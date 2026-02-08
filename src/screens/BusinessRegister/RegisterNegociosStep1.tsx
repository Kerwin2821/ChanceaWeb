"use client"

import { View, Text, Animated, TouchableOpacity } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import Button from "../../components/ButtonComponent/Button"
import Input from "../../components/InputComponent/Input"
import { useNavigation } from "@react-navigation/native"
import InputPhoneNumber from "../../components/InputPhoneNumber/InputPhoneNumber"
import { font } from "../../../styles"
import useRegisterNegociosReqStore from "../../context/RegisterBusinessHooks/useRegisterNegociosReqStore"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import ScreenContainerForm from "../../components/ScreenContainerForm"
import { FontAwesome5, Feather, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"
import { Colors } from "../../utils"

const formatNumber = (number: number) => `0${number}`.slice(-2)

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60)
  const secs = time - mins * 60
  return { mins: formatNumber(mins), secs: formatNumber(secs) }
}

const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const regexTelefonoVenezolano =
  /^(412|414|416|424|413|415|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414)\d{7}$/

export default function RegisterNegocios1Screen() {
  const {
    registerNegociosReq,
    registerNegociosReq: { email, phoneNumber },
    setRegisterNegociosReq,
  } = useRegisterNegociosReqStore()
  const { TokenAuthApi } = useAuth()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [isCorreo, setIsCorreo] = useState<boolean | "pending">("pending")
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">("pending")

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const waveAnim = useRef(new Animated.Value(0)).current

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setRegisterNegociosReq({
        ...registerNegociosReq,
        [key]: value,
      })
    },
    [registerNegociosReq],
  )

  useEffect(() => {
    if (registerNegociosReq.email) {
      setIsCorreo(regex.test(registerNegociosReq.email))
    }
  }, [registerNegociosReq.email])

  useEffect(() => {
    if (registerNegociosReq.phoneNumber) {
      setIsNumberPhone(regexTelefonoVenezolano.test(registerNegociosReq.phoneNumber.slice(3)))
    }
  }, [registerNegociosReq.phoneNumber])

  // Start animations
  useEffect(() => {
    startAnimations()
  }, [])

  const startAnimations = () => {
    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Wave animation
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start()
  }

  // Handle icon press for interaction
  const handleIconPress = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Wave rotation interpolation
  const waveRotate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  async function ValidateData() {
    try {
      const host = process.env.APP_BASE_API
      const header = await GetHeader(TokenAuthApi, "application/json")
      const url2 = `/api/chancea/businesses/validatePhoneNumber/${phoneNumber}`
      const url3 = `/api/chancea/businesses/validateEMail/${email}`

      const response2 = await HttpService("get", host, url2, {}, header, setLoader)
      const response3 = await HttpService("get", host, url3, {}, header, setLoader)

      if (response2.codigoRespuesta === "24") {
        ToastCall("error", "Este teléfono ya está registrado", "ES")
        return
      }
      if (response3.codigoRespuesta === "23") {
        ToastCall("error", "Este email ya está registrado", "ES")
        return
      }
      navigation.navigate("RegisterNegocios2")
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }

  return (
    <ScreenContainerForm>
      <View className=" absolute left-3 top-3 p-2 bg-white/20 rounded-full z-10">
        <TouchableOpacity onPress={() => navigation.navigate("Prelogin")}>
          <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <View className="justify-between p-5">
        {/* Top Section with Illustration */}
        <View className="items-center justify-center mt-5">
          {/* Interactive Illustration */}
          <TouchableOpacity activeOpacity={0.8} onPress={handleIconPress} className="my-8">
            <View className="relative items-center justify-center">
              {/* Background waves - Need to use style for animations */}
              <Animated.View
                className="absolute border-2 rounded-full border-primary/20"
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 140,
                  transform: [{ rotate: waveRotate }, { scale: 1.1 }],
                }}
              />
              <Animated.View
                className="absolute border-2 rounded-full border-primary/30"
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 120,
                  transform: [{ rotate: waveRotate }, { scale: 0.9 }],
                }}
              />

              {/* Main container */}
              <View className="relative">
                {/* Email icon */}
                <Animated.View
                  className="absolute"
                  style={{
                    left: -50,
                    top: 0,
                    transform: [{ translateY: floatAnim }],
                  }}
                >
                  <View className="w-[70px] h-[70px] rounded-full bg-primary/20 items-center justify-center">
                    <MaterialCommunityIcons name="email-outline" size={35} color={Colors.primary} />
                  </View>
                </Animated.View>

                {/* Phone icon */}
                <Animated.View
                  className="absolute"
                  style={{
                    right: -50,
                    top: 0,
                    transform: [
                      {
                        translateY: floatAnim.interpolate({
                          inputRange: [-15, 0],
                          outputRange: [0, -15],
                        }),
                      },
                    ],
                  }}
                >
                  <View className="w-[70px] h-[70px] rounded-full bg-secondary/20 items-center justify-center">
                    <Feather name="phone" size={35} color={Colors.secondary} />
                  </View>
                </Animated.View>

                {/* Main contact icon */}
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <View className="w-52 h-52 rounded-full bg-primary/10 items-center justify-center">
                    <FontAwesome5 name="address-card" size={64} color={Colors.primary} />
                  </View>
                </Animated.View>
              </View>
            </View>
          </TouchableOpacity>

          <Text className="text-xl font-bold text-center text-secondary mb-2">Información de Contacto</Text>
          <Text className="text-sm text-gray-500 text-center px-5 mb-5">
            Proporcione los datos de contacto para su negocio.
          </Text>
        </View>

        {/* Form Fields Section */}
        <View className="items-center w-full px-4">
          {/* Phone Number Input */}
          <View className="w-[90%] mb-5">
            <InputPhoneNumber
              labelText="Número de Teléfono"
              keyboardType="default"
              value={phoneNumber}
              onChangeText={(e: string) => {
                if (e.length < 15) change(e, "phoneNumber")
              }}
              styleContainer={{ width: "100%" }}
            />

            {/* Phone validation message */}
            {phoneNumber && phoneNumber.slice(0, 3) === "+58" && !isNumberPhone && (
              <View className="flex-row items-center mt-1 ml-1">
                <FontAwesome5 name="exclamation-circle" size={12} color="#f87171" />
                <Text style={font.Regular} className="text-xs text-red-400 ml-1">
                  No es un número de teléfono válido
                </Text>
              </View>
            )}
          </View>

          {/* Email Input */}
          <View className="w-[90%] mb-5">
            <Input
              labelText="Correo Electrónico"
              placeholder="correo@gmail.com"
              keyboardType="email-address"
              value={email}
              maxLength={50}
              onChangeText={(e: string) => {
                change(e, "email")
              }}
              styleContainer={{ width: "100%" }}
            />

            {/* Email validation message */}
            {email && !isCorreo && (
              <View className="flex-row items-center mt-1 ml-1">
                <FontAwesome5 name="exclamation-circle" size={12} color="#f87171" />
                <Text style={font.Regular} className="text-xs text-red-400 ml-1">
                  No es un email válido
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between w-full px-4 mt-auto mb-5">
          <View className="w-[45%]">
            <Button
              text={"Volver"}
              onPress={() => {
                navigation.goBack()
              }}
              typeButton="white"
            />
          </View>
          <View className="w-[45%]">
            <Button
              text={"Siguiente"}
              disabled={
                !email ||
                !phoneNumber ||
                !isCorreo ||
                (registerNegociosReq.phoneNumber.slice(0, 3) === "+58" ? !isNumberPhone : false)
              }
              onPress={ValidateData}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  )
}


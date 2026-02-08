"use client"

import { Text, View, ScrollView, TouchableOpacity, Animated } from "react-native"
import Button from "../../components/ButtonComponent/Button"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import Input from "../../components/InputComponent/Input"
import { useAuth, useRender } from "../../context"
import { useCallback, useEffect, useRef } from "react"
import Select from "../../components/Select/SelectComponent"
import { useNavigation } from "@react-navigation/native"
import { HttpService } from "../../services"
import { font } from "../../../styles"
import useRegisterNegociosReqStore from "../../context/RegisterBusinessHooks/useRegisterNegociosReqStore"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import ScreenContainerForm from "../../components/ScreenContainerForm"
import { FontAwesome5 } from "@expo/vector-icons"
import { Colors } from "../../utils"

const documents = [
  {
    value: "J",
    label: "J",
  },
  {
    value: "V",
    label: "V",
  },
  {
    value: "E",
    label: "E",
  },
  {
    value: "P",
    label: "P",
  },
  {
    value: "G",
    label: "G",
  },
]

export default function RegisterNegociosScreen() {
  const {
    registerNegociosReq,
    registerNegociosReq: { name, comercialDenomination, identificationNumber, conditionType },
    setRegisterNegociosReq,
  } = useRegisterNegociosReqStore()
  const { TokenAuthApi, deviceId, DataCoordenadas } = useAuth()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()

  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

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
    setRegisterNegociosReq({
      ...registerNegociosReq,
      latitude: DataCoordenadas?.coords?.latitude?.toString(),
      logintude: DataCoordenadas?.coords?.longitude?.toString(),
    })

    // Start animations
    startAnimations()
  }, [])

  // Animation functions
  const startAnimations = () => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start()
  }

  // Handle image press for a fun interaction
  const handleImagePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }

  // Interpolate rotation value
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  async function ValidateCedula() {
    try {
      const host = process.env.APP_BASE_API
      const url = `/services/cuponservices/api/cuponapp/businesses/validateIdentificacionNumber/${conditionType}/${identificationNumber}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, header, setLoader)
      if (response.codigoRespuesta === "50") {
        ToastCall("warning", "Este RIF ya está registrado", "ES")
        return
      }
      change(identificationNumber, "identificationNumber")
      navigation.navigate("RegisterNegocios1")
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
        <View className="px-5 py-6">
          {/* Interactive Illustration */}
          <View className="items-center justify-center mb-6 mt-4">
            <TouchableOpacity activeOpacity={0.8} onPress={handleImagePress}>
              <View className="relative items-center justify-center">
                {/* Background circle */}
                <Animated.View
                  className="absolute w-48 h-48 rounded-full bg-primary/10"
                  style={{ transform: [] }}
                />

                {/* Main store icon */}
                <Animated.View
                  className="items-center justify-center"
                  style={{
                    transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
                  }}
                >
                  <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center">
                    <FontAwesome5 name="store" size={60} color={Colors.primary} />
                  </View>
                </Animated.View>

                {/* Small decorative elements */}
                <Animated.View className="absolute top-0 right-0" style={{ transform: [] }}>
                  <View className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center">
                    <FontAwesome5 name="dollar-sign" size={16} color={Colors.secondary} />
                  </View>
                </Animated.View>

                <Animated.View className="absolute bottom-0 left-0" style={{ transform: [] }}>
                  <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
                    <FontAwesome5 name="shopping-bag" size={18} color={Colors.primary} />
                  </View>
                </Animated.View>
              </View>
            </TouchableOpacity>

            <Text className="text-xl font-bold text-center text-secondary mt-6 mb-1">Registro de Negocio</Text>
            <Text className="text-sm text-gray-600 text-center px-6">
              Complete el siguiente formulario para ser parte de nuestras empresas aliadas.
            </Text>
          </View>

          {/* RIF Input */}
          <View className="mb-4 ">
            <Text style={font.SemiBold} className="text-secondary mb-1">
              RIF
            </Text>
            <View className="flex-row space-x-3 justify-center items-center">
              <View className="w-[25%]">
                <Select
                  items={documents}
                  onChange={(e: string | number) => change(e, "conditionType")}
                  lengthText={13}
                  styleText={{ paddingHorizontal: 0 }}
                  value={conditionType}
                />
              </View>
              <View className="flex-1">
                <Input
                  placeholder="Ejemplo: 121109771"
                  onChangeText={(e: string) => change(e.replace(/[^0-9a-zA-Z]/g, ""), "identificationNumber")}
                  value={identificationNumber}
                  keyboardType="numeric"
                  maxLength={9}
                />
              </View>
            </View>
          </View>

          {/* Business Name */}
          <View className="mb-4">
            <Input
              labelText="Razón Social"
              placeholder="Comercio María C.A."
              keyboardType="default"
              value={name}
              maxLength={50}
              onChangeText={(e: string) => change(e, "name")}
            />
          </View>

          {/* Commercial Name */}
          <View className="mb-6">
            <Input
              labelText="Nombre Comercial"
              placeholder="Comercio María"
              keyboardType="default"
              value={comercialDenomination}
              maxLength={50}
              onChangeText={(e: string) => change(e, "comercialDenomination")}
            />
          </View>

          {/* Form Validation Hints */}
         {/*  <View className="mb-6 bg-gray-50 p-4 rounded-lg">
            <Text className="text-sm font-semibold text-secondary mb-2">Información Requerida:</Text>
            <View className="flex-row items-center mb-1">
              <View
                className={`w-2 h-2 rounded-full ${
                  conditionType && identificationNumber ? "bg-green-500" : "bg-gray-300"
                } mr-2`}
              />
              <Text className="text-sm text-gray-600">RIF válido</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <View className={`w-2 h-2 rounded-full ${name ? "bg-green-500" : "bg-gray-300"} mr-2`} />
              <Text className="text-sm text-gray-600">Razón social</Text>
            </View>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full ${comercialDenomination ? "bg-green-500" : "bg-gray-300"} mr-2`} />
              <Text className="text-sm text-gray-600">Nombre comercial</Text>
            </View>
          </View> */}

          {/* Action Buttons */}
          <View className="flex-row justify-between mt-4">
            <View className="w-[45%]">
              <Button text={"Volver"} onPress={() => navigation.goBack()} typeButton="white" />
            </View>
            <View className="w-[45%]">
              <Button
                text={"Siguiente"}
                disabled={!comercialDenomination || !identificationNumber || !name}
                onPress={ValidateCedula}
              />
            </View>
          </View>
        </View>
    </ScreenContainerForm>
  )
}


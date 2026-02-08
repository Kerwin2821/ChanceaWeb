"use client"

import { Text, View, TouchableOpacity, ScrollView } from "react-native"
import { useState, useEffect, useCallback, useRef } from "react"
import { Colors } from "../../utils"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import Languages from "../../utils/Languages.json"
import Button from "../../components/ButtonComponent/Button"
import Input from "../../components/InputComponent/Input"
import { useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import useRegisterNegociosReqStore from "../../context/RegisterBusinessHooks/useRegisterNegociosReqStore"
import ScreenContainerForm from "../../components/ScreenContainerForm"
import { Animated } from "react-native"
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons"

const formatNumber = (number: number) => `0${number}`.slice(-2)

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60)
  const secs = time - mins * 60
  return { mins: formatNumber(mins), secs: formatNumber(secs) }
}

function RegisterNegocios2Screen() {
  const { registerNegociosReq } = useRegisterNegociosReqStore()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { setLoader } = useRender()
  const { TokenAuthApi } = useAuth()

  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  // Timer refs
  let intervalTimer: any = null
  let intervalTimer2: any = null
  let intervalTimer3: any = null
  let intervalTimer4: any = null

  // Timer states
  const [timer1, setTimer1] = useState<number>(150)
  const [timer2, setTimer2] = useState<number>(20)
  const [timer3, setTimer3] = useState<number>(150)
  const [timer4, setTimer4] = useState<number>(20)
  const [activeTimer1, setActiveTimer1] = useState<boolean>(true)
  const [activeTimer2, setActiveTimer2] = useState<boolean>(true)
  const [activeTimer3, setActiveTimer3] = useState<boolean>(true)
  const [activeTimer4, setActiveTimer4] = useState<boolean>(true)

  // Form state
  const [state, setState] = useState({
    sms: "",
    email: "",
  })

  // Formatted times
  const { mins: mins1, secs: secs1 } = getRemaining(timer1)
  const { mins: mins3, secs: secs3 } = getRemaining(timer3)

  // Start animations
  useEffect(() => {
    startAnimations()
  }, [])

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

  // Disable button if validation fails
  const disable = () => {
    const { sms } = state
    return registerNegociosReq.phoneNumber.slice(0, 3) === "+58" ? !(sms.length >= 6) : false
  }

  // Update form state
  const change = (value: string, key: string) => {
    setState({
      ...state,
      [key]: value,
    })
  }

  // Resend verification code
  const reSubmit = async (type: "SMS" | "EMAIL", contact: string) => {
    const host = process.env.APP_BASE_API
    const url: string = "/api/appchancea/tokens/generate"
    const req = {
      customerId: null,
      businessId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: type,
    }
    const headers = GetHeader(TokenAuthApi, "application/json")
    try {
      const response: any = await HttpService("post", host, url, req, headers, setLoader)
      if (!response) {
        ToastCall("error", Languages["ES"].GENERAL.ERRORS.RequestError, "ES")
        return
      }

      if (type === "SMS") {
        setActiveTimer1(true)
        setActiveTimer2(true)
        setTimer1(150)
        setTimer2(20)
      }

      if (type === "EMAIL") {
        setActiveTimer3(true)
        setActiveTimer4(true)
        setTimer3(150)
        setTimer4(20)
      }
    } catch (err) {
      console.log("erro", JSON.stringify(err))
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES")
    }
  }

  // Create request object for validation
  const getReq = useCallback((type: "SMS" | "EMAIL", contact: string, token: string) => {
    return {
      customerId: null,
      businessId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: type,
      token: token,
    }
  }, [])

  // Submit verification codes
  const onSubmit = async () => {
    let req
    try {
      const { sms } = state
      const host = process.env.APP_BASE_API
      const url: string = "/api/appchancea/tokens/validate"
      const headers = GetHeader(TokenAuthApi, "application/json")

      if (registerNegociosReq.phoneNumber.slice(0, 3) === "+58") {
        req = getReq("SMS", registerNegociosReq.phoneNumber, sms)
        const responseSms: any = await HttpService("post", host, url, req, headers, setLoader)
        //VALIDAR SMS
        if (!responseSms) {
          ToastCall("warning", Languages["ES"].SCREENS.VerifyContactsScreen.ERROR.message4, "ES")
          return
        }
        if (responseSms?.codigoRespuesta !== "00") {
          ToastCall("warning", Languages["ES"].SCREENS.VerifyContactsScreen.ERROR.message3, "ES")
          return
        }
      }

      clearInterval(intervalTimer)
      clearInterval(intervalTimer2)
      clearInterval(intervalTimer3)
      clearInterval(intervalTimer4)
      navigation.navigate("RegisterNegocios5")
    } catch (err) {
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES")
    }
  }

  // Timer effects
  useEffect(() => {
    if (activeTimer1 && timer1 > 0) {
      intervalTimer = setInterval(() => {
        setTimer1((remainingSecs) => remainingSecs - 1)
      }, 1000)
    } else if (!activeTimer1 || timer1 === 0) {
      clearInterval(intervalTimer)
    }
    return () => clearInterval(intervalTimer)
  }, [activeTimer1, timer1])

  useEffect(() => {
    if (activeTimer2 && timer2 > 0) {
      intervalTimer2 = setInterval(() => {
        setTimer2((remainingSecs) => remainingSecs - 1)
      }, 1000)
    } else if (!activeTimer2 || timer2 === 0) {
      clearInterval(intervalTimer2)
    }
    return () => clearInterval(intervalTimer2)
  }, [activeTimer2, timer2])

  useEffect(() => {
    if (activeTimer3 && timer3 > 0) {
      intervalTimer3 = setInterval(() => {
        setTimer3((remainingSecs) => remainingSecs - 1)
      }, 1000)
    } else if (!activeTimer3 || timer3 === 0) {
      clearInterval(intervalTimer3)
    }
    return () => clearInterval(intervalTimer3)
  }, [activeTimer3, timer3])

  useEffect(() => {
    if (activeTimer4 && timer4 > 0) {
      intervalTimer4 = setInterval(() => {
        setTimer4((remainingSecs) => remainingSecs - 1)
      }, 1000)
    } else if (!activeTimer4 || timer4 === 0) {
      clearInterval(intervalTimer4)
    }
    return () => clearInterval(intervalTimer4)
  }, [activeTimer4, timer4])

  // Send verification codes on mount
  useEffect(() => {
    if (registerNegociosReq.phoneNumber.slice(0, 3) === "+58") {
      reSubmit("SMS", registerNegociosReq.phoneNumber)
    }
    reSubmit("EMAIL", registerNegociosReq.email)
  }, [])

  return (
    <ScreenContainerForm>
      <View className=" absolute left-3 top-3 p-2 bg-white/20 rounded-full z-10">
        <TouchableOpacity onPress={() => navigation.navigate("Prelogin")}>
          <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <View className=" px-5 py-6">
        {/* Interactive Illustration */}
        <View className="items-center justify-center mb-3 mt-5">
          <TouchableOpacity activeOpacity={0.8} onPress={handleImagePress}>
            <View className="relative items-center justify-center">
              {/* Background circle */}
              <Animated.View
                className="absolute w-48 h-48 rounded-full bg-primary/10"
                style={{ transform: [{ rotate: spin }] }}
              />

              {/* Main security icon */}
              <Animated.View
                className="items-center justify-center"
              /*  style={{
                 transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
               }} */
              >
                <View className="w-32 h-32 bg-primary/20 rounded-full items-center justify-center">
                  <FontAwesome5 name="shield-alt" size={60} color={Colors.primary} />
                </View>
              </Animated.View>

              {/* Small decorative elements */}
              <Animated.View className="absolute top-0 right-0" /* style={{ transform: [{ rotate: spin }] }} */>
                <View className="w-10 h-10 bg-secondary/20 rounded-full items-center justify-center">
                  <FontAwesome5 name="lock" size={16} color={Colors.secondary} />
                </View>
              </Animated.View>

              <Animated.View className="absolute bottom-0 left-0" /* style={{ transform: [{ rotate: spin }] }} */>
                <View className="w-12 h-12 bg-primary/20 rounded-full items-center justify-center">
                  <MaterialIcons name="verified-user" size={18} color={Colors.primary} />
                </View>
              </Animated.View>
            </View>
          </TouchableOpacity>


        </View>

        {/* Verification Section */}
        <View className="bg-gray-50 rounded-xl p-5 mb-6 mt-5">
          {registerNegociosReq.phoneNumber.slice(0, 3) === "+58" ? (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <FontAwesome5 name="sms" size={18} color={Colors.primary} className="mr-2" />
                <Text className="text-base font-semibold text-secondary ml-2">
                  {Languages["ES"].SCREENS.VerifyContactsScreen.text1}
                </Text>
              </View>

              <View className="mb-2">
                <Input
                  placeholder={Languages["ES"].SCREENS.VerifyContactsScreen.placeholder1}
                  onChangeText={(e: string) => change(e.replace(/[^0-9]/g, ""), "sms")}
                  value={state.sms}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <View className="flex-row items-center justify-between mt-2">
                <TouchableOpacity
                  className={`py-1.5 px-3 rounded-lg ${timer2 > 0 ? "bg-gray-200" : "bg-primary/10"}`}
                  disabled={timer2 > 0}
                  onPress={() => {
                    reSubmit("SMS", registerNegociosReq.phoneNumber)
                  }}
                >
                  <Text className={`text-sm font-medium ${timer2 > 0 ? "text-gray-500" : "text-primary"}`}>
                    {Languages["ES"].SCREENS.VerifyContactsScreen.textSubmit}{" "}
                    {timer2 > 0 ? `${formatNumber(timer2)}s` : null}
                  </Text>
                </TouchableOpacity>

                <View className={`py-1.5 px-3 rounded-lg ${timer1 > 10 ? "bg-green-100" : "bg-red-100"}`}>
                  <Text className={`text-sm font-medium ${timer1 > 10 ? "text-green-700" : "text-red-700"}`}>
                    {mins1}:{secs1}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Phone number display */}
          <View className="bg-white p-3 rounded-lg mb-4 flex-row items-center">
            <FontAwesome5 name="phone" size={16} color={Colors.primary} />
            <Text className="ml-3 text-gray-700">
              Código enviado a: <Text className="font-semibold">{registerNegociosReq.phoneNumber}</Text>
            </Text>
          </View>

          {/* Security note */}
          <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <Text className="text-xs text-yellow-800 leading-5">
              <Text className="font-semibold">Nota de seguridad:</Text> Nunca compartiremos tus códigos de
              verificación con terceros. Verifica siempre que estés en la aplicación oficial antes de ingresar
              códigos.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-4">
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
            <Button text={"Siguiente"} disabled={disable()} onPress={onSubmit} />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  )
}

export default RegisterNegocios2Screen


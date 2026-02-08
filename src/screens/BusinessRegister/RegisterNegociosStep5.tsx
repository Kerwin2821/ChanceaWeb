"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native"
import { Colors } from "../../utils"
import Languages from "../../utils/Languages.json"
import { ToastCall, GetHeader } from "../../utils/Helpers"
import Button from "../../components/ButtonComponent/Button"
import Input from "../../components/InputComponent/Input"
import { useAuth, useRender } from "../../context"
import { Feather, FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { HttpService } from "../../services"
import useRegisterNegociosReqStore from "../../context/RegisterBusinessHooks/useRegisterNegociosReqStore"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import ScreenContainerForm from "../../components/ScreenContainerForm"

function RegisterNegocios5Screen() {
  const { TokenAuthApi } = useAuth()
  const { language, setLoader } = useRender()
  const { registerNegociosReq, setRegisterNegociosReq, initialStateRegisterNegocios } = useRegisterNegociosReqStore()
  const navigation = useNavigation<NavigationScreenNavigationType>()

  // Password validation states
  const [countLength, setCountLength] = useState<boolean>(false)
  const [countUpperCase, setCountUpperCase] = useState<boolean>(false)
  const [countLowerCase, setCountLowerCase] = useState<boolean>(false)
  const [countNumbers, setCountNumbers] = useState<boolean>(false)
  const [countSymbols, setCountSymbols] = useState<boolean>(false)
  const [equals, setEquals] = useState<boolean>(false)
  const [credentialRepeat, setcredentialRepeat] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

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

  // Handle icon press for a fun interaction
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

  const disable = () => {
    const { password } = registerNegociosReq
    return (
      !(password?.length >= 8) ||
      !(credentialRepeat.length >= 8) ||
      !equals ||
      !countUpperCase ||
      !countLowerCase ||
      !countNumbers ||
      !countSymbols
    )
  }

  const onSubmit = async () => {
    try {
      setLoader(true)

      const { password } = registerNegociosReq

      if (password !== credentialRepeat) {
        ToastCall("warning", Languages[language].SCREENS.PasswordScreen.ERRORS.message2, language)
        return
      }
      const host = process.env.APP_BASE_API
      const url: string = "/api/appchancea/businesses/register"
      const headers = GetHeader(TokenAuthApi, "application/json")
      const req = registerNegociosReq

      const response = await HttpService("post", host, url, req, headers)
      console.log(response, "REGISTER REQ")
      if (response?.codigoRespuesta === "21") {
        ToastCall("warning", Languages[language].SCREENS.PasswordScreen.ERRORS.message3, language)
        return
      }

      if (response?.codigoRespuesta === "06") {
        ToastCall("warning", Languages[language].SCREENS.PasswordScreen.ERRORS.message4, language)
        return
      }
      if (response.codigoRespuesta === "50") {
        ToastCall("error", "Esta Cedula ya esta registrada", "ES")
        return
      }

      if (response?.codigoRespuesta === "00") {
        setRegisterNegociosReq(initialStateRegisterNegocios)
        navigation.navigate("RegisterNegociosFinal")
      } else {
        ToastCall("error", response?.mensajeRespuesta, language)
      }
    } catch (err) {
      console.log(JSON.stringify(err))
      ToastCall("error", Languages[language].GENERAL.ERRORS.GeneralError, language)
    } finally {
      setLoader(false)
    }
  }

  const validatePassword = useCallback(
    (e: any) => {
      const password = e

      const val1 = /(?=.*[a-z])/g // Minuscula
      const val2 = /(?=.*[A-Z])/g // Mayuscula
      const val3 = /(?=.*\d)/g // Digito
      const val4 = /(?=.*\W)/g // Caracter Especial

      if (val1.test(password)) {
        setCountLowerCase(true)
      } else {
        countLowerCase && setCountLowerCase(false)
      }

      if (val2.test(password)) {
        setCountUpperCase(true)
      } else {
        countUpperCase && setCountUpperCase(false)
      }

      if (val3.test(password)) {
        setCountNumbers(true)
      } else {
        countNumbers && setCountNumbers(false)
      }

      if (val4.test(password)) {
        setCountSymbols(true)
      } else {
        countSymbols && setCountSymbols(false)
      }

      if (password.length >= 8) {
        setCountLength(true)
      } else {
        countLength && setCountLength(false)
      }

      if (password.length === 0) {
        setCountLowerCase(false)
        setCountUpperCase(false)
        setCountNumbers(false)
        setCountSymbols(false)
        setCountLength(false)
        setEquals(false)
      }
    },
    [registerNegociosReq.password],
  )

  const change = (value: string, key: string) => {
    key === "password" && validatePassword(value)

    setRegisterNegociosReq({
      ...registerNegociosReq,
      [key]: value,
    })
  }

  useEffect(() => {
    const { password } = registerNegociosReq
    setEquals(password.length && credentialRepeat.length ? password === credentialRepeat : false)
  }, [registerNegociosReq.password, credentialRepeat, credentialRepeat])

  // Calculate password strength
  const getPasswordStrength = () => {
    let strength = 0
    if (countLength) strength++
    if (countUpperCase) strength++
    if (countLowerCase) strength++
    if (countNumbers) strength++
    if (countSymbols) strength++

    if (strength === 0) return { text: "Sin contraseña", color: "bg-gray-200", textColor: "text-gray-500" }
    if (strength <= 2) return { text: "Débil", color: "bg-red-500", textColor: "text-red-500" }
    if (strength <= 4) return { text: "Moderada", color: "bg-yellow-500", textColor: "text-yellow-600" }
    return { text: "Fuerte", color: "bg-green-500", textColor: "text-green-600" }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <ScreenContainerForm>
      <View className=" absolute left-3 top-3 p-2 bg-white/20 rounded-full z-10">
        <TouchableOpacity onPress={() => navigation.navigate("Prelogin")}>
          <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <View className="px-5 py-6">
        {/* Interactive Illustration */}
        <View className="items-center justify-center mb-6">


          <Text className="text-xl font-bold text-center text-secondary mt-4 mb-1">
            {Languages[language].SCREENS.PasswordScreen.text1}
          </Text>
          <Text className="text-sm text-gray-600 text-center px-6 mb-4">
            Crea una contraseña segura para proteger tu cuenta de negocio
          </Text>
        </View>

        {/* Password Requirements */}
        <View className="bg-gray-50 rounded-xl p-5 mb-6">
          <Text className="text-base font-semibold text-secondary mb-3">
            {Languages[language].SCREENS.PasswordScreen.text2}
          </Text>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {countLength ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${countLength ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text3}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {countUpperCase ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${countUpperCase ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text4}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {countLowerCase ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${countLowerCase ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text5}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {countNumbers ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${countNumbers ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text6}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {countSymbols ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${countSymbols ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text7}{" "}
                <Text className="text-primary font-medium"># ? ! $ % & * - . ,</Text>
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-6 h-6 items-center justify-center">
                {equals ? (
                  <Feather name="check-circle" size={18} color={Colors.green} />
                ) : (
                  <View className="w-4 h-4 rounded-full border border-gray-400" />
                )}
              </View>
              <Text className={`text-sm ml-2 ${equals ? "text-green-600" : "text-gray-600"}`}>
                {Languages[language].SCREENS.PasswordScreen.text8}
              </Text>
            </View>
          </View>
        </View>

        {/* Password Strength Indicator */}
        {registerNegociosReq.password && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-gray-600">Fortaleza de la contraseña:</Text>
              <Text className={`text-sm font-medium ${passwordStrength.textColor}`}>{passwordStrength.text}</Text>
            </View>
            <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <View
                className={`h-full ${passwordStrength.color}`}
                style={{
                  width: `${getPasswordStrength().text === "Sin contraseña" ? 0 : getPasswordStrength().text === "Débil" ? 33 : getPasswordStrength().text === "Moderada" ? 66 : 100}%`,
                }}
              />
            </View>
          </View>
        )}

        {/* Password Input Fields */}
        <View className="mb-6 space-y-4">
          <View>
            <Text className="text-sm font-semibold text-secondary mb-2">Contraseña</Text>
            <View className="relative">
              <Input
                placeholder={Languages[language].SCREENS.PasswordScreen.placeholder1}
                secureTextEntry={!showPassword}
                onChangeText={(e: string) => {
                  change(e, "password")
                }}
                keyboardType="default"
                value={registerNegociosReq.password}
                maxLength={20}
                styleContainer={{ width: "100%" }}
              />

            </View>
          </View>

          <View>
            <Text className="text-sm font-semibold text-secondary mb-2">Confirmar Contraseña</Text>
            <View className="relative">
              <Input
                placeholder={Languages[language].SCREENS.PasswordScreen.placeholder2}
                secureTextEntry={!showConfirmPassword}
                onChangeText={(e: string) => {
                  setcredentialRepeat(e)
                }}
                keyboardType="default"
                value={credentialRepeat}
                maxLength={20}
                styleContainer={{ width: "100%" }}
              />
            </View>
            {credentialRepeat && registerNegociosReq.password && !equals && (
              <Text className="text-red-500 text-xs mt-1 ml-1">Las contraseñas no coinciden</Text>
            )}
          </View>
        </View>

        {/* Security Tip */}
        <View className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <Text className="text-xs text-blue-800 leading-5">
            <Text className="font-semibold">Consejo de seguridad:</Text> Nunca uses la misma contraseña en múltiples
            sitios. Considera usar un gestor de contraseñas para mantener tus credenciales seguras.
          </Text>
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
            <Button
              text={"Siguiente"}
              disabled={disable()}
              onPress={() => {
                onSubmit()
              }}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  )
}

export default RegisterNegocios5Screen


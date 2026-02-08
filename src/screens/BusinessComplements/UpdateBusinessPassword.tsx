"use client"

import { useState, useCallback, useEffect } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { Feather, FontAwesome5 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import { Colors } from "../../utils"
import Input from "../../components/InputComponent/Input"
import Button from "../../components/ButtonComponent/Button"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import HeaderApp from "../../components/HeaderApp"


function UpdateBusinessPassword() {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { language, setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { sesionBusiness } = useSesionBusinessStore()

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [countLength, setCountLength] = useState<boolean>(false)
  const [equals, setEquals] = useState<boolean>(false)
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false)
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

  const isDisabled = () => {
    return !(oldPassword.length >= 1) || !(newPassword.length >= 8) || !(confirmPassword.length >= 8) || !equals
  }

  const updatePassword = async () => {
    try {
      if (!sesionBusiness) {
        ToastCall("error", "No hay sesión de negocio activa", language)
        return
      }

      if (newPassword !== confirmPassword) {
        ToastCall("warning", "Las contraseñas nuevas no coinciden", language)
        return
      }

      setLoader(true)
      const host = process.env.APP_BASE_API
      const url = "/api/businesses/updatePassword"
      const headers = await GetHeader(TokenAuthApi, "application/json")

      const validate = await HttpService(
        "post",
        host,
        url,
        {
          sessionToken: SesionToken,
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
        headers,
      )

      if (validate.codigoRespuesta === "21") {
        ToastCall("warning", "Las contraseñas Actual es Incorrecta", language)
        return
      }


      ToastCall("success", "Contraseña actualizada exitosamente", language)

      // Clear form fields
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")

      navigation.goBack()
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err?.status === 401) {
        ToastCall("error", "La contraseña actual es incorrecta", language)
      } else if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", language)
      } else {
        ToastCall("error", "Tienes problemas de conexión", language)
      }
    } finally {
      setLoader(false)
    }
  }

  const validatePassword = useCallback(
    (value: string) => {
      if (value.length >= 8) {
        setCountLength(true)
      } else {
        countLength && setCountLength(false)
      }

      if (value.length === 0) {
        setCountLength(false)
        setEquals(false)
      }
    },
    [countLength],
  )

  useEffect(() => {
    setEquals(newPassword.length && confirmPassword.length ? newPassword === confirmPassword : false)
  }, [newPassword, confirmPassword])

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <HeaderApp title="Actualizar Contraseña"/>

      <View className="flex-1 px-6 pt-6">
        {/* Business Info */}
      {/*   <View className="mb-6 items-center">
          <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-2">
            <FontAwesome5 name="building" size={28} color={Colors.primary} />
          </View>
          <Text className="text-lg font-bold text-secondary">{sesionBusiness?.name || "Mi Negocio"}</Text>
          <Text className="text-sm text-gray-500">{sesionBusiness?.email || ""}</Text>
        </View> */}

        {/* Title and Instructions */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-center text-secondary mb-4">Cambiar Contraseña</Text>

          <Text className="text-sm text-gray-600 text-center mb-4">
            Para actualizar tu contraseña, primero debes ingresar tu contraseña actual y luego la nueva contraseña.
          </Text>
        </View>

        {/* Password Requirements */}
        <View className="mb-6 bg-gray-50 p-4 rounded-lg">
          <Text className="text-base font-semibold text-secondary mb-2">Requisitos:</Text>

          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 items-center justify-center">
              {countLength ? (
                <Feather name="check-circle" size={18} color={Colors.primary} />
              ) : (
                <View className="w-4 h-4 rounded-full border border-gray-400" />
              )}
            </View>
            <Text className={`text-sm ml-2 ${countLength ? "text-primary" : "text-gray-600"}`}>
              Mínimo de 8 caracteres
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className="w-6 h-6 items-center justify-center">
              {equals ? (
                <Feather name="check-circle" size={18} color={Colors.primary} />
              ) : (
                <View className="w-4 h-4 rounded-full border border-gray-400" />
              )}
            </View>
            <Text className={`text-sm ml-2 ${equals ? "text-primary" : "text-gray-600"}`}>
              Las contraseñas coinciden
            </Text>
          </View>
        </View>

        {/* Current Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-secondary mb-2">Contraseña Actual</Text>
          <View className="relative">
            <Input
              placeholder="Ingresa tu contraseña actual"
              secureTextEntry={!showOldPassword}
              onChangeText={setOldPassword}
              keyboardType="default"
              value={oldPassword}
              maxLength={20}
            />
          </View>
        </View>

        {/* New Password Input */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-secondary mb-2">Nueva Contraseña</Text>
          <View className="relative">
            <Input
              placeholder="Ingresa tu nueva contraseña"
              secureTextEntry={!showNewPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                validatePassword(text)
              }}
              keyboardType="default"
              value={newPassword}
              maxLength={20}
            />
          </View>
        </View>

        {/* Confirm New Password Input */}
        <View className="mb-8">
          <Text className="text-sm font-semibold text-secondary mb-2">Confirmar Nueva Contraseña</Text>
          <View className="relative">
            <Input
              placeholder="Confirma tu nueva contraseña"
              secureTextEntry={!showConfirmPassword}
              onChangeText={setConfirmPassword}
              keyboardType="default"
              value={confirmPassword}
              maxLength={20}
            />
          </View>

          {newPassword && confirmPassword && !equals && (
            <Text className="text-red-500 text-xs mt-1 ml-1">Las contraseñas no coinciden</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[45%]">
            <Button text="Cancelar" onPress={() => navigation.goBack()} typeButton="white" />
          </View>

          <View className="w-[45%]">
            <Button text="Actualizar" disabled={isDisabled()} onPress={updatePassword} />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default UpdateBusinessPassword


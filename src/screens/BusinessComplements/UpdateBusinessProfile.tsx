"use client"

import { View, StyleSheet, Text, TouchableOpacity } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { GetHeader, ToastCall, height } from "../../utils/Helpers"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import Button from "../../components/ButtonComponent/Button"
import Input from "../../components/InputComponent/Input"
import { useNavigation } from "@react-navigation/native"
import InputPhoneNumber from "../../components/InputPhoneNumber/InputPhoneNumber"
import { font } from "../../../styles"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import ScreenContainerForm from "../../components/ScreenContainerForm"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FontAwesome5 } from "@expo/vector-icons"
import { Colors } from "../../utils"
import HeaderApp from "../../components/HeaderApp"

const formatNumber = (number: number) => `0${number}`.slice(-2)

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60)
  const secs = time - mins * 60
  return { mins: formatNumber(mins), secs: formatNumber(secs) }
}

const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const regexTelefonoVenezolano =
  /^(412|414|416|424|413|415|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414)\d{7}$/

export default function UpdateBusinessProfile() {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader, language } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { sesionBusiness, setSesionBusiness } = useSesionBusinessStore()

  const [formData, setFormData] = useState({
    email: sesionBusiness?.email || "",
    phoneNumber: sesionBusiness?.phoneNumber || "",
  })

  const [isCorreo, setIsCorreo] = useState<boolean | "pending">("pending")
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">("pending")

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormData({
        ...formData,
        [key]: value,
      })
    },
    [formData],
  )

  useEffect(() => {
    if (formData.email) {
      setIsCorreo(regex.test(formData.email))
    }
  }, [formData.email])

  useEffect(() => {
    if (formData.phoneNumber) {
      setIsNumberPhone(regexTelefonoVenezolano.test(formData.phoneNumber.slice(3)))
    }
  }, [formData.phoneNumber])

  async function updateBusinessProfile() {
    try {
      if (!sesionBusiness) {
        ToastCall("error", "No hay sesión de negocio activa", language)
        return
      }

      // Check if any changes were made
      const emailChanged = formData.email !== sesionBusiness.email
      const phoneChanged = formData.phoneNumber !== sesionBusiness.phoneNumber

      // If nothing changed, just return
      if (!emailChanged && !phoneChanged) {
      
        return
      }

      setLoader(true)
      const host = process.env.APP_BASE_API
      const header = await GetHeader(TokenAuthApi, "application/json")

      // Only validate fields that have changed
      if (emailChanged) {
        const url2 = `/api/chancea/businesses/validateEMail/${formData.email}`
        const response2 = await HttpService("get", host, url2, {}, header)

        if (response2.codigoRespuesta === "23") {
          ToastCall("error", "Este email ya está registrado", language)
          setLoader(false)
          return
        }
      }

      if (phoneChanged) {
        const url3 = `/api/chancea/businesses/validatePhoneNumber/${formData.phoneNumber}`
        const response3 = await HttpService("get", host, url3, {}, header)

        if (response3.codigoRespuesta === "24") {
          ToastCall("error", "Este teléfono ya está registrado", language)
          setLoader(false)
          return
        }
      }

      // Create update data with only the changed fields
      const updateData = {
        ...sesionBusiness,
        updateDate: new Date().toISOString(),
      }

      // Only include changed fields
      if (emailChanged) {
        updateData.email = formData.email
      }

      if (phoneChanged) {
        updateData.phoneNumber = formData.phoneNumber
      }

      // Update business profile
      const updateUrl = `/api/businesses/update?sessionToken=${SesionToken}`
      const response = await HttpService("put", host, updateUrl, updateData, header)

      // Update session business
      setSesionBusiness(response.business)
      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(response.business))

      // Show appropriate success message
      if (emailChanged && phoneChanged) {
        ToastCall("success", "Email y teléfono actualizados correctamente", language)
      } else if (emailChanged) {
        ToastCall("success", "Email actualizado correctamente", language)
      } else {
        ToastCall("success", "Teléfono actualizado correctamente", language)
      }

      navigation.goBack()
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", language)
      } else {
        ToastCall("error", "Tienes problemas de conexión", language)
      }
    } finally {
      setLoader(false)
    }
  }

  return (
    <ScreenContainerForm>
      {/* Header */}
      <HeaderApp title="Actualizar Información"/>

      <View className="h-[35%] w-full justify-center items-center mt-20">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
          <FontAwesome5 name="building" size={36} color={Colors.primary} />
        </View>
        <Text className="text-xl font-bold text-secondary mb-2">{sesionBusiness?.name || "Mi Negocio"}</Text>
        <Text className="text-sm text-gray-500 mb-6">Actualiza la información de contacto</Text>
      </View>

      <View className="w-full justify-center items-center gap-2">
        <View className="w-[80%] justify-center items-center">
          <InputPhoneNumber
            labelText="Número de Teléfono"
            keyboardType="default"
            value={formData.phoneNumber}
            onChangeText={(e: string) => {
              if (e.length < 15) change(e, "phoneNumber")
            }}
          />
        </View>
        {formData.phoneNumber.slice(0, 3) === "+58" ? (
          !isNumberPhone ? (
            <Text className="text-xs text-red-400 text-left w-[70%]" style={font.Regular}>
              No es un número de teléfono válido
            </Text>
          ) : null
        ) : null}

        <View className="w-[80%] justify-center items-center">
          <Input
            labelText="Correo Electrónico"
            placeholder="correo@gmail.com"
            keyboardType="email-address"
            value={formData.email}
            maxLength={50}
            onChangeText={(e: string) => {
              change(e, "email")
            }}
          />
        </View>
        {formData.email && !isCorreo ? (
          <Text className="text-xs text-red-400 text-left w-[70%]" style={font.Regular}>
            No es un email válido
          </Text>
        ) : null}
      </View>

      <View className="w-full flex-row justify-between px-5 mt-10">
        <View className="w-[45%] items-center">
          <Button
            text={"Cancelar"}
            onPress={() => {
              navigation.goBack()
            }}
            typeButton="white"
          />
        </View>
        <View className="w-[45%] items-center">
          <Button
            text={"Actualizar"}
            disabled={
              !formData.email ||
              !formData.phoneNumber ||
              !isCorreo ||
              (formData.phoneNumber.slice(0, 3) === "+58" ? !isNumberPhone : false) ||
              (formData.email === sesionBusiness?.email && formData.phoneNumber === sesionBusiness?.phoneNumber)
            }
            onPress={updateBusinessProfile}
          />
        </View>
      </View>
    </ScreenContainerForm>
  )
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 150,
    borderRadius: 10,
    width: 150,
  },
})


"use client"

import moment from "moment"
import { useCallback, useEffect, useState } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import DatePicker from "react-native-date-picker"
import { AntDesign, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { useAuth, useRender } from "../../../context"
import { initialFormCreateTienda, StoresCreate, type Stores } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import { GetHeader, ToastCall } from "../../../utils/Helpers"
import { HttpService } from "../../../services"
import Input from "../../../components/InputComponent/Input"
import InputPhoneNumber from "../../../components/InputPhoneNumber/InputPhoneNumber"
import Button from "../../../components/ButtonComponent/Button"
import { Colors } from "../../../utils"
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks"
import { SesionBusiness } from "../../../context/AuthBusinessHooks/AuthBusinessHooksInterface"
import HeaderApp from "../../../components/HeaderApp"

const regex = /^[A-Za-zÑñ0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i
const regexTelefonoVenezolano =
  /^(412|414|416|424|413|415|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414|412|416|412|426|426|428|426|424|416|426|413|412|415|414)\d{7}$/

const StoreForm = () => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { FormCreateTienda, setFormCreateTienda, Stores, setStores } = useStoreBusiness()
  const [isDateInit, setisDateInit] = useState(false)
  const [DateInit, setDateInit] = useState(new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000))
  const [DateEnd, setDateEnd] = useState(new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000))
  const [open, setOpen] = useState(false)
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { sesionBusiness } = useSesionBusinessStore();

  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">("pending")
  const [isCorreo, setIsCorreo] = useState<boolean | "pending">("pending")
  const route = useRoute()
  const data = route.params as { store: StoresCreate } | undefined
  const { setLoader } = useRender()
  const [statusOptions] = useState([
    { value: "ACTIVO", label: "Activo", color: "#4CAF50" },
    { value: "PENDING", label: "Pendiente", color: "#FF9800" },
    { value: "INACTIVO", label: "Inactivo", color: "#F44336" },
  ])

  // Initialize form with default values from sesionBusiness
  useEffect(() => {
    if (data?.store && sesionBusiness) {
      setFormCreateTienda(data?.store)
    }
    if (!data?.store && sesionBusiness) {
      setFormCreateTienda({
        ...initialFormCreateTienda,
        id: undefined,
        name: sesionBusiness.name || "",
        description: sesionBusiness.name || "",
        creationDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        endingDate: new Date().toISOString(),
        phoneNumber: sesionBusiness.phoneNumber || "",
        email: sesionBusiness.email || "",
        business: sesionBusiness,
        direccion: null,
      })
    }
  }, [sesionBusiness,data])

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormCreateTienda({
        ...FormCreateTienda,
        [key]: value,
      })
    },
    [FormCreateTienda],
  )

  async function ValidateData(phoneNumber:string,email:string) {
    try {
      const host = process.env.APP_BASE_API
      const header = await GetHeader(TokenAuthApi, "application/json")
      const url2 = `/api/chancea/businesses/validatePhoneNumber/${phoneNumber}`
      const url3 = `/api/chancea/businesses/validateEMail/${email}`

      const response2 = await HttpService("get", host, url2, {}, header, setLoader)
      const response3 = await HttpService("get", host, url3, {}, header, setLoader)

      if (response2.codigoRespuesta === "24") {
        ToastCall("error", "Este teléfono ya está registrado", "ES")
        return false
      }
      if (response3.codigoRespuesta === "23") {
        ToastCall("error", "Este email ya está registrado", "ES")
        return false
      }
      return true
    } catch (err: any) {
      console.error(JSON.stringify(err))
      
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
      return false
    }
  }

  async function sendUpdate() {
    try {
      if (!data) return
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/store-businesses?sessionToken=${SesionToken}&businessId=${data.store.id}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const updateData = {
        ...FormCreateTienda,
        updateDate: new Date().toISOString(),
        password:null
      } as any

      const response = await HttpService("put", host, url, updateData, header, setLoader)
      const newArray = Stores.map((item) => (item.id === data.store.id ? { ...item, ...updateData } : item))
      setStores(newArray)
      setFormCreateTienda(initialFormCreateTienda)
      ToastCall("success", "Tienda actualizada exitosamente", "ES")
      navigation.goBack()
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }

  useEffect(() => {
    if (FormCreateTienda.email) {
      setIsCorreo(regex.test(FormCreateTienda.email))
    }
  }, [FormCreateTienda.email])

 /*  useEffect(() => {
    if (!data) {
      setFormCreateTienda({
        ...FormCreateTienda,
        openHour: DateInit.toISOString(),
      })
    }
  }, [DateInit])

  useEffect(() => {
    if (!data) {
      setFormCreateTienda({
        ...FormCreateTienda,
        closeHour: DateEnd.toISOString(),
      })
    }
  }, [DateEnd])
 */
  useEffect(() => {
    if (FormCreateTienda.phoneNumber) {
      setIsNumberPhone(regexTelefonoVenezolano.test(FormCreateTienda.phoneNumber.slice(3)))
    }
  }, [FormCreateTienda.phoneNumber])

  const prepareFormForSubmission:() => StoresCreate = () => {
    // For new store, ensure we have all required fields
    return {
      ...FormCreateTienda,
      id: data?.store?.id || undefined,
      creationDate: data?.store?.creationDate || new Date().toISOString(),
      updateDate: new Date().toISOString(),
      endingDate: data?.store?.endingDate || new Date().toISOString(),
      statusBusiness: FormCreateTienda.statusBusiness || "ACTIVE",
      business: sesionBusiness as SesionBusiness,
    }
  }

  const handleContinue = async () => {
    const formData = prepareFormForSubmission()
    setFormCreateTienda(formData)
    const validate =  await ValidateData(formData.phoneNumber, formData.email)
    if (!validate) return

    if (data?.store) {
      sendUpdate()
    } else {
      navigation.navigate("StoreUbication")
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <HeaderApp title={data?.store ? "Editar Tienda" : "Crear Tienda"}/>

        {/* Form Content */}
        <View className="p-4">
          {/* Form Title */}
          <View className="mb-4 flex-row items-center">
            <FontAwesome5 name="store" size={20} color={Colors.secondary} />
            <Text className="text-xl font-bold text-secondary ml-2">
              {data?.store ? "Actualizar Información" : "Información de la Tienda"}
            </Text>
          </View>

          {/* Store Name */}
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="store" size={16} color={Colors.primary} />
              <Text className="text-sm font-semibold text-secondary ml-2">Nombre de la Tienda</Text>
            </View>
            <Input
              placeholder="Ingrese el nombre de la tienda"
              keyboardType="default"
              value={FormCreateTienda.name}
              maxLength={50}
              onChangeText={(e: string) => change(e, "name")}
            />
          </View>

          {/* Email */}
          <View className="mb-1">
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="email" size={16} color={Colors.primary} />
              <Text className="text-sm font-semibold text-secondary ml-2">Correo Electrónico</Text>
            </View>
            <Input
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              value={FormCreateTienda.email}
              maxLength={50}
              onChangeText={(e: string) => {
                change(e, "email")
              }}
            />
          </View>

          {/* Email Validation */}
          {FormCreateTienda.email && !isCorreo && (
            <View className="mb-4 flex-row items-center">
              <AntDesign name="exclamationcircle" size={14} color="#EF4444" />
              <Text className="text-xs text-red-500 ml-1">Por favor ingrese un correo electrónico válido</Text>
            </View>
          )}

          {/* Phone Number */}
          <View className="mb-1 mt-3">
            <View className="flex-row items-center mb-1">
              <FontAwesome5 name="phone-alt" size={16} color={Colors.primary} />
              <Text className="text-sm font-semibold text-secondary ml-2">Número de Teléfono</Text>
            </View>
            <InputPhoneNumber
              keyboardType="default"
              value={FormCreateTienda.phoneNumber}
              onChangeText={(e: string) => {
                if (e.length < 15) change(e, "phoneNumber")
              }}
            />
          </View>

          {/* Phone Validation */}
          {FormCreateTienda.phoneNumber.slice(0, 3) === "+58" && !isNumberPhone && (
            <View className="mb-4 flex-row items-center">
              <AntDesign name="exclamationcircle" size={14} color="#EF4444" />
              <Text className="text-xs text-red-500 ml-1">Por favor ingrese un número de teléfono válido</Text>
            </View>
          )}

          {/* Status Selection (for editing only) */}
          {data?.store && (
            <View className="mt-4 mb-4">
              <View className="flex-row items-center mb-2">
                <AntDesign name="tag" size={16} color={Colors.primary} />
                <Text className="text-sm font-semibold text-secondary ml-2">Estado</Text>
              </View>
              <View className="flex-row flex-wrap">
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${FormCreateTienda.statusBusiness === option.value ? "border-2" : "border"}`}
                    style={{
                      borderColor: option.color,
                      backgroundColor:
                        FormCreateTienda.statusBusiness === option.value ? `${option.color}20` : "transparent",
                    }}
                    onPress={() => change(option.value, "statusBusiness")}
                  >
                    <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: option.color }} />
                    <Text className="text-sm font-medium" style={{ color: option.color }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Store Hours Section */}
          {/* <View className="mt-6 mb-4">
            <View className="flex-row items-center mb-4">
              <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.secondary} />
              <Text className="text-base font-semibold text-secondary ml-2">Horario de Atención</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48%]">
                <Text className="text-sm font-medium text-secondary mb-2 ml-1">Hora de Apertura</Text>
                <TouchableOpacity
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-row items-center justify-center"
                  onPress={() => {
                    setisDateInit(true)
                    setOpen(true)
                  }}
                >
                  <MaterialCommunityIcons name="door-open" size={18} color={Colors.primary} />
                  <Text className="text-sm text-gray-700 ml-2">{moment(DateInit).format("hh:mm a")}</Text>
                </TouchableOpacity>
              </View>

              <View className="w-[48%]">
                <Text className="text-sm font-medium text-secondary mb-2 ml-1">Hora de Cierre</Text>
                <TouchableOpacity
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex-row items-center justify-center"
                  onPress={() => {
                    setisDateInit(false)
                    setOpen(true)
                  }}
                >
                  <MaterialCommunityIcons name="door-closed" size={18} color={Colors.primary} />
                  <Text className="text-sm text-gray-700 ml-2">{moment(DateEnd).format("hh:mm a")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View> */}

          {/* Description Section */}
          <View className="mt-2 mb-20">
            <View className="flex-row items-center mb-1">
              <MaterialIcons name="description" size={16} color={Colors.primary} />
              <Text className="text-sm font-semibold text-secondary ml-2">Descripción</Text>
            </View>
            <Input
              placeholder="Descripción de la tienda (opcional)"
              keyboardType="default"
              value={FormCreateTienda.description}
              multiline={true}
              numberOfLines={4}
              onChangeText={(e: string) => change(e, "description")}
            />
          </View>
        </View>
      </ScrollView>

      {/* Time Picker */}
      <DatePicker
        modal
        theme="dark"
        title=" "
        open={open}
        date={isDateInit ? DateInit : DateEnd}
        mode="time"
        textColor="#FFF"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={(date) => {
          setOpen(false)
          isDateInit ? setDateInit(date) : setDateEnd(date)
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />

      {/* Action Button */}
      <View className="absolute bottom-6 left-0 right-0 px-4">
        <Button
          text={data?.store ? "Guardar Cambios" : "Continuar"}
          disabled={
            !FormCreateTienda.email ||
            !FormCreateTienda.name ||
            !FormCreateTienda.phoneNumber ||
            !isCorreo ||
            (FormCreateTienda.phoneNumber.slice(0, 3) === "+58" && !isNumberPhone)
          }
          onPress={handleContinue}
        />
      </View>
    </View>
  )
}

export default StoreForm


"use client"

import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useEffect, useState } from "react"
import { FontAwesome5, MaterialIcons, AntDesign, Feather } from "@expo/vector-icons"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { getColors } from "react-native-image-colors"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { Colors } from "../../../utils"
import CacheImage from "../../../components/CacheImage/CacheImage"
import { GetHeader, ToastCall, width } from "../../../utils/Helpers"
import CustomImageViewer from "../../../components/CustomImageViewer"
import { useAuth, useRender } from "../../../context"
import type { Paquetes } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import { HttpService } from "../../../services"
import HeaderApp from "../../../components/HeaderApp"

// Add the Productos interface
export interface Productos {
  aditional1: string
  aditional2: string
  amount: number
  creationDate: string
  description: string
  id: number
  igtf: number
  imagenProduct: null | string
  imagenProductContentType: string
  imagenUrl: string
  iva: number
  name: string
  statusProduct: string
  updateDate: string
}

const PaqueteShow = () => {
  const route = useRoute()
  const data = route.params as Paquetes
  const [colors, setColors] = useState<any>(null)
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [visible, setIsVisible] = useState(false)
  const isFocused = useIsFocused()
  const { Paquetes, setPaquetes } = useStoreBusiness()
  const [isLoading, setIsLoading] = useState(true)
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader, language } = useRender()

  // In the PaqueteShow component, add a state for products
  const [products, setProducts] = useState<Productos[]>([])

  // Add state for package status
  const [isActive, setIsActive] = useState(data.status)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (data.imagenUrl) {
      getColors(data.imagenUrl, {
        fallback: Colors.primary,
        cache: true,
        key: data.imagenUrl,
      })
        .then((result) => {
          setColors(result)
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [data.imagenUrl])

  // Add a useEffect to fetch products if needed, or set them from data
  useEffect(() => {
    // If data.products exists, use it, otherwise set an empty array
    setProducts(data.products || [])
    setIsActive(data.status)
  }, [data])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Update the togglePackageStatus function to use the correct endpoint
  const togglePackageStatus = async () => {
    try {
      setUpdatingStatus(true)
      const newStatus = !isActive // Toggle the current status

      // Confirm before changing status
      Alert.alert(
        isActive ? "Eliminar Paquete" : "Activar Paquete",
        `¿Estás seguro que deseas ${isActive ? "Eliminar" : "activar"} este paquete?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setUpdatingStatus(false),
          },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                setLoader(true)
                const host = process.env.APP_BASE_API
                // Use the correct endpoint for changing status
                const url = `/api/appchancea/box-package-changeStatus/{id}/status?id=${data.id}&sessionToken=${SesionToken}&status=${newStatus}`
                const header = await GetHeader(TokenAuthApi, "application/json")

                // Send PATCH request with empty body since parameters are in URL
                const response = await HttpService("post", host, url, {}, header)

                // Update local state
                setIsActive(!isActive)

                // Update packages in context if needed
                if (Paquetes && Paquetes.length > 0) {
                  const updatedPaquetes = Paquetes.map((pkg) =>
                    pkg.id === data.id ? { ...pkg, statusBox: !isActive ? "ACTIVE" : "INACTIVE" } : pkg,
                  )
                  setPaquetes(updatedPaquetes)
                }

                ToastCall("success", `Paquete ${isActive ? "desactivado" : "activado"} exitosamente`, language)
              } catch (error) {
                console.error("Error updating package status:", error)
                ToastCall("error", "Error al actualizar el estado del paquete", language)
              } finally {
                setLoader(false)
                setUpdatingStatus(false)
              }
            },
          },
        ],
      )
    } catch (error) {
      console.error("Error in toggle status:", error)
      setUpdatingStatus(false)
    }
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <HeaderApp title="Detalles del Paquete" />
      {/*  <View className="bg-primary pb-4 px-4 flex-row items-center ">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={22} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-4">Detalles del Paquete</Text>
      </View> */}

      <ScrollView className="flex-1">
        {/* Image Section - Original Configuration */}
        <View
          className="w-screen h-[40vh] justify-center items-center"
          style={[
            {
              shadowColor: "black",
              shadowRadius: 50,
              shadowOffset: { width: 0, height: 50 },
              shadowOpacity: 0.7,
            },
            !isLoading && colors ? { backgroundColor: colors?.lightVibrant } : {},
          ]}
        >
          <View className="justify-center items-center" key={data.id + "renderItem2"}>
            <View className="rounded-2xl overflow-hidden">
              <TouchableOpacity
                onPress={() => {
                  setIsVisible(true)
                }}
              >
                <CacheImage styleImage={{ width: width * 0.6, height: width * 0.6 }} source={{ uri: data.imagenUrl }} />
              </TouchableOpacity>
              {/* <FAB
                onPress={() => navigation.navigate("PaqueteImg", data)}
                placement="right"
                icon={{ name: "edit", color: "white" }}
                color={Colors.primary}
              /> */}
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="bg-white flex-1 rounded-t-3xl -mt-6 pt-6 px-5">
          {/* Status Badge */}
          <View className="absolute right-5 top-2">
            <View
              className={`px-3 py-1 rounded-full ${isActive ? "bg-green-100" : "bg-red-100"} flex-row items-center`}
            >
              <View className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"} mr-1`} />
              <Text className={`text-xs font-medium ${isActive ? "text-green-700" : "text-red-700"}`}>
                {isActive ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>

          {/* Title and Price */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-gray-800">{data.nombre}</Text>
              <Text className="text-gray-500 mt-1">{data.typeBox}</Text>
            </View>
            <View className="bg-primary/10 px-4 py-2 rounded-lg">
              <Text className="text-2xl font-bold text-primary">
                {!data.amount ? "Gratis" : "$" + data.amount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Creation Date */}
          <View className="flex-row items-center mb-4">
            <AntDesign name="calendar" size={16} color={Colors.secondary} />
            <Text className="text-gray-500 ml-2">Creado: {formatDate(data.creationDate)}</Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">Descripción</Text>
            <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <Text className="text-gray-700 leading-relaxed">{data.description || "Sin descripción disponible"}</Text>
            </View>
          </View>

          {/* Products Section */}
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="dinner-dining" size={20} color={Colors.secondary} />
              <Text className="text-lg font-bold text-secondary ml-2">Productos Incluidos</Text>
            </View>
            <View className="bg-gray-50 rounded-xl border border-gray-200">
              <BoxComposition products={products} />
            </View>
          </View>

          {/* Tax Information */}
          {(data.tax > 0 || data.iva > 0 || data.igtf > 0 || data.comission > 0) && (
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">Información Fiscal</Text>
              <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">IVA:</Text>
                  <Text className="font-semibold">${data.iva.toFixed(2)}</Text>
                </View>
                {data.tax > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">Impuesto:</Text>
                    <Text className="font-semibold">${data.tax.toFixed(2)}</Text>
                  </View>
                )}
                {data.igtf > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">IGTF:</Text>
                    <Text className="font-semibold">${data.igtf.toFixed(2)}</Text>
                  </View>
                )}
                {data.comission > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Comisión:</Text>
                    <Text className="font-semibold">${data.comission.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Activate/Deactivate Button */}
          <View className="mb-8">
            <TouchableOpacity
              className={`py-3.5 rounded-xl flex-row justify-center items-center ${isActive ? "bg-red-500" : "bg-green-500"
                } ${updatingStatus ? "opacity-70" : "opacity-100"}`}
              onPress={togglePackageStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name={isActive ? "trash" : "check-circle"} size={20} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    {isActive ? "Eliminar Paquete" : "Activar Paquete"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          {/*  <View className="flex-row justify-between mb-8">
            <TouchableOpacity
              className="flex-1 mr-2 bg-gray-100 py-3 rounded-xl flex-row justify-center items-center"
              onPress={() => navigation.goBack()}
            >
              <FontAwesome5 name="arrow-left" size={16} color={Colors.secondary} />
              <Text className="ml-2 font-semibold text-secondary">Volver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 ml-2 bg-primary py-3 rounded-xl flex-row justify-center items-center"
              onPress={() => navigation.navigate("PaqueteImg", data)}
            >
              <FontAwesome5 name="edit" size={16} color="white" />
              <Text className="ml-2 font-semibold text-white">Editar</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <CustomImageViewer
        images={[{ uri: data.imagenUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        FooterComponent={(props: { imageIndex: number }) => (
          <View className="bg-black/50 p-4 items-center">
            <Text className="text-white text-base font-semibold">{data.nombre}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default PaqueteShow

const BoxComposition = ({ products }: { products: Productos[] }) => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [producData, setProducData] = useState<Productos[]>(products || [])

  // Remove the GetBoxProduc function and useEffect since data is passed directly

  if (loading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    )
  }

  if (!products || products.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text className="text-gray-500 italic">No hay productos en este paquete</Text>
      </View>
    )
  }

  return (
    <View className="p-4">
      {products.map((product, index) => (
        <View key={`product-${index}`} className="flex-row items-center mb-2 last:mb-0">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text className="text-gray-700">{product.name}</Text>
        </View>
      ))}
    </View>
  )
}


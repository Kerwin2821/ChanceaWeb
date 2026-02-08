"use client"

import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useEffect, useState } from "react"
import { FontAwesome5, AntDesign, Feather } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { getColors } from "react-native-image-colors"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { Colors } from "../../../utils"
import CacheImage from "../../../components/CacheImage/CacheImage"
import { GetHeader, ToastCall, width } from "../../../utils/Helpers"
import CustomImageViewer from "../../../components/CustomImageViewer"
import { useAuth, useRender } from "../../../context"
import { HttpService } from "../../../services"
import HeaderApp from "../../../components/HeaderApp"

// Product interface
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

// Product type mapping
const PRODUCT_TYPES = [
  { label: "Comida", value: "NORMAL" },
  { label: "Regalo", value: "REGALO" },
]

const ProductoShow = () => {
  const route = useRoute()
  const data = route.params as Productos
  const [colors, setColors] = useState<any>(null)
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [visible, setIsVisible] = useState(false)
  const { Productos, setProductos } = useStoreBusiness()
  const [isLoading, setIsLoading] = useState(true)
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader, language } = useRender()

  // Add state for product status
  const [isActive, setIsActive] = useState(data.statusProduct === "ACTIVO")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Function to get product type label
  const getProductTypeLabel = (value: string) => {
    const productType = PRODUCT_TYPES.find((type) => type.value === value)
    return productType ? productType.label : value
  }

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

  useEffect(() => {
    setIsActive(data.statusProduct === "ACTIVO")
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Update the toggleProductStatus function to use the correct endpoint
  const toggleProductStatus = async () => {
    try {
      setUpdatingStatus(true)
      const newStatus = isActive ? "INACTIVO" : "ACTIVO" // Use string values instead of boolean

      // Confirm before changing status
      Alert.alert(
        isActive ? "Eliminar Producto" : "Activar Producto",
        `¿Estás seguro que deseas ${isActive ? "Eliminar" : "activar"} este producto?`,
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
                // Use the correct endpoint for changing product status
                const url = `/api/appchancea/products/change-status/${data.id}?sessionToken=${SesionToken}&status=${newStatus}`
                const header = await GetHeader(TokenAuthApi, "application/json")

                // Send POST request with empty body
                const response = await HttpService("post", host, url, {}, header)

                // Update local state
                setIsActive(!isActive)

                // Update products in context if needed
                if (Productos && Productos.length > 0) {
                  const updatedProductos = Productos.map((prod) =>
                    prod.id === data.id ? { ...prod, statusProduct: !isActive ? "ACTIVE" : "INACTIVE" } : prod,
                  )
                  setProductos(updatedProductos)
                }

                ToastCall("success", `Producto ${isActive ? "desactivado" : "activado"} exitosamente`, language)
              } catch (error) {
                console.error("Error updating product status:", error)
                ToastCall("error", "Error al actualizar el estado del producto", language)
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
      <HeaderApp title="Detalles del Producto" />

      <ScrollView className="flex-1">
        {/* Image Section */}
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
              <Text className="text-2xl font-bold text-gray-800">{data.name}</Text>
              {data.aditional2 && (
                <View className="flex-row items-center mt-1">
                  <View
                    className={`w-2 h-2 rounded-full ${data.aditional2 === "REGALO" ? "bg-purple-500" : "bg-orange-500"} mr-2`}
                  />
                  <Text className="text-gray-500">{getProductTypeLabel(data.aditional2)}</Text>
                </View>
              )}
            </View>
            {/* <View className="bg-primary/10 px-4 py-2 rounded-lg">
              <Text className="text-2xl font-bold text-primary">
                {!data.amount ? "Gratis" : formatCurrency(data.amount)}
              </Text>
            </View> */}
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

          {/* Product Type */}
          {data.aditional2 && (
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">Tipo de Producto</Text>
              <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <View className="flex-row items-center">
                  <View
                    className={`w-3 h-3 rounded-full ${data.aditional2 === "REGALO" ? "bg-purple-500" : "bg-orange-500"} mr-3`}
                  />
                  <Text className="text-gray-700 font-medium">{getProductTypeLabel(data.aditional2)}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Tax Information */}
          {(data.iva > 0 || data.igtf > 0) && (
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-700 mb-2">Información Fiscal</Text>
              <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                {data.iva > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">IVA:</Text>
                    <Text className="font-semibold">{data.iva}%</Text>
                  </View>
                )}
                {data.igtf > 0 && (
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">IGTF:</Text>
                    <Text className="font-semibold">${data.igtf.toFixed(2)}</Text>
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
              onPress={toggleProductStatus}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name={isActive ? "trash" : "check-circle"} size={20} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    {isActive ? "Eliminar Producto" : "Activar Producto"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mb-8">
            <TouchableOpacity
              className="flex-1 mr-2 bg-gray-100 py-3 rounded-xl flex-row justify-center items-center"
              onPress={() => navigation.goBack()}
            >
              <FontAwesome5 name="arrow-left" size={16} color={Colors.secondary} />
              <Text className="ml-2 font-semibold text-secondary">Volver</Text>
            </TouchableOpacity>

            {/*   <TouchableOpacity
              className="flex-1 ml-2 bg-primary py-3 rounded-xl flex-row justify-center items-center"
              onPress={() => navigation.navigate("ProductoImg", data)}
            >
              <FontAwesome5 name="edit" size={16} color="white" />
              <Text className="ml-2 font-semibold text-white">Editar</Text>
            </TouchableOpacity> */}
          </View>
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
            <Text className="text-white text-base font-semibold">{data.name}</Text>
          </View>
        )}
      />
    </View>
  )
}

export default ProductoShow


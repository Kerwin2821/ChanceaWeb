"use client"

import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { CommonActions, useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import { Image } from "expo-image"
import { GetHeader, height } from "../../utils/Helpers"
import Button from "../../components/ButtonComponent/Button"
import { Colors } from "../../utils"
import { font } from "../../../styles"
import { useStore } from "../../context/storeContext/StoreState"
import type { Product, ProductData } from "../../utils/Date.interface"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth } from "../../context"
import { HttpService } from "../../services"
import type { AxiosError } from "axios"
import { ListItem } from "@rn-vui/themed"
import { SafeAreaView } from "react-native-safe-area-context"
import Share from "react-native-share"
import ViewShot from "react-native-view-shot"
import type { GiftData } from "./interface.regalos"
import { LinearGradient } from "expo-linear-gradient"
import { RegaloNotification } from "../../components/PushNotification.interface"
import CacheImage from "../../components/CacheImage/CacheImage"
import { clearOrden } from "../../services/CacheStorage/Orden/OrdenStorage"

const PaymentRegalosSuccess = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [ImageData, setImageData] = useState("")
  const [visible, setIsVisible] = useState(false)
  const isFocused = useIsFocused()
  const { setBoxPackage } = useStore()
  const viewShotRef = useRef<any>(null)
  const route = useRoute()
  const { data, amount } = route.params as {
    data:GiftData
    amount: number
  }
  const [colors, setColors] = useState<any>(null)
  const tasa = useMemo(() => {
    return Number(amount) / Number(data.boxPackage.amount)
  }, [])

  const igtfAmount = useMemo(() => {
    return Number(data.boxPackage.igtf) * tasa
  }, [tasa])
  const ivaAmount = useMemo(() => {
    return Number(data.boxPackage.iva) * tasa
  }, [tasa])
  const monto = useMemo(() => {
    return Number(amount) - ivaAmount - igtfAmount
  }, [ivaAmount, igtfAmount])

  const onImageLoad = useCallback(async () => {
    const uri = await viewShotRef.current.capture()
    await Share.open({
      url: uri,
      title: "Compartir Captura de Pantalla",
      failOnCancel: false,
    })
  }, [])

  const goHome = useCallback(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    )
  }, [navigation])

  useEffect(() => {
    const preventBackNavigation = (e: any) => {
      // Verificar si la acción es de tipo 'goBack'
      if (e.data.action.type === "GO_BACK") {
        // Prevenir la acción de retroceder
        e.preventDefault()
      }
    }

    const unsubscribe = navigation.addListener("beforeRemove", preventBackNavigation)

    return unsubscribe // Limpiar el listener al desmontar
  }, [navigation])

  useEffect(() => {
    clearOrden()
  }, [])
  

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <ViewShot ref={viewShotRef} options={{ fileName: "Payment-Receipt", format: "jpg", quality: 0.9, }}>
          {/* Success Header with Animation */}
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full py-8 px-6 rounded-b-3xl"
          >
            <View className="items-center">
              <View className="w-20 h-20 bg-white/30 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={60} color="white" />
              </View>
              <Text className="text-white text-2xl font-bold mb-1">¡Pago Exitoso!</Text>
              <Text className="text-white/80 text-center">
                Tu regalo ha sido procesado correctamente y está en camino
              </Text>
            </View>
          </LinearGradient>

          {/* Order Number */}
          <View className="bg-gray-50 mx-6 mt-6 p-4 rounded-xl border border-gray-200">
            <View className="flex-row justify-between items-center">
             {/*  <Text className="text-gray-500" style={font.SemiBold}>
                ORDEN #
              </Text>
              <Text className="text-secondary font-bold">{data.boxPackage.codigoOrden.toString().substring(0, 8)}</Text> */}
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-500" style={font.SemiBold}>
                FECHA
              </Text>
              <Text className="text-secondary">
                {new Date().toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          {/* Package Details */}
          <View className="mx-6 mt-6" >
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="card-giftcard" size={24} color={Colors.primary} />
              <Text className="text-xl font-bold text-secondary ml-2">Detalles del Regalo</Text>
            </View>

            {/* Package Image and Info */}
            <View className="flex-row bg-white rounded-xl overflow-hidden border border-gray-200 mb-4" style={{
              width: "100%",
              height: height * 0.15,
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              minHeight: 130,
              marginBottom: 10,
              position: "relative",
              paddingRight: 16,
              borderWidth: 2,
              borderRadius: 16,
            }}>
              <View style={{ width: "40%", height: "100%", position: "relative", padding: 8 }}>
                <CacheImage
                  source={{ uri: data.boxPackage.imagenUrl }}
                  styleImage={{ width: "100%", height: "100%" }}
                />
              </View>
              <View className="w-2/3 p-3">
                <Text className="text-lg font-bold text-secondary mb-1">{data.boxPackage.nombre}</Text>
                <View className="flex-row items-center mb-2">
                  <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                  <Text className="text-gray-600">{data.boxPackage.typeBox}</Text>
                </View>
                <Text className="text-xs text-gray-500" numberOfLines={2}>
                  {data.boxPackage.description || "Sin descripción"}
                </Text>
              </View>
            </View>

            {/* Recipient Info */}
            <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
              <View className="flex-row items-center mb-3">
                <FontAwesome5 name="user" size={16} color={Colors.primary} />
                <Text className="text-base font-bold text-secondary ml-2">Destinatario</Text>
              </View>
              <Text className="text-gray-700">
                {!data.boxPackage.customerFirstName ? data.customerDestination.firstName : data.boxPackage.customerFirstName}
              </Text>
             {/*  <Text className="text-gray-500 text-sm">{data.customerDestination?.phone}</Text> */}
              {/* {data.message && (
                <View className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                  <Text className="text-gray-500 text-xs mb-1">Mensaje:</Text>
                  <Text className="text-gray-700 italic">"{data.message}"</Text>
                </View>
              )} */}
            </View>

            {/* Products Section */}
            <View className="bg-white rounded-xl border border-gray-200 mb-4">
              <View className="p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                  <MaterialIcons name="dinner-dining" size={20} color={Colors.primary} />
                  <Text className="text-base font-bold text-secondary ml-2">Productos Incluidos</Text>
                </View>
              </View>
              <BoxComposition BoxId={Number(data.boxPackage.id)} />
            </View>

            {/* Price Breakdown */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <FontAwesome5 name="money-bill-wave" size={18} color={Colors.primary} />
                <Text className="text-base font-bold text-secondary ml-2">Detalles del Pago</Text>
              </View>

              <View className="rounded-xl overflow-hidden border border-gray-200">
                <ListItem bottomDivider>
                  <ListItem.Content>
                    <Text style={[font.SemiBold]}>Subtotal</Text>
                  </ListItem.Content>
                  <ListItem.Content right>
                    <ListItem.Title style={[font.SemiBold]}>
                      {monto.toLocaleString("es-VE", { minimumFractionDigits: 2 })} $
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>

                <ListItem bottomDivider>
                  <ListItem.Content>
                    <Text style={[font.Regular]}>IGTF</Text>
                  </ListItem.Content>
                  <ListItem.Content right>
                    <ListItem.Title style={[font.Regular]}>
                      {igtfAmount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} $
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>

                <ListItem bottomDivider>
                  <ListItem.Content>
                    <Text style={[font.Regular]}>IVA</Text>
                  </ListItem.Content>
                  <ListItem.Content right>
                    <ListItem.Title style={[font.Regular]}>
                      {ivaAmount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} $
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>

                <ListItem containerStyle={{ backgroundColor: Colors.primary + "15" }}>
                  <ListItem.Content>
                    <Text style={[font.Bold, { fontSize: 18, color: Colors.secondary }]}>Total</Text>
                  </ListItem.Content>
                  <ListItem.Content right>
                    <ListItem.Title style={[font.Bold, { fontSize: 18, color: Colors.primary }]}>
                      {amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} $
                    </ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              </View>
            </View>

            {/* Store Info */}
            {/* {data.storeBusiness && (
              <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                <View className="flex-row items-center mb-3">
                  <FontAwesome5 name="store" size={16} color={Colors.primary} />
                  <Text className="text-base font-bold text-secondary ml-2">Tienda</Text>
                </View>
                <Text className="text-gray-700 font-medium">{data.storeBusiness.name}</Text>
                <Text className="text-gray-500 text-sm">{data.storeBusiness.phoneNumber}</Text>
              </View>
            )} */}
          </View>

          {/* Thank You Message */}
          <View className="items-center my-6 px-6">
            <Text className="text-center text-gray-500 mb-2">¡Gracias por tu compra!</Text>
            <Text className="text-center text-xs text-gray-400">
              Puedes compartir este recibo usando el botón de abajo
            </Text>
          </View>
        </ViewShot>
      </ScrollView>

      {/* Action Buttons */}
      <View className="bg-white border-t border-gray-200 p-4">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-gray-100 rounded-xl py-3 px-5"
            onPress={onImageLoad}
          >
            <Entypo name="share" size={20} color={Colors.secondary} />
            <Text className="ml-2 font-semibold text-secondary">Compartir</Text>
          </TouchableOpacity>

          <View className="flex-1 ml-3">
            <Button text={"Volver al inicio"} onPress={goHome} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default PaymentRegalosSuccess

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const [Loading, setLoading] = useState(true)
  const [ProductData, setProductData] = useState<Product[]>([])

  async function GetBoxProduct() {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: ProductData[] = await HttpService("get", host, url, {}, header)
      setProductData(response.map((e) => e.product))
    } catch (err) {
      const errors = err as AxiosError
      console.log(errors, "GetRegalos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    GetBoxProduct()
  }, [])

  if (Loading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    )
  }

  if (!ProductData || ProductData.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text className="text-gray-500 italic">No hay productos en este paquete</Text>
      </View>
    )
  }

  return (
    <View className="p-4">
      {ProductData.map((product, index) => (
        <View key={`product-${index}`} className="flex-row items-center mb-2">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text className="text-gray-700">{product.name}</Text>
        </View>
      ))}
    </View>
  )
}

"use client"

import { View, Text, TouchableOpacity, Platform, ScrollView, Linking, ActivityIndicator } from "react-native"
import { useEffect, useRef, useState } from "react"
import { FontAwesome5, FontAwesome6, Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import { GetHeader, width } from "../../utils/Helpers"
import Button from "../../components/ButtonComponent/Button"
import { getColors } from "react-native-image-colors"
import { Colors } from "../../utils"
import { useStore } from "../../context/storeContext/StoreState"
import CustomImageViewer from "../../components/CustomImageViewer"
import type { BoxPackage, BoxPackageV2, Product, ProductData } from "../../utils/Date.interface"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import type { AxiosError } from "axios"
import CacheImage from "../../components/CacheImage/CacheImage"
import { SafeAreaView } from "react-native-safe-area-context"
import HeaderApp from "../../components/HeaderApp"

const RegaloDetallesPackage = () => {
  const route = useRoute()
  const data = route.params as BoxPackageV2
  const [colors, setColors] = useState<any>(null)
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [visible, setIsVisible] = useState(false)
  const isFocused = useIsFocused()
  const { setBoxPackage } = useStore()
  const { setLoader } = useRender()
  const [isLoading, setIsLoading] = useState(true)

  const selectPackage = () => {
    console.log(data)
    if (!data?.stores || data.stores.length === 0) {
      console.log("No stores available for this package")
      return
    }
    const dataCreate = { ...data, id: data.stores[0].boxPackageId }
    setBoxPackage(dataCreate)
    navigation.goBack()
    navigation.goBack()
  }

  const selectCustomer = () => {
    setBoxPackage(data)
    navigation.navigate("HomeScreen")
  }


  useEffect(() => {
    console.log(data, "data")
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const Container = Platform.OS === "web" ? View : SafeAreaView

  return (
    <Container
      className="flex-1"
      style={{ backgroundColor: colors ? (Platform.OS === 'web' ? colors.lightVibrant : colors.lightVibrant) : Colors.BackgroundLight }}
    >
      <View>
        {/* Header */}
        <HeaderApp title="Detalles del Paquete" />


        {/* Image Section */}
        <View
          className="w-screen h-[45vh] justify-center items-center"
          style={{
            paddingBottom: 80,
            paddingTop: 20,
            shadowColor: "black",
            shadowRadius: 50,
            shadowOffset: { width: 0, height: 50 },
            shadowOpacity: Platform.OS === 'web' ? 0 : 0.7,
          }}
        >
          <View className="justify-center items-center" key={data.id + "renderItem2"}>
            <View className="rounded-2xl overflow-hidden shadow-lg">
              <TouchableOpacity
                onPress={() => {
                  setIsVisible(true)
                }}
              >
                <CacheImage
                  styleImage={{
                    width: width * 0.65,
                    height: width * 0.65,
                    maxWidth: Platform.OS === 'web' ? 300 : undefined,
                    maxHeight: Platform.OS === 'web' ? 300 : undefined,
                  }}
                  source={{ uri: data.imagenUrl }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView
        className="bg-white flex-1 px-5"
        style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: Platform.OS === 'web' ? 0 : -40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Spacer to distance from image while background overlaps */}
        <View style={{ height: 20 }} />

        {/* Package Title and Type */}
        <View className="mt-6 mb-2">
          <Text className="text-2xl font-bold text-secondary w-1/2">{data.nombre}</Text>
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 rounded-full bg-primary mr-2" />
            <Text className="text-gray-500 font-medium">{data.typeBox}</Text>
          </View>
        </View>

        {/* Price Badge */}
        <View className="absolute right-5 top-6">
          <View className="bg-primary/10 px-4 py-2 rounded-lg">
            <Text className="text-xl font-bold text-primary">
              {!data.amount ? "Gratis" : formatCurrency(data.amount)}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">Descripción</Text>
          <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <Text className="text-gray-700 leading-relaxed">{data.description || "Sin descripción disponible"}</Text>
          </View>
        </View>

        {/* Products Section */}
        <View className="mb-4">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="dinner-dining" size={20} color={Colors.secondary} />
            <Text className="text-lg font-bold text-secondary ml-2">Productos Incluidos</Text>
          </View>
          <View className="bg-gray-50 rounded-xl border border-gray-200">
            <BoxComposition BoxId={data.id} />
          </View>
        </View>


        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="w-full">
            <Button styleText={{ color: "white" }} text={"Seleccionar paquete"} onPress={selectPackage} />
          </View>
        </View>
      </ScrollView>

      {/* Image Viewer */}
      <CustomImageViewer
        images={!!data.imagenes ? data.imagenes.map(e => ({ uri: e.imageUrl })) : [{ uri: data.imagenUrl }]}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        FooterComponent={(props: { imageIndex: number }) => (
          <View className="bg-black/50 p-4 items-center">
            <Text className="text-white text-base font-semibold">{data.nombre}</Text>
          </View>
        )}
      />
    </Container>
  )
}

export default RegaloDetallesPackage

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const [loading, setLoading] = useState(true)
  const [producData, setProducData] = useState<Product[]>([])

  async function GetBoxProduc() {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: ProductData[] = await HttpService("get", host, url, {}, header)
      setProducData(response.map((e) => e.product))
    } catch (err) {
      const errors = err as AxiosError
      console.log(errors, "GetCitas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    GetBoxProduc()
  }, [])

  if (loading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    )
  }

  if (!producData || producData.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text className="text-gray-500 italic">No hay productos en este paquete</Text>
      </View>
    )
  }

  return (
    <View className="p-4">
      {producData.map((product, index) => (
        <View key={`product-${index}`} className="flex-row items-center mb-2 last:mb-0">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text className="text-gray-700">{product.name}</Text>
        </View>
      ))}
    </View>
  )
}

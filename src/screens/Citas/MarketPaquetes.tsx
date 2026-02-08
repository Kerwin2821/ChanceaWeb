"use client"

import {
  View,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Text,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from "react-native"
import { useCallback, useEffect, useState, useMemo } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Colors } from "../../utils"
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons"
import { useAuth, useRender } from "../../context"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { font } from "../../../styles"
import { HttpService } from "../../services"
import { GetHeader } from "../../utils/Helpers"
import type { BoxPackageV2 } from "../../utils/Date.interface"
import InstaImagCategory from "../../components/InstaImagCategory"
import CacheImage from "../../components/CacheImage/CacheImage"

export interface Category {
  category: string
  imageUrl: string
}

const CuponsAll = {
  category: "TODOS",
  imageUrl: "",
}

const MarketPaquetes = () => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [BoxPackageArray, setBoxPackageArray] = useState<BoxPackageV2[]>([])
  const [DataCategory, setDataCategory] = useState<Category[]>([])
  const [CategorySelect, setCategorySelect] = useState<Category>(CuponsAll)
  const route = useRoute()
  const { width: windowWidth } = useWindowDimensions()
  const data = route.params as {
    userId: string
  }

  // Estados para la paginación
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const PAGE_SIZE = 12

  // Responsiveness
  const numColumns = useMemo(() => {
    if (windowWidth >= 1024) return 4
    if (windowWidth >= 768) return 3
    return 2
  }, [windowWidth])

  const contentMaxWidth = 1200

  // Función para obtener los paquetes iniciales o al cambiar de categoría
  const getCupouns = useCallback(async () => {
    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url =
        CategorySelect.category === "TODOS"
          ? `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&typeBox.notIn=REGALO&page=0&size=${PAGE_SIZE}`
          : `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&typeBox.equals=${CategorySelect.category}&page=0&size=${PAGE_SIZE}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const req = {}

      const response = await HttpService("get", host, url, req, header, setLoader)

      if (response.length) {
        setBoxPackageArray(response)
        setPage(1) // Comenzamos en página 1 para la próxima carga
        setHasMore(response.length === PAGE_SIZE) // Si recibimos menos elementos que el tamaño de página, no hay más datos
      } else {
        setBoxPackageArray([])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      setBoxPackageArray([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [CategorySelect, data.userId, SesionToken, TokenAuthApi])

  // Función para cargar más paquetes (paginación)
  const loadMorePackages = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url =
        CategorySelect.category === "TODOS"
          ? `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&typeBox.notIn=REGALO&page=${page}&size=${PAGE_SIZE}`
          : `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&typeBox.equals=${CategorySelect.category}&page=${page}&size=${PAGE_SIZE}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const req = {}

      const response = await HttpService("get", host, url, req, header)

      if (response.length) {
        // Filtrar duplicados antes de añadir nuevos elementos
        const uniqueNewItems = response.filter(
          (newItem: BoxPackageV2) => !BoxPackageArray.some((existingItem) => existingItem.id === newItem.id),
        )

        setBoxPackageArray((prevItems) => [...prevItems, ...uniqueNewItems])
        setPage(page + 1)
        setHasMore(response.length === PAGE_SIZE) // Si recibimos menos elementos que el tamaño de página, no hay más datos
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more packages:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, CategorySelect, data.userId, SesionToken, TokenAuthApi, BoxPackageArray])

  // Función para refrescar la lista
  const handleRefresh = useCallback(() => {
    setPage(0)
    setHasMore(true)
    getCupouns()
  }, [getCupouns])

  const getCategorys = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/product-categories/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: Category[] = await HttpService("get", host, url, {}, header)

      setDataCategory([
        {
          category: "TODOS",
          imageUrl: "",
        },
        ...response,
      ])
    } catch (error) {
      console.log(JSON.stringify(error))
    }
  }, [TokenAuthApi, SesionToken])

  // Componente para el pie de lista (indicador de carga)
  const renderFooter = () => {
    if (!loading) return null

    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  useEffect(() => {
    if (TokenAuthApi) {
      handleRefresh()
    }
  }, [TokenAuthApi, CategorySelect])

  useEffect(() => {
    getCupouns()
    getCategorys()
  }, [])

  const renderItem = ({ item }: { item: BoxPackageV2 }) => {
    const cardWidth = (Math.min(windowWidth, contentMaxWidth) - 48) / numColumns

    return (
      <View style={{ width: cardWidth }} className="p-2">
        <TouchableOpacity
          onPress={() => navigation.navigate("DetallesPackage", item)}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          style={{ elevation: 2 }}
        >
          <View style={{ width: '100%', aspectRatio: 1 }}>
            <CacheImage classNameImage="w-full h-full" source={{ uri: item.imagenUrl }} />
            <View className="absolute top-2 right-2 bg-primary/90 px-3 py-1 rounded-full">
              <Text className="text-white text-xs" style={font.Bold}>${item.amount}</Text>
            </View>
          </View>

          <View className="p-3 items-center">
            <Text style={font.Bold} numberOfLines={1} className="text-gray-800 text-sm mb-1 text-center w-full">
              {item.nombre}
            </Text>
            <Text style={font.SemiBold} className="text-gray-400 text-[10px] text-center uppercase tracking-wider">
              {item.typeBox}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-primary">
        <TouchableOpacity
          className="mr-4"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text className="text-xl text-white" style={font.Bold}>
          Catálogo de Paquetes
        </Text>
      </View>

      <View
        style={{
          maxWidth: contentMaxWidth,
          width: '100%',
          alignSelf: 'center',
        }}
        className="flex-1"
      >
        {/* Category List */}
        <View className="py-4 bg-white shadow-sm mb-2">
          <Text className="px-4 mb-2 text-gray-400 text-xs uppercase" style={font.Bold}>Categorías</Text>
          {DataCategory.length ? (
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={DataCategory}
              renderItem={({ item, index }) => (
                <InstaImagCategory
                  item={item}
                  index={index}
                  onPress={(e) => {
                    if (e.category !== CategorySelect.category) {
                      setBoxPackageArray([])
                      setPage(0)
                      setHasMore(true)
                      setCategorySelect(e)
                    }
                  }}
                  itemSelect={CategorySelect}
                />
              )}
              initialNumToRender={10}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              style={{ flexGrow: 0 }}
            />
          ) : (
            <View className="h-20 justify-center px-4">
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        </View>

        {/* Content Grid */}
        <FlatList
          key={`${numColumns}`} // Force re-render when columns change
          data={BoxPackageArray}
          numColumns={numColumns}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 8, paddingBottom: 40 }}
          onEndReached={loadMorePackages}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={loading && page === 0}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 justify-center items-center py-20">
                <FontAwesome5 name="store" size={48} color="#E5E7EB" />
                <Text style={font.SemiBold} className="text-gray-400 text-center mt-4 px-10">
                  No encontramos paquetes en esta categoría. ¡Prueba con otra!
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default MarketPaquetes

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
import { FontAwesome6, FontAwesome5 } from "@expo/vector-icons"
import { useAuth, useRender } from "../../context"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { font } from "../../../styles"
import { HttpService } from "../../services"
import { GetHeader } from "../../utils/Helpers"
import type { BoxPackageV2 } from "../../utils/Date.interface"
import InstaImagCategoryRegalos from "../../components/InstaImagCategoryRegalos"
import CacheImage from "../../components/CacheImage/CacheImage"

export interface CategoryRegalos {
  id: string
  description: string
  statusCategory: string
}

const CuponsAll: CategoryRegalos = {
  id: "00",
  description: "TODOS",
  statusCategory: "ACTIVE",
}

const MarketRegalos = () => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [BoxPackageArray, setBoxPackageArray] = useState<BoxPackageV2[]>([])
  const [DataCategory, setDataCategory] = useState<CategoryRegalos[]>([])
  const [CategorySelect, setCategorySelect] = useState<CategoryRegalos>(CuponsAll)
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

  const getCupouns = useCallback(async () => {
    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url =
        CategorySelect.description === "TODOS"
          ? `/api/appchancea/box-packages/sortDestinationByCustomer_2/${SesionToken}?customerDestinationId=${data.userId}&typeBox.in=REGALO&page=0&size=${PAGE_SIZE}`
          : `/api/appchancea/box-packages/sortDestinationByCustomer_2/${SesionToken}?customerDestinationId=${data.userId}&gifCategoryId.equals=${CategorySelect.id}&page=0&size=${PAGE_SIZE}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("get", host, url, {}, header, setLoader)

      if (response && response.length > 0) {
        setBoxPackageArray(response)
        setPage(1)
        setHasMore(response.length === PAGE_SIZE)
      } else {
        setBoxPackageArray([])
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error fetching gift packages:", error)
      setBoxPackageArray([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [CategorySelect, data.userId, SesionToken, TokenAuthApi])

  const loadMorePackages = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url =
        CategorySelect.description === "TODOS"
          ? `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&typeBox.in=REGALO&page=${page}&size=${PAGE_SIZE}`
          : `/api/appchancea/box-packages/sortDestinationByCustomer/${SesionToken}?customerDestinationId=${data.userId}&gifCategoryId.equals=${CategorySelect.id}&page=${page}&size=${PAGE_SIZE}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("get", host, url, {}, header)

      if (response && response.length > 0) {
        const uniqueNewItems = response.filter(
          (newItem: BoxPackageV2) => !BoxPackageArray.some((existingItem) => existingItem.id === newItem.id),
        )
        setBoxPackageArray((prevItems) => [...prevItems, ...uniqueNewItems])
        setPage(page + 1)
        setHasMore(response.length === PAGE_SIZE)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error loading more gift packages:", error)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, CategorySelect, data.userId, SesionToken, TokenAuthApi, BoxPackageArray])

  const handleRefresh = useCallback(() => {
    setPage(0)
    setHasMore(true)
    getCupouns()
  }, [getCupouns])

  const getCategorys = useCallback(async () => {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/get/gif/category/gift/${SesionToken}?page=0&size=50`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: CategoryRegalos[] = await HttpService("get", host, url, {}, header)

      setDataCategory([
        {
          description: "TODOS",
          statusCategory: "ACTIVE",
          id: "00",
        },
        ...(response || []),
      ])
    } catch (error) {
      console.log("Error fetching categories:", JSON.stringify(error))
    }
  }, [TokenAuthApi, SesionToken])

  const renderFooter = () => {
    return (
      <View style={{ paddingVertical: 30, alignItems: "center" }}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : hasMore ? (
          <TouchableOpacity
            onPress={loadMorePackages}
            className="px-8 py-3 bg-primary rounded-full shadow-sm"
          >
            <Text style={[font.Bold, { color: "white" }]}>Cargar más</Text>
          </TouchableOpacity>
        ) : BoxPackageArray.length > 0 ? (
          <View className="flex-row items-center opacity-50">
            <View className="h-[1] flex-1 bg-gray-300" />
            <Text className="mx-4 text-gray-500" style={font.SemiBold}>Fin del catálogo</Text>
            <View className="h-[1] flex-1 bg-gray-300" />
          </View>
        ) : null}
      </View>
    )
  }

  useEffect(() => {
    if (TokenAuthApi) {
      handleRefresh()
    }
  }, [TokenAuthApi, CategorySelect])

  useEffect(() => {
    getCategorys()
  }, [])

  const renderItem = ({ item }: { item: BoxPackageV2 }) => {
    const cardWidth = (Math.min(windowWidth, contentMaxWidth) - 48) / numColumns

    return (
      <View style={{ width: cardWidth }} className="p-2">
        <TouchableOpacity
          onPress={() => navigation.navigate("RegaloDetallesPackage", item)}
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
          Catálogo de Regalos
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
              keyExtractor={(item) => item.id}
              data={DataCategory}
              renderItem={({ item, index }) => (
                <InstaImagCategoryRegalos
                  item={item}
                  index={index}
                  onPress={(e) => {
                    if (e.id !== CategorySelect.id) {
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
                <FontAwesome5 name="gift" size={48} color="#E5E7EB" />
                <Text style={font.SemiBold} className="text-gray-400 text-center mt-4 px-10">
                  No encontramos regalos en esta categoría. ¡Prueba con otra!
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default MarketRegalos

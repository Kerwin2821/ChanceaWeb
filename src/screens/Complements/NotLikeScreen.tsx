"use client"

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useEffect, useState, useCallback } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, ToastCall, width } from "../../utils/Helpers"
import CardLayout from "../../components/CardLayout/CardLayout"
import { font } from "../../../styles"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers"
import { FontAwesome6, Ionicons } from "@expo/vector-icons"

const NotLikeScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { user, TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const isFocus = useIsFocused()
  const [NoMatch, setNoMatch] = useState<any[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [UserSelect, setUserSelect] = useState<number>(0)

  // Nuevos estados para la paginación
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const PAGE_SIZE = 20 // Tamaño de página más pequeño para mejor experiencia

  // Función modificada para soportar paginación
  async function GetMatch(pageNumber = 0, shouldAppend = false) {
    if (loading || (!hasMore && pageNumber > 0)) return

    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/not-likes/${SesionToken}?customerSourceId.equals=${user?.id}&page=${pageNumber}&size=${PAGE_SIZE}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, header, setLoader)

      const newItems = response.map((e: any) => e.customerDestionation)

      // Si no hay nuevos elementos o hay menos elementos que el tamaño de página, no hay más datos
      if (newItems.length === 0 || newItems.length < PAGE_SIZE) {
        setHasMore(false)
      }

      // Actualizar la lista de elementos
      if (shouldAppend) {
        // Filtrar duplicados al añadir nuevos elementos
        const uniqueNewItems = newItems.filter(
          (newItem: any) => !NoMatch.some((existingItem) => existingItem.id === newItem.id),
        )
        setNoMatch((prevItems) => [...prevItems, ...uniqueNewItems])
      } else {
        setNoMatch(newItems)
        setHasMore(true) // Resetear hasMore cuando se carga desde el principio
      }

      setPage(pageNumber)
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para cargar más datos
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      GetMatch(page + 1, true)
    }
  }, [loading, hasMore, page])

  // Función para refrescar la lista
  const handleRefresh = useCallback(() => {
    setPage(0)
    setHasMore(true)
    GetMatch(0, false)
  }, [])

  async function Consult(item: any) {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/${item?.id}?sessionToken=${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, header, setLoader)
      navigation.navigate("CustomerProfile", { Customer: response, type: "NotLike" })
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }

  // Componente para el pie de lista (indicador de carga)
  const renderFooter = () => {
    if (!loading) return null

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  useEffect(() => {
    if (isFocus) {
      handleRefresh()
    }

    // Explicitly clear loader when leaving this screen
    return () => {
      setLoader(false)
    }
  }, [isFocus])

  return (
    <ScreenContainer backgroundColor="white">
      <View className=" px-5 py-2  items-start z-30 ">
        <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" px-3 my-2">
        <Text className=" text-2xl text-primary" style={font.Bold}>
          No me gusta
        </Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {NoMatch.length > 0 || loading ? (
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={NoMatch}
            renderItem={({ item, index }) => {
              return (
                <CardLayout
                  idUser={item.id}
                  photo={{ uri: item.customerProfiles.length ? item.customerProfiles[0].link : undefined }}
                  key={item.id}
                  onPress={() => Consult(item)}
                  onLongPress={() => {
                    /* setUserSelect(item.id);
                    setIsVisible(true); */
                  }}
                >
                  <Text className=" text-md " style={font.Bold}>
                    {item.firstName}
                  </Text>
                </CardLayout>
              )
            }}
            style={{ width: '100%', paddingHorizontal: 10 }}
            contentContainerStyle={{ paddingBottom: 20, gap: 10 }}
            ListEmptyComponent={
              loading ? (
                <View className="flex-1 justify-center items-center" style={{ height: 300 }}>
                  <ActivityIndicator size={64} color={Colors.primary} />
                </View>
              ) : null
            }
            // Propiedades para la paginación
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshing={loading && page === 0}
            onRefresh={handleRefresh}
          />
        ) : (
          <View className=" w-[90%] max-w-[400px] h-1/2 items-center justify-center border rounded-2xl border-primary p-6 bg-white shadow-sm" style={{ alignSelf: 'center' }}>
            <Ionicons name="heart-dislike-outline" size={64} color={Colors.primary} style={{ marginBottom: 16 }} />
            <Text
              style={[
                font.Bold,
                {
                  textAlign: "center",
                  fontSize: 18,
                  color: Colors.primary,
                },
              ]}
            >
              Todavía no le has dado "no me gusta" a ningún chance.
            </Text>
          </View>
        )}
      </View>
      <OptionsBaseCustomers active={isVisible} setActive={setIsVisible} data={{ idDestino: UserSelect.toString() }} />
    </ScreenContainer>
  )
}

export default NotLikeScreen

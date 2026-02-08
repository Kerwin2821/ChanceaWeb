"use client"

import { View, Text, ActivityIndicator, TouchableOpacity, FlatList, Dimensions, RefreshControl } from "react-native"
import { useCallback, useEffect, useState } from "react"
import { useAuth, useRender } from "../../context"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { FontAwesome5, Feather } from "@expo/vector-icons"
import { Avatar } from "@rn-vui/themed"
import { GetHeader, height } from "../../utils/Helpers"
import { font } from "../../../styles"
import { HttpService } from "../../services"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import { Colors } from "../../utils"
import CacheImage from "../../components/CacheImage/CacheImage"
import type { ResponseReservation } from "../../context/storeBusinessHooks/StoreBusinessInterface"
import CardReservationBusiness from "../../components/CardReservationBusiness/CardReservationBusiness"
import type { BottomTabBusinessNavigationType } from "../../navigationBusiness/BottomTabBusiness"

export interface Photo {
  id: string
  uri: string
  likes: number
  comments: number
}

const { width } = Dimensions.get("window")
const numColumns = 3
const tileSize = width / numColumns

const PhotoTile = ({ item }: { item: Photo }) => {
  return (
    <TouchableOpacity style={{ width: tileSize, height: tileSize }}>
      <CacheImage styleImage={{ width: tileSize - 1, height: tileSize - 1, margin: 0.5 }} source={{ uri: item.uri }} />
    </TouchableOpacity>
  )
}

const ReservasBusinessScreen = () => {
  const { TokenAuthApi, SesionToken, setTokenAuthApi } = useAuth()
  const { Reservation, setReservation } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>()
  const isFocus = useIsFocused()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getReservations = useCallback(async () => {
    setRefreshing(true)
    setIsLoading(true)
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/reservations/business/${SesionToken}?businesId=${sesionBusiness?.id}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: ResponseReservation = await HttpService("get", host, url, {}, header, setLoader)

      setReservation(response.reservationSingleListResponse)
    } catch (error) {
      console.log(JSON.stringify(error))
    } finally {
      setRefreshing(false)
      setIsLoading(false)
    }
  }, [TokenAuthApi, sesionBusiness?.id])

  useEffect(() => {
    if (isFocus) {
      getReservations()
    }
  }, [isFocus])

  // Render empty component based on loading state
  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size={50} color={Colors.primary} />
          <Text className="text-gray-500 mt-4" style={font.Regular}>
            Cargando reservaciones...
          </Text>
        </View>
      )
    }

    return (
      <View className="flex-1 justify-center items-center py-20 px-6">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <FontAwesome5 name="calendar-alt" size={32} color={Colors.secondary} />
        </View>
        <Text className="text-xl text-center text-secondary mb-2" style={font.Bold}>
          No tienes reservaciones
        </Text>
        <Text className="text-base text-center text-gray-500 mb-6" style={font.Regular}>
          Por el momento no tienes reservaciones. Las reservaciones aparecerán aquí cuando los clientes reserven tus
          paquetes.
        </Text>
        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <View className="flex-row items-center mb-2">
            <Feather name="info" size={18} color={Colors.primary} />
            <Text className="ml-2 text-secondary font-semibold">Consejo</Text>
          </View>
          <Text className="text-sm text-gray-600">
            Asegúrate de tener paquetes activos y atractivos para que los clientes puedan reservarlos.
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-4  pb-4 bg-white border-b border-gray-100">
        <Text style={[font.Bold, { fontSize: 24, color: Colors.secondary }]}>Reservaciones</Text>

        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {
            navigationBottom.navigate("PerfilBusinessScreen")
          }}
        >
          <Avatar
            size={height / 14}
            source={sesionBusiness?.urlLogo ? { uri: sesionBusiness?.urlLogo } : { uri:"" }}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 bg-white">
        <FlatList
          keyExtractor={(item) => item.citaId.toString()}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 16,
          }}
          data={Reservation}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={getReservations} colors={[Colors.primary]} />
          }
          renderItem={({ item }) => (
            <CardReservationBusiness
              onPress={() => {
                navigation.navigate("DateDetallesBusiness", item)
              }}
              data={item}
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

export default ReservasBusinessScreen


"use client"

import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Linking, Platform } from "react-native"
import CustomMap from "../../../components/CustomMap/CustomMap"
import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import { FAB } from "@rn-vui/themed"
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { Stores } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { useRender } from "../../../context"
import { font } from "../../../../styles"
import { Colors } from "../../../utils"

const { width } = Dimensions.get("window")

const StoreShow = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [store, setStore] = useState<Stores | undefined>()
  const { Stores } = useStoreBusiness()
  const route = useRoute()
  const data = route.params as { storeId: number } | undefined
  const { setLoader } = useRender()
  const isFocus = useIsFocused()

  const [mapRegion, setMapRegion] = useState<any>(null)

  const focusMapOnStore = (e?: { latitude: number; longitude: number }) => {
    if (e) {
      setMapRegion({
        latitude: e.latitude as number,
        longitude: e.longitude as number,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      })
    }
  }

  useEffect(() => {
    if (data?.storeId) {
      const foundStore = Stores.find((s) => s.id === data.storeId)
      setStore(foundStore)
    }
  }, [isFocus, Stores, data])

  useEffect(() => {
    if (store) {
      setTimeout(() => {
        focusMapOnStore({
          latitude: store.positionY,
          longitude: store.positionX,
        })
      }, 1000)
    }
  }, [store])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#4CAF50"
      case "PENDING":
        return "#FF9800"
      case "INACTIVE":
        return "#F44336"
      default:
        return "#757575"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Activo"
      case "PENDING":
        return "Pendiente"
      case "INACTIVE":
        return "Inactivo"
      default:
        return status
    }
  }

  const openMaps = () => {
    if (!store) return

    const lat = store.positionY
    const lng = store.positionX

    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(store.name)}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(store.name)})`,
    })

    Linking.openURL(url as string).catch((err) => console.error("Error opening maps", err))
  }

  const callStore = () => {
    if (!store) return

    Linking.openURL(`tel:${store.phoneNumber}`).catch((err) => console.error("Error making call", err))
  }

  const emailStore = () => {
    if (!store) return

    Linking.openURL(`mailto:${store.email}`).catch((err) => console.error("Error opening email", err))
  }

  if (!store) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-500" style={font.Bold}>
          Cargando información de la tienda...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="pb-20">
        {/* Header with back button */}
        <View className="bg-primary pt-12 pb-4 px-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name="chevron-left" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Detalles de Tienda</Text>
          <View className="w-10" />
        </View>

        {/* Store Card */}
        <View className="bg-white rounded-xl mx-4 -mt-5 p-4 shadow">
          {/* Store Icon and Name */}
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 rounded-full bg-blue-50 justify-center items-center mr-4">
              <FontAwesome5 name="store" size={28} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-secondary mb-1">{store.name}</Text>
              <View
                className="px-3 py-1 rounded-full self-start"
                style={{ backgroundColor: getStatusColor(store.statusBusiness) }}
              >
                <Text className="text-white text-xs font-semibold">{getStatusText(store.statusBusiness)}</Text>
              </View>
            </View>
          </View>

          {/* Store Description */}
          {store.description && (
            <View className="py-3 border-t border-b border-gray-100 my-2">
              <Text className="text-sm text-gray-600 leading-5">{store.description}</Text>
            </View>
          )}

          {/* Quick Action Buttons */}
          <View className="flex-row justify-around mt-3">
            <TouchableOpacity className="items-center" onPress={callStore}>
              <View className="w-10 h-10 rounded-full bg-green-500 justify-center items-center mb-1">
                <FontAwesome name="phone" size={18} color="white" />
              </View>
              <Text className="text-xs text-secondary font-medium">Llamar</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center" onPress={emailStore}>
              <View className="w-10 h-10 rounded-full bg-blue-500 justify-center items-center mb-1">
                <MaterialIcons name="email" size={18} color="white" />
              </View>
              <Text className="text-xs text-secondary font-medium">Email</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center" onPress={openMaps}>
              <View className="w-10 h-10 rounded-full bg-orange-500 justify-center items-center mb-1">
                <FontAwesome5 name="directions" size={18} color="white" />
              </View>
              <Text className="text-xs text-secondary font-medium">Ir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View className="bg-white rounded-xl mx-4 mt-4 p-4 shadow-sm">
          <View className="flex-row items-center pb-3 mb-3 border-b border-gray-100">
            <MaterialIcons name="contact-phone" size={20} color={Colors.secondary} />
            <Text className="text-base font-semibold text-secondary ml-2">Información de Contacto</Text>
          </View>

          <View className="flex-row items-center mb-3">
            <FontAwesome name="phone" size={16} color={Colors.primary} />
            <Text className="text-sm font-medium text-secondary ml-2 w-16">Teléfono:</Text>
            <Text className="text-sm text-gray-600 flex-1">{store.phoneNumber}</Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="email" size={16} color={Colors.primary} />
            <Text className="text-sm font-medium text-secondary ml-2 w-16">Email:</Text>
            <Text className="text-sm text-gray-600 flex-1">{store.email}</Text>
          </View>
        </View>

        {/* Store Hours */}
        {/*  <View className="bg-white rounded-xl mx-4 mt-4 p-4 shadow-sm">
          <View className="flex-row items-center pb-3 mb-3 border-b border-gray-100">
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.secondary} />
            <Text className="text-base font-semibold text-secondary ml-2">Horario de Atención</Text>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-1 items-center p-2">
              <Text className="text-sm font-medium text-secondary mb-2">Apertura</Text>
              <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full">
                <MaterialCommunityIcons name="door-open" size={16} color={Colors.primary} />
                <Text className="text-sm text-gray-600 ml-1">
                  {store.openHour ? moment(store.openHour).format("hh:mm a") : "No disponible"}
                </Text>
              </View>
            </View>

            <View className="h-16 w-px bg-gray-100" />

            <View className="flex-1 items-center p-2">
              <Text className="text-sm font-medium text-secondary mb-2">Cierre</Text>
              <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full">
                <MaterialCommunityIcons name="door-closed" size={16} color={Colors.primary} />
                <Text className="text-sm text-gray-600 ml-1">
                  {store.closeHour ? moment(store.closeHour).format("hh:mm a") : "No disponible"}
                </Text>
              </View>
            </View>
          </View>
        </View> */}

        {/* Location Map */}
        <View className="bg-white rounded-xl mx-4 mt-4 mb-4 shadow-sm overflow-hidden">
          <View className="flex-row items-center p-4 border-b border-gray-100">
            <FontAwesome5 name="map-marker-alt" size={20} color={Colors.secondary} />
            <Text className="text-base font-semibold text-secondary ml-2">Ubicación</Text>
          </View>

          <View className="overflow-hidden">
            <CustomMap
              region={mapRegion || {
                latitude: store.positionY || 0,
                longitude: store.positionX || 0,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
              style={{ width: "100%", height: 180 }}
              markers={[{
                id: store.id,
                coordinate: {
                  latitude: store.positionY,
                  longitude: store.positionX,
                },
                content: (
                  <View className="bg-primary p-2 rounded-full border-2 border-white">
                    <FontAwesome5 name="store" size={14} color="white" />
                  </View>
                )
              }]}
            />

            <TouchableOpacity className="flex-row items-center justify-center bg-gray-50 py-2" onPress={openMaps}>
              <Text className="text-xs font-medium text-primary mr-1">Ver en Mapa Completo</Text>
              <FontAwesome5 name="external-link-alt" size={12} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-5 left-0 right-0 flex-row justify-center space-x-4">
        <FAB
          icon={(() => <FontAwesome5 name="map-marked-alt" size={20} color="white" />) as any}
          color={Colors.primary}
          onPress={() => {
            navigation.navigate("StoreUbication", { store })
          }}
        />

        <FAB
          icon={(() => <MaterialIcons name="edit" size={20} color="white" />) as any}
          color={Colors.primary}
          onPress={() => {
            navigation.navigate("StoreForm", { store })
          }}
        />

        <FAB
          icon={(() => <FontAwesome5 name="lock" size={20} color="white" />) as any}
          color={Colors.primary}
          onPress={() => {
            navigation.navigate("StorePassword", { storeId: store.id })
          }}
        />
      </View>
    </View>
  )
}

export default StoreShow


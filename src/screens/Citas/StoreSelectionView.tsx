"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native"
import CustomMap from "../../components/CustomMap/CustomMap"
import { FontAwesome5, FontAwesome6, Ionicons, MaterialIcons, Feather, FontAwesome } from "@expo/vector-icons"
import { Colors } from "../../utils"
import { mapStyle } from "../../utils/Theme"
import Button from "../../components/ButtonComponent/Button"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import type { BoxPackageV2, StoreV2 } from "../../utils/Date.interface"
import { useStore } from "../../context/storeContext/StoreState"
import HeaderApp from "../../components/HeaderApp"

const { width, height } = Dimensions.get("window")

const StoreSelectionView = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const route = useRoute()
  const data = route.params as BoxPackageV2
  const { setBoxPackage } = useStore()

  const [selectedStore, setSelectedStore] = useState<StoreV2 | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const badgesScrollRef = useRef<ScrollView>(null)

  // Initialize with the first store (position 0) as default
  useEffect(() => {
    if (data && data.stores && data.stores.length > 0) {
      setSelectedStore(data.stores[0])
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [data])
  const selectPackage = () => {
    const dataCreate = { ...data, id: data.stores[0].boxPackageId }
    setBoxPackage(dataCreate)
    navigation.goBack()
    navigation.goBack()
    navigation.goBack()

  }

  // No manual map animation needed anymore as CustomMap handles it via region prop

  // Effect to scroll to badge when selected store changes
  useEffect(() => {
    if (selectedStore) {
      const index = data.stores.findIndex(s => s.id === selectedStore.id);
      if (index !== -1) scrollToSelectedBadge(index);
    }
  }, [selectedStore])

  // Function to open maps app with directions to the selected store
  const getDirections = () => {
    if (!selectedStore) return

    const lat = selectedStore.positionY
    const lng = selectedStore.positionX
    const storeName = selectedStore.name || "Tienda"

    // Create URL based on platform
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(storeName)}`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    })

    // Fallback URL for Android if Google Maps is not installed
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`

    Linking.canOpenURL(url as string)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url as string)
        } else {
          return Linking.openURL(fallbackUrl)
        }
      })
      .catch((err) => console.error("Error opening maps app:", err))
  }

  // Function to call the store
  const callStore = () => {
    if (!selectedStore || !selectedStore.phoneNumber) return

    const phoneUrl = `tel:${selectedStore.phoneNumber}`
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl)
        }
      })
      .catch((err) => console.error("Error making phone call:", err))
  }

  // Function to send email to the store
  const emailStore = () => {
    if (!selectedStore || !selectedStore.email) return

    const emailUrl = `mailto:${selectedStore.email}?subject=Consulta sobre ${data.nombre}`
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl)
        }
      })
      .catch((err) => console.error("Error sending email:", err))
  }

  // Function to scroll to the selected badge
  const scrollToSelectedBadge = (index: number) => {
    if (badgesScrollRef.current) {
      const badgeWidth = 150 // Approximate width of each badge including margins
      const scrollPosition = Math.max(0, index * badgeWidth - width / 2 + badgeWidth / 2)
      badgesScrollRef.current.scrollTo({ x: scrollPosition, animated: true })
    }
  }

  // Handle store selection
  const handleStoreSelect = (store: StoreV2, index: number) => {
    setSelectedStore(store)
    scrollToSelectedBadge(index)
  }

  // Get status color based on store status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return Colors.green
      case "INACTIVE":
        return Colors.danger
      default:
        return Colors.gray
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="mt-4 text-gray-600">Cargando tiendas...</Text>
      </SafeAreaView>
    )
  }

  if (!data.stores || data.stores.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor={Colors.secondary} barStyle="light-content" />
        <View className="bg-secondary pt-12 pb-4 px-4 flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text className="ml-4 text-lg font-bold text-white">Seleccionar Tienda</Text>
        </View>

        <View className="flex-1 justify-center items-center p-6">
          <FontAwesome5 name="store-slash" size={60} color="#CBD5E0" />
          <Text className="mt-4 text-lg font-bold text-center text-gray-700">No hay tiendas disponibles</Text>
          <Text className="mt-2 text-center text-gray-500">Este paquete no tiene tiendas asociadas actualmente.</Text>
          <TouchableOpacity className="mt-6 bg-primary px-6 py-3 rounded-lg" onPress={() => navigation.goBack()}>
            <Text className="text-white font-bold">Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Header */}
      <HeaderApp title="Seleccionar Tienda" />

      {/* Store Badges - Horizontal scrolling pills */}
      <View className="bg-white border-b border-gray-200">
        <ScrollView
          ref={badgesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 8 }}
        >
          {data.stores.map((store, index) => (
            <TouchableOpacity
              key={store.id}
              className={`mx-2 px-4 py-2 rounded-full flex-row items-center ${selectedStore?.id === store.id ? "bg-primary" : "bg-gray-100"
                }`}
              onPress={() => handleStoreSelect(store, index)}
            >
              <FontAwesome5
                name="store"
                size={14}
                color={selectedStore?.id === store.id ? "white" : Colors.secondary}
                style={{ marginRight: 6 }}
              />
              <Text
                className={`font-medium ${selectedStore?.id === store.id ? "text-white" : "text-secondary"}`}
                numberOfLines={1}
              >
                {store.name}
              </Text>
              <View
                className={`w-2 h-2 rounded-full ml-2 ${selectedStore?.id === store.id ? "bg-white" : "bg-transparent"
                  }`}
                style={
                  selectedStore?.id !== store.id ? { backgroundColor: getStatusColor(store.statusBusiness) } : undefined
                }
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View - Taking exactly 1/3 of the screen height */}
      {selectedStore && (
        <View style={{ height: height / 3 }}>
          <CustomMap
            region={{
              latitude: selectedStore.positionY,
              longitude: selectedStore.positionX,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            markers={[{
              id: selectedStore.id,
              coordinate: {
                latitude: selectedStore.positionY,
                longitude: selectedStore.positionX,
              },
              title: selectedStore.name,
              content: (
                <View className="items-center">
                  <View className="bg-primary p-3 rounded-full border-2 border-white shadow">
                    <FontAwesome5 name="store" size={18} color="white" />
                  </View>
                  <View className="bg-black/70 px-3 py-1.5 rounded-md mt-1.5 shadow">
                    <Text className="text-white text-xs font-medium">{selectedStore.name}</Text>
                  </View>
                </View>
              )
            }]}
          />
        </View>
      )}

      {/* Store Information Section - Bottom part */}
      <ScrollView className="flex-1 bg-white">
        {selectedStore && (
          <View className="p-4">
            {/* Store Header */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-3">
                <FontAwesome5 name="store" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-secondary">{selectedStore.name}</Text>
                <View className="flex-row items-center">
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: getStatusColor(selectedStore.statusBusiness) }}
                  />
                  <Text className="text-sm text-gray-500">
                    {selectedStore.statusBusiness === "ACTIVE" ? "Activa" : "Inactiva"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Store Description */}
            <View className="bg-gray-50 p-4 rounded-lg mb-4">
              <Text className="text-base text-gray-700">
                {selectedStore.description || "Sin descripción disponible."}
              </Text>
            </View>


            {/* Action Buttons */}
            <View className="flex-row justify-between mb-6">
              {/* Button Removed as per request */}

              {/*  <TouchableOpacity
                className="w-14 h-12 bg-blue-500 rounded-lg items-center justify-center mr-2"
                onPress={callStore}
              >
                <FontAwesome name="phone" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-14 h-12 bg-green-500 rounded-lg items-center justify-center"
                onPress={emailStore}
              >
                <MaterialIcons name="email" size={20} color="white" />
              </TouchableOpacity> */}
            </View>

            {/* Package Info */}
            <View className="bg-gray-50 p-4 rounded-lg mb-6">
              <Text className="font-bold text-lg text-secondary mb-2">Detalles del paquete</Text>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="card-giftcard" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text className="text-base font-medium text-secondary">{data.nombre}</Text>
              </View>
              <Text className="text-sm text-gray-600">{data.typeBox}</Text>
              {data.description && <Text className="text-sm text-gray-600 mt-2">{data.description}</Text>}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button - Fixed at bottom */}
      <View className="p-4 bg-white border-t border-gray-200">
        <Button
          text="Confirmar selección"
          onPress={selectPackage}
        />
      </View>
    </SafeAreaView>
  )
}

export default StoreSelectionView

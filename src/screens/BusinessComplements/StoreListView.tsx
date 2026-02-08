"use client"

import { useEffect, useState, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
} from "react-native"
import { FontAwesome5, MaterialIcons, Ionicons, FontAwesome, Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useAuth, useRender } from "../../context"
import { Colors } from "../../utils"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"

const { width } = Dimensions.get("window")

const StoreListView = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const { Stores, setStores } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Function to get status color based on store status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return Colors.green
      case "INACTIVE":
        return Colors.danger
      case "PENDING":
        return Colors.yellow
      default:
        return Colors.gray
    }
  }

  // Function to fetch stores
  const fetchStores = async () => {
    if (!sesionBusiness || !sesionBusiness.id) return

    try {
      setLoader(true)
      setRefreshing(true)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/businesses/${sesionBusiness.id}/store-businesses`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("get", host, url, {}, header)

      if (response && Array.isArray(response)) {
        setStores(response)
      }
    } catch (error) {
      console.error("Error fetching stores:", error)
      ToastCall("error", "No se pudieron cargar las tiendas", "ES")
    } finally {
      setLoader(false)
      setRefreshing(false)
    }
  }

  // Fetch stores on component mount
  useEffect(() => {
    fetchStores()
  }, [sesionBusiness])

  // Filter stores based on search term
  const getFilteredStores = useCallback(() => {
    if (!Stores || Stores.length === 0) {
      return []
    }

    if (!searchTerm.trim()) {
      // Return all stores if search term is empty
      return [...Stores, { isAddButton: true, id: "add-button" }]
    }

    // Filter stores based on search term
    const filtered = Stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.phoneNumber.includes(searchTerm),
    )

    // Only add the "Add Store" button if we have results or the search term is empty
    if (filtered.length > 0) {
      return [...filtered, { isAddButton: true, id: "add-button" }]
    }

    return filtered
  }, [Stores, searchTerm])

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
  }

  // Render a store item
  const renderStoreItem = ({ item }:any) => {
    // Special case for the "Add Store" item
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          className="mb-4 bg-white rounded-lg border border-dashed border-primary h-24 justify-center items-center"
          onPress={() => {
            navigation.navigate("StoreForm")
          }}
        >
          <View className="flex-row items-center justify-center">
            <View className="bg-primary/10 p-2.5 rounded-full mr-3">
              <Ionicons name="add" size={24} color={Colors.primary} />
            </View>
            <Text className="text-primary text-base font-semibold">Agregar Tienda</Text>
          </View>
        </TouchableOpacity>
      )
    }

    // Regular store item
    return (
      <TouchableOpacity
        className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        onPress={() => {
          navigation.navigate("StoreShow", { storeId: item.id })
        }}
      >
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-base font-bold w-[90%]" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: getStatusColor(item.statusBusiness) }} />
          </View>

          <Text className="text-xs text-gray-500 mb-3" numberOfLines={2}>
            {item.description || "Sin descripción"}
          </Text>

          <View className="flex-row items-center mb-1.5">
            <FontAwesome name="phone" size={12} color={Colors.primary} />
            <Text className="text-xs ml-2 text-gray-700" numberOfLines={1}>
              {item.phoneNumber}
            </Text>
          </View>

          <View className="flex-row items-center">
            <MaterialIcons name="email" size={12} color={Colors.primary} />
            <Text className="text-xs ml-2 text-gray-700" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Render empty component when no results are found
  const renderEmptyComponent = () => {
    if (searchTerm.trim()) {
      return (
        <View className="flex-1 items-center justify-center py-10">
          <FontAwesome5 name="search" size={40} color="#ccc" />
          <Text className="text-gray-500 mt-3 mb-5 text-center">No se encontraron tiendas con "{searchTerm}"</Text>
          <TouchableOpacity className="bg-gray-100 px-5 py-2.5 rounded-lg" onPress={clearSearch}>
            <Text className="text-secondary font-semibold">Limpiar búsqueda</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View className="flex-1 items-center justify-center py-10">
        <FontAwesome5 name="store-alt-slash" size={40} color="#ccc" />
        <Text className="text-gray-500 mt-3 mb-5">No hay tiendas registradas</Text>
        <TouchableOpacity
          className="bg-primary px-5 py-2.5 rounded-lg"
          onPress={() => navigation.navigate("StoreForm")}
        >
          <Text className="text-white font-semibold">Agregar Tienda</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* <StatusBar backgroundColor={Colors.secondary} barStyle="light-content" /> */}

      {/* Header */}
      <View
        className={`bg-primary ${Platform.OS === "ios" ? "pt-0" : ""} pb-4 px-5 flex-row justify-between items-center`}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="chevron-left" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center">Mis Tiendas</Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 justify-center items-center"
          onPress={fetchStores}
        >
          <Ionicons name="refresh" size={22} color="white" />
        </TouchableOpacity>
      </View>

      
      <View className="bg-white px-5 py-3 border-b border-gray-200">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 h-11">
          <Feather name="search" size={18} color="#666" className="mr-2" />
          <TextInput
            className="flex-1 h-11 text-base text-gray-800"
            placeholder="Buscar tiendas..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#999"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="p-1">
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <Text className="ml-2 text-sm text-gray-500">
            {Stores?.length || 0} tiendas registradas
          </Text>
      </View>

     

      {/* Stores List */}
      <View className="flex-1 p-5">
      {/*   <Text className="text-lg font-bold text-secondary mb-1">Tiendas</Text>
        <Text className="text-sm text-gray-500 mb-4">Gestiona tus tiendas y puntos de venta</Text> */}

        <FlatList
          data={getFilteredStores()}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={fetchStores}
          ListEmptyComponent={renderEmptyComponent}
        />
      </View>

      {/* Add Store Button (Fixed at bottom) */}
      <TouchableOpacity
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-md"
        onPress={() => navigation.navigate("StoreForm")}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default StoreListView


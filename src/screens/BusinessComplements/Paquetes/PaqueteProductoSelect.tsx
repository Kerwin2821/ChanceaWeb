"use client"
import { useState, useEffect, useCallback } from "react"
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Text,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { GetHeader } from "../../../utils/Helpers"
import { HttpService } from "../../../services"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { useAuth, useRender } from "../../../context"
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks"
import type { Productos } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import CacheImage from "../../../components/CacheImage/CacheImage"
import { Colors } from "../../../utils"
import HeaderApp from "../../../components/HeaderApp"

// Get screen width to calculate item size
const { width } = Dimensions.get("window")
const numColumns = 3
const itemSize = width / numColumns

export default function PaqueteProductoSelect() {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { Productos, setProductos, setFormCreateBoxPackage, FormCreateBoxPackage } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const isFocus = useIsFocused()

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<Productos[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const send = () => {
    if (selectedItems.length === 0) {
      return
    }
    setIsLoading(true)
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      setFormCreateBoxPackage({ ...FormCreateBoxPackage, productIds: selectedItems.map((e) => Number(e)) })
      setIsLoading(false)
      navigation.navigate("PaqueteStoreSelect")
    }, 300)
  }

  const getProductos = useCallback(async () => {
    try {
      setIsRefreshing(true)
      const host = process.env.APP_BASE_API
      const url = `/api/business/products/${SesionToken}?aditional1.equals=${sesionBusiness?.id}&statusProduct.equals=ACTIVO&page=0&size=1000`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: Productos[] = await HttpService("get", host, url, {}, header, setLoader)

      // Store the complete product list
      setProductos(response)
      // Apply filtering based on package type
      let filteredProducts = [...response]

      // Check if we need to filter by package type
      if (FormCreateBoxPackage.typeBox === "REGALO") {
        // For gift packages, only show gift products
        filteredProducts = response.filter((item) => item.aditional2 === "REGALO")
        console.log("Filtering for REGALO products:", filteredProducts.length)
      } else {
        // For other package types, exclude gift products
        filteredProducts = response.filter((item) => item.aditional2 !== "REGALO")
        console.log("Filtering for non-REGALO products:", filteredProducts.length)
      }

      // Update the filtered items state
      setFilteredItems(filteredProducts)
    } catch (error) {
      console.log(JSON.stringify(error))
    } finally {
      setIsRefreshing(false)
    }
  }, [TokenAuthApi, SesionToken, sesionBusiness, FormCreateBoxPackage.typeBox])

  useEffect(() => {
    if (isFocus) {
      getProductos()
    }
  }, [isFocus])

  // Update the search effect to maintain type-based filtering
  useEffect(() => {
    if (!Productos || Productos.length === 0) return

    // Start with the base filtered set based on package type
    let baseFiltered = [...Productos]
    if (FormCreateBoxPackage.typeBox === "REGALO") {
      baseFiltered = Productos.filter((item) => item.aditional2 === "REGALO")
    } else {
      baseFiltered = Productos.filter((item) => item.aditional2 !== "REGALO")
    }

    // Then apply search filtering if needed
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      baseFiltered = baseFiltered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)),
      )
    }

    setFilteredItems(baseFiltered)
  }, [searchQuery, Productos, FormCreateBoxPackage.typeBox])

  // Pre-select products if they were already selected in FormCreateBoxPackage
  useEffect(() => {
    if (FormCreateBoxPackage.productIds && FormCreateBoxPackage.productIds.length > 0) {
      setSelectedItems(FormCreateBoxPackage.productIds.map((id) => id.toString()))
    }
  }, [FormCreateBoxPackage.productIds])

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(itemId)) {
        return prevSelected.filter((id) => id !== itemId)
      } else {
        return [...prevSelected, itemId]
      }
    })
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const renderItem = ({ item }: { item: Productos }) => {
    const isSelected = selectedItems.includes(item.id.toString())

    return (
      <TouchableOpacity
        className="relative m-1"
        style={{ width: itemSize - 8, height: itemSize - 8 }}
        onPress={() => toggleItemSelection(item.id.toString())}
        activeOpacity={0.7}
      >
        <View className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
          <CacheImage source={{ uri: item.imagenUrl }} styleImage={{ width: "100%", height: "100%" }} />
          {/* Product Name Overlay */}
          <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
            <Text className="text-white text-xs" numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          {/* Selection Overlay */}
          {isSelected && (
            <View className="absolute inset-0 flex items-center justify-center bg-primary/70 rounded-lg">
              <MaterialIcons name="check-circle" size={32} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyList = () => {
    if (isRefreshing) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-500 mt-4">Cargando productos...</Text>
        </View>
      )
    }

    return (
      <View className="flex-1 items-center justify-center p-8">
        {searchQuery.trim() ? (
          <>
            <MaterialIcons name="search-off" size={48} color="#CBD5E0" />
            <Text className="text-gray-400 text-lg mt-4 text-center">
              No se encontraron productos para "{searchQuery}"
            </Text>
            <TouchableOpacity className="mt-4 bg-gray-200 px-4 py-2 rounded-lg" onPress={clearSearch}>
              <Text className="text-gray-700">Limpiar búsqueda</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <FontAwesome5 name="box-open" size={48} color="#CBD5E0" />
            <Text className="text-gray-400 text-lg mt-4 text-center">No hay productos disponibles</Text>
            <Text className="text-gray-500 text-sm mt-2 text-center">
              Agrega productos a tu catálogo para incluirlos en este paquete
            </Text>
          </>
        )}
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" >
      {/* Header */}
      <HeaderApp title="Seleccionar Productos" />

      {/* Selection Counter */}
      <View className="px-4  bg-white border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-secondary font-medium">
            Selecciona los productos que incluirá este paquete
          </Text>
          {selectedItems.length > 0 && (
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary font-bold">
                {selectedItems.length} {selectedItems.length === 1 ? "seleccionado" : "seleccionados"}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2 bg-gray-50">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-secondary"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <MaterialIcons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80, paddingHorizontal: 4 }}
        ListEmptyComponent={renderEmptyList}
        onRefresh={getProductos}
        refreshing={isRefreshing}
      />

      {/* Confirm Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          className={`p-4 rounded-lg items-center flex-row justify-center ${selectedItems.length > 0 ? "bg-primary" : "bg-gray-300"}`}
          onPress={send}
          disabled={selectedItems.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-base">
                {selectedItems.length > 0
                  ? `Confirmar selección (${selectedItems.length})`
                  : "Selecciona al menos un producto"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
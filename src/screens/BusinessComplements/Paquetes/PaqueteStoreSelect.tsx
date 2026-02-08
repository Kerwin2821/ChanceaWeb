"use client"
import { useState, useEffect } from "react"
import { View, FlatList, TouchableOpacity, Dimensions, Text, SafeAreaView, StatusBar, TextInput } from "react-native"
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { useAuth, useRender } from "../../../context"
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks"
import type { Stores } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import { Colors } from "../../../utils"
import HeaderApp from "../../../components/HeaderApp"

// Get screen width to calculate item size
const { width } = Dimensions.get("window")
const numColumns = 2
const itemSize = width / numColumns

export default function PaqueteStoreSelect() {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { Stores, setStores, setFormCreateBoxPackage, FormCreateBoxPackage } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const isFocus = useIsFocused()

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<Stores[]>([])

  const send = () => {
    setFormCreateBoxPackage({ ...FormCreateBoxPackage, storedIds: selectedItems.map((e) => Number(e)) })
    navigation.navigate("PaqueteImg")
  }

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(Stores)
      return
    }

    if (Stores && Stores.length > 0) {
      const query = searchQuery.toLowerCase().trim()
      const filtered = Stores.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query)) ||
          item.email.toLowerCase().includes(query) ||
          item.phoneNumber.includes(query),
      )
      setFilteredItems(filtered)
    }
  }, [searchQuery, Stores])

  useEffect(() => {
    if (isFocus && Stores) {
      setFilteredItems(Stores)
      // Pre-select stores if they were already selected in FormCreateBoxPackage
      if (FormCreateBoxPackage.storedIds && FormCreateBoxPackage.storedIds.length > 0) {
        setSelectedItems(FormCreateBoxPackage.storedIds.map((id) => id.toString()))
      }
    }
  }, [isFocus, Stores])

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

  // Get status color based on store status
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

  const renderItem = ({ item }: { item: Stores }) => {
    const isSelected = selectedItems.includes(item.id?.toString() || "")

    return (
      <TouchableOpacity
        className={`m-2 rounded-xl overflow-hidden border ${isSelected ? "border-primary" : "border-gray-200"}`}
        style={{ width: itemSize - 16, height: 140 }}
        onPress={() => toggleItemSelection(item.id?.toString() || "")}
        activeOpacity={0.7}
      >
        <View className={`flex-1 p-3 ${isSelected ? "bg-primary/10" : "bg-white"}`}>
          {/* Store Status Indicator */}
          <View
            className="absolute top-2 right-2 h-3 w-3 rounded-full"
            style={{ backgroundColor: getStatusColor(item.statusBusiness) }}
          />

          {/* Store Icon */}
          <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
            <FontAwesome5 name="store" size={20} color={Colors.primary} />
          </View>

          {/* Store Name */}
          <Text className="font-bold text-secondary" numberOfLines={1}>
            {item.name}
          </Text>

          {/* Store Description */}
          <Text className="text-xs text-gray-500 mb-1" numberOfLines={1}>
            {item.description || "Sin descripción"}
          </Text>

          {/* Store Contact */}
          <View className="flex-row items-center mt-auto">
            <Feather name="phone" size={12} color={Colors.primary} />
            <Text className="text-xs ml-1 text-gray-600" numberOfLines={1}>
              {item.phoneNumber}
            </Text>
          </View>

          {/* Selection Indicator */}
          {isSelected && (
            <View className="absolute bottom-2 right-2 bg-primary rounded-full p-1">
              <MaterialIcons name="check" size={16} color="white" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center p-8">
      <MaterialIcons name="search-off" size={48} color="#CBD5E0" />
      <Text className="text-gray-400 text-lg mt-4 text-center">
        {searchQuery.trim() ? `No se encontraron tiendas para "${searchQuery}"` : "No hay tiendas disponibles"}
      </Text>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white" >
     <HeaderApp title="Seleccionar Tiendas"/>
      <View className="px-4 py-2 bg-gray-50 flex-row items-center justify-between">
        <Text className="text-base text-primary font-medium">
          {selectedItems.length > 0 ? `${selectedItems.length} tiendas seleccionadas` : "No hay tiendas seleccionadas"}
        </Text>
        {selectedItems.length > 0 && (
          <TouchableOpacity onPress={() => setSelectedItems([])}>
            <Text className="text-sm text-red-500 font-medium">Limpiar selección</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View className="px-4 py-2 bg-gray-50">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-secondary"
            placeholder="Buscar tiendas..."
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
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={numColumns}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80, paddingHorizontal: 6 }}
        ListEmptyComponent={renderEmptyList}
      />

      {selectedItems.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
          <TouchableOpacity className="bg-primary p-4 rounded-lg items-center" onPress={() => send()}>
            <Text className="text-white font-bold text-base">
              Confirmar selección ({selectedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}
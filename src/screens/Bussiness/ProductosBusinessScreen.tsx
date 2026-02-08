import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { useCallback, useEffect, useState } from "react"
import { useAuth, useRender } from "../../context"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { FontAwesome5, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { Avatar, FAB } from "@rn-vui/themed"
import { GetHeader, height } from "../../utils/Helpers"
import { font } from "../../../styles"
import { HttpService } from "../../services"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import { Colors } from "../../utils"
import CacheImage from "../../components/CacheImage/CacheImage"
import type { Productos } from "../BusinessComplements/Paquetes/PaqueteShow"
import type { BottomTabBusinessNavigationType } from "../../navigationBusiness/BottomTabBusiness"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")
const numColumns = 3
const tileSize = width / numColumns

const ProductosBusinessScreen = () => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { Productos, setProductos } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>()
  const isFocus = useIsFocused()

  // New states for enhanced functionality
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Filter options based on product types
  const filterOptions = [
    { id: "all", label: "Todos" },
    { id: "REGALO", label: "Regalos" },
    { id: "NORMAL", label: "Comida" },
  ]

  // Get filtered products based on search query and active filter
  const getFilteredProducts = useCallback(() => {
    if (!Productos) return []

    let filtered = [...Productos]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.description && product.description.toLowerCase().includes(query)),
      )
    }

    // Apply category filter
    if (activeFilter && activeFilter !== "all") {
      filtered = filtered.filter((product) => product.aditional2 === activeFilter)
    }

    return filtered
  }, [Productos, searchQuery, activeFilter])

  const getProductos = useCallback(async () => {
    setIsLoading(true)
    setIsRefreshing(true)
    setError(null)

    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/business/products/${SesionToken}?aditional1.equals=${sesionBusiness?.id}&statusProduct.equals=ACTIVO&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header, setLoader);

      setProductos(response)
    } catch (error) {
      console.error(JSON.stringify(error))
      setError("No se pudieron cargar los productos. Intente nuevamente.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [TokenAuthApi, SesionToken, sesionBusiness?.id])

  useEffect(() => {
    if (isFocus) {
      getProductos()
    }
  }, [isFocus])

  // Render product item
  const renderProductItem = ({ item }: { item: Productos }) => {
    const isActive = item.statusProduct === "ACTIVE"

    return (
      <TouchableOpacity
        style={{ width: tileSize, height: tileSize }}
        onPress={() => navigation.navigate("ProductoShow", item)}
        activeOpacity={0.8}
      >
        <View className="m-0.5 relative">
          <CacheImage
            styleImage={{ width: tileSize - 1, height: tileSize - 1, borderRadius: 8 }}
            source={{ uri: item.imagenUrl }}
          />

          {/* Status indicator */}
          {/* <View className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} /> */}

          {/* Product type badge */}
          {item.aditional2 === "REGALO" && (
            <View className="absolute top-1 left-1 bg-purple-500/80 rounded-full px-1.5 py-0.5">
              <FontAwesome5 name="gift" size={8} color="white" />
            </View>
          )}

          {/* Product Name Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
          >
            <Text className="text-white text-xs" numberOfLines={1} style={font.SemiBold}>
              {item.name}
            </Text>
           {/*  <Text className="text-white/80 text-[10px]" numberOfLines={1}>
              ${item.amount.toFixed(2)}
            </Text> */}
          </LinearGradient>
        </View>
      </TouchableOpacity>
    )
  }

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-500 mt-4" style={font.Regular}>
            Cargando productos...
          </Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Feather name="alert-circle" size={50} color="#CBD5E0" />
          <Text className="text-lg text-center text-gray-700 mt-4 mb-2" style={font.SemiBold}>
            Error al cargar productos
          </Text>
          <Text className="text-center text-gray-500 mb-6">{error}</Text>
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg flex-row items-center" onPress={getProductos}>
            <Feather name="refresh-cw" size={16} color="white" />
            <Text className="text-white ml-2" style={font.SemiBold}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (searchQuery.trim() && getFilteredProducts().length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Feather name="search" size={50} color="#CBD5E0" />
          <Text className="text-lg text-center text-gray-700 mt-4 mb-2" style={font.SemiBold}>
            No se encontraron resultados
          </Text>
          <Text className="text-center text-gray-500 mb-6">No hay productos que coincidan con "{searchQuery}"</Text>
          <TouchableOpacity className="bg-gray-200 px-6 py-3 rounded-lg" onPress={() => setSearchQuery("")}>
            <Text className="text-gray-700" style={font.SemiBold}>
              Limpiar búsqueda
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View className="flex-1 justify-center items-center py-20 px-6">
        <FontAwesome5 name="box-open" size={50} color="#CBD5E0" />
        <Text className="text-xl text-center text-gray-700 mt-4 mb-2" style={font.Bold}>
          No tienes productos
        </Text>
        <Text className="text-base text-center text-gray-500 mb-6" style={font.Regular}>
          Crea tu primer producto para comenzar a vender y crear paquetes.
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-lg flex-row items-center"
          onPress={() => navigation.navigate("ProductoCreateInit")}
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white ml-2" style={font.SemiBold}>
            Crear Producto
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["right", "left"]}>
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-4 pt-5 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center mr-3"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name="chevron-left" size={18} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={[font.Bold, { fontSize: 24, color: Colors.secondary }]}>Productos</Text>
        </View>

        <TouchableOpacity
          className="justify-center items-center"
          onPress={() => {
            navigationBottom.navigate("PerfilBusinessScreen")
          }}
        >
          <Avatar
            size={height / 14}
            rounded
            source={sesionBusiness?.urlLogo ? { uri: sesionBusiness?.urlLogo } : undefined}
            title={sesionBusiness ? sesionBusiness?.name.charAt(0) : "N"}
            containerStyle={{ backgroundColor: Colors.primary }}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 h-10">
          <Feather name="search" size={18} color="#666" />
          <TextInput
            className="flex-1 h-10 ml-2 text-base text-gray-800"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="p-1">
              <Feather name="x" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`px-4 py-2 rounded-full mr-2 ${activeFilter === option.id ? "bg-primary" : "bg-gray-100"}`}
              onPress={() => setActiveFilter(option.id === activeFilter ? null : option.id)}
            >
              <Text className={activeFilter === option.id ? "text-white" : "text-gray-700"} style={font.Regular}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <View className="flex-1 bg-white">
        <FlatList
          data={getFilteredProducts()}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 80,
            ...((!Productos || Productos.length === 0 || getFilteredProducts().length === 0) && { flex: 1 }),
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={getProductos} colors={[Colors.primary]} />
          }
          ListEmptyComponent={renderEmptyState()}
        />
      </View>

      {/* FAB */}
      <FAB
        icon={(() => <MaterialCommunityIcons name="plus" size={24} color="white" />) as any}
        color={Colors.primary}
        placement="right"
        style={{ marginBottom: 20 }}
        onPress={() => {
          navigation.navigate("ProductoCreateInit")
        }}
      />
    </SafeAreaView>
  )
}

export default ProductosBusinessScreen

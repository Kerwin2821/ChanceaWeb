"use client"

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
import { useCallback, useEffect, useState, useMemo } from "react"
import { useAuth, useRender } from "../../context"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import { MaterialCommunityIcons, FontAwesome5, AntDesign, Feather, Ionicons } from "@expo/vector-icons"
import { Avatar, FAB } from "@rn-vui/themed"
import { GetHeader, height } from "../../utils/Helpers"
import { font } from "../../../styles"
import { HttpService } from "../../services"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import type { Paquetes, PaquetesResponse } from "../../context/storeBusinessHooks/StoreBusinessInterface"
import { Colors } from "../../utils"
import CacheImage from "../../components/CacheImage/CacheImage"
import type { BottomTabBusinessNavigationType } from "../../navigationBusiness/BottomTabBusiness"
import DialogValidateBusiness from "../../components/Dialog/DialogValidateBusiness/DialogValidateBusiness"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import DialogNoProductsAlert from "../../components/Dialog/DialogNoProductsAlert/DialogNoProductsAlert"

const { width } = Dimensions.get("window")
const numColumns = 3
const tileSize = width / numColumns

const PaquetesBusinessScreen = () => {
  const { TokenAuthApi, SesionToken } = useAuth()
  const { Paquetes, setPaquetes, Productos } = useStoreBusiness()
  const navigationBottom = useNavigation<BottomTabBusinessNavigationType>()
  const { setSesionBusiness, sesionBusiness } = useSesionBusinessStore()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const isFocus = useIsFocused()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isValidate, setIsValidate] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
   const [showNoProductsDialog, setShowNoProductsDialog] = useState(false)

  // Filter options based on package types
  const filterOptions = [
    { id: "all", label: "Todos" },
    { id: "REGALO", label: "Regalos" },
    { id: "DESAYUNO", label: "Desayunos" },
    { id: "ALMUERZO", label: "Almuerzos" },
    { id: "CENA", label: "Cenas" },
  ]

  // Get filtered packages based on search query and active filter
  const getFilteredPackages = useCallback(() => {
    if (!Paquetes) return []

    let filtered = [...Paquetes]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (pkg) =>
          pkg.nombre.toLowerCase().includes(query) ||
          (pkg.description && pkg.description.toLowerCase().includes(query)),
      )
    }

    // Apply category filter
    if (activeFilter && activeFilter !== "all") {
      filtered = filtered.filter((pkg) => pkg.typeBox === activeFilter)
    }

    return filtered
  }, [Paquetes, searchQuery, activeFilter])

  const getPaquetes = useCallback(async () => {
    setIsRefreshing(true)
    setError(null)

    try {
      setIsLoading(true)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/business/box-packages-list/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: PaquetesResponse = await HttpService("get", host, url, {}, header)

      setPaquetes(response.boxPackageSingles)
    } catch (error) {
      console.error(JSON.stringify(error))
      setError("No se pudieron cargar los paquetes. Intente nuevamente.")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [TokenAuthApi, SesionToken])

  const validatesEstatusPak = async () => {
    try {
       if (!hasProducts) {
        setShowNoProductsDialog(true)
        return
      }
      if (sesionBusiness) {
        const copySessionBusiness = { ...sesionBusiness }

        if (copySessionBusiness?.businessCondition !== "VALIDATED") {
          const host = process.env.APP_BASE_API
          const url = `/api/appchancea/businesses/getBusinessCondition?token=${SesionToken}`
          const header = await GetHeader(TokenAuthApi, "application/json")
          const response = await HttpService("get", host, url, {}, header, setLoader)

          copySessionBusiness.businessCondition = response.businessCondition
          setSesionBusiness(copySessionBusiness)

          if (copySessionBusiness?.businessCondition !== "VALIDATED") {
            setIsValidate(true)
            return
          }
        }
        navigation.navigate("PaqueteCreateInit")
      }
    } catch (error) {
      console.error(JSON.stringify(error))
      return false
    }
  }

  const validatesEstatusProd = async () => {
    try {
      if (sesionBusiness) {
        const copySessionBusiness = { ...sesionBusiness }

        if (copySessionBusiness?.businessCondition !== "VALIDATED") {
          const host = process.env.APP_BASE_API
          const url = `/api/appchancea/businesses/getBusinessCondition?token=${SesionToken}`
          const header = await GetHeader(TokenAuthApi, "application/json")
          const response = await HttpService("get", host, url, {}, header, setLoader)

          copySessionBusiness.businessCondition = response.businessCondition
          setSesionBusiness(copySessionBusiness)

          if (copySessionBusiness?.businessCondition !== "VALIDATED") {
            setIsValidate(true)
            return
          }
        }
        navigation.navigate("ProductosBusinessScreen")
      }
    } catch (error) {
      console.error(JSON.stringify(error))
    }
  }

  useEffect(() => {
    if (isFocus) {
      getPaquetes()
    }
  }, [isFocus])

  const hasProducts = Array.isArray(Productos) && Productos.length > 0;


  // Render package item with enhanced UI
  const renderPackageItem = ({ item }: { item: Paquetes }) => {

    return (
      <TouchableOpacity
        style={{ width: tileSize, height: tileSize }}
        onPress={() => navigation.navigate("PaqueteShow", item)}
        activeOpacity={0.8}
      >
        <View className="m-0.5 relative">
          <CacheImage
            styleImage={{ width: tileSize - 1, height: tileSize - 1, borderRadius: 8 }}
            source={{ uri: item.imagenUrl }}
          />


          {/* Package type badge */}
          {item.typeBox === "REGALO" && (
            <View className="absolute top-1 left-1 bg-purple-500/80 rounded-full px-1.5 py-0.5">
              <FontAwesome5 name="gift" size={8} color="white" />
            </View>
          )}

          {/* Package Name Overlay with gradient */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
          >
            <Text className="text-white text-xs" numberOfLines={1} style={font.SemiBold}>
              {item.nombre}
            </Text>
            <Text className="text-white/80 text-[10px]" numberOfLines={1}>
              ${item.amount.toFixed(2)}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    )
  }

  // Render empty state based on what's missing
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-500 mt-4" style={font.Regular}>
            Cargando paquetes...
          </Text>
        </View>
      )
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Feather name="alert-circle" size={50} color="#CBD5E0" />
          <Text className="text-lg text-center text-gray-700 mt-4 mb-2" style={font.SemiBold}>
            Error al cargar paquetes
          </Text>
          <Text className="text-center text-gray-500 mb-6">{error}</Text>
          <TouchableOpacity className="bg-primary px-6 py-3 rounded-lg flex-row items-center" onPress={getPaquetes}>
            <Feather name="refresh-cw" size={16} color="white" />
            <Text className="text-white ml-2" style={font.SemiBold}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (searchQuery.trim() && getFilteredPackages().length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Feather name="search" size={50} color="#CBD5E0" />
          <Text className="text-lg text-center text-gray-700 mt-4 mb-2" style={font.SemiBold}>
            No se encontraron resultados
          </Text>
          <Text className="text-center text-gray-500 mb-6">No hay paquetes que coincidan con "{searchQuery}"</Text>
          <TouchableOpacity className="bg-gray-200 px-6 py-3 rounded-lg" onPress={() => setSearchQuery("")}>
            <Text className="text-gray-700" style={font.SemiBold}>
              Limpiar búsqueda
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    // If no products, recommend creating products first
    if (!hasProducts) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <FontAwesome5 name="box-open" size={32} color={Colors.primary} />
          </View>
          <Text className="text-xl text-center text-secondary mb-3" style={font.Bold}>
            No tienes productos
          </Text>
          <Text className="text-base text-center text-gray-600 mb-6" style={font.Regular}>
            Antes de crear paquetes, necesitas agregar productos a tu catálogo.
          </Text>
          <TouchableOpacity
            className="bg-primary py-3 px-6 rounded-lg flex-row items-center"
            onPress={() => validatesEstatusProd()}
          >
            <AntDesign name="plus" size={18} color="white" />
            <Text className="text-white ml-2" style={font.SemiBold}>
              Crear Producto
            </Text>
          </TouchableOpacity>
        </View>
      )
    }

    // If has products but no packages, recommend creating packages
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
          <MaterialCommunityIcons name="package-variant" size={32} color={Colors.primary} />
        </View>
        <Text className="text-xl text-center text-secondary mb-3" style={font.Bold}>
          No tienes paquetes
        </Text>
        <Text className="text-base text-center text-gray-600 mb-6" style={font.Regular}>
          Crea tu primer paquete para ofrecer a tus clientes una experiencia completa.
        </Text>
        <TouchableOpacity
          className="bg-primary py-3 px-6 rounded-lg flex-row items-center"
          onPress={() => validatesEstatusPak()}
        >
          <AntDesign name="plus" size={18} color="white" />
          <Text className="text-white ml-2" style={font.SemiBold}>
            Crear Paquete
          </Text>
        </TouchableOpacity>
      </View>
    )
  }



  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center w-full px-4 pt-5 pb-4 bg-white border-b border-gray-100">
        <Text style={[font.Bold, { fontSize: 24, color: Colors.secondary }]}>Paquetes</Text>

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
            placeholder="Buscar paquetes..."
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

  
      {/* Package Grid */}
      <View className="flex-1 bg-white">
        <FlatList
          data={getFilteredPackages()}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 80,
            ...((!Paquetes || Paquetes.length === 0 || getFilteredPackages().length === 0) && { flex: 1 }),
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={getPaquetes} colors={[Colors.primary]} />
          }
          ListEmptyComponent={renderEmptyState()}
        />
      </View>

       
       {/* FAB Buttons */}
      {hasProducts && (
        <View className="absolute z-10 bottom-[2%] left-4">
          <FAB
            icon={(() => <MaterialCommunityIcons name="puzzle-plus" size={24} color="white" />) as any}
            color={Colors.primary}
            onPress={() => validatesEstatusProd()}
          />
        </View>
      )}

      {hasProducts && (
        <View className="absolute z-10 bottom-[2%] right-4">
          <FAB
            icon={(() => <MaterialCommunityIcons name="plus-thick" size={24} color="white" />) as any}
            color={Colors.primary}
            onPress={() => validatesEstatusPak()}
          />
        </View>
      )}
      
       {/* No Products Dialog */}
      <DialogNoProductsAlert
        active={showNoProductsDialog}
        setActive={setShowNoProductsDialog}
        onCreateProduct={validatesEstatusProd}
      />
      {/* Validation Dialog */}
      <DialogValidateBusiness active={isValidate} setActive={setIsValidate} />
    </SafeAreaView>
  )
}

export default PaquetesBusinessScreen

"use client"

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native"
import { useCallback, useEffect, useState, useRef } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import type { BottomTabNavigationType } from "../../navigation/BottomTab"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import CacheImage from "../../components/CacheImage/CacheImage"
import HeaderApp from "../../components/HeaderApp"

// Define interfaces for the receipt data
interface Receipt {
  ordenDate: string
  totalAmount: number
  orderType: string
  item: {
    id: number
    quantity: number
    unitPrice: number | null
    unitPrice2: number
    amount: number | null
    amount2: number
    plan?: {
      id: number
      name: string
      description: string
      imgSrc: string
    }
    boxPackage?: {
      id: number
      nombre: string
      description: string
      imagenUrl: string
      amount: number
      storeBusiness?: {
        id: number
        name: string
        description: string
      }
    }
    gif?: {
      id: number
      creationDate: string
      message: string
      statusGif: string
    }
    invitations?: {
      id: number
      message: string
      creationDate: string
      acceptanceDate: string | null
      dateTimeInvitation: string
      timePeriod: number
      statusInvitation: string
    }
  }
  orderNumber: string
  plan?: {
    id: number
    name: string
    description: string
    imgSrc: string
    currency?: {
      id: number
      name: string
      simbol: string
    }
  }
  gif?: {
    id: number
    creationDate: string
    message: string
    statusGif: string
    boxPackage?: {
      id: number
      nombre: string
      description: string
      imagenUrl: string
    }
    customerSource?: {
      id: number
      firstName: string
      lastName: string
    }
    customerDestination?: {
      id: number
      firstName: string
      lastName: string
    }
    storeBusiness?: {
      id: number
      name: string
      description: string
    }
  }
  invitation?: any
  paymentType: {
    id: number
    name: string
  }
}

interface ReceiptsResponse {
  content: Receipt[]
  pageable: {
    pageNumber: number
    pageSize: number
    offset: number
  }
  totalElements: number
  totalPages: number
  last: boolean
  size: number
  number: number
  numberOfElements: number
  first: boolean
  empty: boolean
}



// Filter options for transaction types
const FILTER_OPTIONS = [
  { id: "ALL", label: "Todos", icon: "receipt" },
  { id: "COMPRA_PLAN", label: "Planes", icon: "star" },
  { id: "REGALO", label: "Regalos", icon: "gift" },
  { id: "COMPRA_PRODUCTO", label: "Citas", icon: "calendar-alt" },
]

const ReceiptsScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const navigationBottom = useNavigation<BottomTabNavigationType>()
  const { user, TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const isFocus = useIsFocused()

  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false)
  // Use a ref to track API calls in progress
  const isApiCallInProgress = useRef(false)

  // State variables
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState("ALL")
  const [hasError, setHasError] = useState(false)

  // Function to fetch receipts with pagination
  const fetchReceipts = useCallback(
    async (page = 0, reset = false) => {
      // Prevent multiple simultaneous API calls
      if (isApiCallInProgress.current) {
        return
      }

      isApiCallInProgress.current = true

      try {
        if (reset) {
          setLoading(true)
        } else if (page > 0) {
          setLoadingMore(true)
        }

        setHasError(false)

        const host = process.env.APP_BASE_API
        let url = `/api/appchancea/ordens/byCustomer?sessionToken=${SesionToken}&page=${page}&size=10&sort=ordenDate,desc`

        // Add filter if not "ALL"
        if (selectedFilter !== "ALL") {
          url += `&orderType=${selectedFilter}`
        }

        const header = await GetHeader(TokenAuthApi, "application/json")
        console.log(`Fetching receipts: page ${page}, filter: ${selectedFilter}`)
        const response: ReceiptsResponse = await HttpService("get", host, url, {}, header)

        console.log(response.content[0].orderType)

        if (reset) {
          setReceipts(response.content)
        } else {
          setReceipts((prevReceipts) => {
            // Merge with existing receipts, avoiding duplicates
            const newReceipts = [...prevReceipts]
            response.content.forEach((newReceipt) => {
              if (!newReceipts.some((r) => r.orderNumber === newReceipt.orderNumber)) {
                newReceipts.push(newReceipt)
              }
            })
            return newReceipts
          })
        }

        setCurrentPage(response.pageable.pageNumber)
        setTotalPages(response.totalPages)
      } catch (err: any) {
        console.error(err)
        setHasError(true)
        setReceipts([])
        setCurrentPage(0)
        setTotalPages(0)
        if (err && err?.status) {
          ToastCall("error", "Error de conexión con el servidor", "ES")
        } /* else {
          ToastCall("error", "Tienes problemas de conexión", "ES")
        } */
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
        isApiCallInProgress.current = false
      }
    },
    [TokenAuthApi, SesionToken, selectedFilter], // Removed receipts from dependencies
  )

  // Load more receipts when reaching the end of the list
  const loadMoreReceipts = useCallback(() => {
    if (currentPage < totalPages - 1 && !loadingMore && !isApiCallInProgress.current) {
      fetchReceipts(currentPage + 1)
    }
  }, [currentPage, totalPages, loadingMore, fetchReceipts])

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    if (!isApiCallInProgress.current) {
      setRefreshing(true)
      fetchReceipts(0, true)
    }
  }, [fetchReceipts])

  // Filter change handler
  const handleFilterChange = useCallback(
    (filterId: string) => {
      /*   if (filterId === selectedFilter || isApiCallInProgress.current) return */

      setCurrentPage(0)
      fetchReceipts(0, true)
    },
    [fetchReceipts, selectedFilter],
  )

  // Initial data load - with better control to prevent multiple calls
  useEffect(() => {
    if (isFocus && TokenAuthApi && user && !initialFetchDone.current && !isApiCallInProgress.current) {
      initialFetchDone.current = true
      fetchReceipts(0, true)
    }

    // Reset the initialFetchDone flag when component loses focus
    if (!isFocus) {
      initialFetchDone.current = false
    }
  }, [user, TokenAuthApi, isFocus, fetchReceipts])

  useEffect(() => {
    handleFilterChange(selectedFilter)
  }, [selectedFilter])


  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)

      // Format: "dd MMM yyyy, HH:mm"
      const day = date.getDate().toString().padStart(2, "0")
      const month = date.toLocaleString("es", { month: "short" })
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, "0")
      const minutes = date.getMinutes().toString().padStart(2, "0")

      return `${day} ${month} ${year}, ${hours}:${minutes}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Render item for the FlatList
  // Render item for the FlatList
  const renderReceiptItem = ({ item }: { item: Receipt }) => {
    // Determine icon and color based on order type
    let icon = "receipt-long"
    let iconColor = Colors.primary
    let typeLabel = "Transacción"

    if (item.orderType === "COMPRA_PLAN") {
      icon = "star"
      iconColor = "#FFD700"
      typeLabel = "Plan"
    } else if (item.orderType === "REGALO") {
      icon = "gift"
      iconColor = "#FF6B6B"
      typeLabel = "Regalo"
    } else if (item.orderType === "COMPRA_PRODUCTO") {
      icon = "calendar-alt"
      iconColor = "#4ECDC4"
      typeLabel = "Cita"
    }

    // Format date
    const formattedDate = formatDate(item.ordenDate)

    // Get item details
    const itemName = item.plan?.name || item.gif?.boxPackage?.nombre || item.item?.boxPackage?.nombre || "Producto"

    const itemDescription =
      item.plan?.description || item.gif?.boxPackage?.description || item.item?.boxPackage?.description || ""

    const imageUrl = item.plan?.imgSrc || item.gif?.boxPackage?.imagenUrl || item.item?.boxPackage?.imagenUrl || ""

    // Get business name for product purchases
    let businessName = ""
    if (item.orderType === "COMPRA_PRODUCTO" && item.item?.boxPackage?.storeBusiness) {
      businessName = `De: ${item.item.boxPackage.storeBusiness.name}`
    }

    // Get recipient or source name for gifts
    let personName = ""
    if (item.orderType === "REGALO" && item.gif) {
      if (item.gif.customerDestination && item.gif.customerSource?.id === user?.id) {
        personName = `Para: ${item.gif.customerDestination.firstName} ${item.gif.customerDestination.lastName}`
      } else if (item.gif.customerSource && item.gif.customerDestination?.id === user?.id) {
        personName = `De: ${item.gif.customerSource.firstName} ${item.gif.customerSource.lastName}`
      }
    }

    // Get invitation details for product purchases
    let invitationInfo = ""
    if (item.orderType === "COMPRA_PRODUCTO" && item.item?.invitations) {
      const status = item.item.invitations.statusInvitation === "PENDIENTE_DE_PAGO" ? "Pendiente" : "Confirmada"
      invitationInfo = `Cita: ${status}`
    }

    return (
      <TouchableOpacity
        style={styles.receiptCard}
        onPress={() => {
          navigation.navigate("ReceiptDetailsScreen", { receipt: item })
        }}
        activeOpacity={0.7}
      >
        <View style={styles.receiptHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
            <FontAwesome5 name={icon} size={20} color={iconColor} />
          </View>
          <View style={styles.receiptInfo}>
            <Text style={styles.receiptType}>{typeLabel}</Text>
            <Text style={styles.receiptDate}>{formattedDate}</Text>
          </View>
          <Text style={styles.receiptAmount}>Bs {item.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.receiptDetails}>
          {imageUrl ? (
            <CacheImage source={{ uri: imageUrl }} styleImage={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.placeholderImage]}>
              <FontAwesome5 name={icon} size={24} color="#ccc" />
            </View>
          )}

          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>
              {itemName}
            </Text>
            {itemDescription ? (
              <Text style={styles.itemDescription} numberOfLines={2}>
                {itemDescription}
              </Text>
            ) : null}
            {businessName ? <Text style={styles.businessName}>{businessName}</Text> : null}
            {personName ? <Text style={styles.personName}>{personName}</Text> : null}
            {invitationInfo ? <Text style={styles.invitationInfo}>{invitationInfo}</Text> : null}
            <Text style={styles.orderNumber}>Orden #{item.orderNumber}</Text>
          </View>
        </View>

        <View style={styles.receiptFooter}>
          <View style={styles.paymentMethod}>
            <FontAwesome5 name="money-bill-wave" size={12} color="#666" />
            <Text style={styles.paymentText}>{item.paymentType.name.replace(/_/g, " ")}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: "#4CAF50" }]} />
            <Text style={styles.statusText}>Completado</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Render footer for the FlatList (loading indicator)
  const renderFooter = () => {
    if (!loadingMore) return null

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingMoreText}>Cargando más transacciones...</Text>
      </View>
    )
  }

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null

    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="receipt" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No hay transacciones</Text>
        <Text style={styles.emptyText}>
          No se encontraron transacciones{selectedFilter !== "ALL" ? " con el filtro seleccionado" : ""}.
        </Text>
        {hasError && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <ScreenContainer backgroundColor="white">
      <View style={styles.container}>
        {/* Header */}
        <HeaderApp title="Historial de Transacciones" />


        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {FILTER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.filterOption, selectedFilter === option.id && styles.filterOptionActive]}
                onPress={() => setSelectedFilter(option.id)}
              >
                <FontAwesome5
                  name={option.icon}
                  size={16}
                  color={selectedFilter === option.id ? Colors.white : Colors.secondary}
                />
                <Text style={[styles.filterText, selectedFilter === option.id && styles.filterTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Receipts List */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando transacciones...</Text>
          </View>
        ) : (
          <FlatList
            data={receipts}
            renderItem={renderReceiptItem}
            keyExtractor={(item) => item.orderNumber}
            contentContainerStyle={[
              styles.listContainer,
              receipts.length === 0 && { flexGrow: 1, justifyContent: "center" },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            onEndReached={loadMoreReceipts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />
        )}
      </View>
    </ScreenContainer>
  )
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginLeft: 8,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterOptionActive: {
    backgroundColor: Colors.secondary,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Medium",
    color: Colors.secondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  receiptInfo: {
    flex: 1,
    marginLeft: 12,
  },
  receiptType: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.secondary,
  },
  receiptDate: {
    fontSize: 12,
    fontFamily: "Regular",
    color: "#666",
    marginTop: 2,
  },
  receiptAmount: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.primary,
  },
  receiptDetails: {
    flexDirection: "row",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    fontFamily: "Regular",
    color: "#666",
    marginBottom: 4,
  },
  personName: {
    fontSize: 12,
    fontFamily: "Medium",
    color: Colors.primary,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: "Regular",
    color: "#999",
  },
  receiptFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentText: {
    fontSize: 12,
    fontFamily: "Regular",
    color: "#666",
    marginLeft: 6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Medium",
    color: "#4CAF50",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "Regular",
    color: "#666",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: "Medium",
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontFamily: "Bold",
    color: Colors.white,
  },
  businessName: {
    fontSize: 12,
    fontFamily: "Medium",
    color: "#4ECDC4",
    marginBottom: 4,
  },
  invitationInfo: {
    fontSize: 12,
    fontFamily: "Medium",
    color: "#FF9800",
    marginBottom: 4,
  },
})

export default ReceiptsScreen

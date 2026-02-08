"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform } from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { FontAwesome5, Ionicons, AntDesign } from "@expo/vector-icons"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import ViewShot, { captureRef } from "react-native-view-shot"
import Share from "react-native-share"
import { LinearGradient } from "expo-linear-gradient"
import CacheImage from "../../components/CacheImage/CacheImage"

// Custom date formatter to avoid external library dependencies
const formatDate = (dateString: string, format = "full") => {
  const date = new Date(dateString)

  // Spanish month names
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  // Spanish day names
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]

  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  if (format === "full") {
    return `${day} de ${month} de ${year}, ${hours}:${minutes}`
  } else if (format === "short") {
    return `${day} ${month.substring(0, 3)} ${year}, ${hours}:${minutes}`
  }

  return `${day}/${date.getMonth() + 1}/${year} ${hours}:${minutes}`
}

const ReceiptDetailsScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const route = useRoute()
  const { receipt: initialReceipt, receiptId } = route.params as { receipt?: any; receiptId?: string }
  const { TokenAuthApi, SesionToken, user } = useAuth()
  const { setLoader } = useRender()

  // State variables
  const [loading, setLoading] = useState(!initialReceipt && !!receiptId)
  const [receipt, setReceipt] = useState(initialReceipt || null)
  const [error, setError] = useState(false)
  const [downloadModalVisible, setDownloadModalVisible] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Refs to prevent multiple API calls
  const isApiCallInProgress = useRef(false)
  const isMounted = useRef(true)
  const receiptViewRef = useRef(null)

  // Fetch receipt details if not provided in navigation params
  const fetchReceiptDetails = useCallback(async () => {
    // Skip if no receiptId or API call already in progress
    if (!receiptId || isApiCallInProgress.current || !isMounted.current) return

    try {
      isApiCallInProgress.current = true
      setLoading(true)
      setError(false)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/ordens/${receiptId}?sessionToken=${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("get", host, url, {}, header)

      if (isMounted.current) {
        setReceipt(response)
      }
    } catch (err: any) {
      console.error("Error fetching receipt details:", JSON.stringify(err))
      if (isMounted.current) {
        setError(true)
        ToastCall("error", "Error al cargar los detalles de la transacción", "ES")
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
      isApiCallInProgress.current = false
    }
  }, [receiptId, TokenAuthApi, SesionToken])

  // Handle download receipt
  const handleDownloadReceipt = () => {
    setDownloadModalVisible(true)
  }

  // Capture and share receipt
  const captureAndShareReceipt = useCallback(async () => {
    try {
      setDownloadLoading(true)

      // Capture the receipt view
      const uri = await captureRef(receiptViewRef, {
        format: "jpg",
        quality: 0.9,
        result: "data-uri",
      })

      // Share the captured image
      await Share.open({
        url: uri,
        title: "Recibo de Transacción",
        message: `Recibo de transacción #${receipt.orderNumber} por Bs ${receipt.totalAmount.toFixed(2)}`,
        subject: "Recibo de Transacción",
        failOnCancel: false,
      })

      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        setDownloadModalVisible(false)
      }, 2000)
    } catch (error) {
      console.error("Error capturing or sharing receipt:", error)
      ToastCall("error", "Error al compartir el recibo", "ES")
    } finally {
      setDownloadLoading(false)
    }
  }, [receipt])

  // Cleanup and initial fetch
  useEffect(() => {
    isMounted.current = true

    if (receiptId && !initialReceipt) {
      fetchReceiptDetails()
    }

    return () => {
      isMounted.current = false
    }
  }, [receiptId, initialReceipt, fetchReceiptDetails])

  // Retry fetch on error
  const handleRetry = () => {
    if (receiptId) {
      fetchReceiptDetails()
    } else {
      navigation.goBack()
    }
  }

  // If still loading or no receipt data
  if (loading) {
    return (
      <ScreenContainer backgroundColor="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles de Transacción</Text>
          </View>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        </View>
      </ScreenContainer>
    )
  }

  // If error occurred
  if (error || !receipt) {
    return (
      <ScreenContainer backgroundColor="white">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detalles de Transacción</Text>
          </View>
          <View style={styles.errorContainer}>
            <FontAwesome5 name="exclamation-circle" size={64} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Error al cargar los detalles</Text>
            <Text style={styles.errorText}>No se pudieron cargar los detalles de la transacción.</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    )
  }

  // Determine icon and color based on order type
  let icon = "receipt-long"
  let iconColor = Colors.primary
  let typeLabel = "Transacción"

  if (receipt.orderType === "COMPRA_PLAN") {
    icon = "star"
    iconColor = "#FFD700"
    typeLabel = "Plan"
  } else if (receipt.orderType === "REGALO") {
    icon = "gift"
    iconColor = "#FF6B6B"
    typeLabel = "Regalo"
  } else if (receipt.orderType === "COMPRA_PRODUCTO") {
    icon = "calendar-alt"
    iconColor = "#4ECDC4"
    typeLabel = "Cita"
  }

  // Format date
  const formattedDate = formatDate(receipt.ordenDate)

  // Get item details based on order type
  let itemName = "Producto"
  let itemDescription = ""
  let imageUrl = ""
  let businessName = ""
  let businessDescription = ""
  let businessLogo = ""

  if (receipt.orderType === "COMPRA_PLAN" && receipt.plan) {
    itemName = receipt.plan.name
    itemDescription = receipt.plan.description
    imageUrl = receipt.plan.imgSrc
  } else if (receipt.orderType === "REGALO" && receipt.gif?.boxPackage) {
    itemName = receipt.gif.boxPackage.nombre
    itemDescription = receipt.gif.boxPackage.description
    imageUrl = receipt.gif.boxPackage.imagenUrl
  } else if (receipt.orderType === "COMPRA_PRODUCTO" && receipt.item?.boxPackage) {
    itemName = receipt.item.boxPackage.nombre
    itemDescription = receipt.item.boxPackage.description
    imageUrl = receipt.item.boxPackage.imagenUrl

    // Get business details for product purchase
    if (receipt.item.boxPackage.storeBusiness) {
      businessName = receipt.item.boxPackage.storeBusiness.name
      businessDescription = receipt.item.boxPackage.storeBusiness.description
      businessLogo = receipt.item.boxPackage.storeBusiness.urlLogo
    } else if (receipt.item.boxPackage.business) {
      businessName = receipt.item.boxPackage.business.name
      businessDescription = receipt.item.boxPackage.business.comercialDenomination
      businessLogo = receipt.item.boxPackage.business.urlLogo
    }
  }

  // Get invitation details if available
  const hasInvitation = receipt.item?.invitations || receipt.invitation
  const invitation = receipt.item?.invitations || receipt.invitation

  return (
    <ScreenContainer backgroundColor="white">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de Transacción</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleDownloadReceipt}>
            <Ionicons name="share-outline" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Receipt Card */}
          <ViewShot ref={receiptViewRef} options={{ format: "jpg", quality: 0.9 }}>
            <View style={styles.receiptCard}>
              {/* Receipt Header with Logo */}
              <View style={styles.receiptBranding}>
                <Text style={styles.brandName}>Chancea</Text>
                <Text style={styles.receiptTitle}>Comprobante de Pago</Text>
              </View>

              <View style={styles.receiptHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                  <FontAwesome5 name={icon} size={24} color={iconColor} />
                </View>
                <Text style={styles.receiptType}>{typeLabel}</Text>
              </View>

              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Monto Total</Text>
                <Text style={styles.amount}>Bs {receipt.totalAmount.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              {/* Item Details */}
              <View style={styles.itemContainer}>
                {imageUrl ? (
                  <CacheImage source={{ uri: imageUrl }} styleImage={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImage]}>
                    <FontAwesome5 name={icon} size={32} color="#ccc" />
                  </View>
                )}

                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{itemName}</Text>
                  {itemDescription ? <Text style={styles.itemDescription}>{itemDescription}</Text> : null}
                </View>
              </View>

              <View style={styles.divider} />

              {/* Transaction Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Número de Orden</Text>
                  <Text style={styles.detailValue}>{receipt.orderNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>{formattedDate}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Método de Pago</Text>
                  <Text style={styles.detailValue}>{receipt.paymentType.name.replace(/_/g, " ")}</Text>
                </View>

                {receipt.orderType === "COMPRA_PRODUCTO" && receipt.item && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cantidad</Text>
                    <Text style={styles.detailValue}>{receipt.item.quantity}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estado</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: "#4CAF50" }]} />
                    <Text style={styles.statusText}>Completado</Text>
                  </View>
                </View>
              </View>

              {/* Business details for product purchase */}
              {receipt.orderType === "COMPRA_PRODUCTO" && businessName && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Detalles del Negocio</Text>

                    <View style={styles.businessContainer}>
                      {businessLogo ? (
                        <CacheImage source={{ uri: businessLogo }} styleImage={styles.businessLogo} />
                      ) : null}
                      <View style={styles.businessInfo}>
                        <Text style={styles.businessName}>{businessName}</Text>
                        {businessDescription ? (
                          <Text style={styles.businessDescription}>{businessDescription}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* Invitation details if available */}
              {hasInvitation && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Detalles de la Cita</Text>

                    {invitation.message && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mensaje</Text>
                        <Text style={styles.detailValue}>{invitation.message}</Text>
                      </View>
                    )}

                    {invitation.dateTimeInvitation && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha de Cita</Text>
                        <Text style={styles.detailValue}>{formatDate(invitation.dateTimeInvitation)}</Text>
                      </View>
                    )}

                    {invitation.statusInvitation && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Estado</Text>
                        <Text style={styles.detailValue}>{invitation.statusInvitation.replace(/_/g, " ")}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Gift specific details */}
              {receipt.orderType === "REGALO" && receipt.gif && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Detalles del Regalo</Text>

                    {receipt.gif.customerSource && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Remitente</Text>
                        <Text style={styles.detailValue}>
                          {receipt.gif.customerSource.firstName} {receipt.gif.customerSource.lastName}
                        </Text>
                      </View>
                    )}

                    {receipt.gif.customerDestination && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Destinatario</Text>
                        <Text style={styles.detailValue}>
                          {receipt.gif.customerDestination.firstName} {receipt.gif.customerDestination.lastName}
                        </Text>
                      </View>
                    )}

                    {receipt.gif.message && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Mensaje</Text>
                        <Text style={styles.detailValue}>{receipt.gif.message}</Text>
                      </View>
                    )}

                    {receipt.gif.storeBusiness && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Tienda</Text>
                        <Text style={styles.detailValue}>{receipt.gif.storeBusiness.name}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Plan specific details */}
              {receipt.orderType === "COMPRA_PLAN" && receipt.plan && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailsContainer}>
                    <Text style={styles.sectionTitle}>Detalles del Plan</Text>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Nombre del Plan</Text>
                      <Text style={styles.detailValue}>{receipt.plan.name}</Text>
                    </View>

                    {receipt.plan.currency && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Moneda</Text>
                        <Text style={styles.detailValue}>
                          {receipt.plan.currency.name} ({receipt.plan.currency.simbol})
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}

              {/* Price breakdown */}
              <View style={styles.divider} />
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Resumen de Pago</Text>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subtotal</Text>
                  <Text style={styles.detailValue}>Bs {(receipt.totalAmount * 0.84).toFixed(2)}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IVA (16%)</Text>
                  <Text style={styles.detailValue}>Bs {(receipt.totalAmount * 0.16).toFixed(2)}</Text>
                </View>

                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>Bs {receipt.totalAmount.toFixed(2)}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.receiptFooter}>
                <Text style={styles.footerText}>Gracias por tu compra</Text>
                <Text style={styles.footerCopyright}>© {new Date().getFullYear()} Chancea</Text>
              </View>
            </View>
          </ViewShot>

          {/* Download Receipt Button */}
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadReceipt}>
            <FontAwesome5 name="file-download" size={16} color={Colors.white} />
            <Text style={styles.downloadText}>Descargar Recibo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Download Modal */}
      <Modal
        visible={downloadModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDownloadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {downloadLoading ? (
              <View style={styles.modalContent}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.modalTitle}>Preparando recibo...</Text>
                <Text style={styles.modalText}>Estamos generando tu recibo para compartir.</Text>
              </View>
            ) : downloadSuccess ? (
              <View style={styles.modalContent}>
                <AntDesign name="checkcircle" size={64} color={Colors.primary} />
                <Text style={styles.modalTitle}>¡Recibo compartido!</Text>
                <Text style={styles.modalText}>Tu recibo ha sido compartido exitosamente.</Text>
              </View>
            ) : (
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.modalHeader}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalHeaderText}>Opciones de Recibo</Text>
                </LinearGradient>

                <Text style={styles.modalTitle}>Compartir Recibo</Text>
                <Text style={styles.modalText}>
                  Puedes compartir este recibo como imagen o guardarlo en tu dispositivo.
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={() => setDownloadModalVisible(false)}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={captureAndShareReceipt}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Compartir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  )
}

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
    flex: 1,
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginLeft: 8,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  receiptBranding: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  brandName: {
    fontSize: 24,
    fontFamily: "Bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  receiptTitle: {
    fontSize: 16,
    fontFamily: "Medium",
    color: Colors.secondary,
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  receiptType: {
    fontSize: 20,
    fontFamily: "Bold",
    color: Colors.secondary,
  },
  amountContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: "Medium",
    color: "#666",
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontFamily: "Bold",
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: "Regular",
    color: "#666",
  },
  detailsContainer: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: "Medium",
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "SemiBold",
    color: Colors.secondary,
    flex: 1,
    textAlign: "right",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "SemiBold",
    color: "#4CAF50",
  },
  businessContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f5f5f5",
  },
  businessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  businessName: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    fontFamily: "Regular",
    color: "#666",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.secondary,
  },
  totalValue: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.primary,
    textAlign: "right",
  },
  receiptFooter: {
    marginTop: 30,
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  footerText: {
    fontSize: 16,
    fontFamily: "Medium",
    color: Colors.secondary,
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    fontFamily: "Regular",
    color: "#999",
  },
  downloadButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
  },
  downloadText: {
    fontSize: 16,
    fontFamily: "Bold",
    color: Colors.white,
    marginLeft: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalContent: {
    alignItems: "center",
    padding: 20,
  },
  modalHeader: {
    width: "100%",
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  modalHeaderText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Bold",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Bold",
    color: Colors.secondary,
    marginVertical: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    fontFamily: "Regular",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: "45%",
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonTextPrimary: {
    color: "white",
    fontSize: 16,
    fontFamily: "Bold",
  },
  modalButtonTextSecondary: {
    color: Colors.secondary,
    fontSize: 16,
    fontFamily: "Medium",
  },
})

export default ReceiptDetailsScreen

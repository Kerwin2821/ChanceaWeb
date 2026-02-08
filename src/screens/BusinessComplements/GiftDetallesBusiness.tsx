"use client"

import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Linking, TextInput } from "react-native"
import { useEffect, useState } from "react"
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native"
import {
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons"
import moment from "moment"
import { Image } from "expo-image"
import { Colors } from "../../utils"
import type { EstadoRegalos, GiftData } from "../Regalos/interface.regalos"
import CacheImage from "../../components/CacheImage/CacheImage"
import { HttpService } from "../../services"
import { GetHeader } from "../../utils/Helpers"
import { useAuth } from "../../context"
import HeaderApp from "../../components/HeaderApp"

const GiftDetallesBusiness = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const gift = route.params as GiftData
  const [status, setStatus] = useState<EstadoRegalos>(gift.statusGif)
  const [loading, setLoading] = useState(false)
  const isFocused = useIsFocused()
  const [cancelReason, setCancelReason] = useState<string>("El cliente ha cancelado su pedido")
  const { TokenAuthApi, SesionToken } = useAuth()

  // Get status color based on gift status
  const getStatusColor = (status: EstadoRegalos) => {
    switch (status) {
      case "PAGADO":
        return "#4CAF50" // Green
      case "POR_PAGAR":
        return "#FF9800" // Orange
      case "CANCELADO":
        return "#F44336" // Red
      case "EN_PROCESO":
        return "#2196F3" // Blue
      case "ENVIADO":
        return "#9C27B0" // Purple
      case "ENTREGADO":
        return "#009688" // Teal
      default:
        return "#757575" // Gray
    }
  }

  // Get status text based on gift status
  const getStatusText = (status: EstadoRegalos) => {
    switch (status) {
      case "PAGADO":
        return "Pagado"
      case "POR_PAGAR":
        return "Por Pagar"
      case "CANCELADO":
        return "Cancelado"
      case "EN_PROCESO":
        return "En Proceso"
      case "ENVIADO":
        return "Enviado"
      case "ENTREGADO":
        return "Entregado"
      default:
        return status
    }
  }

  // Function to call the recipient
  const callRecipient = () => {
    const phoneNumber = gift.customerDestination.phone
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => Alert.alert("Error", "No se pudo realizar la llamada"))
  }

  // Function to send a WhatsApp message to the recipient
  const messageRecipient = () => {
    const phoneNumber = gift.customerDestination.phone
    // Remove any non-numeric characters from the phone number
    const formattedPhone = phoneNumber.replace(/\D/g, "")

    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`).catch((err) =>
      Alert.alert("Error", "No se pudo abrir WhatsApp. Asegúrate de tenerlo instalado."),
    )
  }

  // Function to open maps app with store location
  const openMapsApp = () => {
    const lat = gift.storeBusiness.positionX
    const lng = gift.storeBusiness.positionY

    // Verify if the device is Android or iOS
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(gift.storeBusiness.name)}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(gift.storeBusiness.name)})`,
    })

    // Open the link with Linking
    Linking.openURL(url as string).catch((err) => Alert.alert("Error", "No se pudo abrir la aplicación de mapas"))
  }

  // Function to handle cancellation
  const handleCancel = () => {
    Alert.alert("Cancelar Regalo", "¿Estás seguro que deseas cancelar este regalo?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Sí, Cancelar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true)
            const host = process.env.APP_BASE_API
            const url = "/api/appchancea/business/appchanceaUpdateGifStatus"
            const headers = await GetHeader(TokenAuthApi, "application/json")

            const data = {
              gifId: gift.id,
              tokenSessionId: SesionToken,
              acceptanceDate: new Date().toISOString(),
              statusGif: "CANCELADO",
            }

            await HttpService("post", host, url, data, headers)
            setStatus("CANCELADO")
            Alert.alert("Regalo Cancelado", "El regalo ha sido cancelado exitosamente")
          } catch (error) {
            console.error("Error al cancelar regalo:", error)
            Alert.alert("Error", "No se pudo cancelar el regalo. Intente nuevamente.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Function to handle setting status to "En Proceso"
  const handleSetInProcess = () => {
    Alert.alert("Cambiar a En Proceso", "¿Deseas cambiar el estado del regalo a En Proceso?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            setLoading(true)
            const host = process.env.APP_BASE_API
            const url = "/api/appchancea/business/appchanceaUpdateGifStatus"
            const headers = await GetHeader(TokenAuthApi, "application/json")

            const data = {
              gifId: gift.id,
              tokenSessionId: SesionToken,
              acceptanceDate: new Date().toISOString(),
              statusGif: "EN_PROCESO",
            }

            await HttpService("post", host, url, data, headers)
            setStatus("EN_PROCESO")
            Alert.alert("Estado Actualizado", "El regalo ahora está En Proceso")
          } catch (error) {
            console.error("Error al actualizar estado:", error)
            Alert.alert("Error", "No se pudo actualizar el estado. Intente nuevamente.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Function to handle setting status to "Enviado"
  const handleSetSent = () => {
    Alert.alert("Marcar como Enviado", "¿Confirmas que el regalo ha sido enviado?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            setLoading(true)
            const host = process.env.APP_BASE_API
            const url = "/api/appchancea/business/appchanceaUpdateGifStatus"
            const headers = await GetHeader(TokenAuthApi, "application/json")

            const data = {
              gifId: gift.id,
              tokenSessionId: SesionToken,
              acceptanceDate: new Date().toISOString(),
              statusGif: "ENVIADO",
            }

            await HttpService("post", host, url, data, headers)
            setStatus("ENVIADO")
            Alert.alert("Estado Actualizado", "El regalo ha sido marcado como Enviado")
          } catch (error) {
            console.error("Error al actualizar estado:", error)
            Alert.alert("Error", "No se pudo actualizar el estado. Intente nuevamente.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Function to handle setting status to "Entregado"
  const handleSetDelivered = () => {
    Alert.alert("Marcar como Entregado", "¿Confirmas que el regalo ha sido entregado al destinatario?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: async () => {
          try {
            setLoading(true)
            const host = process.env.APP_BASE_API
            const url = "/api/appchancea/business/appchanceaUpdateGifStatus"
            const headers = await GetHeader(TokenAuthApi, "application/json")

            const data = {
              gifId: gift.id,
              tokenSessionId: SesionToken,
              acceptanceDate: new Date().toISOString(),
              statusGif: "ENTREGADO",
            }

            await HttpService("post", host, url, data, headers)
            setStatus("ENTREGADO")
            Alert.alert("Estado Actualizado", "El regalo ha sido marcado como Entregado")
          } catch (error) {
            console.error("Error al actualizar estado:", error)
            Alert.alert("Error", "No se pudo actualizar el estado. Intente nuevamente.")
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  // Function to handle payment
  const handlePay = () => {
    Alert.alert("Pagar Regalo", "¿Deseas proceder con el pago de este regalo?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Pagar",
        onPress: () => {
          setLoading(true)
          // Simulate API call
          setTimeout(() => {
            setStatus("PAGADO")
            setLoading(false)
            Alert.alert("Pago Exitoso", "El regalo ha sido pagado exitosamente")
          }, 1000)
        },
      },
    ])
  }

  // Calculate total price
  const calculateTotal = () => {
    const { amount, iva, igtf, comission } = gift.boxPackage
    return amount - ((amount * iva) / 100) - ((amount * igtf) / 100) - comission
  }

  useEffect(() => {
    console.log(gift.boxPackage)
  }, [])

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <HeaderApp title="Detalles del Regalo" />

      {/* Status Badge */}
      <View className="items-center mt-4">
        <View
          style={{ backgroundColor: getStatusColor(status) }}
          className="px-4 py-1 rounded-full flex-row items-center"
        >
          {status === "PAGADO" && (
            <FontAwesome5 name="check-circle" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          {status === "POR_PAGAR" && (
            <FontAwesome5 name="money-bill-wave" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          {status === "CANCELADO" && (
            <Ionicons name="close-circle" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          {status === "EN_PROCESO" && (
            <MaterialCommunityIcons name="progress-clock" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          {status === "ENVIADO" && (
            <FontAwesome5 name="paper-plane" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          {status === "ENTREGADO" && (
            <MaterialIcons name="delivery-dining" size={14} color="white" style={{ marginRight: 5 }} />
          )}
          <Text className="text-white font-bold">{getStatusText(status)}</Text>
        </View>
      </View>

      {/* Gift Message */}
      {gift.message && (
        <View className="bg-white rounded-lg mx-4 my-4 p-4 shadow">
          <View className="flex-row items-center mb-2">
            <FontAwesome name="gift" size={24} color={Colors.secondary} />
            <Text className="text-lg font-bold text-secondary ml-2">Mensaje</Text>
          </View>
          <View className="bg-gray-50 p-3 rounded-lg border border-gray-200 italic">
            <Text className="text-gray-700">{gift.message}</Text>
          </View>
        </View>
      )}

      {/* Recipient Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="user" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Destinatario</Text>
        </View>

        <View className="items-center mb-4">
          <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-2">
            <CacheImage
              source={{ uri: gift.customerDestination.customerProfiles[0].link }}
              classNameImage="w-full h-full"
            />
          </View>
          <Text className="font-bold text-lg">
            {gift.customerDestination.firstName.split(" ")[0]} {gift.customerDestination.lastName.split(" ")[0]}
          </Text>
        </View>

        <View className="flex-row justify-center mb-2">
          <TouchableOpacity
            className="flex-row items-center justify-center bg-primary py-2 px-4 rounded-lg mr-2"
            onPress={callRecipient}
          >
            <FontAwesome name="phone" size={18} color="white" />
            <Text className="text-white font-bold ml-2">Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-green-500 py-2 px-4 rounded-lg ml-2"
            onPress={messageRecipient}
          >
            <FontAwesome5 name="whatsapp" size={18} color="white" />
            <Text className="text-white font-bold ml-2">WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mt-2 px-2">
          <FontAwesome name="phone" size={16} color={Colors.secondary} />
          <Text className="ml-2">{gift.customerDestination.phone}</Text>
        </View>
      </View>

      {/* Package Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="card-giftcard" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Paquete</Text>
        </View>

        <View className="flex-row border border-primary rounded-lg overflow-hidden">
          <View className="w-[100px] h-[100px]">
            <CacheImage source={{ uri: gift.boxPackage.imagenUrl }} classNameImage="w-full h-full" />
          </View>
          <View className="flex-1 p-2">
            <Text className="font-bold text-base mb-1">{gift.boxPackage.nombre}</Text>
            <Text className="text-sm text-gray-600" numberOfLines={3}>
              {gift.boxPackage.description}
            </Text>
          </View>
        </View>
      </View>

      {/* Store Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <FontAwesome5 name="store" size={20} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Tienda</Text>
        </View>

        <View className="p-2">
          <Text className="text-lg font-bold mb-1">{gift.storeBusiness.name}</Text>
          <Text className="text-sm text-gray-600 mb-4">{gift.storeBusiness.description}</Text>
        </View>
      </View>

      {/* Date Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="calendar-month" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Fechas</Text>
        </View>

        <View className="py-2">
          <View className="flex-row items-center mb-2">
            <FontAwesome5 name="calendar-plus" size={16} color={Colors.primary} />
            <Text className="ml-2 text-sm">
              <Text className="font-medium">Creado: </Text>
              {moment(gift.creationDate).format("DD/MM/YYYY hh:mm a")}
            </Text>
          </View>

          {gift.sendDate && (
            <View className="flex-row items-center mb-2">
              <FontAwesome5 name="shipping-fast" size={16} color={Colors.primary} />
              <Text className="ml-2 text-sm">
                <Text className="font-medium">Enviado: </Text>
                {moment(gift.sendDate).format("DD/MM/YYYY hh:mm a")}
              </Text>
            </View>
          )}

          {gift.receiveDate && (
            <View className="flex-row items-center mb-2">
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text className="ml-2 text-sm">
                <Text className="font-medium">Recibido: </Text>
                {moment(gift.receiveDate).format("DD/MM/YYYY hh:mm a")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Price Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="money" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Precio</Text>
        </View>

        <View className="p-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Precio base</Text>
            <Text className="text-sm">${calculateTotal().toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">IVA</Text>
            <Text className="text-sm">${gift.boxPackage.iva.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">IGTF</Text>
            <Text className="text-sm">${gift.boxPackage.igtf.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600">Comisión</Text>
            <Text className="text-sm">${gift.boxPackage.comission.toFixed(2)}</Text>
          </View>
          <View className="h-[1px] bg-gray-300 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold">Total</Text>
            <Text className="text-base font-bold text-primary">${gift.boxPackage.amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Conditional Action Buttons based on status */}
      {status === "PAGADO" && (
        <View className="mx-4 mb-5">
          <View className="flex-row justify-between mb-3">
            <TouchableOpacity
              className="flex-row items-center justify-center py-3 rounded-lg flex-1 mr-2 bg-red-500"
              onPress={handleCancel}
              disabled={loading}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-center py-3 rounded-lg flex-1 ml-2 bg-blue-500"
              onPress={handleSetInProcess}
              disabled={loading}
            >
              <MaterialCommunityIcons name="progress-clock" size={20} color="white" />
              <Text className="text-white font-bold ml-2">En Proceso</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {status === "CANCELADO" && (
        <View className="mx-4 mb-5">
          <Text className="text-base font-bold text-gray-700 mb-2">Motivo de cancelación:</Text>
          <TextInput
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-gray-700"
            value={cancelReason}
            editable={false}
            multiline
            numberOfLines={2}
          />
        </View>
      )}

      {status === "EN_PROCESO" && (
        <View className="mx-4 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg bg-purple-500"
            onPress={handleSetSent}
            disabled={loading}
          >
            <FontAwesome5 name="paper-plane" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Marcar como Enviado</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "ENVIADO" && (
        <View className="mx-4 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg bg-teal-500"
            onPress={handleSetDelivered}
            disabled={loading}
          >
            <MaterialIcons name="delivery-dining" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Marcar como Entregado</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "ENTREGADO" && (
        <View className="mx-4 mb-5">
          <View className="flex-row items-center justify-center bg-green-50 p-4 rounded-lg w-full">
            <FontAwesome name="check-circle" size={20} color={Colors.primary} />
            <Text className="ml-2 text-primary font-medium">Este regalo ha sido entregado exitosamente</Text>
          </View>
        </View>
      )}

      {/* Spacer for bottom padding */}
      <View className="h-10" />
    </ScrollView>
  )
}

export default GiftDetallesBusiness


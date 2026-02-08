"use client";

import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Linking } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome, FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import moment from "moment";
import { Image } from "expo-image";
import { Colors } from "../../utils";
import type {
  ReservationSingleListResponse,
  EstadoReservation,
  Stores,
  Paquetes,
  Productos,
  UpdateReservationResponse,
} from "../../context/storeBusinessHooks/StoreBusinessInterface";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useAuth, useRender } from "../../context";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import { HttpService } from "../../services";
import CacheImage from "../../components/CacheImage/CacheImage";
import { font } from "../../../styles";
import HeaderApp from "../../components/HeaderApp";

const DateDetallesBusiness = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as ReservationSingleListResponse;
  const [status, setStatus] = useState<EstadoReservation>(data.statusReservation);
  const [store, setStore] = useState<Stores | undefined>();
  const [paquete, setPaquete] = useState<Paquetes | undefined>();
  const [productosData, setProductosData] = useState<Productos[] | undefined>();
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused();
  const { Stores, Paquetes, Productos } = useStoreBusiness();
  const { TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();

  // Update the getStatusColor function to use the correct status types
  const getStatusColor = (status: EstadoReservation) => {
    switch (status) {
      case "CONFIRMADA":
        return "#4CAF50";
      case "CANCELADA":
        return "#F44336";
      case "PENDIENTE":
        return "#FF9800";
      case "COMPLETADA":
        return "#9C27B0";
      default:
        return "#757575";
    }
  };

  // Update the getStatusText function to use the correct status types
  const getStatusText = (status: EstadoReservation) => {
    switch (status) {
      case "CONFIRMADA":
        return "Confirmada";
      case "CANCELADA":
        return "Cancelada";
      case "PENDIENTE":
        return "Pendiente";
      case "COMPLETADA":
        return "Completada";
      default:
        return status;
    }
  };

  // Update the handleConfirm function to use CONFIRMADA instead of ACEPTADA
  const handleConfirm = () => {
    Alert.alert("Confirmar Cita", "¿Estás seguro que deseas confirmar esta cita?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: () => {
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setLoading(false);
            updateReservation("COMPLETADA")
            ToastCall("success","La cita ha sido confirmada exitosamente","ES");
          }, 1000);
        },
      },
    ]);
  };

  // Update the handleCancel function to use CANCELADA
  const handleCancel = () => {
    Alert.alert("Cancelar Cita", "¿Estás seguro que deseas cancelar esta cita?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Sí, Cancelar",
        style: "destructive",
        onPress: () => {
          setLoading(true);
          // Simulate API call
          setTimeout(() => {
            setLoading(false);
            updateReservation("CANCELADA")
            ToastCall("success","La cita ha sido cancelada exitosamente","ES");
          }, 1000);
        },
      },
    ]);
  };

  

  const updateReservation = useCallback(async (Estatus:EstadoReservation) => {
    try {
      console.log({
        "id": data.citaId,
        "sessionToken": SesionToken,
        "status": Estatus
      })

      const host = process.env.APP_BASE_API;
      const url = `/api/reservations/updateStatus`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: UpdateReservationResponse = await HttpService("post", host, url, {
        "id": data.citaId,
        "sessionToken": SesionToken,
        "status": Estatus
      }, header, setLoader);

      console.log(response, "REGALOS");
      setStatus(Estatus)

    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, [TokenAuthApi]);

  console.log(data.customerURLDestination)

  useEffect(() => {
    if (isFocused) {
      console.log(data)
      const paqueteFind = Paquetes?.find((e) => e.id.toString() === data.boxPackageId);
      const storeFind = Stores?.find((e) => e.id && e.id.toString() === data.storeId);
      if (paqueteFind) {
        setPaquete(paqueteFind);
        setProductosData(paqueteFind.products);
      }
      if (storeFind) {
        setStore(storeFind);
      }
    }
  }, [isFocused, Paquetes, Stores, data]);

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <HeaderApp title="Detalles de la Reservación"/>

      {/* Status Badge */}
      <View className="items-center mt-4">
        <View style={{ backgroundColor: getStatusColor(status) }} className="px-4 py-1 rounded-full">
          <Text className="text-white font-bold">{getStatusText(status)}</Text>
        </View>
      </View>

      {/* User Profiles */}
      <View className="flex-row justify-center items-center my-5 px-5">
        <View className="items-center flex-2">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
            <CacheImage source={{ uri: data.customerURLSource }} classNameImage="w-full h-full"  />
          </View>
          <Text className="font-bold mt-1 text-base">{data.customerSourceName.split(" ")[0]}</Text>
          <Text className="text-xs text-secondary">Anfitrión</Text>
        </View>

        <View className="flex-1 items-center">
          <FontAwesome5 name="arrow-right" size={20} color={Colors.secondary} />
        </View>

        <View className="items-center flex-2">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
            <CacheImage source={{ uri: data.customerURLDestination }} classNameImage="w-full h-full"  />
          </View>
          <Text className="font-bold mt-1 text-base">{data.customerDestinationName.split(" ")[0]}</Text>
          <Text className="text-xs text-secondary">Invitado</Text>
        </View>
      </View>

      {/* Package Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="dinner-dining" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Paquete</Text>
        </View>

        <View className="flex-row border border-primary rounded-lg overflow-hidden">
          <View className="w-[100px] h-[100px]">
            <CacheImage
              source={{ uri: paquete?.imagenUrl || data.urlBoxpackge }}
              
              styleImage={{ height: 100, width: 100 }}
            />
          </View>
          <View className="flex-1 p-2">
            <Text className="font-bold text-base mb-1">{paquete?.nombre || data.packageName}</Text>
            <Text className="text-sm text-gray-600" numberOfLines={3}>
              {paquete?.description || data.packageDescription}
            </Text>
          </View>
        </View>

        {/* Products in Package */}
        {productosData && productosData.length > 0 && (
          <View className="mt-4 pt-4 border-t border-gray-200">
            <Text className="text-base font-bold mb-2">Productos incluidos:</Text>
            {productosData.map((producto, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
                <Text className="ml-2 text-sm">{producto.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Store Details */}
      {store && (
        <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
          <View className="flex-row items-center mb-2">
            <FontAwesome5 name="store" size={20} color={Colors.secondary} />
            <Text className="text-lg font-bold text-secondary ml-2">Información de la Tienda</Text>
          </View>

          <View className="p-2">
            <Text className="text-lg font-bold mb-1">{store.name}</Text>
            <Text className="text-sm text-gray-600 mb-4">{store.description}</Text>

            {/* <View className="mb-4">
              <TouchableOpacity className="flex-row items-center mb-2" onPress={callStore}>
                <FontAwesome name="phone" size={20} color={Colors.primary} />
                <Text className="ml-2 text-sm">{store.phoneNumber}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center mb-2" onPress={emailStore}>
                <FontAwesome name="envelope" size={20} color={Colors.primary} />
                <Text className="ml-2 text-sm">{store.email}</Text>
              </TouchableOpacity>
            </View> */}

            {/*  <TouchableOpacity
              className="flex-row items-center justify-center bg-secondary py-2 rounded-lg"
              onPress={openMapsApp}
            >
              <FontAwesome5 name="map-marker-alt" size={18} color="white" />
              <Text className="text-white font-bold ml-2">Ver ubicación en el mapa</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      )}

      {/* Date Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="calendar-month" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Fecha y Hora</Text>
        </View>

        <View className="flex-row justify-around py-2">
          <View className="flex-row items-center">
            <FontAwesome5 name="calendar-day" size={18} color={Colors.primary} />
            <Text className="ml-2 text-base font-medium">{moment(data.citaDate).format("DD/MM/YYYY")}</Text>
          </View>
          <View className="flex-row items-center">
            <FontAwesome5 name="clock" size={18} color={Colors.primary} />
            <Text className="ml-2 text-base font-medium">{moment(data.citaDate).format("hh:mm a")}</Text>
          </View>
        </View>
      </View>

      {/* Price Details */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4 shadow">
        <View className="flex-row items-center mb-2">
          <FontAwesome name="money" size={24} color={Colors.secondary} />
          <Text className="text-lg font-bold text-secondary ml-2">Precio</Text>
        </View>

        <View className="p-2">
            <>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Precio base</Text>
                <Text className="text-sm">${(Number(data.amountDolar) - Number(data.total_comission) - Number(data.total_ivaPrice)- Number(data.total_IGTF)).toFixed(2) }</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">IVA</Text>
                <Text className="text-sm">${Number(data.total_ivaPrice).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">IGTF</Text>
                <Text className="text-sm">${Number(data.total_IGTF).toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-600">Comisión</Text>
                <Text className="text-sm">${Number(data.total_comission).toFixed(2)}</Text>
              </View>
              <View className="h-[1px] bg-gray-300 my-2" />
              <View className="flex-row justify-between">
                <Text className="text-base font-bold">Total</Text>
                <Text className="text-base font-bold text-primary">
                  $
                  {Number(data.amountDolar).toFixed(2)}
                </Text>
              </View>
            </>
        </View>
      </View>

      {/* Action Buttons */}
      {status === "PENDIENTE" && (
        <View className="flex-row justify-between mx-4 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg flex-1 mx-1 bg-red-500"
            onPress={handleCancel}
            disabled={loading}
          >
            <FontAwesome name="times" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg flex-1 mx-1 bg-primary"
            onPress={handleConfirm}
            disabled={loading}
          >
            <FontAwesome name="check" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Confirmar</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "CONFIRMADA" && (
        <View className="flex-row justify-between mx-4 mb-5">
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg flex-1 mx-1 bg-red-500"
            onPress={handleCancel}
            disabled={loading}
          >
            <FontAwesome name="times" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-lg flex-1 mx-1 bg-green-500"
            onPress={handleConfirm}
            disabled={loading}
          >
            <FontAwesome name="check-circle" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Completar</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "COMPLETADA" && (
        <View className="mx-4 mb-5">
          <View className="flex-row items-center justify-center bg-green-50 p-4 rounded-lg w-full">
            <FontAwesome name="check-circle" size={20} color={Colors.primary} />
            <Text className="ml-2 text-primary font-medium">Esta cita ha sido completada exitosamente</Text>
          </View>
        </View>
      )}

      {status === "CANCELADA" && (
        <View className="mx-4 mb-5">
          <View className="flex-row items-center justify-center bg-red-50 p-4 rounded-lg w-full">
            <FontAwesome name="times-circle" size={20} color="#F44336" />
            <Text className="ml-2 text-red-500 font-medium">Esta cita ha sido cancelada</Text>
          </View>
        </View>
      )}

      {/* Spacer for bottom padding */}
      <View className="h-10" />
    </ScrollView>
  );
};

export default DateDetallesBusiness;

"use client";

import { Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../utils";
import type { Props } from "./CardReservationBusinessInterfaces";
import { font } from "../../../styles";
import moment from "moment";
import CacheImage from "../CacheImage/CacheImage";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import type { EstadoReservation, Stores } from "../../context/storeBusinessHooks/StoreBusinessInterface";
import { useEffect, useState } from "react";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { StyleSheet } from "react-native";
import { height } from "../../utils/Helpers";

const CardReservationBusiness = ({ data, tipoCita, onPress }: Props) => {
  const [store, setStore] = useState<Stores | undefined>();
  const { Stores } = useStoreBusiness();

  // Get status configuration based on reservation status
  const getStatusConfig = (status: EstadoReservation) => {
    switch (status) {
      case "CONFIRMADA":
        return {
          label: "CONFIRMADA",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: <Ionicons name="checkmark-circle" size={14} color="#22c55e" />,
        };
      case "CANCELADA":
        return {
          label: "CANCELADA",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: <Ionicons name="close-circle" size={14} color="#ef4444" />,
        };
      case "PENDIENTE":
        return {
          label: "PENDIENTE",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: <MaterialIcons name="pending" size={14} color="#eab308" />,
        };
      case "COMPLETADA":
        return {
          label: "COMPLETADA",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: <Ionicons name="checkmark-done-circle" size={14} color="#3b82f6" />,
        };
      default:
        return {
          label: "DESCONOCIDO",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: <FontAwesome5 name="question-circle" size={14} color="#6b7280" />,
        };
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    return moment(dateString).format("DD MMM YYYY • h:mm a");
  };

  useEffect(() => {
    const storeData = Stores.find((e) => e.id.toString() === data.storeId);
    setStore(storeData);
  }, [Stores]);

  const statusConfig = getStatusConfig(data.statusReservation);

  return (
    <TouchableOpacity
      style={styles.container}
      className="flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Remove the status badge from the image section */}
      <View style={styles.imageContainer}>
        <CacheImage source={data.urlBoxpackge} styleImage={styles.image} />
      </View>

      {/* Right side - Content */}
      <View style={styles.contentContainer}>
        {/* Store name */}
        <View style={styles.storeNameContainer}>
          <FontAwesome5 name="store" size={12} color={Colors.primary} style={styles.icon} />
          <Text style={[styles.storeName, font.Bold]} numberOfLines={1}>
            {store?.name || "Tienda"}
          </Text>
        </View>

        {/* Package name */}
        <Text style={[styles.packageName, font.Regular]} numberOfLines={1}>
          {data.packageName}
        </Text>

      
        {/* Bottom info section */}
        <View style={styles.bottomContainer}>
          {/* Date and time */}
          <View style={styles.dateContainer}>
            <FontAwesome5 name="calendar-alt" size={11} color={Colors.primary} style={styles.icon} />
            <Text style={[styles.dateText, font.Regular]} numberOfLines={1}>
              {formatDate(data.citaDate)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            {/* Reservation ID */}
           {/*  <View style={styles.idContainer}>
              <FontAwesome5 name="hashtag" size={9} color={"black"} style={styles.icon} />
              <Text style={[styles.idText, font.Regular]}>{data.citaId.substring(0, 8)}</Text>
            </View> */}

            {/* Status badge - Now positioned at bottom right */}
            <View className={`${statusConfig.bgColor} px-2 py-1 rounded-full flex-row items-center`}>
              {statusConfig.icon}
              <Text className={`text-xs font-bold ml-1 ${statusConfig.textColor}`}>{statusConfig.label}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

{
  /* Update the styles to accommodate the new layout */
}
const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: height * 0.15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    minHeight: 130,
    marginBottom: 10,
    position: "relative",
    borderColor: Colors.primary,
    paddingRight: 43,
    borderWidth: 2,
    borderRadius: 16,
  },
  imageContainer: {
    width: "45%",
    height: "100%",
    position: "relative",
    padding:8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius:8
  },
  contentContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  storeNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  storeName: {
    fontSize: 15,
    color: Colors.secondary,
  },
  packageName: {
    fontSize: 13,
    color: Colors.blackBackground,
    marginBottom: 4,
  },
  customersContainer: {
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  customerText: {
    fontSize: 11,
  },
  customerName: {
    color: Colors.secondary,
  },
  bottomContainer: {
    marginTop: "auto",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    gap:8
  },
  idContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  idText: {
    fontSize: 10,
  },
  icon: {
    marginRight: 4,
  },
});

export default CardReservationBusiness;

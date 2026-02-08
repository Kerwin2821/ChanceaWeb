import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../utils";
import type { Props } from "./CardRegaloBusinessInterfaces";
import { font } from "../../../styles";
import moment from "moment";
import CacheImage from "../CacheImage/CacheImage";
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { height } from "../../utils/Helpers";

const CardRegaloBusiness = ({ data, onPress }: Props) => {
  return (
    <TouchableOpacity
      style={styles.container}
      className="flex-row bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Left side - Image */}
      <View style={styles.imageContainer}>
        <CacheImage source={data.boxPackage.imagenUrl} styleImage={styles.image} />
      </View>

      {/* Right side - Content */}
      <View style={styles.contentContainer}>
        {/* Package name */}
        <View style={styles.packageNameContainer}>
          <FontAwesome5 name="gift" size={12} color={Colors.primary} style={styles.icon} />
          <Text style={[styles.packageName, font.Bold]} numberOfLines={1}>
            {data.boxPackage.nombre}
          </Text>
        </View>

        {/* Store name */}
        <View style={styles.storeContainer}>
          <FontAwesome5 name="store" size={12} color={Colors.secondary} style={styles.icon} />
          <Text style={[styles.storeText, font.Regular]} numberOfLines={1}>
            {data.storeBusiness.name}
          </Text>
        </View>

        {/* Customer info */}
        {/* {data.customerSource && (
          <View style={styles.customerContainer}>
            <FontAwesome5 name="user" size={10} color={Colors.secondary} style={styles.icon} />
            <Text style={[styles.customerText, font.Regular]} numberOfLines={1}>
              De: <Text style={styles.customerName}>{data.customerSource.firstName || "Cliente"}</Text>
            </Text>
          </View>
        )} */}

        {data.customerDestination && (
          <View style={styles.customerContainer}>
            <FontAwesome5 name="user" size={10} color={Colors.secondary} style={styles.icon} />
            <Text style={[styles.customerText, font.Regular]} numberOfLines={1}>
              Para: <Text style={styles.customerName}>{data.customerDestination.firstName || "Cliente"}</Text>
            </Text>
          </View>
        )}

        {/* Bottom row with date and status */}
        <View style={styles.bottomRow}>
          {/* Date if available */}
          {data.creationDate && (
            <View style={styles.dateContainer}>
              <FontAwesome5 name="calendar-alt" size={10} color={Colors.primary} style={styles.icon} />
              <Text style={[styles.dateText, font.Regular]}>{moment(data.creationDate).format("DD/MM/YY")}</Text>
            </View>
          )}

        </View>
          {/* Status badge - positioned at bottom right */}
          {renderEstado(data.statusGif)}
      </View>
    </TouchableOpacity>
  );
};

const renderEstado = (estado: string) => {
  switch (estado) {
    case "ENVIADO":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#9C27B0" }]}>
          <FontAwesome5 name="paper-plane" size={12} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Enviado</Text>
        </View>
      )
    case "PAGADO":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#4CAF50" }]}>
          <FontAwesome5 name="check-circle" size={12} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Pendiente</Text>
        </View>
      )
    case "ENTREGADO":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#009688" }]}>
          <MaterialIcons name="delivery-dining" size={14} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Entregado</Text>
        </View>
      )
    case "POR_PAGAR":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#FF9800", width: 130 }]}>
          <FontAwesome5 name="money-bill-wave" size={12} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Pendiente de Pago</Text>
        </View>
      )
    case "CANCELADO":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#F44336" }]}>
          <Ionicons name="close-circle" size={14} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Cancelado</Text>
        </View>
      )
    case "EN_PROCESO":
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#2196F3" }]}>
          <MaterialCommunityIcons name="progress-clock" size={14} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>En Proceso</Text>
        </View>
      )
    default:
      return (
        <View style={[styles.statusBadge, { backgroundColor: "#757575" }]}>
          <FontAwesome name="question-circle" size={12} color="#FFFFFF" style={styles.statusIcon} />
          <Text style={[styles.statusText, font.Bold]}>Desconocido</Text>
        </View>
      )
  }
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
    paddingRight: 16,
    borderWidth: 2,
    borderRadius: 16,
  },
  imageContainer: {
    width: "40%",
    height: "100%",
    position: "relative",
    padding: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  packageNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  packageName: {
    fontSize: 15,
    color: Colors.secondary,
  },
  storeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  storeText: {
    fontSize: 13,
    color: Colors.blackBackground,
  },
  customerContainer: {
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
    width: 100,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
  },
  icon: {
    marginRight: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
});

export default CardRegaloBusiness;

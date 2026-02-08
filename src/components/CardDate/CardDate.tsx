import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../utils";
import { Props } from "./CardDateInterfaces";
import { Image } from "expo-image";
import { AntDesign } from "@expo/vector-icons";
import { Images } from "../../../assets/img";
import { useChat } from "../../context/ChatContext/ChatProvider";
import { useEffect, useState } from "react";
import db from "@react-native-firebase/database";
import { styles } from "./CardDateResources";
import { font } from "../../../styles";
import moment from "moment";
import { Estado } from "../../utils/Date.interface";
import CacheImage from "../CacheImage/CacheImage";

const CardDate = ({ data, onPress, tipoCita }: Props) => {

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress && onPress()}
    >
      <View style={styles.containerPhoto}>
        <CacheImage
          source={(data.boxPackage as any).imagenUrl}
          styleImage={{
            width: "100%",
            height: "100%",
          }}
        />
        <View style={styles.containerAvatar}>
          <CacheImage
            source={{ uri: (tipoCita === "RECIBIDA" ? (data.customerSource as any) : (data.customerDestination as any)).customerProfiles?.[0]?.link }}
            styleImage={{
              width: "100%",
              height: "100%",
            }}
          />
        </View>
      </View>

      <View style={styles.contentInfo}>
        <Text style={[font.Bold, { fontSize: 15, color: Colors.grayDark }]} numberOfLines={1}>
          {tipoCita === "RECIBIDA" ? (
            `${data.customerSource.firstName.split(" ")[0]} te invitó`
          ) : (
            `Invitaste a ${data.customerDestination.firstName.split(" ")[0]}`
          )}
        </Text>

        <Text style={[font.Regular, { fontSize: 13, color: Colors.gray, marginTop: 2 }]} numberOfLines={1}>
          Lugar: {(data.boxPackage as any).storeBusiness?.name || (data.boxPackage as any).business?.name}
        </Text>

        <Text style={[font.Regular, { fontSize: 12, color: Colors.gray, marginTop: 2 }]}>
          Fecha: <Text style={font.Bold}>{moment(data.dateTimeInvitation).format("DD/MM/YY hh:mm a")}</Text>
        </Text>

        {renderEstado(data.statusInvitation)}
      </View>
    </TouchableOpacity>
  );
};

export default CardDate;

const renderEstado = (estado: Estado) => {
  let bgColor = Colors.gray;
  let displayText = "";

  switch (estado) {
    case "ENVIADA":
      bgColor = "#FFD700"; // Gold/Yellow
      displayText = "Pendiente";
      break;
    case "ACEPTADA":
      bgColor = Colors.green;
      displayText = "Aceptada";
      break;
    case "FINALIZADA":
      bgColor = "#E67E22"; // Orange
      displayText = "Finalizada";
      break;
    case "PENDIENTE_DE_PAGO":
      bgColor = Colors.blue;
      displayText = "Pendiente de Pago";
      break;
    case "RECHAZADA":
      bgColor = "#95A5A6"; // Gray
      displayText = "Rechazada";
      break;
    case "VENCIDA":
      bgColor = Colors.grayDark;
      displayText = "Vencida";
      break;
    case "CANCELADA":
      bgColor = Colors.danger;
      displayText = "Cancelada";
      break;
    case "EN_PROCESO":
      bgColor = Colors.secondary;
      displayText = "En Proceso";
      break;
    default:
      return null;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <Text style={[font.Bold, styles.statusTextBadge]}>
        {displayText}
      </Text>
    </View>
  );
};

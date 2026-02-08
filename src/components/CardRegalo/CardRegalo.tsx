import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { Colors } from "../../utils";
import { Props } from "./CardRegaloInterfaces";
import { styles } from "./CardRegaloResources";
import { font } from "../../../styles";
import { Estado } from "../../utils/Regalos.interface";
import CacheImage from "../CacheImage/CacheImage";

const CardRegalo = ({ data, onPress, tipoRegalo }: Props) => {
  const avatarLink = tipoRegalo === "RECIBIDA"
    ? data.customerSource.customerProfiles?.[0]?.link
    : data.customerDestination.customerProfiles?.[0]?.link;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.container}
      onPress={() => onPress && onPress()}
    >
      <View style={styles.containerPhoto}>
        <CacheImage
          source={data.boxPackage.imagenUrl}
          styleImage={{ width: "100%", height: "100%" }}
        />
        <View style={styles.containerAvatar}>
          <CacheImage
            source={avatarLink}
            styleImage={{ width: "100%", height: "100%" }}
          />
        </View>
      </View>

      <View style={styles.contentInfo}>
        <Text numberOfLines={1} style={[font.Bold, { fontSize: 16, color: Colors.grayDark }]}>
          {tipoRegalo === "RECIBIDA"
            ? `${data.customerSource?.firstName?.split(" ")[0] || "Alguien"} te brindó`
            : `Brindaste a ${data.customerDestination?.firstName?.split(" ")[0] || "alguien"}`}
        </Text>

        <Text numberOfLines={1} style={[font.Regular, { fontSize: 13, color: '#6B7280', marginTop: 2 }]}>
          {data.boxPackage.nombre}
        </Text>

        <Text numberOfLines={1} style={[font.Regular, { fontSize: 13, color: Colors.gray, marginTop: 2 }]}>
          Lugar: {data.storeBusiness.name}
        </Text>

        {renderEstado(data.statusGif)}
      </View>
    </TouchableOpacity>
  );
};

export default CardRegalo;

const renderEstado = (estado: string) => {
  let bgColor = "#F3F4F6";
  let text = estado;
  let textColor = "#374151";

  switch (estado) {
    case "ENVIADO":
    case "PAGADO":
      bgColor = "#FEF3C7"; // Soft Yellow
      textColor = "#92400E";
      text = "Pendiente";
      break;
    case "ENTREGADO":
      bgColor = "#D1FAE5"; // Soft Green
      textColor = "#065F46";
      text = "Entregado";
      break;
    case "POR_PAGAR":
      bgColor = "#DBEAFE"; // Soft Blue
      textColor = "#1E40AF";
      text = "Por pagar";
      break;
    case "CANCELADO":
      bgColor = "#FEE2E2"; // Soft Red
      textColor = "#991B1B";
      text = "Cancelado";
      break;
    case "EN_PROCESO":
      bgColor = "#F3E8FF"; // Soft Purple
      textColor = "#6B21A8";
      text = "En proceso";
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
      <Text style={[font.Bold, styles.statusText, { color: textColor }]}>
        {text}
      </Text>
    </View>
  );
};

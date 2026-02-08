import { TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { styles } from "./CallButtonResources"


const CallButton = ({
  recipientId,
  recipientName,
  hasVideo = true,
  size = "medium",
  color = "#0084ff",
  style,
}: CallButtonProps) => {
  const navigation = useNavigation()

  const handlePress = () => {
    navigation.navigate("Call", {
      recipientId,
      recipientName,
      hasVideo,
      isIncoming: false,
    })
  }

  // Determinar tamaño del botón
  const getSize = () => {
    switch (size) {
      case "small":
        return { button: 40, icon: 18 }
      case "large":
        return { button: 60, icon: 28 }
      default:
        return { button: 50, icon: 24 }
    }
  }

  const buttonSize = getSize()

  return (
    <TouchableOpacity
      style={[styles.button, { width: buttonSize.button, height: buttonSize.button, backgroundColor: color }, style]}
      onPress={handlePress}
    >
      <Ionicons name={hasVideo ? "videocam" : "call"} size={buttonSize.icon} color="white" />
    </TouchableOpacity>
  )
}



export default CallButton

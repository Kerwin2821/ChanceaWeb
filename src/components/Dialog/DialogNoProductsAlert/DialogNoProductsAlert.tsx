import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native"
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { Colors } from "../../../utils"
import { font } from "../../../../styles"
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"

interface DialogNoProductsAlertProps {
  active: boolean
  setActive: (active: boolean) => void
  onCreateProduct: () => void
}

const DialogNoProductsAlert = ({ active, setActive, onCreateProduct }: DialogNoProductsAlertProps) => {
  const navigation = useNavigation<NavigationScreenNavigationType>()

  return (
    <Modal visible={active} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <FontAwesome5 name="box-open" size={40} color={Colors.primary} />
          </View>

          {/* Title */}
          <Text style={[styles.title, font.Bold]}>Necesitas productos</Text>

          {/* Message */}
          <Text style={[styles.message, font.Regular]}>
            Para crear un paquete, primero debes tener al menos un producto en tu catálogo. Los paquetes se componen de
            productos que ya has creado.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setActive(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonTextSecondary, font.Regular]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                setActive(false)
                onCreateProduct()
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="puzzle-plus" size={18} color="white" style={styles.buttonIcon} />
              <Text style={[styles.buttonTextPrimary, font.Regular]}>Crear Producto</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: Colors.secondary,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: "#f3f4f6",
  },
  buttonTextPrimary: {
    color: "white",
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: "#4b5563",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
})

export default DialogNoProductsAlert

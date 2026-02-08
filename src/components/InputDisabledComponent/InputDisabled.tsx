import type React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Colors } from "../../utils"

interface InputDisabledProps {
  labelText: string
  value?: string
  icon?: React.ReactNode
}

const InputDisabled = ({ labelText, value, icon }: InputDisabledProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{labelText}</Text>
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.value}>{value || "No disponible"}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: "SemiBold",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 8,
  },
  value: {
    color: Colors.black,
    fontSize: 14,
    fontFamily: "Regular",
    flex: 1,
  },
})

export default InputDisabled
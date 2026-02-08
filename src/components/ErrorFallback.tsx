import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Updates from "expo-updates"

const ErrorFallback = ({ error, resetError }:{error:any,resetError:any}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Oops! Algo salió mal.</Text>
    <Text style={styles.errorMessage}>{error.toString()}</Text>
    <TouchableOpacity style={styles.button} onPress={resetError}>
      <Text style={styles.buttonText}>Intentar de nuevo</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={async () => await Updates.reloadAsync()}>
      <Text style={styles.buttonText}>Reiniciar aplicación</Text>
    </TouchableOpacity>
  </View>
);

export default ErrorFallback

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8d7da",
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#721c24",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#721c24",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#721c24",
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

"use client"

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, BackHandler, Vibration } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation, useRoute } from "@react-navigation/native"
import InCallManager from "react-native-incall-manager"
import { useCall } from "../../context/CallContext/CallContext"

type IncomingCallParams = {
  callId: string
  callerName: string
  callerAvatar?: string
  hasVideo: boolean
}

const VIBRATION_PATTERN = [1000, 2000, 1000]

const IncomingCallScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { callId, callerName, callerAvatar, hasVideo } = route.params as IncomingCallParams
  const { answerCall, rejectCall } = useCall()

  const [callTimer, setCallTimer] = useState(0)

  // Configurar manejo de botón de retroceso en Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      // Evitar que el botón de retroceso cierre la pantalla de llamada entrante
      return true
    })

    return () => backHandler.remove()
  }, [])

  // Iniciar vibración y sonido de llamada
  useEffect(() => {
    // Iniciar vibración
    Vibration.vibrate(VIBRATION_PATTERN, true)

    // Temporizador para la llamada (30 segundos)
    const timer = setInterval(() => {
      setCallTimer((prev) => {
        if (prev >= 30) {
          handleRejectCall()
          return prev
        }
        return prev + 1
      })
    }, 1000)

    return () => {
      // Limpiar recursos
      Vibration.cancel()
      InCallManager.stopRingtone()
      clearInterval(timer)
    }
  }, [])

  // Manejar respuesta a llamada
  const handleAnswerCall = async () => {
    try {
      // Detener vibración y sonido
      Vibration.cancel()

      // Navegar a la pantalla de llamada
      navigation.navigate("Call", {
        callId,
        recipientName: callerName,
        isIncoming: true,
        hasVideo,
      })
    } catch (error) {
      console.error("Error al responder llamada:", error)
    }
  }

  // Manejar rechazo de llamada
  const handleRejectCall = async () => {
    try {
      // Detener vibración y sonido
      Vibration.cancel()

      // Rechazar llamada
      await rejectCall(callId)

      // Volver a la pantalla anterior
      navigation.goBack()
    } catch (error) {
      console.error("Error al rechazar llamada:", error)
      navigation.goBack()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.callerInfoContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{callerName.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callTypeText}>{hasVideo ? "Videollamada entrante" : "Llamada entrante"}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleRejectCall}>
          <Ionicons name="call" size={30} color="white" style={styles.rejectIcon} />
          <Text style={styles.actionText}>Rechazar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.answerButton]} onPress={handleAnswerCall}>
          <Ionicons name="call" size={30} color="white" />
          <Text style={styles.actionText}>Contestar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    justifyContent: "space-between",
  },
  callerInfoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 60,
    color: "white",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  callTypeText: {
    fontSize: 18,
    color: "#ccc",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 50,
    width: "100%",
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#ff3b30",
  },
  answerButton: {
    backgroundColor: "#4cd964",
  },
  rejectIcon: {
    transform: [{ rotate: "135deg" }],
  },
  actionText: {
    color: "white",
    marginTop: 8,
    fontSize: 14,
  },
})

export default IncomingCallScreen

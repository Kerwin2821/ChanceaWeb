"use client"
import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { View, Text, TouchableOpacity, Image, Dimensions, StatusBar, Animated, Platform, Vibration } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useCall } from "../../context/CallContext/CallProvider"
import { useNavigation, useRoute } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "../../utils"
import type { UserData } from "../../context/AuthContext/AuthInterface"
import { useChat } from "../../context/ChatContext/ChatProvider"
import CacheImage from "../../components/CacheImage/CacheImage"

const { width, height } = Dimensions.get("window")

// Generar posiciones aleatorias una sola vez fuera del componente
const backgroundElements = Array(6)
  .fill(0)
  .map((_, i) => ({
    width: 100 + i * 20,
    height: 100 + i * 20,
    top: Math.random() * height,
    left: Math.random() * width,
  }))

const OutgoingCallScreen = () => {
  const { currentCall, cancelCall, onCallStatusChange, requestPermissions } = useCall()
  const { sendMessage } = useChat()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const route = useRoute()
  const data = route.params as {
    userToCall: UserData
    chatId: string
  }

  // State management
  const [callDuration, setCallDuration] = useState(0)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [callStatus, setCallStatus] = useState("Llamando...")

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current
  const rippleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoCancelTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Memoize user data to prevent re-renders
  const userToCall = useMemo(() => data?.userToCall, [data?.userToCall])
  const userAvatar = useMemo(() => userToCall?.customerProfiles?.[0]?.link, [userToCall])
  const userName = useMemo(() => userToCall?.firstName || "Usuario", [userToCall])

  const startAnimations = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ]),
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(rippleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(rippleAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
    ).start()
    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 8000, useNativeDriver: true })).start()
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim, rippleAnim, rotateAnim])

  const startRingbackTone = async () => {
    if (sound) {
      console.log("Ringback tone is already active or loading.")
      await sound.unloadAsync().catch((e) => console.warn("Error unloading sound:", e))
      return
    }
    console.log("Attempting to start ringback tone...")
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
      const { sound: newSound } = await Audio.Sound.createAsync(require("../../../assets/sound/ringback.mp3"), {
        shouldPlay: true,
        isLooping: true,
        volume: 0.5,
      })
      setSound(newSound)
      console.log("Ringback tone started successfully.")
    } catch (error) {
      console.error("Error starting ringback tone:", error)
    }
  }

  const stopRingbackTone = async () => {
    if (sound) {
      console.log("Stopping ringback tone.")
      /* await sound.stopAsync().catch((e) => console.warn("Error stopping sound:", e)) */
      await sound.unloadAsync().catch((e) => console.warn("Error unloading sound:", e))
      setSound(null)
    }
  }

  const startCallTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000)
  }, [])

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }, [])

  const clearAutoCancelCallTimer = useCallback(() => {
    if (autoCancelTimerRef.current) {
      console.log("Clearing auto-cancel timer ID:", autoCancelTimerRef.current)
      clearTimeout(autoCancelTimerRef.current)
      autoCancelTimerRef.current = null
    }
  }, [])

  const handleEndCall = async () => {
    clearAutoCancelCallTimer() // Ensure timer is cleared if call ends for any reason.
    await stopRingbackTone()
    const callToActuallyEnd = currentCall
    await sendMessage(data.userToCall, data.chatId, "Llamada perdida", "offline")

    if (!callToActuallyEnd) {
      console.warn("handleEndCall invoked but no currentCall found.")
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
      return
    }
    try {
      console.log(`handleEndCall: Attempting to cancel call ${callToActuallyEnd.callId}`)
      await cancelCall(callToActuallyEnd.callId)
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    } catch (error) {
      console.error("Error in handleEndCall:", error)
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    }
  }

  const startAutoCancelCallTimer = useCallback(() => {
    clearAutoCancelCallTimer()
    console.log("Starting auto-cancel timer (30s)")
    autoCancelTimerRef.current = setTimeout(async () => {
      console.log("Auto-cancel timer fired. Call presumed not answered.")

      // Attempt to set call status, but don't let it block call termination.
      try {
        setCallStatus("Llamada no contestada")
      } catch (statusError) {
        console.error("Error setting call status to 'Llamada no contestada' on auto-cancel:", statusError)
      }

      // Proceed to handle the end of the call.
      try {
        await handleEndCall() // This function should contain the core logic for ending the call.
      } catch (endCallError) {
        // This catches errors if handleEndCall itself throws an unhandled exception.
        console.error("Error during handleEndCall execution from auto-cancel timer:", endCallError)
        // Depending on requirements, a more direct cleanup/cancellation might be attempted here
        // if handleEndCall is unreliable, but per "no other changes", we rely on handleEndCall.
      }
    }, 30000)
  }, [clearAutoCancelCallTimer, handleEndCall]) // Dependencies are correct

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Llamando...":
        return "#FF6B35"
      case "Conectando...":
        return "#4ECDC4"
      case "Llamada rechazada":
        return "#FF4757"
      case "Llamada no contestada":
        return "#FF4757" // Added for consistency
      case "Llamada finalizada":
        return Colors.secondary // Or a neutral color
      default:
        return "#FF6B35"
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "Llamando...":
        return "phone-in-talk"
      case "Conectando...":
        return "sync"
      case "Llamada rechazada":
        return "phone-missed"
      case "Llamada no contestada":
        return "phone-missed" // Added for consistency
      case "Llamada finalizada":
        return "call-end" // Added for consistency
      default:
        return "phone-in-talk"
    }
  }, [])

  // Call status listener effect
  useEffect(() => {
    startAnimations()
    startCallTimer()

    const unsubscribe = onCallStatusChange(async (status, callData) => {
      console.log(`Call status changed to: ${status}`, callData)

      switch (status) {
        case "calling":
          setCallStatus("Llamando...")
          Vibration.vibrate([100, 200, 100])
          await startRingbackTone()
          startAutoCancelCallTimer() // Start the timer
          break
        case "connected":
          setCallStatus("Conectando...")
          await stopRingbackTone()
          clearAutoCancelCallTimer() // CRITICAL: Clear the timer
          console.log("Call connected, Jitsi URL:", callData?.jitsiUrl)
          if (currentCall && callData?.jitsiUrl) {
            navigation.navigate("CallScreen", {
              roomName: currentCall.roomName,
              userName: currentCall.fromName,
              jitsiServer: callData.jitsiUrl,
              callId: currentCall.callId,
            })
          } else {
            console.error("Cannot navigate to CallScreen: missing currentCall or jitsiUrl. CallData:", callData)
            await handleEndCall() // End call if critical data is missing
          }
          break
        case "rejected":
          setCallStatus("Llamada rechazada")
          Vibration.vibrate([200, 100, 200])
          await stopRingbackTone()
          clearAutoCancelCallTimer() // Clear the timer
          setTimeout(() => {
            if (navigation.canGoBack()) navigation.goBack()
          }, 2000)
          break
        case "missed":
          setCallStatus("Llamada no contestada")
          await stopRingbackTone()
          clearAutoCancelCallTimer() // Clear the timer
          setTimeout(() => {
            if (navigation.isFocused() && navigation.canGoBack()) navigation.goBack()
          }, 2000)
          break
        case "ended":
          setCallStatus("Llamada finalizada")
          await stopRingbackTone()
          clearAutoCancelCallTimer() // Clear the timer
          if (navigation.canGoBack()) {
            navigation.goBack()
          }
          break
        default:
          console.warn("Unhandled call status received:", status)
          clearAutoCancelCallTimer() // Safeguard for unhandled states
      }
    })

    // Initial state check when component mounts or currentCall changes
    if (currentCall && currentCall.status === "calling") {
    } else if (currentCall && currentCall.status !== "calling") {
      // If the call is already in a non-calling state (e.g. connected, ended) when component mounts
      console.log(`useEffect initial check: currentCall.status is '${currentCall.status}'. Ensuring timer is cleared.`)
      clearAutoCancelCallTimer()
      if (currentCall.status !== "connected") {
        // Ringback should be stopped unless connected
        stopRingbackTone()
      }
    }

    return () => {
      console.log("OutgoingCallScreen: useEffect cleanup running.")
      stopRingbackTone()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      clearAutoCancelCallTimer() // CRUCIAL: Ensure timer is cleared on unmount
      unsubscribe()
    }
  }, [
    currentCall, // Primary dependency for call state
    sound
  ])

  const spin = useMemo(
    () => rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }),
    [rotateAnim],
  )
  const rippleScale = useMemo(() => rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }), [rippleAnim])
  const rippleOpacity = useMemo(
    () => rippleAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.8, 0.3, 0] }),
    [rippleAnim],
  )

  if (!userToCall) {
    // Optional: Navigate back or show error if userToCall is missing
    // useEffect(() => { if (!userToCall && navigation.canGoBack()) navigation.goBack(); }, [userToCall, navigation]);
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error: No se encontró información del usuario a llamar.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        {/* Animated Background Elements */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          {backgroundElements.map((element, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                width: element.width,
                height: element.height,
                borderRadius: element.width / 2,
                backgroundColor: Colors.primary,
                opacity: 0.4,
                top: element.top,
                left: element.left,
                transform: [{ rotate: spin }, { scale: pulseAnim }],
              }}
            />
          ))}
        </View>

        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight || 20,
              marginBottom: 40,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
            </TouchableOpacity>

            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                  color: Colors.secondary,
                }}
              >
                Videollamada
              </Text>
            </View>

            <View style={{ width: 44 }} />
          </View>

          {/* Recipient Info */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 40,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 40,
              }}
            >
              {[...Array(3)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={{
                    position: "absolute",
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.3)",
                    transform: [{ scale: rippleScale }],
                    opacity: rippleOpacity,
                  }}
                />
              ))}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                {userAvatar ? (
                  <CacheImage
                    source={{ uri: userAvatar }}
                    styleImage={{
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      borderWidth: 4,
                      borderColor: "#fff",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 90,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 4,
                      borderColor: Colors.secondary,
                    }}
                  >
                    <Ionicons name="person" size={80} color={Colors.secondary} />
                  </View>
                )}
                <View
                  style={{
                    position: "absolute",
                    bottom: 15,
                    right: 15,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 5,
                  }}
                >
                  <MaterialIcons name={getStatusIcon(callStatus)} size={18} color={getStatusColor(callStatus)} />
                </View>
              </Animated.View>
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                marginBottom: 12,
                textAlign: "center",
                textShadowColor: "rgba(0,0,0,0.3)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
                color: Colors.secondary,
              }}
            >
              {userName}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MaterialIcons
                name={getStatusIcon(callStatus)}
                size={20}
                color={getStatusColor(callStatus)}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 18,
                  opacity: 0.9,
                  fontWeight: "500",
                  color: Colors.secondary,
                }}
              >
                {callStatus}
              </Text>
            </View>
            {callDuration > 0 && (
              <Text
                style={{
                  fontSize: 16,
                  opacity: 0.7,
                  marginBottom: 12,
                  fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                  color: Colors.secondary,
                }}
              >
                {formatDuration(callDuration)}
              </Text>
            )}
          </View>

          {/* End Call Button */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 40,
            }}
          >
            <TouchableOpacity
              onPress={handleEndCall}
              activeOpacity={0.8}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FF4757",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#FF4757",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
                transform: [{ rotate: "135deg" }],
              }}
            >
              <Ionicons name="call" size={36} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View
            style={{
              alignItems: "center",
              paddingBottom: 30,
            }}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  opacity: 0.8,
                  textAlign: "center",
                  color: Colors.secondary,
                }}
              >
                {callStatus === "Conectando..." ? "Preparando sala de reunión..." : "Preparando video..."}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

export default OutgoingCallScreen

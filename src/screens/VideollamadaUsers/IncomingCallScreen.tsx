import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  ActivityIndicator,
  BackHandler,
} from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useCall } from "../../context/CallContext/CallProvider"
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { SafeAreaView } from "react-native-safe-area-context"
import { Colors } from "../../utils"
import type { CallData } from "../../context/CallContext/CallInterface"
import CacheImage from "../../components/CacheImage/CacheImage"

const { width, height } = Dimensions.get("window")

const backgroundElements = Array(6)
  .fill(0)
  .map((_, i) => ({
    width: 100 + i * 20,
    height: 100 + i * 20,
    top: Math.random() * height,
    left: Math.random() * width,
  }))

const log = (message: string) => {
  console.log(`IncomingCallScreen: ${message}`)
}

const IncomingCallScreen = () => {
  const {
    incomingCall: currentIncomingCallDetails,
    incomingCall,
    rejectCall,
    answerCall,
  } = useCall()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const route = useRoute()
  const routeParamsData = route.params as { data: CallData }

  const [callStatus, setCallStatus] = useState("Llamada entrante...")
  const [isAccepting, setIsAccepting] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [ringtoneSound, setRingtoneSound] = useState<Audio.Sound | null>(null)

  const pulseAnim = useRef(new Animated.Value(1)).current
  const rippleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current
  const acceptBtnAnim = useRef(new Animated.Value(1)).current
  const rejectBtnAnim = useRef(new Animated.Value(1)).current

  const callActionInProgress = useRef(false)
  const isRingtonePlayingRef = useRef(false)
  const isStoppingRingtoneRef = useRef(false)

  const stopRingtone = useCallback(async () => {
    await ringtoneSound.unloadAsync();
    // if (isStoppingRingtoneRef.current) {
    //   log("stopRingtone: Already stopping. Aborting.");
    //   return;
    // }
    // if (!ringtoneSound || !isRingtonePlayingRef.current) {
    //   log("stopRingtone: No active ringtone object or not marked as playing. Cleaning up if needed.");
    //   if (ringtoneSound && !isRingtonePlayingRef.current) {
    //     try {
    //         log("stopRingtone: Unloading a sound object that wasn't marked as playing (orphaned).");
    //         await ringtoneSound.unloadAsync();
    //     } catch (e) {
    //         console.warn("stopRingtone: Error unloading orphaned sound:", e);
    //     }
    //     setRingtoneSound(null);
    //   }
    //   isRingtonePlayingRef.current = false;
    //   return;
    // }

    // isStoppingRingtoneRef.current = true;
    // log("stopRingtone: Attempting to stop and unload active ringtone...");

    // try {
    //   const soundObject = ringtoneSound;
    //   const status = await soundObject.getStatusAsync();

    //   if (status.isLoaded && status.isPlaying) {
    //     log("stopRingtone: Sound is playing, calling stopAsync().");
    //     await soundObject.stopAsync();
    //     log("stopRingtone: stopAsync() completed.");
    //   } else if (status.isLoaded) {
    //     log("stopRingtone: Sound was loaded but not playing.");
    //   } else {
    //     log("stopRingtone: Sound was not loaded.");
    //   }

    //   if (status.isLoaded) {
    //     log("stopRingtone: Calling unloadAsync().");
    //     await soundObject.unloadAsync();
    //     log("stopRingtone: unloadAsync() completed.");
    //   }
      
    //   log("stopRingtone: Successfully stopped and unloaded.");
    // } catch (error) {
    //   console.error("stopRingtone: Error during stop/unload:", error);
    // } finally {
    //   setRingtoneSound(null);
    //   isRingtonePlayingRef.current = false;
    //   isStoppingRingtoneRef.current = false;
    //   log("stopRingtone: Finalized. isRingtonePlayingRef=false, isStoppingRingtoneRef=false, ringtoneSound=null.");
    // }
  }, [ringtoneSound]);

  const startRingtone = useCallback(async () => {
    if (isRingtonePlayingRef.current) {
      log("startRingtone: Already marked as playing. Aborting.");
      return;
    }
    if (ringtoneSound) {
       log("startRingtone: ringtoneSound object already exists. Aborting to prevent duplicates.");
       return;
    }
    if (callActionInProgress.current) {
      log("startRingtone: Call action in progress. Aborting.");
      return;
    }
    if (isStoppingRingtoneRef.current) {
      log("startRingtone: Stop action in progress. Aborting.");
      return;
    }

    log("startRingtone: Attempting to load and play ringtone...");
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/sound/chanceaRingtone.mp3"),
        { shouldPlay: true, isLooping: true, volume: 1 },
      );
      setRingtoneSound(sound);
      isRingtonePlayingRef.current = true;
      log("startRingtone: Successfully loaded and playing. isRingtonePlayingRef=true.");
    } catch (error) {
      console.error("startRingtone: Error:", error);
      setRingtoneSound(null);
      isRingtonePlayingRef.current = false;
    }
  }, [ringtoneSound]);

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
    Animated.loop(
      Animated.sequence([
        Animated.timing(acceptBtnAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(acceptBtnAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start()
    Animated.loop(
      Animated.sequence([
        Animated.timing(rejectBtnAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true, delay: 500 }),
        Animated.timing(rejectBtnAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
    ).start()
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim, rippleAnim, rotateAnim, acceptBtnAnim, rejectBtnAnim])

  const handleAcceptCall = async () => {
    if (callActionInProgress.current || !routeParamsData?.data?.callId) {
      log("handleAcceptCall: Action already in progress or no callId. Aborting.");
      return
    }
    callActionInProgress.current = true
    setIsAccepting(true)
    setCallStatus("Conectando...")
    /* Vibration.vibrate(100) */
    log("handleAcceptCall: Call action started. Stopping ringtone...")
    await stopRingtone()
    log("handleAcceptCall: stopRingtone() awaited. Proceeding to answer call.")

    try {
      await answerCall(routeParamsData.data.callId)
      log("handleAcceptCall: answerCall() successful. Navigating to CallScreen.")
      navigation.navigate("CallScreen", {
        roomName: routeParamsData.data.roomName,
        userName: routeParamsData.data.fromName,
        jitsiServer: routeParamsData.data.jitsiUrl,
        callId: routeParamsData.data.callId,
      })
    } catch (error) {
      console.error("handleAcceptCall: Error answering call:", error)
      setCallStatus("Error al conectar")
      setIsAccepting(false)
      callActionInProgress.current = false
      log("handleAcceptCall: Error occurred. callActionInProgress=false.")
    }
  }

  const handleRejectCall = async () => {
    if (callActionInProgress.current || !routeParamsData?.data?.callId) {
      log("handleRejectCall: Action already in progress or no callId. Aborting.");
      return
    }
    callActionInProgress.current = true
    setIsRejecting(true)
    setCallStatus("Rechazando llamada...")
    /* Vibration.vibrate([50, 50, 50]) */
    log("handleRejectCall: Call action started. Stopping ringtone...")
    await stopRingtone()
    log("handleRejectCall: stopRingtone() awaited. Proceeding to reject call.")

    try {
      await rejectCall(routeParamsData.data.callId)
      log("handleRejectCall: rejectCall() successful. Navigation back should be handled by context/effects.")
    } catch (error) {
      console.error("handleRejectCall: Error rejecting call:", error)
      setCallStatus("Error al rechazar")
      setIsRejecting(false)
      callActionInProgress.current = false
      log("handleRejectCall: Error occurred. callActionInProgress=false.")
    }
  }

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "Llamada entrante...":
        return "#4ECDC4"
      case "Conectando...":
        return "#4ECDC4"
      case "Error al conectar":
        return "#FF4757"
      case "Rechazando llamada...":
        return "#FF4757"
      case "Llamada cancelada/resuelta":
        return Colors.graySemiDark
      default:
        return "#4ECDC4"
    }
  }, [])

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "Llamada entrante...":
        return "call-received"
      case "Conectando...":
        return "sync"
      case "Error al conectar":
        return "error"
      case "Rechazando llamada...":
        return "call-missed"
      case "Llamada cancelada/resuelta":
        return "phone-disabled"
      default:
        return "call-received"
    }
  }, [])

  useEffect(() => {
    startAnimations()
    log(`MOUNTED: callId=${routeParamsData?.data?.callId}, currentIncomingCallDetails?.callId=${currentIncomingCallDetails?.callId}`)

    if (routeParamsData?.data?.callId && currentIncomingCallDetails?.callId === routeParamsData.data.callId) {
      log("useEffect[init]: Call is active and matches route. Attempting to start ringtone.")
      startRingtone()
    } else {
      log("useEffect[init]: Conditions not met to start ringtone.")
    }

    return () => {
      log(`UNMOUNTING: callId=${routeParamsData?.data?.callId}. Cleaning up...`)
      stopRingtone()
      callActionInProgress.current = false
      isStoppingRingtoneRef.current = false
      isRingtonePlayingRef.current = false
      log("UNMOUNTED: Cleanup complete.")
    }
  }, [startAnimations, routeParamsData?.data?.callId, startRingtone, stopRingtone, currentIncomingCallDetails])

  useEffect(() => {
    if (routeParamsData?.data?.callId && !currentIncomingCallDetails && navigation.isFocused()) {
      log(`useEffect[callCancelled]: Call ${routeParamsData.data.callId} no longer active in context. Navigating back.`)
      setCallStatus("Llamada cancelada/resuelta")
      if (!callActionInProgress.current) {
        log("useEffect[callCancelled]: No call action in progress, stopping ringtone.")
        stopRingtone()
      } else {
        log("useEffect[callCancelled]: Call action in progress, ringtone stop handled by action.")
      }

      const navTimeout = setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        } else {
          navigation.navigate("Home" as any)
        }
      }, 700)
      return () => clearTimeout(navTimeout)
    }
  }, [currentIncomingCallDetails, routeParamsData?.data?.callId, navigation, stopRingtone])

  useEffect(() => {
    if (incomingCall?.status === "missed" || incomingCall?.status === "ended" || incomingCall?.status === "rejected") {
      log(`useEffect[callStatusChanged]: Status is ${incomingCall.status}. Stopping ringtone and navigating back.`)
      if (!callActionInProgress.current) {
        log("useEffect[callStatusChanged]: No call action in progress, stopping ringtone.")
        stopRingtone()
      } else {
        log("useEffect[callStatusChanged]: Call action in progress, ringtone stop handled by action.")
      }
      if (navigation.isFocused() && navigation.canGoBack()) {
        navigation.goBack()
      }
    }
  }, [incomingCall, navigation, stopRingtone])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (routeParamsData?.data?.callId && !callActionInProgress.current) {
          log("Android back button pressed. Rejecting call.")
          handleRejectCall()
          return true
        }
        return false
      }
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress)
      return () => subscription.remove()
    }, [routeParamsData?.data?.callId]),
  )

  const spin = useMemo(() => rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }), [rotateAnim])
  const rippleScale = useMemo(() => rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }), [rippleAnim])
  const rippleOpacity = useMemo(() => rippleAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.8, 0.3, 0] }), [rippleAnim])

  if (!routeParamsData?.data) {
    log("No call data found in route params. Navigating back.")
    if (navigation.canGoBack()) navigation.goBack()
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error: No hay datos de llamada.</Text>
      </SafeAreaView>
    )
  }

  const { fromAvatar, fromName } = routeParamsData.data

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white || "#1A1A2E" }} edges={["top"]}>
      <View style={{ flex: 1 }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.7 }}>
          {backgroundElements.map((element, i) => (
            <Animated.View
              key={i}
              style={{
                position: "absolute",
                width: element.width,
                height: element.height,
                borderRadius: element.width / 2,
                backgroundColor: Colors.primary || "#E94560",
                opacity: 0.2,
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
              paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight || 20,
              marginBottom: 40,
            }}
          >
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
                style={{ fontSize: 16, fontWeight: "600", textAlign: "center", color: Colors.secondary || "#FFFFFF" }}
              >
                Videollamada entrante
              </Text>
            </View>
          </View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 }}>
            <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
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
                {fromAvatar ? (
                  <CacheImage
                    source={{ uri: fromAvatar }}
                    styleImage={{ width: 180, height: 180, borderRadius: 90, borderWidth: 4, borderColor: "#fff" }}
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
                      borderColor: Colors.secondary || "#FFFFFF",
                    }}
                  >
                    <Ionicons name="person" size={80} color={Colors.secondary || "#FFFFFF"} />
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
                color: Colors.secondary || "#FFFFFF",
              }}
            >
              {fromName || "Usuario Desconocido"}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <MaterialIcons
                name={getStatusIcon(callStatus)}
                size={20}
                color={getStatusColor(callStatus)}
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 18, opacity: 0.9, fontWeight: "500", color: Colors.secondary || "#FFFFFF" }}>
                {callStatus}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                backgroundColor: "rgba(255,255,255,0.15)",
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Ionicons name={"videocam"} size={18} color={Colors.secondary || "#FFFFFF"} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 14, color: Colors.secondary || "#FFFFFF" }}>Videollamada</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              marginBottom: 60,
              paddingHorizontal: 30,
            }}
          >
            <Animated.View style={{ transform: [{ scale: rejectBtnAnim }] }}>
              <TouchableOpacity
                onPress={handleRejectCall}
                disabled={isRejecting || isAccepting}
                activeOpacity={0.8}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isRejecting ? "#FF6B6B" : "#FF4757",
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
                {isRejecting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="call" size={36} color="#fff" />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 14,
                  color: Colors.secondary || "#FFFFFF",
                  opacity: 0.9,
                }}
              >
                Rechazar
              </Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: acceptBtnAnim }] }}>
              <TouchableOpacity
                onPress={handleAcceptCall}
                disabled={isAccepting || isRejecting}
                activeOpacity={0.8}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: isAccepting ? "#4ECDC4" : "#38A169",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#38A169",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 12,
                }}
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name={"videocam"} size={36} color="#fff" />
                )}
              </TouchableOpacity>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 14,
                  color: Colors.secondary || "#FFFFFF",
                  opacity: 0.9,
                }}
              >
                Contestar
              </Text>
            </Animated.View>
          </View>

          <View style={{ alignItems: "center", paddingBottom: 30 }}>
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
              <Text style={{ fontSize: 14, opacity: 0.8, textAlign: "center", color: Colors.secondary || "#FFFFFF" }}>
                La llamada se cerrará automáticamente en 30 segundos si no se contesta.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

export default IncomingCallScreen
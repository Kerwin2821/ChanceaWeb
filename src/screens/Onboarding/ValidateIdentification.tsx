"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Dimensions, Alert, BackHandler, AppState, TouchableOpacity } from "react-native"
import WebViewWebWrapper from "../../components/WebViewWebWrapper"
import { useAuth } from "../../context"
import { CommonActions, useNavigation } from "@react-navigation/native"
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { Colors } from "../../utils"
import Button from "../../components/ButtonComponent/Button"

const { width, height } = Dimensions.get("window")

const loadingMessages = [
  "Analizando tus fotos para verificar su autenticidad...",
  "Nuestro sistema está procesando las imágenes de forma segura.",
  "Verificando que las fotos sean realmente tuyas.",
  "Procesando datos biométricos para tu seguridad.",
  "Casi terminamos, estamos validando los últimos detalles.",
  "Tu privacidad es importante, procesamos todo de forma segura.",
  "Verificando la autenticidad de tus fotografías.",
  "Analizando patrones únicos en tus imágenes.",
]

interface PhotoScannerScreenProps {
  userId?: string
  sessionToken?: string
  onScanComplete?: (result: any) => void
  onScanError?: (error: any) => void
  navigation?: any
}

export default function ValidateIdentification({
  userId = "demo-user",
  sessionToken,
  onScanComplete,
  onScanError,
}: PhotoScannerScreenProps) {
  const { user, SesionToken, TokenAuthApi } = useAuth()

  const [showInitialLoadingScreen, setShowInitialLoadingScreen] = useState(true)
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [initialCountdown, setInitialCountdown] = useState(10)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Iniciando escáner...")
  const [isScannerReady, setIsScannerReady] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [loadingQuote, setLoadingQuote] = useState("")
  const [scanResult, setScanResult] = useState(null)
  const [isScanCompleted, setIsScanCompleted] = useState(false)
  const [isPhotoTrapDetected, setIsPhotoTrapDetected] = useState(false)

  const webViewRef = useRef<any>(null)

  const scannerUrl = `https://qa.chanceaapp.com/?sessionToken=${encodeURIComponent(sessionToken || SesionToken || "demo-token")}`

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      console.log("Scanner Message:", data)

      switch (data.type) {
        case "SCANNER_READY":
        case "scannerReady":
          setIsScannerReady(true)
          setLoadingMessage("Escáner listo")
          setTimeout(() => setLoading(false), 1000)
          break

        case "SCAN_STARTED":
        case "scanStarted":
          setLoadingMessage("Iniciando análisis...")
          setScanProgress(0)
          break

        case "SCAN_PROGRESS":
        case "scanProgress":
          setScanProgress(data.progress || 0)
          setLoadingMessage(`Analizando... ${data.progress || 0}%`)
          break

        case "SCAN_COMPLETE":
        case "scanComplete":
          setScanResult(data)
          setLoadingMessage("Análisis completado")
          setIsScanCompleted(true)
          setTimeout(() => {
            handleScanComplete(data)
          }, 1500)
          break

        case "SCAN_ERROR":
        case "scanError":
          console.error("Scan Error:", data)
          handleScanError(data)
          break

        case "PHOTO_TRAP_DETECTED":
          console.log("Photo trap detected!")
          setIsPhotoTrapDetected(true)
          break

        case "PHOTO_TRAP_REMOVED":
          console.log("Photo trap removed!")
          setIsPhotoTrapDetected(false)
          break

        default:
          console.log("Unknown message type:", data.type)
      }
    } catch (e) {
      console.error("Error parsing scanner message:", e)
    }
  }

  const handleScanComplete = (result: any) => {
    if (onScanComplete) {
      onScanComplete(result)
    } else {
      Alert.alert(
        "Verificación Completada",
        `Resultado: ${result.isAuthentic ? "Fotos auténticas" : "Fotos no auténticas"}\nConfianza: ${result.confidence}%`,
        [
          {
            text: "Continuar",
            onPress: () => navigation?.goBack(),
          },
        ],
      )
    }
  }

  const handleScanError = (error: any) => {
    if (onScanError) {
      onScanError(error)
    } else {
      Alert.alert("Error en la Verificación", error.message || "Ocurrió un error durante el análisis de las fotos.", [
        {
          text: "Reintentar",
          onPress: () => {
            setLoading(true)
            setShowInitialLoadingScreen(true)
            setInitialCountdown(10)
          },
        },
        {
          text: "Cancelar",
          onPress: () => navigation?.goBack(),
          style: "cancel",
        },
      ])
    }
  }

  const handleCancel = () => {
    Alert.alert("Cancelar Verificación", "¿Estás seguro que deseas cancelar la verificación de fotos?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Sí, cancelar",
        onPress: () => handleNext(),
        style: "destructive",
      },
    ])
  }

  const handleNext = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{
          name: "Home",
          state: {
            routes: [
              {
                name: "Profile", // Nombre del tab en el BottomTabNavigator
              },
            ],
            index: 0,
          },
        }],
      })
    );
  }

  useEffect(() => {
    const backAction = () => {
      handleCancel()
      return true
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log("App went to background during scan")
      }
    }

    const subscription = AppState.addEventListener("change", handleAppStateChange)
    return () => subscription?.remove()
  }, [])

  useEffect(() => {
    if (showInitialLoadingScreen) {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length)
      setLoadingQuote(loadingMessages[randomIndex])

      if (initialCountdown > 0) {
        const timer = setTimeout(() => setInitialCountdown((prev) => prev - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setShowInitialLoadingScreen(false)
      }
    }
  }, [showInitialLoadingScreen, initialCountdown])

  const injectedJavaScript = `
    (function() {
      console.log("[v0] Starting photo trap detection system...");
      
      let photoTrapDetected = false;
      
      function sendMessage(type, data = {}) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data }));
        }
      }
      
      function checkForPhotoTrap() {
        console.log("[v0] Checking for photo trap element...");
        
        const element = document.querySelector('[data-testid="chancea-photo-trap-detected"]');
        const isCurrentlyDetected = element !== null && element.offsetParent !== null;
        
        if (element) {
          console.log("[v0] Photo trap element found in DOM:", element);
          console.log("[v0] Element is visible:", isCurrentlyDetected);
        } else {
          console.log("[v0] Photo trap element not found in DOM");
        }
        
        if (isCurrentlyDetected && !photoTrapDetected) {
          photoTrapDetected = true;
          console.log("[v0] Photo trap DETECTED! Sending message to React Native");
          sendMessage('PHOTO_TRAP_DETECTED', {
            element: element ? element.outerHTML : null
          });
        } else if (!isCurrentlyDetected && photoTrapDetected) {
          photoTrapDetected = false;
          console.log("[v0] Photo trap REMOVED! Sending message to React Native");
          sendMessage('PHOTO_TRAP_REMOVED');
        }
      }
      
      // Initialize scanner after delay
      setTimeout(() => {
        console.log("[v0] Sending INIT_SCANNER message to React Native");
        sendMessage('INIT_SCANNER', {
          userId: '${userId}',
          sessionToken: '${sessionToken || SesionToken || "demo-token"}',
          source: 'mobile'
        });
      }, 2000);
      
      // Set up periodic checking
      console.log("[v0] Setting up photo trap detection interval (500ms)");
      setInterval(checkForPhotoTrap, 500);
      
      // Set up MutationObserver for DOM changes
      if (typeof MutationObserver !== 'undefined') {
        console.log("[v0] Setting up MutationObserver for DOM changes");
        const observer = new MutationObserver(() => {
          console.log("[v0] DOM mutation detected, checking for photo trap");
          checkForPhotoTrap();
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });
      } else {
        console.log("[v0] MutationObserver not available");
      }
      
      console.log("[v0] Photo trap detection system initialized successfully");
      return true;
    })();
  `

  return (
    <View style={styles.container}>
      <WebViewWebWrapper
        ref={webViewRef}
        source={{ uri: scannerUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoad={() => {
          console.log("Scanner WebView loaded successfully")
        }}
        onError={(error: any) => {
          console.error("WebView Error:", error)
          Alert.alert("Error de Conexión", "No se pudo cargar el escáner. Verifica tu conexión a internet.", [
            {
              text: "Reintentar",
              onPress: () => webViewRef.current?.reload ? webViewRef.current.reload() : window.location.reload(),
            },
            {
              text: "Cancelar",
              onPress: () => navigation?.goBack(),
              style: "cancel",
            },
          ])
        }}
      />

      <View className="w-1/3 absolute bottom-0 right-3">
        <Button text={user?.verified ? "Finalizar" : "Cancelar"} onPress={user?.verified ? handleNext : handleCancel} styleButton={user?.verified ? styles.nextButton : styles.cancelButton} />
      </View>

      {/*  <TouchableOpacity
        style={[, (isScanCompleted || isPhotoTrapDetected) && styles.nextButton]}
        onPress={handleNext}
      >
        <Text style={styles.cancelButtonText}>
          {isScanCompleted || isPhotoTrapDetected ? "Siguiente" : "Finalizar"}
        </Text>
      </TouchableOpacity> */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
  initialLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  spinner: {
    width: 32,
    height: 32,
    borderWidth: 4,
    borderColor: "#fff",
    borderTopColor: "transparent",
    borderRadius: 16,
  },
  loadingQuote: {
    color: "#fff",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  countdownText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
    opacity: 0.8,
  },
  loadingMessage: {
    color: "#fff",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginTop: 32,
    width: width * 0.8,
    maxWidth: 300,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  cancelButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: Colors.danger,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 5,
  },
  cancelButtonIcon: {
    color: "#fff",
    fontSize: 20,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
})

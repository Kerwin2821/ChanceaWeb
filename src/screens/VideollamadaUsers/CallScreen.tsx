"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  Platform,
  SafeAreaView,
  AppState,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect, useIsFocused, CommonActions } from "@react-navigation/native";
import WebViewWebWrapper from "../../components/WebViewWebWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useCall } from "../../context/CallContext/CallProvider";
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import LoaderLogo from "../../components/accesories/LoaderLogo";
import { useAuth } from "../../context";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import { HttpService } from "../../services";
import { Camera, CameraType } from "expo-camera";
import LogoTipoD from "../../components/imgSvg/LogoTipoD";

const loadingMessages = [
  "Estamos cuadrando todo para que puedas empezar a chancear.",
  "Preparando la llamada para que la conversación fluya sin problemas.",
  "Recuerda, no compartas datos personales con desconocidos. ¡La seguridad primero!",
  "Sigue el proceso y todo saldrá bien, estamos casi listos.",
  "Chancea te recomienda que no te vayas a la primera, ¡dale tiempo a la conexión!",
  "Mientras conectamos, aprovecha para pensar en qué quieres contar.",
  "Tu próxima gran conversación está a punto de comenzar.",
  "Paciencia, estamos conectando a tu match.",
  "Recuerda respetar y ser respetado, una buena charla siempre es bienvenida.",
  "Estamos preparando un espacio seguro para que disfrutes el chanceo.",
  "¿Ya tienes tema de conversación? Mientras conectamos, prepáralo.",
  "No olvides ser tú mismo, la autenticidad siempre gana.",
];

export default function CallScreen() {
  const route = useRoute();
  const isFocus = useIsFocused();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { roomName, userName, jitsiServer, callId } = route.params as {
    roomName: string;
    userName: string;
    jitsiServer: string;
    callId: string;
  };

  const { endCall: endCallProvider, onCallEnded, remainingSeconds, setRemainingSeconds } = useCall();
  const { user, SesionToken, TokenAuthApi } = useAuth();

  const [showInitialLoadingScreen, setShowInitialLoadingScreen] = useState(true);
  const [initialCountdown, setInitialCountdown] = useState(15);
  const [initialCountdown2, setInitialCountdown2] = useState(15);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Cargando videollamada...");
  const [isCallConnected, setIsCallConnected] = useState(false);
  const [CallDuration, setCallDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const warnedBefore = useRef(false); // alerta previa
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingQuote, setLoadingQuote] = useState("");

  const webViewRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);

  const jitsiUrl =
    `${jitsiServer}${encodeURIComponent(roomName)}#` +
    `config.startWithAudioMuted=false&` +
    `config.startWithVideoMuted=false&` +
    `userInfo.displayName=${encodeURIComponent(userName)}&` +
    `config.prejoinPageEnabled=false&` +
    `config.disableDeepLinking=true&` +
    `config.requireDisplayName=false&` +
    `config.toolbarButtons=["microphone","camera"]`;

  async function ValidateEndCall(
    callId: string,
    endingDate: string,
    durationSecond: number,
    callStatus: string,
    roomId: string,
    description: string
  ) {
    try {
      console.log(
        {
          customerSessionToken: SesionToken,
          callId,
          endingDate,
          durationSecond,
          callStatus,
          roomId,
          description,
          rate: 0,
        },
        "ValidateEndCall"
      );
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/completeCall`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      await HttpService(
        "post",
        host,
        url,
        {
          customerSessionToken: SesionToken,
          callId,
          endingDate,
          durationSecond,
          callStatus,
          roomId,
          description,
          rate: 0,
        },
        header
      );
      setIsRunning(false);
      setRemainingSeconds(null);
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }
  const endCall = async () => {
    if (callId) {
      try {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
                try {
                  const hangupButton = document.querySelector('.hangup-button') || document.querySelector('[data-testid="hangup"]');
                  if (hangupButton) hangupButton.click();
                } catch(e) { console.error(e); }
                true;
              `);
        }
        if (callId) {
          await endCallProvider();
          await ValidateEndCall(
            callId,
            new Date().toISOString(),
            remainingSeconds || 0,
            "ENDED",
            roomName,
            "Llamada finalizada por el usuario"
          );
        }
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );;
      } catch (error) {
        console.error("Error al finalizar llamada:", error);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );;
      }
    }
  };

  useEffect(() => {
    if (isRunning && remainingSeconds !== null) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;

          if (prev === 0) {
            clearInterval(intervalRef.current!);
            alert(
              "⌛ ¡Tu tiempo de videollamada ha terminado!Has agotado tu cupo de minutos para chancear por video.Pero no te preocupes, aún puedes seguir conociendo a esa persona especial.Te invitamos a continuar la conversación por el chat. 💬✨"
            );
            endCall();
            return 0;
          }

          if (prev === 300 && !warnedBefore.current) {
            alert(
              "⚠️ ¡Últimos 5 minutos en la llamada! Aprovecha al máximo este tiempo para conectar, reír y compartir. Cada segundo cuenta cuando la química está fluyendo."
            );
            warnedBefore.current = true;
          }
          console.log(prev, "prev");
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, intervalRef]);

  // Auto finalizar llamada si app va a background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        (nextAppState === "inactive" || nextAppState === "background") &&
        isCallConnected
      ) {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        await endCallProvider();
        await ValidateEndCall(
          callId,
          new Date().toISOString(),
          remainingSeconds || 0,
          "DISCONNECTED",
          roomName,
          "App cerrada o minimizada"
        );
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );;
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isCallConnected, remainingSeconds, callId, roomName, endCallProvider, navigation]);

  useEffect(() => {
    if (showInitialLoadingScreen) {
      if (initialCountdown > 0) {
        const timer = setTimeout(() => setInitialCountdown((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setShowInitialLoadingScreen(false);
      }
    }
  }, [showInitialLoadingScreen, initialCountdown]);

  useEffect(() => {
    if (showInitialLoadingScreen) {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingQuote(loadingMessages[randomIndex]);

      if (initialCountdown2 > 0) {
        const timer = setTimeout(() => setInitialCountdown2((prev) => prev - 1), 5000); // 5000 ms = 5 segundos
        return () => clearTimeout(timer);
      } else {
        setShowInitialLoadingScreen(false);
      }
    }
  }, [showInitialLoadingScreen, initialCountdown2]);

  useEffect(() => {
    if (isCallConnected) {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(callTimerRef.current);
  }, [isCallConnected]);

  useEffect(() => {
    onCallEnded(() => {
      console.log("Llamada terminada desde Firebase");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );;
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        handleEndCall();
        return true;
      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const injectedJavaScript = `
    (function() {
      let isJoined = false;
      let participantCount = 0;
      function sendMessage(type, data = {}) { window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, ...data })); }
      const style = document.createElement('style');
      style.textContent = \`.watermark, .welcome, .prejoin-screen, .invite-more-dialog { display: none !important; } #new-toolbox { bottom: 10px !important; } .toolbox-content-items { justify-content: center !important; }\`;
      document.head.appendChild(style);
      setTimeout(() => { const joinButton = document.querySelector('[data-testid="prejoin.joinMeeting"]'); if (joinButton) joinButton.click(); }, 2000);
      function checkIfJoined() { const tb = document.querySelector('#new-toolbox'); const vc = document.querySelector('#largeVideoContainer'); if (tb && vc && !isJoined) { isJoined = true; sendMessage('callConnected'); }}
      function checkParticipants() { const p = document.querySelectorAll('.participant'); const nC = p.length; if (nC !== participantCount) { participantCount = nC; sendMessage('participantCountChanged', { count: nC }); }}
      const observer = new MutationObserver(() => { checkIfJoined(); checkParticipants(); });
      observer.observe(document.body, { childList: true, subtree: true });
      setInterval(() => { checkIfJoined(); checkParticipants(); }, 1000);
      window.addEventListener('message', function(event) { try { const d = JSON.parse(event.data); if (d.type === 'readyToClose') sendMessage('endCall'); } catch (e) {} });
      document.addEventListener('click', function(event) { const t = event.target; if (t.closest('.hangup-button') || t.closest('[data-testid="hangup"]')) { setTimeout(() => sendMessage('endCall'), 500); }});
      true;
    })();
  `;

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "callConnected":
          setIsCallConnected(true);
          setLoadingMessage("Conectado");
          setIsRunning(true);
          setTimeout(() => setLoading(false), 1000);
          break;
        case "participantCountChanged":
          console.log(`Participantes en la llamada: ${data.count}`);
          break;
        case "endCall":
          handleEndCall();
          break;
        default:
          console.log("Mensaje WebView:", data);
      }
    } catch (e) { }
  };

  const handleEndCall = async () => {
    Alert.alert("Finalizar llamada", "¿Estás seguro que deseas finalizar la llamada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        style: "destructive",
        onPress: async () => {
          try {
            if (callTimerRef.current) clearInterval(callTimerRef.current);
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                try {
                  const hangupButton = document.querySelector('.hangup-button') || document.querySelector('[data-testid="hangup"]');
                  if (hangupButton) hangupButton.click();
                } catch(e) { console.error(e); }
                true;
              `);
            }
            if (callId) {
              await endCallProvider();
              await ValidateEndCall(
                callId,
                new Date().toISOString(),
                remainingSeconds || 0,
                "ENDED",
                roomName,
                "Llamada finalizada por el usuario"
              );
            }
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home" }],
              })
            );;
          } catch (error) {
            console.error("Error al finalizar llamada:", error);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home" }],
              })
            );;
          }
        },
      },
    ]);
  };

  if (!isFocus) {
    return null; // Evitar renderizado si no está enfocado 
  }

  return (
    <SafeAreaView style={styles.container}>


      <WebViewWebWrapper
        ref={webViewRef}
        source={{ uri: jitsiUrl }}
        style={styles.webview}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        allowsBackForwardNavigationGestures={false}
        userAgent={
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        injectedJavaScript={injectedJavaScript}
        onMessage={handleWebViewMessage}
        onError={(error) => {
          console.error("WebView Error:", error);
          Alert.alert("Error de conexión", "No se pudo cargar la videollamada. Verifica tu conexión a internet.", [
            { text: "Reintentar", onPress: () => webViewRef.current?.reload() },
            {
              text: "Salir", onPress: () => navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                })
              )
            },
          ]);
        }}
        onHttpError={(error) => {
          console.error("HTTP Error:", error);
          Alert.alert("Error del servidor", "Problema con el servidor de videollamadas.", [
            { text: "Reintentar", onPress: () => webViewRef.current?.reload() },
            {
              text: "Salir", onPress: () => navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                })
              )
            },
          ]);
        }}
        onLoadStart={() => {
          setLoading(true);
          setLoadingMessage("Conectando a la sala...");
        }}
        onLoadEnd={() => {
          // Inyectar script para verificar configuraciones
          webViewRef.current?.injectJavaScript(`
            console.log('User Agent:', navigator.userAgent);
            console.log('Jitsi config:', window.config);
            
            setTimeout(() => {
              const videos = document.querySelectorAll('video');
              console.log('Videos encontrados:', videos.length);
              
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                userAgent: navigator.userAgent,
                videosCount: videos.length,
                hasJitsiAPI: !!window.JitsiMeetExternalAPI
              }));
            }, 5000);
            
            true;
          `);
        }}
      />

      {!showInitialLoadingScreen && loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>{loadingMessage}</Text>
          {roomName && <Text style={styles.loadingSubtext}>Sala: {roomName}</Text>}
        </View>
      )}

      {showInitialLoadingScreen && (
        <View style={styles.initialLoadingOverlay}>
          <LoaderLogo />
          <Text style={styles.initialLoadingText}>{loadingQuote}</Text>
          <Text style={styles.initialLoadingCountdown}>Iniciando en {initialCountdown}s</Text>
        </View>
      )}

      {!showInitialLoadingScreen && !loading && isCallConnected && (
        <View style={styles.exitButtonContainer}>
          <TouchableOpacity style={styles.exitButton} onPress={handleEndCall}>
            <Ionicons name="call" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <View className="absolute top-0 w-screen h-[10vh] bg-white flex-row items-center justify-center px-4">
        <LogoTipoD />
      </View>
      <View className="absolute bottom-0 w-screen h-[15vh] bg-white flex-row items-center justify-between px-4" />



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? 0 : 32,
  },
  webview: {
    flex: 1,
  },
  initialLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.98)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  initialLoadingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 20,
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  initialLoadingCountdown: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.98)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "600",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  loadingSubtext: {
    color: "#fff",
    marginTop: 10,
    fontSize: 14,
    opacity: 0.8,
  },
  exitButtonContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    right: 20,
    zIndex: 5,
  },
  exitButton: {
    borderRadius: 10,
    backgroundColor: "#DC3545",
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

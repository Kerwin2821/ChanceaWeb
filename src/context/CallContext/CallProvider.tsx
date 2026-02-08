import type React from "react";
import { createContext, useContext, useState, useEffect, useCallback, useRef, PropsWithChildren } from "react";
import { Platform, Alert } from "react-native";
import { io, type Socket } from "socket.io-client";
import { Audio } from "expo-av";
import type { CallContextType, CallData, CallStatus } from "./CallInterface";
import * as Camera from "expo-camera";
import type { UserData } from "../AuthContext/AuthInterface";
import useAuth from "../AuthContext/AuthProvider";
import CallContext from "./CallContext";
import { useStore } from "../storeContext/StoreState";

// URL del servidor de sockets
const SOCKET_SERVER_URL = "https://meet.chanceaapp.com:8443";

// Ensure log function is available or define it
const log = (message: string) => console.log(`[CallProvider] ${new Date().toISOString()} - ${message}`);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall debe ser usado dentro de un CallProvider");
  }
  return context;
};

export const CallProvider = ({ children }: PropsWithChildren) => {
  // Referencias
  const socketRef = useRef<Socket | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const callStatusListenersRef = useRef<((status: CallStatus, callData: CallData) => void)[]>([]);
  const callEndedListenersRef = useRef<(() => void)[]>([]);
  const incomingCallListenersRef = useRef<((callData: CallData) => void)[]>([]);
  const { Match } = useStore();

  // Estado
  const [isConnected, setIsConnected] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallData | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callHistory, setCallHistory] = useState<CallData[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Contexto de autenticación (asumimos que existe)
  const { user } = useAuth();

  // Iniciar sonido de llamada
  const startRingtone = useCallback(async (isIncoming = true) => {
    try {
      /* if (soundRef.current) {
        await soundRef.current.unloadAsync()
      }

      const soundSource = isIncoming
        ? require("../../assets/sounds/ringtone.mp3")
        : require("../../assets/sounds/ringback.mp3")

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        isLooping: true,
        volume: 1.0,
      })

      soundRef.current = sound */
    } catch (error) {
      console.error("Error al reproducir sonido:", error);
    }
  }, []);

  // Detener sonido de llamada
  const stopRingtone = useCallback(async () => {
    if (soundRef.current) {
      try {
        /*   await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null */
      } catch (error) {
        console.error("Error al detener sonido:", error);
      }
    }
  }, []);

  // Función para navegar a la pantalla de llamada entrante
  const navigateToIncomingCall = useCallback((callData: CallData, navigate: Function) => {
    console.log("Navegando a pantalla de llamada entrante:", callData.callId);
    if (navigate && typeof navigate === "function") {
      navigate("IncomingCall", { data: callData });
    }
  }, []);

  // Solicitar permisos de cámara y micrófono
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "web") return true;

    try {
      // Solicitar permisos de cámara (incluye micrófono)
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();

      const hasPermissions = cameraPermission.status === "granted" && microphonePermission.status === "granted";

      if (!hasPermissions) {
        Alert.alert("Permisos requeridos", "Necesitamos acceso a la cámara y micrófono para las videollamadas.", [
          { text: "OK" },
        ]);
      }

      return hasPermissions;
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
      return false;
    }
  }, []);

  // Generar nombre de sala único
  const generateRoomName = useCallback(() => {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Notificar cambio de estado de llamada
  const notifyCallStatusChange = useCallback((status: CallStatus, callData: CallData) => {
    callStatusListenersRef.current.forEach((listener) => {
      listener(status, callData);
    });
  }, []);

  // Notificar llamada entrante
  const notifyIncomingCall = useCallback((callData: CallData) => {
    incomingCallListenersRef.current.forEach((listener) => {
      listener(callData);
    });
  }, []);

  // Notificar fin de llamada
  const notifyCallEnded = useCallback(() => {
    callEndedListenersRef.current.forEach((listener) => {
      listener();
    });
  }, []);

  // Iniciar una llamada
  const startCall = async (
    recipientId: string,
    roomId: string,
    user2: UserData,
    hasVideo = true,
    recipientName?: string,
    recipientAvatar?: string,
  ): Promise<string> => {
    console.log(!socketRef.current || !isConnected || !user);
    console.log(!socketRef.current);
    console.log(!isConnected);
    console.log(!user);
    if (!socketRef.current || !user) {
      throw new Error("No hay conexión con el servidor");
    }

    try {
      // Solicitar permisos
      /* const hasPermissions = await requestPermissions()
        if (!hasPermissions) {
          throw new Error("Permisos de cámara o micrófono denegados")
        } */

      // Generar ID de sala

      const jitsiUrl = "https://meet.chanceaapp.com/";

      // Crear datos de la llamada
      const callData: CallData = {
        callId: roomId,
        roomId: roomId,
        roomName: roomId,
        fromId: user.id.toString(),
        fromName: user.firstName || "Usuario",
        fromAvatar: user.customerProfiles?.[0]?.link,
        toId: recipientId,
        toName: recipientName || user2.firstName || "Usuario",
        toAvatar: recipientAvatar || user2.customerProfiles?.[0]?.link,
        jitsiUrl,
        status: "calling",
        startTime: new Date().toISOString(),
      };

      // Actualizar estado
      setCurrentCall(callData);
      setIsCallActive(true);

      // Añadir a historial
      setCallHistory((prev) => [...prev, callData]);

      // Iniciar sonido de llamada saliente
      await startRingtone(false);

      // Enviar evento al servidor
      socketRef.current.emit("call-user", {
        from: user.id,
        to: recipientId,
        roomId: roomId,
      });

      // Notificar cambio de estado
      notifyCallStatusChange("calling", callData);

      return roomId;
    } catch (error) {
      const roomId = generateRoomName();
      const jitsiUrl = "https://meet.chanceaapp.com/";

      // Crear datos de la llamada
      const callData: CallData = {
        callId: roomId,
        roomId: roomId,
        roomName: roomId,
        fromId: user.id.toString(),
        fromName: user.firstName || "Usuario",
        fromAvatar: user.customerProfiles?.[0]?.link,
        toId: recipientId,
        toName: recipientName || user2.firstName || "Usuario",
        toAvatar: recipientAvatar || user2.customerProfiles?.[0]?.link,
        jitsiUrl,
        status: "calling",
        startTime: new Date().toISOString(),
      };

      notifyCallStatusChange("ended", callData);
      console.error("Error al iniciar llamada:", error);
      throw error;
    }
  };

  // Aceptar una llamada
  const answerCall = async (callId: string): Promise<void> => {
    if (!socketRef.current || !incomingCall || incomingCall.callId !== callId) {
      throw new Error("No hay llamada entrante con ese ID");
    }

    console.log(incomingCall);

    try {
      // Detener sonido
      /* await stopRingtone() */

      // Enviar respuesta al servidor
      socketRef.current.emit("call-response", {
        to: incomingCall.fromId.toString(),
        accepted: true,
        roomId: incomingCall.roomId,
      });

      // Actualizar estazdo de la llamada
      /* const updatedCall = {
        ...incomingCall,
        status: "connected" as CallStatus,
      };
      setCurrentCall(updatedCall);
      setIncomingCall(null);
      setIsCallActive(true); */
    } catch (error) {
      console.error("Error al aceptar llamada:", error);
      throw error;
    }
  };
  // Rechazar una llamada
  const rejectCall = async (callId: string): Promise<boolean> => {
    if (!socketRef.current || !incomingCall || incomingCall.callId !== callId) {
      return false;
    }

    try {
      // Detener sonido
      // await stopRingtone();

      // Enviar respuesta al servidor
      socketRef.current.emit("call-response", {
        to: incomingCall.fromId.toString(),
        accepted: false,
        roomId: incomingCall.roomId,
      });

      // Actualizar estado
      const updatedCall = {
        ...incomingCall,
        status: "rejected" as CallStatus,
      };

      // Actualizar historial
      /* setCallHistory((prev) => prev.map((call) => (call.callId === callId ? updatedCall : call))); */

      setIncomingCall(null);

      // Notificar cambio de estado
      notifyCallStatusChange("rejected", updatedCall);

      return true;
    } catch (error) {
      console.error("Error al rechazar llamada:", error);
      return false;
    }
  };

  // Finalizar una llamada
  const endCall = async (): Promise<boolean> => {
    /* console.log("LLAMADA FINALIZADA"); */

    try {
      // Detener sonido
      /* await stopRingtone(); */
      console.log(incomingCall, "LLAMADA FINALIZADA");
      console.log(currentCall, "LLAMADA FINALIZADA");

      const callToEnd = currentCall || incomingCall;
      if (!socketRef.current || !callToEnd) {
        return false;
      }
      // Enviar evento al servidor
      socketRef.current.emit("end-call", {
        roomId: callToEnd.roomId,
      });

      // Actualizar estado
      const updatedCall = {
        ...currentCall,
        status: "ended" as CallStatus,
        endTime: new Date().toISOString(),
      };

      // Actualizar historial
      /*  setCallHistory((prev) => prev.map((call) => (call.callId === currentCall.callId ? updatedCall : call))); */
      /* 
      setCurrentCall(null);
      setIsCallActive(false);

      // Notificar cambio de estado
      notifyCallStatusChange("ended", updatedCall);
      notifyCallEnded();
 */
      return true;
    } catch (error) {
      console.error("Error al finalizar llamada:", error);
      return false;
    }
  };

  const cancelCall = useCallback(
    async (roomId: string): Promise<void> => {
      if (!socketRef.current || !currentCall || currentCall.roomId !== roomId) {
        log(
          `Cannot cancel call: No active calling session, mismatched roomId, or not in 'calling' state. Current room: ${currentCall?.roomId}, Target room: ${roomId}`
        );
        // If currentCall exists but status is not 'calling', it might be an error or already connected
        if (currentCall && currentCall.status !== "calling") {
          log(`Call status is ${currentCall.status}, cannot cancel. Consider ending if connected.`);
        }
        return;
      }
      // Ensure we only cancel if the status is 'calling'
      if (currentCall.status !== "calling") {
        log(`Call ${roomId} is not in 'calling' state (current: ${currentCall.status}). Cannot cancel.`);
        return;
      }

      try {
        log(`Attempting to cancel call for room: ${roomId}`);
        //await stopRingbackTone()
        socketRef.current.emit("cancel-call", { roomId });
        log(`Emitted cancel-call for room: ${roomId}`);

        const updatedCall = {
          ...currentCall,
          status: "ended" as CallStatus, // Treat as ended locally for the caller
          endTime: new Date().toISOString(),
        };

        setCurrentCall(null); // Clear the current call for the caller
        setIsCallActive(false);

        notifyCallStatusChange("ended", updatedCall); // Notify listeners (e.g., OutgoingCallScreen)
        notifyCallEnded(); // Generic ended signal
      } catch (error) {
        console.error("Error cancelling call:", error);
        throw error; // Re-throw to allow UI to handle if necessary
      }
    },
    [currentCall, notifyCallStatusChange, notifyCallEnded]
  );

  // Manejar llamada entrante
  const handleIncomingCall = (data: any) => {
    console.log("Llamada entrante:", data);

    // Obtener información del usuario que llama (esto dependerá de tu implementación)
    // En un caso real, podrías tener una API para obtener datos del usuario

    const customer = Match?.find((e) => e.id === Number(data.from));
    console.log(customer,"a ver");
    console.log(Match,"a ver2");
    if (!customer) return;

    const fromName = customer.firstName; // Idealmente obtendrías el nombre real
    const fromAvatar = customer.customerProfiles[0].link; // Idealmente obtendrías el avatar real

    // Crear datos de la llamada
    const callData: CallData = {
      callId: data.roomId,
      roomId: data.roomId,
      roomName: data.roomId,
      fromId: data.from,
      fromName,
      fromAvatar,
      toId: user?.id.toString() || "",
      toName: user?.firstName || "Usuario",
      toAvatar: user?.customerProfiles?.[0]?.link,
      jitsiUrl: "https://meet.chanceaapp.com/",
      status: "ringing",
      startTime: data.timestamp || new Date().toISOString(),
    };

    // Actualizar estado
    setIncomingCall(callData);

    return callData;
  };

  // Configurar listeners de Firebase (stub para la implementación)
  const setupFirebaseListeners = useCallback(() => {
    console.log("Configurando listeners de Firebase (stub)");
    // Aquí iría la implementación real con Firebase
  }, []);

  // Registrar listener para cambios de estado de llamada
  const onCallStatusChange = useCallback((callback: (status: CallStatus, callData: CallData) => void) => {
    callStatusListenersRef.current.push(callback);

    return () => {
      callStatusListenersRef.current = callStatusListenersRef.current.filter((cb) => cb !== callback);
    };
  }, []);

  // Registrar listener para llamadas entrantes
  const onIncomingCall = useCallback((callback: (callData: CallData) => void) => {
    incomingCallListenersRef.current.push(callback);

    return () => {
      incomingCallListenersRef.current = incomingCallListenersRef.current.filter((cb) => cb !== callback);
    };
  }, [Match]);

  // Registrar listener para fin de llamada
  const onCallEnded = useCallback((callback: () => void) => {
    callEndedListenersRef.current.push(callback);

    return () => {
      callEndedListenersRef.current = callEndedListenersRef.current.filter((cb) => cb !== callback);
    };
  }, []);

  // Inicializar conexión de socket
  useEffect(() => {
    if (!user) {
      console.log("no user");
      return;
    }

    // Crear conexión de socket
    socketRef.current = io(SOCKET_SERVER_URL, {
      path: "/socketapp/socket.io",
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
    });

    // Manejar eventos de conexión
    socketRef.current.on("connect", () => {
      console.log("Socket conectado:", socketRef.current?.id);
      setIsConnected(true);

      // Registrar usuario
      socketRef.current?.emit("register", user.id.toString());
    });

    socketRef.current.on("disconnect", () => {
      console.log("Socket desconectado");
      setIsConnected(false);
    });

    socketRef.current.on("error", (error) => {
      console.error("Error de socket:", error);
    });

    socketRef.current.on("registered", (data) => {
      console.log("Usuario registrado:", data);
    });

    // Manejar eventos de llamada
    socketRef.current.on("incoming-call", async (data) => {
      console.log(data, "socket on");
      const callData = handleIncomingCall(data);

      // Iniciar sonido de llamada entrante
      /* await startRingtone(true) */
    });

    socketRef.current.on("call-answered", async (data) => {
      console.log("Llamada respondida:", data);

      if (data.roomId) {
        // Detener sonido
        /* await stopRingtone() */

        console.log(currentCall, "currentCall");

        if (data.accepted) {
          // Actualizar estado
          const updatedCall = {
            ...currentCall,
            status: "connected" as CallStatus,
          };
          setCurrentCall(updatedCall);
          setIsCallActive(true);
          notifyCallStatusChange("connected", updatedCall);
        } else {
          // Actualizar estado
          console.log("AVER");
          const updatedCall = {
            ...currentCall,
            status: "rejected" as CallStatus,
          };
          notifyCallStatusChange("rejected", updatedCall);
          setCurrentCall(null);
          setIsCallActive(false);
        }
      }
    });

    socketRef.current.on("call-cancelled", async (data: { roomId: string; from: string; timestamp: string }) => {
      log(`Received call-cancelled for room: ${data.roomId} to: ${user.id} from: ${data.from}`);

      // await stopRingtone() // Stop incoming ringtone for recipient

      // Update local state for the recipient
      const cancelledCallData = {
        ...incomingCall,
        status: "missed" as CallStatus, // Or a new "cancelled_by_caller" status
        endTime: new Date().toISOString(),
      };
      // Optional: notify status change if other parts of app need to know
      notifyCallStatusChange("missed", cancelledCallData);

      setIncomingCall(cancelledCallData); // This is crucial for IncomingCallScreen to react and navigate back

      // notifyCallEnded(); // This can also be used if IncomingCallScreen listens to it for cleanup
      log(`Incoming call ${data.roomId} was cancelled. State updated.`);
    });

    socketRef.current.on("call-ended", async (data) => {
      console.log("Llamada finalizada:", data);

      // Detener sonido
      /* await stopRingtone(); */
      // Actualizar estado
      const callToUpdate = currentCall || incomingCall;
      if (callToUpdate) {
        const updatedCall = {
          ...callToUpdate,
          status: "ended" as CallStatus,
          endTime: new Date().toISOString(),
        };

        // Actualizar historial
        setCallHistory((prev) => prev.map((call) => (call.callId === callToUpdate.callId ? updatedCall : call)));

        // Notificar cambio de estado
        notifyCallStatusChange("ended", updatedCall);
        notifyCallEnded();
      }

      // Limpiar estado
      setCurrentCall(null);
      setIncomingCall(null);
      setIsCallActive(false);
    });

    socketRef.current.on("forced-disconnect", async (data) => {
      console.log("Desconexión forzada:", data);

      // Si hay una llamada activa, finalizarla
      if (currentCall || incomingCall) {
        await endCall();
      }
    });

    // Limpiar al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      /* stopRingtone(); */
    };
  }, [user, currentCall, incomingCall,Match]);

  // Valor del contexto
  const value: CallContextType = {
    isConnected,
    currentCall,
    incomingCall,
    isCallActive,
    callHistory,
    remainingSeconds,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    cancelCall,
    onIncomingCall,
    onCallStatusChange,
    onCallEnded,
    generateRoomName,
    requestPermissions,
    setupFirebaseListeners,
    handleIncomingCall,
    navigateToIncomingCall,
    setRemainingSeconds,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

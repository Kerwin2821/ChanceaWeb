"use client";

import { useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { font } from "../../../styles";
import MessageComponent from "../../components/ChatsComponent/MessageComponent";
import { Platform } from "react-native";
import { FontAwesome6, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { useChat } from "../../context/ChatContext/ChatProvider";
import type { Mensaje } from "../../context/ChatContext/ChatInterface";
import { useAuth } from "../../context";
import type { UserData } from "../../context/AuthContext/AuthInterface";
import moment from "moment";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../context/storeContext/StoreState";
import type { BottomTabNavigationType } from "../../navigation/BottomTab";
import { Colors } from "../../utils";
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers";
import DialogMessageAlertSub from "../../components/Dialog/DialogMessageAlertSub/DialogMessageAlertSub";
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { validateMessageNoPhone } from "../../utils/PhoneValidator";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@rn-vui/themed";
import { useCall } from "../../context/CallContext/CallProvider";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import { HttpService } from "../../services";
import db, { FirebaseDatabaseTypes, firebase } from "@react-native-firebase/database";
import { onSnapshot } from "firebase/firestore";

import { Audio } from "expo-av";
import { getPresignedUrl, uploadToS3 } from "../../services/UploadService";

const { width, height } = Dimensions.get("window");

const MessagingScreen = () => {
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as {
    idDestination: string;
    idChat: string;
  };

  const { user, SesionToken, TokenAuthApi } = useAuth();
  const { consultarMensajesChats, sendMessage, chatVisto, Chats, setChatSee } = useChat();
  const { startCall, setRemainingSeconds, generateRoomName } = useCall();
  const { Customers, Match, CitasEnviadas, CitasRecibidas } = useStore();
  const isFocus = useIsFocused();

  // State management
  const [isVisible, setIsVisible] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [chatMessages, setChatMessages] = useState<Mensaje[]>([]);
  const [message, setMessage] = useState("");
  const [user2, setUser2] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isVideoCallLoading, setIsVideoCallLoading] = useState(false);

  // Audio recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const inputHeightAnim = useRef(new Animated.Value(40)).current;

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    if (!recording) return;

    setRecording(null);
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      if (uri) {
        uploadAndSendAudio(uri);
      }
    } catch (error) {
      console.error('Error stopping recording', error);
    }
  }

  const uploadAndSendAudio = async (uri: string) => {
    if (!user2) return;
    setIsSending(true);
    try {
      const fileName = `audio_${Date.now()}.m4a`;
      const presignedUrl = await getPresignedUrl(fileName, SesionToken, TokenAuthApi);
      if (presignedUrl) {
        const uploadedUrl = await uploadToS3(uri, presignedUrl, 'audio/m4a');
        if (uploadedUrl) {
          await sendMessage(user2, data.idChat, uploadedUrl, "offline", "audio");
        }
      }
    } catch (error) {
      console.error("Error sending audio", error);
      Alert.alert("Error", "No se pudo enviar el audio");
    } finally {
      setIsSending(false);
    }
  };

  async function ValidateCall(detinationId: number, roomId: string) {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/validateCallAvailability`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "post",
        host,
        url,
        {
          customerSessionToken: SesionToken,
          destinationCustomerId: detinationId,
          roomId
        },
        header
      );

      // Extraer los datos relevantes de la respuesta parseada
      const { code, callId, remainingSeconds, message } = response;

      // Manejar la respuesta basada en el 'code' recibido
      switch (code) {
        case "00": // Éxito - Llamada permitida
          /* ToastCall("success", message || "Llamada permitida. Procediendo...", "ES"); */
          // Ejecutar el callback para proceder con la lógica de la llamada
          /*  if (proceedWithCallCallback && typeof proceedWithCallCallback === 'function') {
             proceedWithCallCallback({ callId, remainingSeconds, message });
           } */
          setRemainingSeconds(remainingSeconds)
          return { success: true, data: { callId, remainingSeconds, message } };

        case "12": // Cliente no tiene plan (200 OK según API)
          ToastCall("warning", message || "No tienes un plan activo para realizar llamadas.", "ES");
          navigation.navigate('SubscriptionScreen', { canBack: true }); // Reemplazar 'PurchasePlanScreen' con la ruta real
          return { success: false, error: { code, message: message || "Cliente no tiene plan." } };

        case "13": // Plan expirado (200 OK según API)
          ToastCall("warning", message || "Tu plan de llamadas ha expirado.", "ES");
          navigation.navigate('SubscriptionScreen', { canBack: true }); // Reemplazar 'RenewPlanScreen' con la ruta real
          return { success: false, error: { code, message: message || "Plan expirado." } };

        case "30": // No hay tiempo de llamada disponible (200 OK según API)
          ToastCall("warning", message || "No tienes suficientes minutos disponibles para esta llamada.", "ES");
          // Opcionalmente, podrías redirigir a una pantalla para comprar más minutos:
          // navigation.navigate('BuyMinutesScreen');
          return { success: false, error: { code, message: message || "No hay tiempo de llamada disponible." } };

        // --- Problemas de Autenticación ---
        case "18": // Formato de token inválido (API debería devolver 400 Bad Request)
        case "49": // Sesión no encontrada (API debería devolver 401 Unauthorized)
          const authErrorMessage = message || (code === "18" ? "Formato de token inválido." : "Sesión no encontrada o inválida.");
          ToastCall("error", `Problema de autenticación (${code}): ${authErrorMessage}`, "ES");
          // Considerar redirigir a la pantalla de Login si es apropiado
          // navigation.navigate('LoginScreen');
          return { success: false, error: { code, message: authErrorMessage } };

        // --- Errores del Sistema ---
        // El código "99" es usado para dos tipos de errores de servidor según la especificación.
        case "16": // Cliente destino no encontrado (API debería devolver 400 Bad Request)
        case "99": // Error en configuración del sistema o al guardar registro (API debería devolver 500 Server Error)
          let systemErrorMessage = message;
          if (!systemErrorMessage) {
            if (code === "16") systemErrorMessage = "El cliente destino no fue encontrado.";
            else if (code === "99") systemErrorMessage = "Error interno del servidor.";
            else systemErrorMessage = "Error desconocido del sistema.";
          }
          ToastCall("error", `Error del sistema (${code}): ${systemErrorMessage}`, "ES");
          return { success: false, error: { code, message: systemErrorMessage } };

        default:
          // Código de respuesta no reconocido o no manejado explícitamente
          const unexpectedMessage = message || `Código de respuesta no manejado: ${code}.`;
          console.warn("Respuesta de API no manejada:", response);
          ToastCall("error", unexpectedMessage, "ES");
          return { success: false, error: { code: code || 'UNKNOWN_API_CODE', message: unexpectedMessage } };
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setIsVideoCallLoading(false)
    }
  }

  const sendNewMessage = useCallback(async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);

    try {
      if (user && !user.plan) {
        // Validate phone
        if (user.phone) {
          const validation = validateMessageNoPhone(message.trim());
          if (!validation.isValid) {
            setIsAlert(true);
            setIsSending(false);
            return;
          }
        }

        // Validate email
        if (user.email) {
          const lowerUserEmail = user.email.toLowerCase();
          const emailRegex = /[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}/g;
          const emailMatches = message.match(emailRegex) || [];

          for (const emailMatch of emailMatches) {
            if (emailMatch.toLowerCase() === lowerUserEmail) {
              setIsAlert(true);
              setIsSending(false);
              return;
            }
          }
        }
      }

      if (user2) {
        await sendMessage(user2, data.idChat, message, "offline", "text");

        // Animate input height back to normal
        Animated.timing(inputHeightAnim, {
          toValue: 40,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }

      setMessage("");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  }, [user, user2, message, data, isSending]);

  // Handle input content size change
  const handleContentSizeChange = useCallback((event: any) => {
    const newHeight = Math.min(Math.max(40, event.nativeEvent.contentSize.height), 120);
    Animated.timing(inputHeightAnim, {
      toValue: newHeight,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, []);

  // Handle video call
  const handleVideoCall = useCallback(async () => {
    if (!user2 || isVideoCallLoading) return;

    setIsVideoCallLoading(true);

    try {
      Alert.alert("Videollamada", `¿Deseas iniciar una videollamada con ${user2.firstName?.split(" ")[0]}?`, [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setIsVideoCallLoading(false),
        },
        {
          text: "Llamar",
          onPress: async () => {
            try {
              // TODO: Integrate with your video calling service
              // Example: navigation.navigate("VideoCallScreen", { user: user2, chatId: data.idChat })
              const roomId = generateRoomName();
              const validate = await ValidateCall(user2.id, roomId)
              console.log(validate?.data, "validateCallData");
              if (validate?.success) {
                startCall(user2.id.toString(), roomId, user2, true, user2.firstName, user2.customerProfiles[0].link);
                navigation.navigate("OutgoingCall", { userToCall: user2, chatId: data.idChat });
                setIsVideoCallLoading(false);
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo iniciar la videollamada");
              setIsVideoCallLoading(false);
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo iniciar la videollamada");
      setIsVideoCallLoading(false);
    }
  }, [user2, isVideoCallLoading, data.idChat]);

  // Set up user data
  useLayoutEffect(() => {
    const user2Query = Customers.find((ele) => ele.id.toString() === data.idDestination.toString());
    const user2QueryMatch = Match
      ? Match.find((ele) => ele.id.toString() === data.idDestination.toString())
      : undefined;
    const user2CitaEnviada = CitasEnviadas.find(
      (ele) => ele.customerDestination.id.toString() === data.idDestination.toString()
    );
    const user2CitaRecibida = CitasRecibidas.find(
      (ele) => ele.customerSource.id.toString() === data.idDestination.toString()
    );

    if (user2CitaRecibida) {
      setUser2(user2CitaRecibida.customerSource as any);
    } else if (user2CitaEnviada) {
      setUser2(user2CitaEnviada.customerDestination as any);
    } else if (user2QueryMatch) {
      setUser2(user2QueryMatch);
    } else if (user2Query) {
      setUser2(user2Query as any);
    }

    // Simulate online status (you can replace this with real logic)

  }, []);

  useEffect(() => {
    if (!user2) return;
    const onValueChange = db()
      .ref(`/status/${user2.id}`)
      .on('value', snapshot => {
        console.log('User data: ', snapshot.val());
        console.log(user2.id);
        if (snapshot.val()) setIsOnline(snapshot.val().status === 'online');
      });

    // Stop listening for updates when no longer required
    return () => db().ref(`/users/${user2.id}`).off('value', onValueChange);
  }, [user2]);

  // Set up message listener
  useEffect(() => {
    setIsLoading(true);

    const subscribe = Platform.OS === 'web'
      ? onSnapshot(consultarMensajesChats(data.idChat) as any, (documentSnapshot) => {
        const res = documentSnapshot.docs.map((e) => e.data() as Mensaje);

        if (res.length > 0 && !res[res.length - 1].fecha) {
          const fecha = new Date();
          const fechaMoment = moment(fecha);

          const fechaObjeto = {
            nanoseconds: fechaMoment.millisecond() * 1000000,
            seconds: fechaMoment.unix(),
          };
          res[res.length - 1] = { ...res[res.length - 1], fecha: fechaObjeto };
        }

        setChatMessages(res.reverse());
        setIsLoading(false);
      })
      : consultarMensajesChats(data.idChat).onSnapshot((documentSnapshot) => {
        const res = documentSnapshot.docs.map((e) => e.data() as Mensaje);

        if (res.length > 0 && !res[res.length - 1].fecha) {
          const fecha = new Date();
          const fechaMoment = moment(fecha);

          const fechaObjeto = {
            nanoseconds: fechaMoment.millisecond() * 1000000,
            seconds: fechaMoment.unix(),
          };
          res[res.length - 1] = { ...res[res.length - 1], fecha: fechaObjeto };
        }

        setChatMessages(res.reverse());
        setIsLoading(false);
      });

    return () => {
      if (Platform.OS === 'web') {
        // @ts-ignore
        subscribe();
      } else {
        // @ts-ignore
        subscribe();
      }
    };
  }, []);

  // Handle chat seen status
  useEffect(() => {
    return () => {
      const chat = Chats.find((e) => e.idChat === data.idChat);
      if (!chat?.visto) {
        chatVisto(data.idChat);
      }
    };
  }, [isFocus]);

  useEffect(() => {
    setChatSee(data.idChat);
    return () => {
      setChatSee(undefined);
    };
  }, [isFocus]);

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="mt-4 text-gray-500" style={font.Regular}>
            Cargando conversación...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Enhanced Header */}
        <LinearGradient colors={[Colors.primary, `${Colors.primary}E6`]} className="px-4 py-3">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => navigation.navigate("Home", { screen: "Chat" })}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="arrow-left" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1 flex-row items-center justify-center">
              <Avatar
                size={36}
                avatarStyle={{ borderRadius: 18 }}
                onPress={() => {
                  if (user2) navigation.navigate("CustomerProfile", {
                    Customer: user2,
                    type: "Match"
                  });
                }}
                source={user2?.customerProfiles[0].link ? { uri: user2?.customerProfiles[0].link } : { uri: "" }}
              />
              <TouchableOpacity onPress={() => {
                if (user2) navigation.navigate("CustomerProfile", {
                  Customer: user2,
                  type: "Match"
                });
              }} className="ml-3">
                <Text className="text-white text-lg" style={font.Bold}>
                  {user2?.firstName?.split(" ")[0] || "Usuario"}
                </Text>
                {isOnline && (
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-green-400 rounded-full mr-1" />
                    <Text className="text-white/80 text-xs" style={font.Regular}>
                      En línea
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View className={`flex-row items-center space-x-3 ${isOnline ? "opacity-100" : "opacity-50"}`}>
              {/* Video Call Button */}
              <TouchableOpacity
                onPress={isOnline ? handleVideoCall : () => { }}
                disabled={isVideoCallLoading}
                activeOpacity={0.7}
                className="p-2"
              >
                {isVideoCallLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="videocam" size={24} color="white" />
                )}
              </TouchableOpacity>

              {/* Options Button */}
              <TouchableOpacity onPress={() => setIsVisible(true)} activeOpacity={0.7} className="p-2">
                <SimpleLineIcons name="options-vertical" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Messages Container */}
        <Animated.View
          style={{
            flex: 1,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="bg-gray-50"
        >
          {chatMessages.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={chatMessages}
              renderItem={({ item }) => <MessageComponent item={item} user={user} />}
              inverted
              keyExtractor={(item, index) => (item.mensajeId ? item.mensajeId : index.toString())}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-8">
              <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                <Ionicons name="chatbubbles-outline" size={32} color={Colors.primary} />
              </View>
              <Text className="text-lg text-gray-700 text-center mb-2" style={font.SemiBold}>
                ¡Inicia la conversación!
              </Text>
              <Text className="text-gray-500 text-center" style={font.Regular}>
                Envía tu primer mensaje a {user2?.firstName?.split(" ")[0]}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Enhanced Input Area */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          {isRecording ? (
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2" />
                <Text style={font.SemiBold} className="text-red-500">Grabando audio...</Text>
              </View>
              <TouchableOpacity
                onPress={stopRecording}
                className="bg-primary px-4 py-2 rounded-full"
              >
                <Text style={font.Bold} className="text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-end space-x-3">
              {/* Message Input */}
              <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                <Animated.View style={{ height: inputHeightAnim }}>
                  <TextInput
                    ref={textInputRef}
                    className="text-base text-gray-800"
                    style={[font.Regular, { textAlignVertical: "top" }]}
                    placeholder="Escribe un mensaje..."
                    placeholderTextColor="#9CA3AF"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    maxLength={500}
                    onContentSizeChange={handleContentSizeChange}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                  />
                </Animated.View>
              </View>

              {/* Send Button or Mic */}
              <TouchableOpacity
                onPress={message.trim() ? sendNewMessage : startRecording}
                disabled={isSending}
                activeOpacity={0.7}
                className={`w-12 h-12 rounded-full items-center justify-center ${message.trim() || !isRecording ? "bg-primary" : "bg-gray-300"}`}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : message.trim() ? (
                  <Ionicons name="send" size={20} color="white" />
                ) : (
                  <Ionicons name="mic" size={24} color="white" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Character Counter */}
          {message.length > 400 && (
            <Text className="text-xs text-gray-400 mt-1 text-right" style={font.Regular}>
              {message.length}/500
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <OptionsBaseCustomers active={isVisible} setActive={setIsVisible} data={{ idDestino: data.idDestination }} />

      <DialogMessageAlertSub
        navigation={navigation}
        active={isAlert}
        setActive={setIsAlert}
        message="Para compartir tu teléfono o correo por el chat, suscríbete y únete a la comunidad de Chanceros."
      />
    </SafeAreaView>
  );
};

export default MessagingScreen;

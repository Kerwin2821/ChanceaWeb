import { AntDesign, Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabNavigationProp, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Colors } from "../utils";
import Svg, { Mask, Path, G } from "react-native-svg";
import HomeScreen from "../screens/BottomBar/HomeScreen";
import ChatScreen from "../screens/BottomBar/ChatScreen";
import MatchScreen from "../screens/BottomBar/MatchScreen";
import ProfileScreen from "../screens/BottomBar/ProfileScreen";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "../context/ChatContext/ChatProvider";
import { useAuth, useRender } from "../context";
import { Chats, ChatsStorage } from "../context/ChatContext/ChatInterface";
import { useStore } from "../context/storeContext/StoreState";
import CopilotStepComponent from "../components/CopilotStep/CopilotStepComponent";
import { AppState, Platform, View } from "react-native";
import { manageChats } from "../services/ChatsAsyncStorage";
import { useNavigation } from "@react-navigation/native";
import { onSnapshot } from "firebase/firestore";
import { NavigationScreenNavigationType } from "./StackNavigator";
import DateScreen from "../screens/Citas/DateScreen";
import RegaloScreen from "../screens/Regalos/RegaloScreen";
import { useOrdenStore } from "../context/OrderContext/useOrder";
import NotificationCallService from "../services/NotificationCallService";
import { useCall } from "../context/CallContext/CallProvider";

export type BottomTabNavigationType = BottomTabNavigationProp<BottomTabStackParamList>;

export type BottomTabStackParamList = {
  Init: any;
  MisCupones: any;
  Profile: any;
  Chat: any;
  Promotions: any;
  Megustas: any;
  Dates: any;
  RegaloScreen: any;
};

// Navegador Bottom Tabs Navigator
const Tab = createBottomTabNavigator<BottomTabStackParamList>();
function BottomTab() {
  const { consultarChatsUsuario, Chats, setChats, ChatSee, } = useChat();
  const { setupFirebaseListeners, handleIncomingCall } = useCall();
  const { user, customerBlockList, deviceId } = useAuth();
  const { Match, CitasEnviadas, CitasRecibidas } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const appState = useRef(AppState.currentState);
  const { HandlerOrden } = useOrdenStore();

  const { incomingCall, onIncomingCall, navigateToIncomingCall } = useCall()

  // Efecto para manejar llamadas entrantes existentes
  useEffect(() => {
    if (incomingCall) {
      console.log("Llamada entrante detectada en CallHandler:", incomingCall.callId)
      console.log(incomingCall, "PRUEb")
      navigateToIncomingCall(incomingCall, navigation.navigate)
    }
  }, [incomingCall, navigateToIncomingCall, navigation])


  // Efecto para escuchar nuevas llamadas entrantes
  useEffect(() => {
    // Registrar listener para llamadas entrantes
    const unsubscribe = onIncomingCall((callData) => {
      console.log("Nueva llamada entrante detectada en listener:", callData.callId)
      navigateToIncomingCall(callData, navigation.navigate)
    })

    // Limpiar listener al desmontar
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
  }, [onIncomingCall, navigateToIncomingCall, navigation])

  // Optimizado: Cálculo de chats no vistos
  const ChatsNosee = useMemo(() => countUnseenChats(Chats), [Chats]);


  useEffect(() => {
    if (!user) return;

    const subscribe = Platform.OS === 'web'
      ? onSnapshot(consultarChatsUsuario() as any, (documentSnapshot) => {
        const processedChats = documentSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const userId = data.infoUser.userId.toString();

            // Si Match es undefined o null, no procesamos este documento
            if (!Match) return null;

            // Buscar la imagen de perfil
            const picture = findProfilePicture(userId, Match, CitasEnviadas, CitasRecibidas);

            // Devolver el objeto con la imagen si se encontró
            return {
              ...data,
              picture: picture || data.picture, // Usar la imagen encontrada o mantener la original
            } as Chats;
          })
          .filter((chat): chat is Chats => {
            // Filtrar nulls y verificar si el usuario existe en las listas
            if (!chat) return false;

            const userId = chat.infoUser.userId.toString();
            return userExistsInLists(userId, Match, CitasEnviadas, CitasRecibidas, customerBlockList);
          });

        setChats(processedChats);
      })
      : consultarChatsUsuario().onSnapshot((documentSnapshot) => {
        const processedChats = documentSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const userId = data.infoUser.userId.toString();

            // Si Match es undefined o null, no procesamos este documento
            if (!Match) return null;

            // Buscar la imagen de perfil
            const picture = findProfilePicture(userId, Match, CitasEnviadas, CitasRecibidas);

            // Devolver el objeto con la imagen si se encontró
            return {
              ...data,
              picture: picture || data.picture, // Usar la imagen encontrada o mantener la original
            } as Chats;
          })
          .filter((chat): chat is Chats => {
            // Filtrar nulls y verificar si el usuario existe en las listas
            if (!chat) return false;

            const userId = chat.infoUser.userId.toString();
            return userExistsInLists(userId, Match, CitasEnviadas, CitasRecibidas, customerBlockList);
          });

        setChats(processedChats);
      });

    return subscribe; // Cleanup function
  }, [Match, user, CitasEnviadas, CitasRecibidas, customerBlockList]);


  const handleAppStateChange = (nextAppState: any) => {
    if (appState.current.match(/inactive|background/) && nextAppState === "active") {
      //"App ha vuelto al primer plano!"
      HandlerOrden(navigation);
    } else if (nextAppState.match(/inactive|background/)) {
      //"App ha pasado a segundo plano!"
    }
    appState.current = nextAppState;
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);



  console.log(navigation.getState().routes, "Navegación actual");

  /* useEffect(() => {
    if (Chats.length) {
      manageChats(Chats as ChatsStorage[], navigation, ChatSee)
    }
  }, [Chats, navigation, ChatSee])
 */
  return (
    <Tab.Navigator
      initialRouteName="Init"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.graySemiDark,
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="Init"
        component={HomeScreen}
        options={{
          lazy: false,
          tabBarIcon: ({ color, focused, size }) => (
            <CopilotStepComponent message="Aquí podrás elegir a tus cuadres" step={10} name="Inicio">
              <ChanceaIcon size={size} color={color} focused={focused} />
            </CopilotStepComponent>
          ),
        }}
      />
      {/*  <Tab.Screen
        name="Promotions"
        component={Promotions}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="card-search" size={size} color={color}/>
        }}
      /> */}
      <Tab.Screen
        name="Megustas"
        component={MatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CopilotStepComponent message="Aquí puedes ver tus cuadres y a quien le gustaste" step={11} name="Megustas">
              <AntDesign name="star" size={size} color={color} />
            </CopilotStepComponent>
          ),
        }}
      />

      <Tab.Screen
        name="Dates"
        component={DateScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CopilotStepComponent message="Aquí puedes ver tus cuadres y a quien le gustaste" step={12} name="Megustas">
              <MaterialCommunityIcons name="calendar-heart" size={size} color={color} />
            </CopilotStepComponent>
          ),
        }}
      />
      <Tab.Screen
        name="RegaloScreen"
        component={RegaloScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="hand-holding-heart" size={size - 2} color={color} />,
        }}
      />

      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CopilotStepComponent message="Aquí puedes ver tus chats con tus cuadres." step={13} name="Chats">
              <Ionicons name="chatbubbles" size={size} color={color} />
            </CopilotStepComponent>
          ),
          tabBarBadge: ChatsNosee,
          tabBarBadgeStyle: { backgroundColor: Colors.primary, color: "white" },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <CopilotStepComponent message="Aquí puedes ver tu perfil y editar tus datos." step={14} name="Perfil">
              <FontAwesome5 name="user-alt" size={size} color={color} />
            </CopilotStepComponent>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ChanceaIcon({ focused, ...props }: any) {
  return (
    <Svg
      width={props.size * 2}
      height={props.size}
      viewBox="0 0 135 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Mask id="a" maskUnits="userSpaceOnUse" x={0} y={0} width={135} height={135}>
        <Path d="M.086.333H134.16V134.36H.086V.333z" fill={focused ? Colors.primary : Colors.graySemiDark} />
      </Mask>
      <G mask="url(#a)">
        <Path
          d="M133.988 67.417c0 36.97-29.972 66.942-66.944 66.942-36.97 0-66.942-29.968-66.942-66.942C.102 30.445 30.074.473 67.044.473c36.972 0 66.944 29.972 66.944 66.944z"
          fill={focused ? Colors.primary : Colors.graySemiDark}
        />
      </G>
      <Path
        d="M37.292 15.35c-9.595 0-20.942-9.172-24.493-12.697a7.432 7.432 0 00-8.104-1.61A7.43 7.43 0 00.102 7.91c0 12.865 6.218 37.19 29.752 37.19a7.44 7.44 0 006.653-4.112l7.438-14.876a7.436 7.436 0 00-6.653-10.763zm92.106-14.308a7.423 7.423 0 00-8.108 1.615c-3.295 3.29-14.865 12.693-24.494 12.693a7.431 7.431 0 00-6.325 3.529 7.453 7.453 0 00-.328 7.237l7.439 14.877a7.44 7.44 0 006.653 4.109c23.534 0 29.753-24.326 29.753-37.19a7.432 7.432 0 00-4.59-6.87z"
        fill={focused ? Colors.primary : Colors.graySemiDark}
      />
      <Path
        d="M101.762 95.79a1.862 1.862 0 00-2.361-.109c-.146.109-14.587 10.786-32.357 10.786-17.724 0-32.214-10.677-32.355-10.785a1.872 1.872 0 00-2.362.108 1.86 1.86 0 00-.35 2.335c.48.8 11.964 19.499 35.067 19.499s34.591-18.7 35.068-19.5a1.856 1.856 0 00-.35-2.334zM58.517 68.507C46.412 56.4 26.957 56.259 26.135 56.259a3.714 3.714 0 00-3.715 3.712 3.72 3.72 0 003.711 3.727c.108 0 7.16.081 14.813 2.74-2.205 2.38-3.652 6.077-3.652 10.276 0 7.193 4.162 13.017 9.298 13.017s9.297-5.824 9.297-13.016c0-.648-.07-1.265-.137-1.886.048 0 .093.026.137.026a3.71 3.71 0 002.63-1.09 3.716 3.716 0 000-5.258zm49.437-12.248c-.822 0-20.272.142-32.381 12.248a3.714 3.714 0 000 5.258 3.709 3.709 0 002.629 1.09c.048 0 .088-.026.134-.026-.06.621-.134 1.238-.134 1.886 0 7.192 4.162 13.016 9.298 13.016s9.296-5.824 9.296-13.016c0-4.2-1.445-7.897-3.651-10.276 7.653-2.66 14.705-2.741 14.817-2.741a3.719 3.719 0 003.707-3.727 3.716 3.716 0 00-3.715-3.712z"
        fill="#553986"
      />
    </Svg>
  );
}
export default BottomTab;

// Función auxiliar para encontrar la imagen de perfil
export const findProfilePicture = (
  userId: string,
  match: any[] | undefined,
  citasEnviadas: any[],
  citasRecibidas: any[]
): string | undefined => {
  // Buscar en Match
  const matchItem = match?.find((ele) => ele.id.toString() === userId);
  if (matchItem?.customerProfiles?.[0]?.link) {
    return matchItem.customerProfiles[0].link;
  }

  // Buscar en CitasEnviadas
  const citaEnviada = citasEnviadas.find((ele) => ele.customerDestination.id.toString() === userId);
  if (citaEnviada?.customerDestination?.customerProfiles?.[0]?.link) {
    return citaEnviada.customerDestination.customerProfiles[0].link;
  }

  // Buscar en CitasRecibidas
  const citaRecibida = citasRecibidas.find((ele) => ele.customerSource.id.toString() === userId);
  if (citaRecibida?.customerSource?.customerProfiles?.[0]?.link) {
    return citaRecibida.customerSource.customerProfiles[0].link;
  }

  return undefined;
};

// Función para verificar si un usuario existe en alguna de las listas
export const userExistsInLists = (
  userId: string,
  match: any[] | undefined,
  citasEnviadas: any[],
  citasRecibidas: any[],
  blockList: any[]
): boolean => {
  const existsInMatch = match?.some((e) => e.id.toString() === userId) ?? false;
  const existsInCitasEnviadas = citasEnviadas.some((e) => e.customerDestination.id.toString() === userId);
  const existsInCitasRecibidas = citasRecibidas.some((e) => e.customerSource.id.toString() === userId);
  const existsInBlockList = blockList.some((e) => e.customerDestination.id.toString() === userId);

  return (existsInMatch || existsInCitasEnviadas || existsInCitasRecibidas) && !existsInBlockList;
};

// Función para contar chats no vistos
export const countUnseenChats = (chats: Chats[]): number | undefined => {
  const count = chats.reduce((total, { visto }) => (!visto ? total + 1 : total), 0);
  return count > 0 ? count : undefined;
};

import { useState, useEffect, useContext, PropsWithChildren } from "react";
import AuthContext from "./AuthContext";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Coodernadas, CustomerBlackList, Plan, PreferenceFind, UserData, statusConection } from "./AuthInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStore } from "../storeContext/StoreState";
import db from "@react-native-firebase/database";
import { AppState } from "react-native";
import { GetHeader, ToastCall } from "../../utils/Helpers";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { clearBlackList, clearCitasEnviadasS, clearCitasRecibidasS, HttpError, HttpService, WholikemeClearAllUsers } from "../../services";
import { environmet } from "../../../env";
import { deleteSesionToken } from "../../services/AsyncStorageMethods";
import { clearChats } from "../../services/ChatsAsyncStorage";
import { clearMatchs } from "../../services/MatchsAsyncStorage";
// import { useChat } from "../ChatContext/ChatProvider";
import { clearOrden } from "../../services/CacheStorage/Orden/OrdenStorage";

GoogleSignin.configure({
  webClientId: "802445280653-4i7daas8rrnnfv0erilf67p19hrt5r2q.apps.googleusercontent.com",
});

export const AuthProvider = (props: PropsWithChildren) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [customerBlockList, setCustomerBlockList] = useState<CustomerBlackList[]>([]);
  const [PreferenceFindUser, setPreferenceFindUser] = useState<PreferenceFind | null>(null);
  const [TokenAuthApi, setTokenAuthApi] = useState<string>("");
  const [SesionToken, setSesionToken] = useState<string>("");
  const { setCustomers } = useStore();
  const [deviceId, setDeviceId] = useState<string>("");
  const [DataCoordenadas, setDataCoordenadas] = useState<Coodernadas>({
    coords: { latitude: 0, longitude: 0 },
  });
  const { WhoLikeMeList, setWhoLikeMeList, Match, setMatch } = useStore();
  // const { setChats, setChatSee, } = useChat();
  const [DataStatus, setDataStatus] = useState<statusConection>({ status: "online", timestamp: 0 });
  const [IsConnected, setIsConnected] = useState<boolean>(false);
  const [IsUpdate, setIsUpdate] = useState<boolean>(false);
  const [aState, setAppState] = useState(AppState.currentState);

  const singInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      return (userInfo as any).data;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        /* ToastCall("warning", "Inicio de sesion cancelado", "ES");
        return; */
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        ToastCall("error", "Inicio de sesion en progreso, espere un poco", "ES");
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        ToastCall("error", "no tienes el servicio de Google", "ES");
        return;
      } else {
        // some other error happened
        ToastCall("error", `Error: ${error.message || JSON.stringify(error)}`, "ES");
        const host = process.env.APP_BASE_API;
        console.log("Google Sign-In Error:", JSON.stringify(error));
        const header = await GetHeader(TokenAuthApi, "application/json");
        const url2 = `/api/appchancea/messages/saveMessage/${JSON.stringify(error)}`;
        await HttpService("get", host, url2, {}, header);
        return;
      }
    }
  };

  const logOut = async () => {
    if (user)
      db().ref(`status/${user.id}`).update({ status: "offline", timestamp: new Date().toISOString() });
    // Clear storage FIRST
    await AsyncStorage.removeItem("Sesion");
    await AsyncStorage.removeItem("SesionGoogle");
    await AsyncStorage.removeItem("SesionToken");

    // Check for window directly (more robust for web)
    if (typeof window !== 'undefined') {
      console.log("LOGOUT: Web detected via window check.");

      // Clear both localStorage and sessionStorage
      window.localStorage.removeItem('Sesion');
      window.localStorage.removeItem('SesionGoogle');
      window.localStorage.removeItem('SesionToken');
      window.sessionStorage.removeItem('Sesion'); // Just in case

      window.location.hash = '';

      // Aggressive loop cleanup
      Object.keys(window.localStorage).forEach(key => {
        if (key.includes('Sesion')) window.localStorage.removeItem(key);
      });

      // Redirect to clean origin (drops tokens in URL)
      window.location.href = window.location.origin;
      return;
    }
    await clearMatchs();
    await clearChats()
    await deleteSesionToken()
    await WholikemeClearAllUsers()
    await clearBlackList()
    await clearCitasEnviadasS()
    await clearCitasRecibidasS()
    await clearOrden()
    setMatch([])
    setWhoLikeMeList([])
    /* setChatSee(undefined)
    setChats([]) */
    const isSignedIn = await GoogleSignin.isSignedIn();
    setCustomers([]);
    if (isSignedIn) {
      GoogleSignin.signOut();
    }
  };
  useEffect(() => {
    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });
    (async () => {
      const location = await AsyncStorage.getItem("location");
      if (location) setDataCoordenadas(JSON.parse(location));
      const deviceIdST = await AsyncStorage.getItem("deviceId");
      if (deviceIdST) setDeviceId(deviceIdST);
    })();
    return () => {
      appStateListener?.remove();
    };
  }, []);

  const getPresence = async (uid: string | number) => {
    return db()
      .ref(`status/${uid}`)
      .once("value" as any)
      .then((snapshot: any) => {
        console.log("User data: ", snapshot.val());
      });
  };

  useEffect(() => {
    console.log(aState);
    let reference: any;
    if (user) {
      getPresence(user.id);
      reference = db().ref(`status/${user.id}`);
      if (aState === "active") {
        reference.update({ status: "online", timestamp: db().getServerTime().toISOString() });
      }
      if (aState === "background") {
        reference.update({ status: "offline", timestamp: db().getServerTime().toISOString() });
      }
    }

    return () => {
      if (reference) {
        console.log("offline2");
        reference.onDisconnect().update({ status: "offline", timestamp: db().getServerTime().toISOString() });
      }
    };
  }, [aState, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        singInWithGoogle,
        logOut,
        TokenAuthApi,
        setTokenAuthApi,
        PreferenceFindUser,
        setPreferenceFindUser,
        deviceId,
        setDeviceId,
        DataCoordenadas,
        setDataCoordenadas,
        IsConnected,
        setIsConnected,
        customerBlockList, setCustomerBlockList,
        IsUpdate, setIsUpdate,
        SesionToken, setSesionToken
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}

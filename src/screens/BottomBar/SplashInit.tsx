import { View, StyleSheet, Animated, Platform, ActivityIndicator } from "react-native";
import { useRender } from "../../context/renderContext/RenderState";
import LottieView from "lottie-react-native";
import animation from "../../../assets/animation.json";
import { useEffect, useRef, useState } from "react";
import { Easing } from "react-native-reanimated";
import { Image } from "expo-image";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import { Colors } from "../../utils";
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../context";
import dataExpo from "../../../app.json";
import {
  HttpService,
  saveBlackListUsers,
  setCitasEnviadasS,
  setCitasRecibidasS,
  WholikemeSaveUsers,
} from "../../services";
import { CustomersHome } from "../../utils/Interface";
import { useStore } from "../../context/storeContext/StoreState";
import { AxiosError } from "axios";
import * as Location from "expo-location";
import { ResponsePreferenceFind } from "../Complements/PreferenceScreen";
import { useChat } from "../../context/ChatContext/ChatProvider";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { clearChats } from "../../services/ChatsAsyncStorage";
import { getPreference, savePreference } from "../../services/PreferenceAsyncStorage";
import { manageMatchsLocal } from "../../services/MatchsAsyncStorage";
import { getSesionToken } from "../../services/AsyncStorageMethods";
import { Cita } from "../../utils/Date.interface";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserData } from "../../context/AuthContext/AuthInterface";
import useGradualFetch from "../../components/CacheImageCard/useGradualFetch";
import { useImageCacheStore } from "../../context/ImageCacheHook/imageCacheStore";
import {
  clearCustomerProfilesStorage,
  getCustomerProfilesStorage,
  saveCustomerProfilesStorage,
} from "../../services/CacheStorage/CustomerProfiles/CustomerProfileStorage";
import { prefetchImage, prefetchImage2 } from "../../components/CacheImageCard/CacheImageService";
import { getAdsStorage, saveAdsStorage } from "../../services/CacheStorage/Ads/AdvertisementsStorage";
import useGradualFetchAds from "../../services/CacheStorage/Ads/useGradualFetchAds";
import { Advertisements } from "./Promotions";
import OnboardingValidate from "../../utils/OnboardingValidate";
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness";
import { SesionBusiness } from "../../context/AuthBusinessHooks/AuthBusinessHooksInterface";
import { PaquetesResponse, Stores } from "../../context/storeBusinessHooks/StoreBusinessInterface";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
const AnimatedLottieView = Animated.createAnimatedComponent(LottieView);

const SplashInit = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const {
    setPreferenceFindUser,
    setUser,
    TokenAuthApi,
    setTokenAuthApi,
    setCustomerBlockList,
    user,
    DataCoordenadas,
    logOut,
    setSesionToken,
    SesionToken,
  } = useAuth();
  const { setCustomers, setCustomers2, setMatch, setWhoLikeMeList, setCitasRecibidas, setCitasEnviadas, setPlans } =
    useStore();
  const { UpdateShow, setUpdateShow, DataAds, setDataAds } = useRender();
  const { consultarChatsUsuario, setChats } = useChat();
  const animationProgress = useRef(new Animated.Value(0));
  const [CanNextScreen, setCanNextScreen] = useState(true);
  const isFocus = useIsFocused();
  const [Ready, setReady] = useState(false);
  const { setImageCache } = useImageCacheStore();
  const { setStores, setPaquetes, setProductos } = useStoreBusiness();
  const { setSesionBusiness, sesionBusiness, } = useSesionBusinessStore();

  useEffect(() => {
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 1500, // Reduced from 5000
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, []);

  const animationCode = Animated.loop(
    Animated.timing(animationProgress.current, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
      useNativeDriver: false,
    }),
    {
      iterations: 1000,
    }
  );
  const GetTokenAPI = async () => {
    try {
      const username = process.env.AUTH_API_USERNAME;
      const password = process.env.AUTH_API_PASSWORD;
      const host = process.env.APP_BASE_API;
      const url = "/api/authenticate";
      const req = { username, password };
      const response = await HttpService("post", host, url, req);
      if (response) {
        console.log(response.id_token);
        setTokenAuthApi(response.id_token);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
    }
  };


  async function GetBlockList() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/blocked-customers/${SesionToken}?customerSourceId.equals=${user?.id}&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header);
      setCustomerBlockList(response);
      await saveBlackListUsers(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }

  async function GetIntereses() {
    const sesion = await AsyncStorage.getItem("Sesion");
    if (sesion) {
      try {
        const host = process.env.APP_BASE_API;
        const url = `/api/appchancea/listOrderLocatorFormal2/${SesionToken}?page=0&size=100`;
        const header = await GetHeader(TokenAuthApi, "application/json");
        const response: CustomersHome[] = await HttpService("get", host, url, {}, header);

        setCustomers(response);
        setCustomers2(response);
        const CacheImage = await getCustomerProfilesStorage();
        console.log(CacheImage, "CacheImage");
        setImageCache(CacheImage);
        const gradual = await useGradualFetch(response, CacheImage, setImageCache);
        await saveCustomerProfilesStorage(gradual);
        return;
      } catch (err) {
        const errors = err as AxiosError;
        console.log(errors);
      }
    }
  }
  async function GetPlans() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/plans/${SesionToken}?page=0&size=20`;
      const header = GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header);

      setPlans(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }

  async function GetPreference() {
    try {
      const data = await getPreference();
      if (data) {
        setPreferenceFindUser(data);
        return;
      }
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/preference-finds-by-customer/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ResponsePreferenceFind = await HttpService("get", host, url, {}, header);
      console.log(response);
      setPreferenceFindUser(response.preferenceFind);
      savePreference(response.preferenceFind);
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }

  async function GetAds() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/advertisements?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: Advertisements[] = await HttpService("get", host, url, {}, header);
      console.log(response, "GetAds");

      const CacheImage = await getAdsStorage();
      const gradual = await useGradualFetchAds(response, CacheImage);
      saveAdsStorage(gradual);

      console.log(gradual, "ads123");

      setDataAds(
        response.map((e) => {
          if (gradual[e.advertisementUrl]) {
            console.log(gradual[e.advertisementUrl]);
            return { ...e, advertisementUrl: gradual[e.advertisementUrl].base64 };
          }

          return e;
        })
      );
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }
  async function GetMatch() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: MatchResponse = await HttpService("get", host, url, {}, header);

      if (response.codigoRespuesta == "00") {
        setMatch(response.customers);
      }
    } catch (err: any) {
      setMatch([]);
      console.error(JSON.stringify(err));
    }
  }
  async function GetUpdateLastEnter() {
    try {
      console.log("me ejecute");
      const LocationPermisson = await AsyncStorage.getItem("LocationPermissonData");
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/last-enter-event`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      console.log(LocationPermisson, "me ejecute");
      if (LocationPermisson) {
        console.log("valide");
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).then(async (position) => {
          await AsyncStorage.setItem("location", JSON.stringify(position));
          await HttpService(
            "put",
            host,
            url,
            {
              postionX: position.coords.longitude,
              postionY: position.coords.latitude,
              customerDevice: Platform.OS === "ios" ? 2 : 1,
              sessionToken: SesionToken,
            },
            header
          );
        }).catch(err => {
          console.error("Location error in SplashInit:", err);
          // Continue without updating location
        });
      }
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }

  async function GetWhoLikeMeList() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/get-who-like-me/${SesionToken}?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: MatchResponse = await HttpService("get", host, url, {}, header);

      if (response.codigoRespuesta == "00") {
        setWhoLikeMeList(response.customers);
        WholikemeSaveUsers(response.customers);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  /*  async function UpdateLocation() {
    const LocationPermisson = await AsyncStorage.getItem("LocationPermissonData");

      if (LocationPermisson) {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        await AsyncStorage.setItem("location", JSON.stringify(position));
        const host = process.env.APP_BASE_API;
        await HttpService(
          "put",
          host,
          url,
          { 
            postionX: position.coords.longitude, 
            postionY: position.coords.latitude 
          },
          header
        );
      } else {
        await HttpService("put", host, url, {}, header);
      }
    } catch (error) {}
  }
 */
  async function GetCitasDestination() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/invitations/${SesionToken}?customerDestinationId.equals=${user?.id}&page=0&size=1000&sort=id%2Cdesc`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const responseCitaRecibidas: Cita[] = await HttpService("get", host, url, {}, header);
      setCitasRecibidas(responseCitaRecibidas);
      setCitasRecibidasS(responseCitaRecibidas);
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "GetCitas");
    }
  }
  async function GetCitasSource() {
    try {
      const host = process.env.APP_BASE_API;
      const url2 = `/api/appchancea/invitations/${SesionToken}?customerSourceId.equals=${user?.id}&page=0&size=1000&sort=id%2Cdesc`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const responseCitaEnviadas: Cita[] = await HttpService("get", host, url2, {}, header);
      setCitasEnviadas(responseCitaEnviadas);
      setCitasEnviadasS(responseCitaEnviadas);
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "GetCitas");
    }
  }

  const RunFetchData = async () => {
    console.log("listo");
    await GetAds();
    if (user && SesionToken) {
      await GetMatch();
      await GetWhoLikeMeList();
      await GetCitasSource();
      await GetCitasDestination();
      await GetPreference();
      /* await new Promise(resolve => setTimeout(resolve, 2500)); */
      /* await clearChats(); */
      await GetPlans();
      await GetBlockList();
      await GetUpdateLastEnter();
      await GetIntereses();
      /* UpdateLocation(); */
      console.log("listo");
    }
    setReady(true);
    return;
  };

  useEffect(() => {
    if (TokenAuthApi) {
      console.log("listo");
      RunFetchData();
      return;
    }
  }, [TokenAuthApi, user, SesionToken]);

  async function getPaquetes() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/business/box-packages-list/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: PaquetesResponse = await HttpService("get", host, url, {}, header);

      setPaquetes(response.boxPackageSingles);

      /*  setCupones(response.sort((a, b) => (b.id - a.id ))); */
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
  const getProductos = async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/business/products/${SesionToken}?aditional1.equals=${sesionBusiness?.id}&statusProduct.equals=ACTIVO&page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header);

      setProductos(response);

    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }

  const RunFetchDataBusiness = async () => {
    console.log("listo");
    if (sesionBusiness && SesionToken) {
      await getPaquetes();
      await getProductos();
      console.log("listo");
    }
    setReady(true);
    return;
  };

  useEffect(() => {
    if (TokenAuthApi) {
      console.log("listo");
      RunFetchDataBusiness();
      return;
    }
  }, [TokenAuthApi, sesionBusiness, SesionToken]);

  useEffect(() => {
    if (!TokenAuthApi) {
      GetTokenAPI();
      return;
    }
  }, [TokenAuthApi]);

  useEffect(() => {
    animationCode.start();
  }, []);

  /* useEffect(() => {
    (async () => {
      await SplashScreen.hideAsync();
    })();
  }, []); */
  useEffect(() => {
    if (Ready) {
      (async () => {
        // FORCE LOGOUT CHECK (Web via URL Param)
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          const isLogout = url.searchParams.get('logout') === 'true';

          if (isLogout) {
            try {
              console.log("Forced Logout via URL detected. Clearing everything.");

              // Explicitly remove critical keys
              await AsyncStorage.removeItem('Sesion');
              await AsyncStorage.removeItem('SesionGoogle');
              window.localStorage.removeItem('Sesion');
              window.localStorage.removeItem('SesionGoogle');
              window.sessionStorage.removeItem('Sesion');

              await AsyncStorage.clear();
              window.localStorage.clear();
              window.sessionStorage.clear();

              // Restore firstTime so we go to Prelogin
              await AsyncStorage.setItem("firstTime", "true");
              window.localStorage.setItem("firstTime", "true");

              // Clean URL and redirect to origin to ensure NO tokens persist
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, document.title, window.location.origin);
              }

              navigation.navigate("Prelogin");
              return;
            } catch (e) {
              console.error("Error clearing storage", e);
              navigation.navigate("Prelogin");
              return;
            }
          }
        }

        // FORCE LOGOUT CHECK (Web)
        if (typeof window !== 'undefined') {
          const forceLogoutLocal = window.localStorage.getItem('FORCE_LOGOUT');
          const forceLogoutSession = window.sessionStorage.getItem('FORCE_LOGOUT');
          const forceLogout = forceLogoutLocal || forceLogoutSession;

          if (forceLogout === 'true' || forceLogout === 'processed') {
            try {
              console.log("Forced Logout detected. Clearing everything.");

              // Mark as processed
              window.localStorage.setItem('FORCE_LOGOUT', 'processed');
              window.sessionStorage.setItem('FORCE_LOGOUT', 'processed');

              // Explicitly remove critical keys
              await AsyncStorage.removeItem('Sesion');
              await AsyncStorage.removeItem('SesionGoogle');
              window.localStorage.removeItem('Sesion');
              window.localStorage.removeItem('SesionGoogle');
              window.sessionStorage.removeItem('Sesion');

              await AsyncStorage.clear();
              window.localStorage.clear();
              window.sessionStorage.clear();

              // Restore firstTime so we go to Prelogin
              await AsyncStorage.setItem("firstTime", "true");
              window.localStorage.setItem("firstTime", "true");

            } catch (e) {
              console.error("Error clearing storage", e);
            }

            navigation.navigate("Prelogin");
            return;
          }
        }


        const firstTime = await AsyncStorage.getItem("firstTime");
        if (Platform.OS === 'web') {
          // Debug code removed
        }

        // Session Re-hydration logic
        const rawSesion = await AsyncStorage.getItem("Sesion");
        // Web fallback: check localStorage directly if AsyncStorage is slow
        const sesion = rawSesion || (typeof window !== 'undefined' ? window.localStorage.getItem("Sesion") : null);

        const sesionBusiness = await AsyncStorage.getItem("SesionBusiness");
        const sesionToken = await getSesionToken();

        if (sesion) {
          if (sesionToken) setSesionToken(sesionToken);
          const userData = JSON.parse(sesion) as UserData;
          setUser(userData);

          // Reduced delay to improve UX
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const validate = await OnboardingValidate(userData, navigation, setUser, {
            longitude: DataCoordenadas?.coords?.longitude,
            latitude: DataCoordenadas?.coords?.latitude,
          });

          if (!validate) return;

          setTimeout(() => {
            navigation.navigate("Home");
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Home" }],
              })
            );
          }, 1000); // Reduced from 2500
          return;
        }
        if (sesionBusiness && sesionToken) {
          if (sesionToken) setSesionToken(sesionToken);
          const businessData = JSON.parse(sesionBusiness) as SesionBusiness;
          const host = process.env.APP_BASE_API;
          const url2 = `/api/appchancea/store-businesses?businessId.equals=${businessData.id}&page=0&size=20`;
          const header2 = await GetHeader(TokenAuthApi, "application/json");
          const response2: Stores[] = await HttpService("get", host, url2, {}, header2);
          setStores(response2);
          setSesionBusiness(businessData);

          setTimeout(() => {
            navigation.navigate("HomeBusiness");
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "HomeBusiness" }],
              })
            );
          }, 2500);
          return;
        }
        if (firstTime) {
          navigation.navigate("Prelogin");
        } else {
          navigation.navigate("Intro");
          await AsyncStorage.setItem("firstTime", "true");
        }


      })();
    }

    return;
  }, [Ready]);

  const MainContainer = Platform.OS === "web" ? View : SafeAreaView;

  return (
    <MainContainer style={{ flex: 1 }}>
      <View className="flex-1">
        <View className="justify-center items-center z-10" style={{ width: width, height: height }} >
          <View style={{ width: 240, height: 240, overflow: 'hidden' }}>
            <LottieView
              source={animation}
              autoPlay
              loop
              resizeMode="contain"
              style={{ height: '100%', width: '100%' }}
            />
          </View>
        </View>
        {/*  <Image
          className=" h-full w-full "
          style={{ width: width, height: height, position: "absolute", top: 0, left: 0 }}
          source={require("../../../assets/items/splashInit.png")}
          transition={{ duration: 300 }}
        /> */}
      </View>
    </MainContainer>
  );
};

export default SplashInit;

const style = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
});

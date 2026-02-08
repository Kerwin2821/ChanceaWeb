import { NativeStackNavigationProp, createNativeStackNavigator } from "@react-navigation/native-stack";
import { environmet } from "../../env";
import { useAuth } from "../context";
import { HttpService } from "../services";
import { ToastCall } from "../utils/Helpers";
import { useEffect, useState } from "react";
import PreferenceScreen from "../screens/Complements/PreferenceScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Register/RegisterScreen";
import RegisterScreen1 from "../screens/Register/RegisterScreen1";
import RegisterScreen2 from "../screens/Register/RegisterScreen2";
import BottomTab from "./BottomTab";
import RegisterScreen3 from "../screens/Register/RegisterScreen3";
import RegisterScreen4 from "../screens/Register/RegisterScreen4";
import RegisterScreen5 from "../screens/Register/RegisterScreen5";
import Prelogin from "../screens/Auth/Prelogin";
import AboutMe from "../screens/Onboarding/AboutMe";
import PhotoChange from "../screens/Onboarding/PhotoChange";
import InteresSelect from "../screens/Onboarding/InteresSelect";
import GoalsSelect from "../screens/Onboarding/GoalsSelect";
import MessaginScreen from "../screens/Complements/MessaginScreen";
import MatchModal from "../screens/Complements/MatchModal";
import CustomerProfile from "../screens/Complements/CustomerProfile";
import LocalizationPScreen from "../screens/PermisosScreen/LocalizationScreen";
import CamaraPermisos from "../screens/PermisosScreen/CamaraPermisos";
import NotificationPermisos from "../screens/PermisosScreen/NotificationPermisos";
import IntroScreen from "../screens/Complements/IntroScreen";
import PagoMovilPayment from "../screens/Complements/PagoMovilPayment";
import PiroposScreen from "../screens/Complements/PiroposScreen";
import SubscriptionScreen from "../screens/Complements/SubscriptionScreen";
import SubscriptionComplete from "../screens/Complements/SubscriptionComplete";
import NicknameScreen from "../screens/Onboarding/NicknameScreen";
import ValidateIdentification from "../screens/Onboarding/ValidateIdentification";
import SplashInit from "../screens/BottomBar/SplashInit";
import InfoValidateIdentification from "../screens/Onboarding/InfoValidateIdentification";
import ProfileOptions from "../screens/Complements/ProfileOptions";
import NotLikeScreen from "../screens/Complements/NotLikeScreen";
import ChangePasswordScreen from "../screens/recoverPassword/ChangePasswordScreen";
import ResetPasswordScreen from "../screens/recoverPassword/ResetPasswordScreen";
import ResetPassSuccessScreen from "../screens/recoverPassword/ResetPassSuccessScreen";
import MapasScreen from "../screens/Complements/MapasScrenn";
import SharedLocation from "../screens/Onboarding/SharedLocation";
import LikeScreen from "../screens/Complements/LikeScreen";
import TerminosCondicionesEULA from "../screens/PermisosScreen/TerminosCondicionesEULA";
import DateScreen from "../screens/Citas/DateScreen";
import DateDetalles from "../screens/Citas/DateDetalles";
import FormDate from "../screens/Citas/FormDate";
import MarketPaquetes from "../screens/Citas/MarketPaquetes";
import DetallesPackage from "../screens/Citas/DetallesPackage";
import PagoMovilPaymentCitas from "../screens/Citas/PagoMovilPaymentCitas";
import HomeScreen from "../screens/BottomBar/HomeScreen";
import DateTutorial from "../screens/Complements/DateTutorial";
import PaymentDateSuccess from "../screens/Citas/PaymentDateSuccess";
import RegaloScreen from "../screens/Regalos/RegaloScreen";
import RegalosDetalles from "../screens/Regalos/RegaloDetalles";
import FormRegalos from "../screens/Regalos/FormRegalos";
import MarketRegalos from "../screens/Regalos/MarketRegalos";
import PagoMovilPaymentRegalos from "../screens/Regalos/PagoMovilPaymentRegalos";
import PaymentRegalosSuccess from "../screens/Regalos/PaymentrRegaloSuccess";
import RegaloDetallesPackage from "../screens/Regalos/RegaloDetallesPackage";
import LoginBusinessScreen from "../screens/Auth/LoginBusinessScreen";
import BottomTabBusiness from "../navigationBusiness/BottomTabBusiness";
import RegisterNegociosScreen from "../screens/BusinessRegister/RegisterNegociosScreen";
import RegisterNegocios1Screen from "../screens/BusinessRegister/RegisterNegociosStep1";
import RegisterNegocios2Screen from "../screens/BusinessRegister/RegisterNegociosStep2";
import RegisterNegocios5Screen from "../screens/BusinessRegister/RegisterNegociosStep5";
import RegisterNegociosFinal from "../screens/BusinessRegister/RegisterNegociosFinal";
import WelcomeBussiness from "../screens/BussisnessOnboarding/WelcomeBussiness";
import RepresentanteForm from "../screens/BussisnessOnboarding/RepresentanteForm";
import LoadAssetsBusiness from "../screens/BussisnessOnboarding/LoadAssetsBusiness";
import CreateTienda from "../screens/BussisnessOnboarding/CreateTienda";
import ProductosBusinessScreen from "../screens/Bussiness/ProductosBusinessScreen";
import ProductImg from "../screens/BusinessComplements/Productos/ProductImg";
import ProductoCreateInit from "../screens/BusinessComplements/Productos/ProductoCreateInit";
import ProdutForm from "../screens/BusinessComplements/Productos/ProdutForm";
import PaqueteCreateInit from "../screens/BusinessComplements/Paquetes/PaqueteCreateInit";
import PaqueteForm from "../screens/BusinessComplements/Paquetes/PaqueteForm";
import PaqueteImg from "../screens/BusinessComplements/Paquetes/PaqueteImg";
import { NavigationStackParamList } from "./StackN.interface";
import PaqueteProductoSelect from "../screens/BusinessComplements/Paquetes/PaqueteProductoSelect";
import PaqueteShow from "../screens/BusinessComplements/Paquetes/PaqueteShow";
import DateDetallesBusiness from "../screens/BusinessComplements/DateDetallesBusiness";
import GiftDetallesBusiness from "../screens/BusinessComplements/GiftDetallesBusiness";
import ProfileOptionsBusiness from "../screens/BusinessComplements/ProfileOptionsBusiness";
import { useSesionBusinessStore } from "../context/AuthBusinessHooks/useAuthBusinessHooks";
import StoreShow from "../screens/BusinessComplements/TiendasCreate/StoreShow";
import StoreForm from "../screens/BusinessComplements/TiendasCreate/StoreForm";
import StoreUbication from "../screens/BusinessComplements/TiendasCreate/StoreUbication";
import StorePassword from "../screens/BusinessComplements/TiendasCreate/StorePassword";
import UpdateBusinessPassword from "../screens/BusinessComplements/UpdateBusinessPassword";
import UpdateBusinessProfile from "../screens/BusinessComplements/UpdateBusinessProfile";
import StoreListView from "../screens/BusinessComplements/StoreListView";
import ProductoShow from "../screens/BusinessComplements/Productos/ProductoShow";
import PaqueteStoreSelect from "../screens/BusinessComplements/Paquetes/PaqueteStoreSelect";
import StoreSelectionView from "../screens/Citas/StoreSelectionView";
import ChangePasswordBusinessScreen from "../screens/BusinessRecoverPassword/ChangePasswordBusinessScreen";
import ResetPasswordBusinessScreen from "../screens/BusinessRecoverPassword/ResetPasswordBusinessScreen";
import ResetPassBusinessSuccessScreen from "../screens/BusinessRecoverPassword/ResetPassBusinessSuccessScreen";
import ReceiptsScreen from "../screens/Complements/ReceiptsScreen";
import ReceiptDetailsScreen from "../screens/Complements/ReceiptDetailsScreen";
import BussinessSourceScreen from "../screens/BussisnessOnboarding/BussinessSourceScreen";
import CustomerSourceScreen from "../screens/Onboarding/CustomerSource";
import AppointmentRatingScreen from "../screens/Complements/AppointmentRatingScreen";
import CallScreen from "../screens/VideollamadaUsers/CallScreen";
import IncomingCallScreen from "../screens/VideollamadaUsers/IncomingCallScreen";
import OutgoingCallScreen from "../screens/VideollamadaUsers/OutgoingCallScreen";
import NotificationScreen from "../screens/Complements/NotificationScreen";
import UserShowProfile from "../screens/Complements/UserShowProfile";
import VideoEditorDemo from "../screens/Onboarding/VideoEditor";
import WhoLikeMeScreen from "../screens/Complements/WhoLikeMeScreen";

const Stack = createNativeStackNavigator<NavigationStackParamList>();
export type NavigationScreenNavigationType = NativeStackNavigationProp<NavigationStackParamList>;

const StackNavigator = () => {
  const { user, setUser, setTokenAuthApi } = useAuth();
  const { sesionBusiness } = useSesionBusinessStore();
  const [FT, setFT] = useState<boolean>(false);
  const [InitApp, setInitApp] = useState<keyof NavigationStackParamList | undefined>(undefined);
  const GetTokenAPI = async () => {
    try {
      const username = process.env.AUTH_API_USERNAME;
      const password = process.env.AUTH_API_PASSWORD;
      const host = process.env.APP_BASE_API;
      const url = "/api/authenticate";
      const req = { username, password };
      const response = await HttpService("post", host, url, req);
      if (response) {
        setTokenAuthApi(response.id_token);
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  };

  useEffect(() => {
    (async () => {
      /* const firstTime = await AsyncStorage.getItem('firstTime');
      const sesion = await AsyncStorage.getItem('Sesion');
      if (firstTime) {
        if(Platform.OS === "ios"){
          setInitApp('Login');
        }else{
          setInitApp('Prelogin');
        }
      } else {
        setInitApp('Intro');
        await AsyncStorage.setItem('firstTime', 'true');
      }
      if (sesion) {
        setInitApp('Home');
        setUser(JSON.parse(sesion));
      }*/
      setInitApp("SplashInit");
      /* setInitApp('Home'); */
      setTimeout(() => {
        setFT(true);
      }, 0);
    })();
  }, []);

  useEffect(() => {
    GetTokenAPI();
  }, []);

  if (!FT) {
    return <></>;
  }

  return (
    <Stack.Navigator initialRouteName={InitApp} screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="SplashInit" component={SplashInit} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LoginBusiness" component={LoginBusinessScreen} />
        <Stack.Screen name="Prelogin" component={Prelogin} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterScreen1" component={RegisterScreen1} />
        <Stack.Screen name="RegisterScreen2" component={RegisterScreen2} />
        <Stack.Screen name="RegisterScreen3" component={RegisterScreen3} />
        <Stack.Screen name="RegisterScreen4" component={RegisterScreen4} />
        <Stack.Screen name="RegisterScreen5" component={RegisterScreen5} />
        <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="ResetPassSuccessScreen" component={ResetPassSuccessScreen} />

        <Stack.Screen name="ChangePasswordBusinessScreen" component={ChangePasswordBusinessScreen} />
        <Stack.Screen name="ResetPasswordBusinessScreen" component={ResetPasswordBusinessScreen} />
        <Stack.Screen name="ResetPassBusinessSuccessScreen" component={ResetPassBusinessSuccessScreen} />

        <Stack.Screen name="RegisterNegocios" component={RegisterNegociosScreen} />
        <Stack.Screen name="RegisterNegocios1" component={RegisterNegocios1Screen} />
        <Stack.Screen name="RegisterNegocios2" component={RegisterNegocios2Screen} />
        <Stack.Screen name="RegisterNegocios5" component={RegisterNegocios5Screen} />
        <Stack.Screen name="RegisterNegociosFinal" component={RegisterNegociosFinal} />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name="LocalizationP" component={LocalizationPScreen} />
        <Stack.Screen name="CamaraPermisos" component={CamaraPermisos} />
        <Stack.Screen name="NotificationPermisos" component={NotificationPermisos} />
        <Stack.Screen name="TerminosCondicionesEULA" component={TerminosCondicionesEULA} />
      </Stack.Group>
       {user && (
        <Stack.Group>
          <Stack.Screen name="Home" component={BottomTab} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="PreferenceScreen" component={PreferenceScreen} />
          <Stack.Screen options={{ presentation: "transparentModal" }} name="MatchModal" component={MatchModal} />
          <Stack.Screen name="MessaginScreen" component={MessaginScreen} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
          <Stack.Screen name="CustomerProfile" component={CustomerProfile} />
          <Stack.Screen name="UserShowProfile" component={UserShowProfile} />
          <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
          <Stack.Screen name="SubscriptionComplete" component={SubscriptionComplete} />
          <Stack.Screen name="AboutMe" component={AboutMe} />
           <Stack.Screen name="PhotoChange" component={PhotoChange} />
          <Stack.Screen name="InterestSelect" component={InteresSelect} />
          <Stack.Screen name="Goals" component={GoalsSelect} />
          <Stack.Screen name="NicknameScreen" component={NicknameScreen} />
          <Stack.Screen name="SharedLocation" component={SharedLocation} />
          <Stack.Screen name="CustomerSource" component={CustomerSourceScreen} />
          <Stack.Screen name="PagoMovilPayment" component={PagoMovilPayment} />
          <Stack.Screen name="PiroposScreen" component={PiroposScreen} />
          <Stack.Screen name="ValidateIdentification" component={ValidateIdentification} />
          <Stack.Screen name="InfoValidateIdentification" component={InfoValidateIdentification} />
          <Stack.Screen name="ProfileOptions" component={ProfileOptions} />
          <Stack.Screen name="ReceiptsScreen" component={ReceiptsScreen} />
          <Stack.Screen name="ReceiptDetailsScreen" component={ReceiptDetailsScreen} />
          <Stack.Screen name="NotLikeScreen" component={NotLikeScreen} />
          <Stack.Screen name="LikeScreen" component={LikeScreen} />
          <Stack.Screen name="MapasScreen" component={MapasScreen} />
          <Stack.Screen name="DateScreen" component={DateScreen} />
          <Stack.Screen name="DateDetalles" component={DateDetalles} />
          <Stack.Screen name="FormDate" component={FormDate} />
          <Stack.Screen name="AppointmentRatingScreen" component={AppointmentRatingScreen} />
          <Stack.Screen name="MarketPaquetes" component={MarketPaquetes} />
          <Stack.Screen name="StoreSelectionView" component={StoreSelectionView} />
          <Stack.Screen name="DetallesPackage" component={DetallesPackage} />
          <Stack.Screen name="PagoMovilPaymentCitas" component={PagoMovilPaymentCitas} />
          <Stack.Screen name="DateTutorial" component={DateTutorial} />
          <Stack.Screen name="PaymentDateSuccess" component={PaymentDateSuccess} />
          <Stack.Screen name="VideoEditorDemo" component={VideoEditorDemo} />
          <Stack.Screen name="WhoLikeMeScreen" component={WhoLikeMeScreen} />
          {/* REGALOS */}
          <Stack.Screen name="RegalosScreen" component={RegaloScreen} />
          <Stack.Screen name="RegalosDetalles" component={RegalosDetalles} />
          <Stack.Screen name="FormRegalos" component={FormRegalos} />
          <Stack.Screen name="MarketRegalos" component={MarketRegalos} />
          <Stack.Screen name="RegaloDetallesPackage" component={RegaloDetallesPackage} />
          <Stack.Screen name="PagoMovilPaymentRegalos" component={PagoMovilPaymentRegalos} />
          {/* <Stack.Screen name="RegalosTutorial" component={RegalosTutorial} /> */}
          <Stack.Screen name="PaymentRegalosSuccess" component={PaymentRegalosSuccess} />
          {/* REGALOS */}
          {/* Videollamada*/}
          <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
          <Stack.Screen name="OutgoingCall" component={OutgoingCallScreen} />
          <Stack.Screen name="CallScreen" component={CallScreen} />
          {/* Videollamada*/}
          
        </Stack.Group>
      )}
       <Stack.Group>
        {/* INIT */}
        <Stack.Screen name="HomeBusiness" component={BottomTabBusiness} />
        <Stack.Screen name="WelcomeBusiness" component={WelcomeBussiness} />
        <Stack.Screen name="ProfileOptionsBusiness" component={ProfileOptionsBusiness} />
        {/* INIT */}
      </Stack.Group>
      {sesionBusiness && (
        <Stack.Group>
          {/* Onboarding */}
          <Stack.Screen name="RepForm" component={RepresentanteForm} />
          <Stack.Screen name="LoadAssetsBusiness" component={LoadAssetsBusiness} />
          <Stack.Screen name="CreateTienda" component={CreateTienda} />
          <Stack.Screen name="BussinessSourceScreen" component={BussinessSourceScreen} />
          {/* Onboarding */}
          {/* Complements */}
          <Stack.Screen name="DateDetallesBusiness" component={DateDetallesBusiness} />
          <Stack.Screen name="GiftDetallesBusiness" component={GiftDetallesBusiness} />
          <Stack.Screen name="UpdateBusinessPassword" component={UpdateBusinessPassword} />
          <Stack.Screen name="UpdateBusinessProfile" component={UpdateBusinessProfile} />
          <Stack.Screen name="StoreListView" component={StoreListView} />
          {/* Complements */}
          {/* Prods */}
          <Stack.Screen name="ProductosBusinessScreen" component={ProductosBusinessScreen} />
          <Stack.Screen name="ProductoCreateInit" component={ProductoCreateInit} />
          <Stack.Screen name="ProductImg" component={ProductImg} />
          <Stack.Screen name="ProdutForm" component={ProdutForm} />
          <Stack.Screen name="ProductoShow" component={ProductoShow} />
          {/* Prods */}
          {/* Paquetes */}
          
          {/* POR VERIFICAR */}
          
          <Stack.Screen name="PaqueteCreateInit" component={PaqueteCreateInit} />
           <Stack.Screen name="PaqueteForm" component={PaqueteForm} />
          <Stack.Screen name="PaqueteProductoSelect" component={PaqueteProductoSelect} />
          <Stack.Screen name="PaqueteStoreSelect" component={PaqueteStoreSelect} />
          <Stack.Screen name="PaqueteImg" component={PaqueteImg} />
          <Stack.Screen name="PaqueteShow" component={PaqueteShow} /> 
          {/* Paquetes */}
          <Stack.Screen name="StoreShow" component={StoreShow} />
          <Stack.Screen name="StoreForm" component={StoreForm} />
          <Stack.Screen name="StoreUbication" component={StoreUbication} />
          <Stack.Screen name="StorePassword" component={StorePassword} />
        </Stack.Group>
      )}

    </Stack.Navigator>
  );
};

export default StackNavigator;

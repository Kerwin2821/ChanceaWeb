import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import useAuth from "../../context/AuthContext/AuthProvider";
import Button from "../../components/ButtonComponent/Button";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../utils";
import LogotipoYLogoV from "../../components/imgSvg/LogotipoYLogoV";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRender } from "../../context";
import { decrypt, encrypt, fixAccents, GetHeader, ToastCall } from "../../utils/Helpers";
import { HttpError, HttpService, WholikemeSaveUsers } from "../../services";
import ScreenContainer from "../../components/ScreenContainer";
import { useStore } from "../../context/storeContext/StoreState";
import { statusCodes } from "@react-native-google-signin/google-signin";
import * as Location from "expo-location";
import { getUserData, saveSesionToken, saveUserData } from "../../services/AsyncStorageMethods";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { manageMatchsLocal } from "../../services/MatchsAsyncStorage";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { ResponseLogin } from "../../utils/Interface";
import DialogNoActualizado from "../../components/Dialog/DialogNoActualizado/DialogNoActualizado";
import OnboardingValidate from "../../utils/OnboardingValidate";
import { processObject } from "../../utils/CorregirTexto";
import * as AppleAuthentication from 'expo-apple-authentication';

const Prelogin = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const {
    TokenAuthApi,
    user,
    setUser,
    setDataCoordenadas,
    DataCoordenadas,
    singInWithGoogle,
    setSesionToken,
    setDeviceId,
  } = useAuth();
  const { setLoader, UpdateShow } = useRender();
  const { setWhoLikeMeList, setMatch } = useStore();
  const isFocus = useIsFocused();

  // Safety check: clear only volatile flags and stale sessions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('FORCE_LOGOUT');
      window.sessionStorage.removeItem('FORCE_LOGOUT');

      // If we land on Prelogin, verify if we have a "zombie" session
      const checkStale = async () => {
        const ses = await AsyncStorage.getItem("Sesion");
        // Only clear if we aren't at a redirect URL (avoid killing fresh login)
        if (ses && !window.location.href.includes('id_token=')) {
          console.log("Prelogin: Stale session detected without active login. Clearing.");
          await AsyncStorage.removeItem("Sesion");
          await AsyncStorage.removeItem("SesionGoogle");
          window.localStorage.removeItem("Sesion");
          window.localStorage.removeItem("SesionGoogle");
        }
      };
      checkStale();
    }
  }, []);

  const signIn = async () => {
    setLoader(true);

    setTimeout(() => {
      if (!user) {
        /* setLoader(false) */
      }
    }, 1000);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('FORCE_LOGOUT');
        window.sessionStorage.removeItem('FORCE_LOGOUT');
      }
      const userInfo = await singInWithGoogle();

      if (!userInfo) return;
      if (!process.env.ENCRYPTION_KEY) return;

      console.log(process.env.ENCRYPTION_KEY);
      const deviceId = await AsyncStorage.getItem("deviceId");

      const host = process.env.APP_BASE_API as string;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const url2 = Platform.OS === 'web' ? "/api/appchancea/customers/loginGoogleWeb" : "/api/appchancea/customers/loginGoogle";

      console.log({
        email: userInfo.user.email,
        token: userInfo.idToken,
        latitude: DataCoordenadas?.coords?.latitude?.toString(),
        logintude: DataCoordenadas?.coords?.longitude?.toString(),
        deviceId: deviceId ? deviceId : "N/A",
      });
      // EXPLICIT LOG FOR USER
      console.log("--> GOOGLE ID TOKEN:", userInfo.idToken);

      console.log({
        encryptedData: encrypt(
          JSON.stringify({
            email: userInfo.user.email,
            token: userInfo.idToken,
            latitude: DataCoordenadas?.coords?.latitude?.toString(),
            logintude: DataCoordenadas?.coords?.longitude?.toString(),
            deviceId: deviceId ? deviceId : "N/A",
          }),
          process.env.ENCRYPTION_KEY
        ),
      });

      const response2Encode = await HttpService(
        "post",
        host,
        url2,
        {
          encryptedData: encrypt(
            JSON.stringify({
              email: userInfo.user.email,
              token: userInfo.idToken,
              latitude: DataCoordenadas?.coords?.latitude?.toString(),
              logintude: DataCoordenadas?.coords?.longitude?.toString(),
              deviceId: deviceId ? deviceId : "N/A",
            }),
            process.env.ENCRYPTION_KEY
          ),
        },
        header
      );

      let response2 = JSON.parse(decrypt(response2Encode.encryptedData, process.env.ENCRYPTION_KEY)) as ResponseLogin;

      console.log(response2, "response2");

      if (response2.customer)
        response2 = {
          ...response2,
          customer: {
            ...response2.customer,
            firstName: fixAccents(response2.customer?.firstName),
            lastName: fixAccents(response2.customer?.lastName),
            aboutme: fixAccents(response2.customer?.aboutme),
          },
        };

      if (response2.codigoRespuesta === "20") {
        navigation.navigate("Register", { email: userInfo.user.email });
        return;
      }
      if (response2.codigoRespuesta === "22") {
        ToastCall("error", `Su usuario se encuentra inactivo, comuníquese con atención al cliente`, "ES");
        return;
      }
      if (response2.codigoRespuesta === "52") {
        ToastCall(
          "error",
          "Por seguridad no podrás entrar en la app, deberás esperar 1 hora para volver a probar.",
          "ES"
        );
        return;
      }
      if (response2.codigoRespuesta === "00") {
        await AsyncStorage.setItem("SesionGoogle", JSON.stringify(userInfo));
        await saveSesionToken(response2.stringSessionToken);
        setSesionToken(response2.stringSessionToken);
        const data = await getUserData();
        if (!data) {
          await saveUserData({ id: response2.customer.id.toString(), firstTimeLogin: false });
        }

        const validate = await OnboardingValidate(response2.customer, navigation, setUser, {
          longitude: DataCoordenadas?.coords?.longitude,
          latitude: DataCoordenadas?.coords?.latitude,
        });

        if (!validate) return;

        setUser(processObject(response2.customer));
        await AsyncStorage.setItem("Sesion", JSON.stringify(processObject(response2.customer)));

        const host = process.env.APP_BASE_API;
        const url = `/api/appchancea/customers/get-my-match/${response2.stringSessionToken}?page=0&size=100`;
        const header = await GetHeader(TokenAuthApi, "application/json");
        const response: MatchResponse = await HttpService("get", host, url, {}, header);

        const url2 = `/api/appchancea/customers/get-who-like-me/${response2.stringSessionToken}?page=0&size=100`;
        const response3: MatchResponse = await HttpService("get", host, url2, {}, header);

        if (response.codigoRespuesta == "00") {
          setMatch(response.customers);
          manageMatchsLocal(response.customers);
        }
        if (response3.codigoRespuesta == "00") {
          setWhoLikeMeList(response.customers);
          WholikemeSaveUsers(response.customers);
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Redireccionando a Home");
        navigation.navigate("Home");
        /* navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        ); */
        return;
      }

      ToastCall("error", `${response2.mensajeRespuesta} ${response2.codigoRespuesta}`, "ES");
    } catch (error: any) {
      console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        ToastCall("warning", "Inicio de sesión cancelado", "ES");
        return;
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        ToastCall("error", "Inicio de sesión en progreso, espere un poco", "ES");
        return;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        ToastCall("error", "no tienes el servicio de Google", "ES");
        return;
      } else {
        // some other error happened
        ToastCall("error", `Error: ${error.message || JSON.stringify(error)}`, "ES");
        HttpError(TokenAuthApi, JSON.stringify(error));
        return;
      }
    } finally {
      setLoader(false);
    }
  };
  const signInApple = async () => {
    setLoader(true);

    setTimeout(() => {
      if (!user) {
        /* setLoader(false) */
      }
    }, 1000);
    try {

      console.log("gol")
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // signed in
      console.log(credential)

      let appleGivenName = credential.fullName?.givenName;
      let appleFamilyName = credential.fullName?.familyName;
      let appleEmail = credential.email;

      // Si nos llega el nombre o email (Primera vez), lo guardamos en caché por si el usuario no termina el registro
      if (appleGivenName || appleFamilyName || appleEmail) {
        await AsyncStorage.setItem("appleUserData", JSON.stringify({
          firstName: appleGivenName,
          lastName: appleFamilyName,
          email: appleEmail
        }));
      } else {
        // Si no llega (intentos posteriores), buscamos si lo teníamos guardado de antes
        const cachedData = await AsyncStorage.getItem("appleUserData");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (!appleGivenName) appleGivenName = parsedData.firstName;
          if (!appleFamilyName) appleFamilyName = parsedData.lastName;
          if (!appleEmail) appleEmail = parsedData.email;
        }
      }


      if (!credential) return;
      if (!process.env.ENCRYPTION_KEY) return;

      console.log(process.env.ENCRYPTION_KEY);
      const deviceId = await AsyncStorage.getItem("deviceId");

      const host = process.env.APP_BASE_API as string;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const url2 = "/api/appchancea/customers/loginApple";

      console.log({
        email: credential.email,
        identityToken: credential.identityToken,
        latitude: DataCoordenadas?.coords?.latitude?.toString(),
        logintude: DataCoordenadas?.coords?.longitude?.toString(),
        deviceId: deviceId ? deviceId : "N/A",
      });

      console.log({
        encryptedData: encrypt(
          JSON.stringify({
            email: credential.email,
            identityToken: credential.identityToken,
            latitude: DataCoordenadas?.coords?.latitude?.toString(),
            logintude: DataCoordenadas?.coords?.longitude?.toString(),
            deviceId: deviceId ? deviceId : "N/A",
          }),
          process.env.ENCRYPTION_KEY
        ),
      });

      const response2Encode = await HttpService(
        "post",
        host,
        url2,
        {
          encryptedData: encrypt(
            JSON.stringify({
              email: credential.email,
              identityToken: credential.identityToken,
              latitude: DataCoordenadas?.coords?.latitude?.toString(),
              logintude: DataCoordenadas?.coords?.longitude?.toString(),
              deviceId: deviceId ? deviceId : "N/A",
            }),
            process.env.ENCRYPTION_KEY
          ),
        },
        header
      );


      let response2 = JSON.parse(decrypt(response2Encode.encryptedData, process.env.ENCRYPTION_KEY)) as ResponseLogin;

      console.log(response2, "response2");

      if (response2.customer)
        response2 = {
          ...response2,
          customer: {
            ...response2.customer,
            firstName: fixAccents(response2.customer?.firstName),
            lastName: fixAccents(response2.customer?.lastName),
            aboutme: fixAccents(response2.customer?.aboutme),
          },
        };

      if (response2.codigoRespuesta === "20") {
        console.log(response2.emailOpcional, "emailOptional")
        console.log(credential)
        navigation.navigate("Register", {
          email: response2.emailOpcional || appleEmail,
          firstName: appleGivenName,
          lastName: appleFamilyName
        });
        return;
      }
      if (response2.codigoRespuesta === "22") {
        ToastCall("error", `Su usuario se encuentra inactivo, comuníquese con atención al cliente`, "ES");
        return;
      }
      if (response2.codigoRespuesta === "52") {
        ToastCall(
          "error",
          "Por seguridad no podrás entrar en la app, deberás esperar 1 hora para volver a probar.",
          "ES"
        );
        return;
      }
      if (response2.codigoRespuesta === "00") {
        await saveSesionToken(response2.stringSessionToken);
        setSesionToken(response2.stringSessionToken);
        const data = await getUserData();
        if (!data) {
          await saveUserData({ id: response2.customer.id.toString(), firstTimeLogin: false });
        }

        const validate = await OnboardingValidate(response2.customer, navigation, setUser, {
          longitude: DataCoordenadas?.coords?.longitude,
          latitude: DataCoordenadas?.coords?.latitude,
        });

        if (!validate) return;

        setUser(processObject(response2.customer));
        await AsyncStorage.setItem("Sesion", JSON.stringify(processObject(response2.customer)));

        const host = process.env.APP_BASE_API;
        const url = `/api/appchancea/customers/get-my-match/${response2.stringSessionToken}?page=0&size=100`;
        const header = await GetHeader(TokenAuthApi, "application/json");
        const response: MatchResponse = await HttpService("get", host, url, {}, header);

        const url2 = `/api/appchancea/customers/get-who-like-me/${response2.stringSessionToken}?page=0&size=100`;
        const response3: MatchResponse = await HttpService("get", host, url2, {}, header);

        if (response.codigoRespuesta == "00") {
          setMatch(response.customers);
          manageMatchsLocal(response.customers);
        }
        if (response3.codigoRespuesta == "00") {
          setWhoLikeMeList(response.customers);
          WholikemeSaveUsers(response.customers);
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Redireccionando a Home");
        navigation.navigate("Home");

        return;
      }

      ToastCall("error", `${response2.mensajeRespuesta} ${response2.codigoRespuesta}`, "ES");
    } catch (error: any) {
      console.log(error);
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
        ToastCall("warning", "Inicio de sesión cancelado", "ES");

        return;
      } else {
        // handle other errors
        ToastCall("error", "Tienes problemas de conexión", "ES");
        HttpError(TokenAuthApi, JSON.stringify(error));
        return;
      }
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (isFocus) {
      location();
    }

    // Safety check: clear only volatile flags
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('FORCE_LOGOUT');
      window.sessionStorage.removeItem('FORCE_LOGOUT');
    }

    // Check for Google Redirect Token
    if (Platform.OS === 'web') {
      const checkGoogleRedirect = async () => {
        try {
          const currentUrl = window.location.href;
          if (currentUrl.includes('id_token=')) {
            console.log("Detected Google Redirect Token, auto-signing in...");
            setLoader(true);
            await signIn();
          }
        } catch (e) {
          console.error("Auto-login failed", e);
        }
      };
      checkGoogleRedirect();
    }

  }, [isFocus]);

  const location = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "denied") {
        return;
      }
      Location.getCurrentPositionAsync()
        .then(async (position) => {
          setDataCoordenadas(position);
          await AsyncStorage.setItem("location", JSON.stringify(position));
          await AsyncStorage.setItem("LocationPermissonData", "1");
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }, []);

  return (
    <ScreenContainer disabledPaddingBottom disabledPaddingTop disabledStatusBar>
      <View className="flex-1 items-center bg-primary w-full h-full">
        <View className=" relative top-[10%]">
          <LogotipoYLogoV />
        </View>

        <View className=" w-full p-3 justify-center items-center absolute bottom-[5%]">
          <Text
            style={{
              fontFamily: "Bold",
              fontSize: 14,
              color: Colors.white,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Al hacer clic en "Iniciar sesión", acepta nuestros Términos y Política de Privacidad.
          </Text>

          {Platform.OS !== "ios" ? (
            <Button
              text={"Iniciar Sesión con Google"}
              typeButton="white"
              showIcon
              IconDirection="right"
              styleText={{ textTransform: "uppercase" }}
              icon={<Ionicons name="logo-google" size={24} color="red" />}
              onPress={signIn}
            />
          ) : null}

          <Button
            text={"Iniciar Sesión con Email"}
            typeButton="white"
            showIcon
            IconDirection="right"
            styleText={{ textTransform: "uppercase" }}
            icon={<Entypo name="email" size={24} color="black" />}
            onPress={() => {
              if (typeof window !== "undefined") {
                window.localStorage.removeItem("FORCE_LOGOUT");
                window.sessionStorage.removeItem("FORCE_LOGOUT");
              }
              navigation.navigate("Login");
            }}
          />

          {Platform.OS !== "ios" ? (
            <Button
              text={"Soy un Negocio"}
              typeButton="white"
              showIcon
              IconDirection="right"
              styleText={{ textTransform: "uppercase" }}
              icon={<Ionicons name="business" size={24} color="black" />}
              onPress={() => {
                navigation.navigate("LoginBusiness");
              }}
            />
          ) : null}

          <Button
            text={"Registrarse"}
            typeButton="link"
            className="mt-2"
            styleText={{ fontFamily: "Bold", fontSize: 16, color: Colors.white }}
            onPress={() => {
              navigation.navigate("Register");
            }}
          />
        </View>
        <DialogNoActualizado IsUpdate={UpdateShow && !Number(process.env.DEV)} />
      </View>
    </ScreenContainer>
  );
};

export default Prelogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.blackBackground,
    borderRadius: 40,
    shadowColor: Colors.blackBackground,
    shadowOffset: {
      width: 0,
      height: 0
    },
    marginBottom: 10,
  },
});
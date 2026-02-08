import { useEffect } from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { Colors } from "../../utils";
import { useAuth, useFormRegister, useRender } from "../../context";
import { width, height, GetHeader, encrypt, decrypt, ToastCall, fixAccents } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation, CommonActions, useIsFocused } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import RegisteIMG6 from "../../components/imgSvg/RegisteIMG6";
import { font } from "../../../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HttpService, WholikemeSaveUsers } from "../../services";
import { ResponseLogin } from "../../utils/Interface";
import OnboardingValidate from "../../utils/OnboardingValidate";
import { processObject } from "../../utils/CorregirTexto";
import { useStore } from "../../context/storeContext/StoreState";
import { getUserData, saveSesionToken, saveUserData } from "../../services/AsyncStorageMethods";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { manageMatchsLocal } from "../../services/MatchsAsyncStorage";

export default function RegisterScreen5() {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { TokenAuthApi, setUser, DataCoordenadas, deviceId, setSesionToken, singInWithGoogle } = useAuth();
  const { setLoader } = useRender();
  const { setWhoLikeMeList, setMatch } = useStore();
  const {
    setIsGoogleRegister,
    IsGoogleRegister,
    initialStateRegister,
    initialStateRegisterGoogle,
    setRegisterGoogleReq,
    setRegisterReq
  } = useFormRegister();
  const isFocus = useIsFocused();

  useEffect(() => {
    if (IsGoogleRegister) {
      setRegisterGoogleReq(initialStateRegisterGoogle)
    } else {
      setRegisterReq(initialStateRegister)
    }

    if (Platform.OS === 'web' && isFocus) {
      const checkGoogleRedirect = async () => {
        try {
          const currentUrl = window.location.href;
          if (currentUrl.includes('id_token=')) {
            console.log("Detected Google Redirect Token in RegisterScreen5, auto-logging in...");
            await callApiLoginGoogle();
          }
        } catch (e) {
          console.error("Auto-login failed in RegisterScreen5", e);
        }
      };
      checkGoogleRedirect();
    }
  }, [isFocus])

  const callApiLogin = async () => {
    try {
      const data = await AsyncStorage.getItem("RegisterData");
      if (!data) {
        navigation.navigate("Login");
        return;
      }

      const dataJson = JSON.parse(data);
      const { email, credencial } = dataJson;

      if (!process.env.ENCRYPTION_KEY) return;

      setLoader(true);
      const host = process.env.APP_BASE_API;
      const url = "/api/appchancea/customers/login";

      const loginReq = {
        email,
        credencial,
        logintude: DataCoordenadas?.coords?.longitude?.toString() || "10.491021",
        latitude: DataCoordenadas?.coords?.latitude?.toString() || "-66.8074",
        deviceId: deviceId,
      };

      const req = {
        encryptedData: encrypt(JSON.stringify(loginReq), process.env.ENCRYPTION_KEY),
      };

      const header = await GetHeader(TokenAuthApi, "application/json");
      const responseEncode = await HttpService("post", host, url, req, header);

      let response = JSON.parse(decrypt(responseEncode.encryptedData, process.env.ENCRYPTION_KEY)) as ResponseLogin;

      if (response.codigoRespuesta === "00") {
        if (response.customer) {
          response = {
            ...response,
            customer: {
              ...response.customer,
              firstName: fixAccents(response.customer?.firstName),
              lastName: fixAccents(response.customer?.lastName),
              aboutme: fixAccents(response.customer?.aboutme)
            }
          };
        }

        await saveSesionToken(response.stringSessionToken);
        setSesionToken(response.stringSessionToken);

        const userData = await getUserData();
        if (!userData) {
          await saveUserData({ id: response.customer.id.toString(), firstTimeLogin: false });
        }

        const processedUser = processObject(response.customer);
        setUser(processedUser);
        await AsyncStorage.setItem("Sesion", JSON.stringify(processedUser));
        await AsyncStorage.removeItem("RegisterData");

        // Fetch initial data
        const matchUrl = `/api/appchancea/customers/get-my-match/${response.stringSessionToken}?page=0&size=100`;
        const matchResponse: MatchResponse = await HttpService("get", host, matchUrl, {}, header);
        if (matchResponse.codigoRespuesta == "00") {
          setMatch(matchResponse.customers);
          manageMatchsLocal(matchResponse.customers);
        }

        const whoLikesMeUrl = `/api/appchancea/customers/get-who-like-me/${response.stringSessionToken}?page=0&size=100`;
        const whoLikesMeResponse: MatchResponse = await HttpService("get", host, whoLikesMeUrl, {}, header);
        if (whoLikesMeResponse.codigoRespuesta == "00") {
          setWhoLikeMeList(whoLikesMeResponse.customers);
          WholikemeSaveUsers(whoLikesMeResponse.customers);
        }

        // Validate Onboarding
        const validate = await OnboardingValidate(processedUser, navigation, setUser, {
          longitude: DataCoordenadas?.coords?.longitude,
          latitude: DataCoordenadas?.coords?.latitude,
        }, { TokenAuthApi, SesionToken: response.stringSessionToken });

        if (validate) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        }
      } else {
        navigation.navigate("Login");
      }
    } catch (err) {
      console.error("Auto-login error:", err);
      navigation.navigate("Login");
    } finally {
      setLoader(false);
    }
  };

  const callApiLoginGoogle = async () => {
    setLoader(true);
    try {
      const userInfo = await singInWithGoogle();
      if (!userInfo) return;
      if (!process.env.ENCRYPTION_KEY) return;

      const deviceIdLocal = await AsyncStorage.getItem("deviceId");
      const host = process.env.APP_BASE_API as string;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const url = Platform.OS === 'web' ? "/api/appchancea/customers/loginGoogleWeb" : "/api/appchancea/customers/loginGoogle";

      const loginReq = {
        email: userInfo.user.email,
        token: userInfo.idToken,
        latitude: DataCoordenadas?.coords?.latitude?.toString() || "-66.8074",
        logintude: DataCoordenadas?.coords?.longitude?.toString() || "10.491021",
        deviceId: deviceIdLocal ? deviceIdLocal : "N/A",
        aboutme: "N/A" // Ensure aboutme is at least "N/A" for onboarding to trigger if needed
      };

      const req = {
        encryptedData: encrypt(JSON.stringify(loginReq), process.env.ENCRYPTION_KEY),
      };

      const responseEncode = await HttpService("post", host, url, req, header);
      let response = JSON.parse(decrypt(responseEncode.encryptedData, process.env.ENCRYPTION_KEY)) as ResponseLogin;

      if (response.customer) {
        response = {
          ...response,
          customer: {
            ...response.customer,
            firstName: fixAccents(response.customer?.firstName),
            lastName: fixAccents(response.customer?.lastName),
            aboutme: fixAccents(response.customer?.aboutme),
          },
        };
      }

      if (response.codigoRespuesta === "00") {
        await AsyncStorage.setItem("SesionGoogle", JSON.stringify(userInfo));
        await saveSesionToken(response.stringSessionToken);
        setSesionToken(response.stringSessionToken);

        const userData = await getUserData();
        if (!userData) {
          await saveUserData({ id: response.customer.id.toString(), firstTimeLogin: false });
        }

        const processedUser = processObject(response.customer);
        if (!processedUser.aboutme) processedUser.aboutme = "N/A"; // Force "N/A" if null to trigger onboarding step
        setUser(processedUser);
        await AsyncStorage.setItem("Sesion", JSON.stringify(processedUser));
        await AsyncStorage.removeItem("RegisterData");

        // Fetch initial data
        const matchUrl = `/api/appchancea/customers/get-my-match/${response.stringSessionToken}?page=0&size=100`;
        const matchResponse: MatchResponse = await HttpService("get", host, matchUrl, {}, header);
        if (matchResponse.codigoRespuesta == "00") {
          setMatch(matchResponse.customers);
          manageMatchsLocal(matchResponse.customers);
        }

        const whoLikesMeUrl = `/api/appchancea/customers/get-who-like-me/${response.stringSessionToken}?page=0&size=100`;
        const whoLikesMeResponse: MatchResponse = await HttpService("get", host, whoLikesMeUrl, {}, header);
        if (whoLikesMeResponse.codigoRespuesta == "00") {
          setWhoLikeMeList(whoLikesMeResponse.customers);
          WholikemeSaveUsers(whoLikesMeResponse.customers);
        }

        // Wait for state to settle on web before validating onboarding
        if (Platform.OS === 'web') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        // Validate Onboarding
        const validate = await OnboardingValidate(processedUser, navigation, setUser, {
          longitude: DataCoordenadas?.coords?.longitude,
          latitude: DataCoordenadas?.coords?.latitude,
        }, { TokenAuthApi, SesionToken: response.stringSessionToken });

        if (validate) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        }
      } else {
        ToastCall("error", `${response.mensajeRespuesta} ${response.codigoRespuesta}`, "ES");
        navigation.navigate("Prelogin");
      }
    } catch (err) {
      console.error("Google Login error:", err);
      navigation.navigate("Prelogin");
    } finally {
      setLoader(false);
    }
  };


  return (
    <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-center items-center pb-10 px-5">
      <View className="items-center mb-10">
        <RegisteIMG6 width={Platform.OS === 'web' ? 180 : width * 0.35} height={Platform.OS === 'web' ? 180 : width * 0.35} />
      </View>

      <View className="w-full mb-10">
        <Text style={[font.Bold, { textAlign: "center", fontSize: 24, color: Colors.black, marginBottom: 15 }]}>
          ¡Felicidades, ya eres parte de nuestra comunidad!
        </Text>
        <Text style={[font.Regular, { textAlign: "center", fontSize: 16, color: Colors.graySemiDark }]}>
          Estamos casi listos para que comiences a chancear. Cuadra con tu pareja ideal de forma rápida y sencilla.
        </Text>
      </View>

      <View className="w-full mt-5 px-10">
        <Button
          text="Comenzar"
          onPress={() => {
            if (IsGoogleRegister) {
              callApiLoginGoogle();
            } else {
              callApiLogin();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  containerForm: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    flex: .9,
    gap: width * 0.10
  },
  textTitle: {
    color: Colors.blackBackground,
    fontSize: 14,
    fontFamily: "Medium",
    marginHorizontal: 10,
    textAlign: "center",
  },
  logo: {
    marginTop: 30,
    height: 200,
    borderRadius: 10,
    width: 200,
  },
});

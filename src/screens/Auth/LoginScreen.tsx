import { useCallback, useEffect } from "react";
import { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Platform, ScrollView, Text } from "react-native";
import { useRender } from "../../context/renderContext/RenderState";
import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { GetHeader, ToastCall, decrypt, encrypt, fixAccents, height } from "../../utils/Helpers";
import { HttpService, WholikemeSaveUsers } from "../../services";
import * as Location from "expo-location";
import { useNavigation, useIsFocused, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { font } from "../../../styles";
import ScreenContainer from "../../components/ScreenContainer";
import { useAuth } from "../../context";
import { environmet } from "../../../env";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import LogotipoYLogoV from "../../components/imgSvg/LogotipoYLogoV";
import { useStore } from "../../context/storeContext/StoreState";
import ScreenContainerForm from "../../components/ScreenContainerForm";
import DialogNoActualizado from "../../components/Dialog/DialogNoActualizado/DialogNoActualizado";
import { getUserData, saveSesionToken, saveUserData } from "../../services/AsyncStorageMethods";
import CryptoJS from "crypto-js";
import { Colors } from "../../utils";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { ResponseLogin } from "../../utils/Interface";
import OnboardingValidate from "../../utils/OnboardingValidate";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { manageMatchsLocal } from "../../services/MatchsAsyncStorage";
import { processObject } from "../../utils/CorregirTexto";

import { LinearGradient } from "expo-linear-gradient";

const formLoginInit = {
  email: "",
  credencial: "",
  logintude: "10.491021",
  latitude: "-66.8074",
  deviceId: "sdasdasdasdasd",
};

export default function LoginScreen() {
  const { TokenAuthApi, setUser, DataCoordenadas, deviceId, setDataCoordenadas, setSesionToken } = useAuth();
  const { setLoader, setPrecioDolar, PrecioDolar, KeyboardStatus, UpdateShow } = useRender();
  const { setWhoLikeMeList, setMatch } = useStore();
  const [data, setData] = useState([]);
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [formLogin, setFormLogin] = useState(formLoginInit);
  const isFocus = useIsFocused();

  const location = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLoader(true);
      Location.getCurrentPositionAsync()
        .then(async (position) => {
          setLoader(false);
          setDataCoordenadas(position);
          await AsyncStorage.setItem("location", JSON.stringify(position));
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setLoader(false);
    }
  }, [formLogin, isFocus]);

  useEffect(() => {
    if (DataCoordenadas.coords.longitude) {
      setFormLogin({
        ...formLogin,
        latitude: DataCoordenadas?.coords?.latitude?.toString(),
        logintude: DataCoordenadas?.coords?.longitude?.toString(),
        deviceId: deviceId,
      });
    }
  }, [DataCoordenadas]);

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormLogin({
        ...formLogin,
        [key]: value,
      });
    },
    [formLogin]
  );

  async function callApiLogin(email = "", credencial = "") {
    if (email == "") {
      ToastCall("warning", "el Campo Email no puede estar vació", "ES");
      return;
    }

    if (credencial == "") {
      ToastCall("warning", "el Campo Contraseña no puede estar vació", "ES");
      return;
    }
    if (!process.env.ENCRYPTION_KEY) {
      return;
    }
    const deviceId = await AsyncStorage.getItem("deviceId");
    setLoader(true);

    try {
      const host = process.env.APP_BASE_API;
      const url = "/api/appchancea/customers/login";
      let req = {
        encryptedData: encrypt(JSON.stringify({ ...formLogin, deviceId }), process.env.ENCRYPTION_KEY),
      };
      if (email && credencial) {
        req = {
          encryptedData: encrypt(
            JSON.stringify({ ...formLogin, email, credencial, deviceId }),
            process.env.ENCRYPTION_KEY
          ),
        };

        await AsyncStorage.removeItem("RegisterData");
      }
      const header = await GetHeader(TokenAuthApi, "application/json");
      const responseEncode = await HttpService("post", host, url, req, header);
      let response = JSON.parse(decrypt(responseEncode.encryptedData, process.env.ENCRYPTION_KEY)) as ResponseLogin;

      if (response.customer) response = { ...response, customer: { ...response.customer, firstName: fixAccents(response.customer?.firstName), lastName: fixAccents(response.customer?.lastName), aboutme: fixAccents(response.customer?.aboutme) } }

      if (response.codigoRespuesta == "21") {
        ToastCall("warning", "Contraseña o Email incorrecto", "ES");
        return;
      }
      if (response.codigoRespuesta == "20") {
        ToastCall("warning", "Usuario no encontrado o no existe", "ES");
        return;
      }
      if (response.codigoRespuesta === "22") {
        ToastCall("error", `Su usuario se encuentra inactivo, comuníquese con atención al cliente`, "ES");
        return;
      }
      if (response.codigoRespuesta === "52") {
        ToastCall(
          "error",
          "Por seguridad no podrás entrar en la app, deberás esperar 1 hora para volver a probar.",
          "ES"
        );
        return;
      }
      if (response.codigoRespuesta === "00") {
        const data = await getUserData();
        await saveSesionToken(response.stringSessionToken);
        setSesionToken(response.stringSessionToken);
        if (!data) {
          await saveUserData({ id: response.customer.id.toString(), firstTimeLogin: false });
        }
        const validate = await OnboardingValidate(response.customer, navigation, setUser, {
          longitude: DataCoordenadas?.coords?.longitude,
          latitude: DataCoordenadas?.coords?.latitude,
        });

        if (!validate) return

        setUser(processObject(response.customer));
        await AsyncStorage.setItem("Sesion", JSON.stringify(processObject(response.customer)));


        const host = process.env.APP_BASE_API;
        const url = `/api/appchancea/customers/get-my-match/${response.stringSessionToken}?page=0&size=100`;
        const header = await GetHeader(TokenAuthApi, "application/json");
        const response2: MatchResponse = await HttpService("get", host, url, {}, header);

        const url2 = `/api/appchancea/customers/get-who-like-me/${response.stringSessionToken}?page=0&size=100`;
        const response3: MatchResponse = await HttpService("get", host, url2, {}, header);

        if (response2.codigoRespuesta == "00") {
          setMatch(response2.customers);
          manageMatchsLocal(response2.customers);
        }
        if (response3.codigoRespuesta == "00") {
          setWhoLikeMeList(response3.customers);
          WholikemeSaveUsers(response3.customers);
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        setFormLogin(formLoginInit);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        );
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false);
    }
  }

  useEffect(() => {
    if (isFocus) {
      location();
      (async () => {
        const data = await AsyncStorage.getItem("RegisterData");
        if (data) {
          const dataJson = JSON.parse(data);
          setFormLogin({
            ...formLogin,
            credencial: dataJson.credencial,
            email: dataJson.email,
          });
          callApiLogin(dataJson.email, dataJson.credencial);
        }
      })();
    }
  }, [isFocus]);

  return (
    <ScreenContainerForm contentContainerStyle={{ backgroundColor: Colors.primary }}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Prelogin")}
          >
            <FontAwesome6 name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <LogotipoYLogoV className="mb-10" />

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Input
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@ejemplo.com"
              labelText="Correo Electrónico"
              styleLabel={{ color: Colors.white, marginBottom: 8 }}
              styleContainer={styles.inputContainer}
              value={formLogin.email}
              onChangeText={(e: string) => change(e, "email")}
            />

            <Input
              keyboardType="default"
              secureTextEntry
              placeholder="*******"
              labelText="Contraseña"
              styleLabel={{ color: Colors.white, marginBottom: 8 }}
              styleContainer={styles.inputContainer}
              value={formLogin.credencial}
              onChangeText={(e: string) => change(e, "credencial")}
            />
          </View>

          {/* Action Button */}
          <View style={styles.buttonWrapper}>
            <Button
              text={"Iniciar Sesión"}
              typeButton="white"
              styleButton={styles.loginButton}
              styleText={styles.loginButtonText}
              onPress={() => {
                callApiLogin(formLogin.email, formLogin.credencial);
              }}
            />
          </View>

          {/* Links Section */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ResetPasswordScreen")}
              style={styles.linkButton}
            >
              <Text style={[font.Bold, styles.linkText]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={() => navigation.navigate("Register")}
                style={[styles.linkButton, { marginTop: 25 }]}
              >
                <Text style={[font.Bold, styles.linkText]}>
                  Registrarse
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <DialogNoActualizado IsUpdate={UpdateShow && !Number(process.env.DEV)} />
    </ScreenContainerForm>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    gap: 20,
    marginTop: 20,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 0,
    height: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonWrapper: {
    width: "70%",
    marginTop: 40,
    marginBottom: 30,
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.primary,
  },
  linksContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: Colors.white,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});

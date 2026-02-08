import { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Platform, ScrollView, Text, Animated } from "react-native";
import { useRender } from "../../context/renderContext/RenderState";
import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { GetHeader, ToastCall, decrypt, encrypt, fixAccents, height } from "../../utils/Helpers";
import { HttpService } from "../../services";
import * as Location from "expo-location";
import { useNavigation, useIsFocused, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
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
import { ResponseSesionBusiness, SesionBusiness } from "../../context/AuthBusinessHooks/AuthBusinessHooksInterface";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import { font } from "../../../styles";
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness";
import { Stores } from "../../context/storeBusinessHooks/StoreBusinessInterface";
import { processObject } from "../../utils/CorregirTexto";

const formLoginInit = {
  email: "",
  credencial: "",
  deviceId: "sdasdasdasdasd",
};

export default function LoginBusinessScreen() {
  const { TokenAuthApi, deviceId, DataCoordenadas, setDataCoordenadas, setSesionToken } = useAuth();
  const { setSesionBusiness } = useSesionBusinessStore();
  const { setStores } = useStoreBusiness();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  // Animation values
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [formLogin, setFormLogin] = useState(formLoginInit);
  const isFocus = useIsFocused();

  const location = useCallback(async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      /*  if (status === 'denied') {
        if (Platform.OS !== 'ios') {
          navigation.navigate('LocationPermissonScreen');
        }
        return;
      } */
      setLoader(true);
      Location.getCurrentPositionAsync()
        .then(async (position) => {
          setLoader(false);
          setDataCoordenadas(position);
          console.log(position);
          await AsyncStorage.setItem("location", JSON.stringify(position));
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
        setFormLogin({
          ...formLogin,
          deviceId: deviceId,
        });
    } catch (error) {
      console.log(JSON.stringify(error));
    } finally {
      setLoader(false);
    }
  }, [formLogin, deviceId, isFocus]);

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormLogin({
        ...formLogin,
        [key]: value,
      });
    },
    [formLogin]
  );

  async function callApiLogin() {
    //Valida que el campo Email no este vacio
    if (formLogin.email == "") {
      ToastCall("warning", "el Campo Email no puede estar vacio", "ES");
      return;
    }

    if (formLogin.credencial == "") {
      ToastCall("warning", "el Campo Contraseña no puede estar vacio", "ES");
      return;
    }

    try {
      const host = process.env.APP_BASE_API;
      const url = "/api/appchancea/businesses/login";
      const req = formLogin;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ResponseSesionBusiness = await HttpService("post", host, url, req, header, setLoader);

      const url2 = `/api/appchancea/store-businesses?businessId.equals=${response.business.id}&page=0&size=20`;
      const header2 = await GetHeader(TokenAuthApi, "application/json");
      const response2: Stores[] = await HttpService("get", host, url2, {}, header2, setLoader);

      await saveSesionToken(response.token);
      setSesionToken(response.token);
      setStores(response2);

      setSesionBusiness(processObject(response.business));
      setFormLogin(formLoginInit);

      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(processObject(response.business)));

      const validate = await OnboardingValidateBusiness(response.business, navigation, setSesionBusiness, response2);
      console.log(validate, "validate");
      console.log(navigation.getState().routes, "navigation.getState().routes");
      if (!validate) return;
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }],
        })
      );
      navigation.navigate("HomeBusiness");
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      console.error(err, "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexion en con el Servidor", "ES");
      } else {
        ToastCall("warning", "Contraseña o correo invalido", "ES");
      }
    } // Displaying the stringified data in an alert popup
  }

  // Animation functions
  const startAnimations = () => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    if (isFocus) {
      location();
    }
    startAnimations();
  }, [isFocus]);

  return (
    <ScreenContainerForm>
      <View className=" h-[100vh]" style={{backgroundColor: Colors.primary}}>
          <View className=" absolute left-3 top-3 p-2 bg-white/20 rounded-full z-10">
            <TouchableOpacity  onPress={() => navigation.navigate("Prelogin")}>
              <FontAwesome6 name="arrow-left" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

        <View className="  justify-center items-center" style={{ height: height * 0.8 }}>
          <LogotipoYLogoV className="" />
          {/* Store Icon and Title */}
          <View className=" my-2  flex-col items-center ">
            <View className="relative items-center justify-center">
           
              {/* Main store icon */}
              <Animated.View
                className="items-center justify-center"
                style={{
                  transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
                }}
              >
                <View className="w-28 h-28 bg-white/20 rounded-full items-center justify-center">
                  <FontAwesome5 name="store" size={48} color={Colors.white} />
                </View>
              </Animated.View>

              {/* Small decorative elements */}
              <Animated.View className="absolute top-0 right-0" style={{ transform: [] }}>
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <FontAwesome5 name="dollar-sign" size={14} color={Colors.white} />
                </View>
              </Animated.View>

              <Animated.View className="absolute bottom-0 left-0" style={{ transform: [] }}>
                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                  <FontAwesome5 name="shopping-bag" size={16} color={Colors.white} />
                </View>
              </Animated.View>
            </View>
            <Text className="text-white ml-3" style={[font.Bold, { fontSize: 20 }]}>
              Negocios
            </Text>
          </View>

          <View className=" w-[90%] items-center  " style={{ gap: 16 }}>
            <Input
              keyboardType="default"
              placeholder="email@ejemplo.com"
              labelText="Email del negocio"
              value={formLogin.email}
              onChangeText={(e: string) => change(e, "email")}
            />

            <Input
              keyboardType="default"
              secureTextEntry
              placeholder="*******"
              labelText="Contraseña del negocio"
              value={formLogin.credencial}
              onChangeText={(e: string) => change(e, "credencial")}
            />
          </View>

          <View style={{ width: "60%", marginTop: 20 }}>
            <Button
              text={"Iniciar Sesión"}
              typeButton="white"
              styleText={{ fontFamily: "Bold", fontSize: 16 }}
              onPress={() => {
                callApiLogin();
              }}
            />
          </View>

          <Button
            text={"¿Olvidaste tu contraseña?"}
            typeButton="link"
            className="-bottom-8 absolute"
            styleText={{ fontFamily: "Bold", fontSize: 16 }}
            onPress={() => {
              navigation.navigate("ResetPasswordBusinessScreen");
            }}
          />
          <Button
            text={"Registrar Negocio"}
            typeButton="link"
            className="-bottom-16 absolute"
            styleText={{ fontFamily: "Bold", fontSize: 16 }}
            onPress={() => {
              navigation.navigate("RegisterNegocios");
            }}
          />
        </View>
      </View>
    </ScreenContainerForm>
  );
}

const styles = StyleSheet.create({
  imagestyle: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    fontFamily: "SemiBold",
  },

  separator: {
    paddingTop: 120,
    backgroundColor: "white",
  },

  logo: {
    height: 150,
    width: 150,
  },

  inputView: {
    width: "80%",
    backgroundColor: "#F4F2F2",
    borderRadius: 10,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20,
  },

  inputText: {
    height: 50,
    color: "black",
  },
  forgot: {
    color: "black",
    fontSize: 11,
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#7ED957",
    borderRadius: 10,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  loginText: {
    color: "black",
  },
});

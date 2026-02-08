import {
  Text,
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  PermissionsAndroid,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { Colors } from "../../utils";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import { useAuth, useFormRegister, useRender } from "../../context";
import { HttpService } from "../../services";
import Languages from "../../utils/Languages.json";

import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import ScreenContainer from "../../components/ScreenContainer";
import { useNavigation } from "@react-navigation/native";
import RegisteIMG4 from "../../components/imgSvg/RegisteIMG4";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RegisterRequestNew } from "../../context/registerContext/RegisterInterfaces";
import ScreenContainerForm from "../../components/ScreenContainerForm";
import { font } from "../../../styles";

const formatNumber = (number: number) => `0${number}`.slice(-2);

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = time - mins * 60;
  return { mins: formatNumber(mins), secs: formatNumber(secs) };
};

const limitMessage = 3;

function RegisterScreen3() {
  const { registerReq, IsGoogleRegister } = useFormRegister();
  const { language, setLoader } = useRender();
  const { TokenAuthApi } = useAuth();
  const [receiveSmsPermission, setReceiveSmsPermission] = useState("");
  var intervalTimer: any = null;
  var intervalTimer2: any = null;
  var intervalTimer3: any = null;
  var intervalTimer4: any = null;
  const [timer1, setTimer1] = useState<number>(150);
  const [timer2, setTimer2] = useState<number>(20);
  const [timer3, setTimer3] = useState<number>(150);
  const [timer4, setTimer4] = useState<number>(20);
  const [counter, setCounter] = useState<number>(0);
  const [activeTimer1, setActiveTimer1] = useState<boolean>(true);
  const [activeTimer2, setActiveTimer2] = useState<boolean>(true);
  const [activeTimer3, setActiveTimer3] = useState<boolean>(true);
  const [activeTimer4, setActiveTimer4] = useState<boolean>(true);
  const [state, setState] = useState({
    sms: "",
    email: "",
  });
  const { mins: mins1, secs: secs1 } = getRemaining(timer1);
  const { mins: mins3, secs: secs3 } = getRemaining(timer3);
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const disable = () => {
    const { email, sms } = state;
    return !(email.length >= 6) || registerReq.phone.slice(0, 3) === "+58" ? !(sms.length >= 6) : false;
  };
  const change = (value: string, key: string) => {
    setState({
      ...state,
      [key]: value,
    });
  };
  const reSubmit = async (type: "SMS" | "EMAIL", contact: string) => {
    const host = process.env.APP_BASE_API;
    const url: string = "/api/appchancea/tokens/generate";
    const req = {
      customerId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: "SMS",
    };
    const headers = GetHeader(TokenAuthApi, "application/json");
    try {
      const response: any = await HttpService("post", host, url, req, headers, setLoader);

      if (!response) {
        ToastCall("error", Languages["ES"].GENERAL.ERRORS.RequestError, "ES");
        return;
      }

      /* if(response.codigoRespuesta === "53"){
        ToastCall("warning", "Ya has hecho muchos intentos", "ES");
        navigation.goBack()
        return;
      } */

      if (type === "SMS") {
        setActiveTimer1(true);
        setActiveTimer2(true);
        setTimer1(150);
        setTimer2(20);
      }

      if (type === "EMAIL") {
        setActiveTimer3(true);
        setActiveTimer4(true);
        setTimer3(150);
        setTimer4(20);
      }
    } catch (err) {
      console.log("erro", JSON.stringify(err));
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };
  const getReq = useCallback((type: "SMS" | "EMAIL", contact: string, token: string) => {
    return {
      customerId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: "SMS",
      token: token,
    };
  }, []);
  const onSubmit = async (DataSMS?: string) => {
    let req;

    try {
      const { sms, email } = state;
      const host = process.env.APP_BASE_API;
      const url: string = "/api/appchancea/tokens/validate";
      const headers = GetHeader(TokenAuthApi, "application/json");
      if (DataSMS) {
        req = getReq("SMS", registerReq.phone, DataSMS);
      } else {
        req = getReq("SMS", registerReq.phone, sms);
      }
      const responseSms: any = await HttpService("post", host, url, req, headers, setLoader);
      //VALIDAR SMS
      if (!responseSms) {
        console.log("aqui");
        ToastCall("warning", Languages["ES"].SCREENS.VerifyContactsScreen.ERROR.message4, "ES");
        return;
      }
      if (responseSms?.codigoRespuesta !== "00") {
        console.log("aqui");
        ToastCall("warning", Languages["ES"].SCREENS.VerifyContactsScreen.ERROR.message3, "ES");
        return;
      }

      /*    req = getReq('EMAIL', registerReq.email, email);
      const responseEmail: any = await HttpService('post', host, url, req, headers, setLoader);
      //VALIDAR EMAIL
      if (!responseEmail) {
        ToastCall('warning', Languages['ES'].SCREENS.VerifyContactsScreen.ERROR.message5, 'ES');
        return;
      }

      if (responseEmail?.codigoRespuesta !== '00') {
        ToastCall('warning', Languages['ES'].SCREENS.VerifyContactsScreen.ERROR.message2, 'ES');
        return;
      }
 */
      clearInterval(intervalTimer);
      clearInterval(intervalTimer2);
      clearInterval(intervalTimer3);
      clearInterval(intervalTimer4);
      if (IsGoogleRegister) {
        try {
          setLoader(true);
          const deviceId = await AsyncStorage.getItem("deviceId");

          const host = process.env.APP_BASE_API;
          const url: string = "/api/appchancea/customers";
          const headers = GetHeader(TokenAuthApi, "application/json");
          const req: RegisterRequestNew = { ...registerReq, externalId: deviceId as string, password: "AAAAA0000" };

          const response = await HttpService("post", host, url, req, headers);

          console.log(response);

          navigation.navigate("RegisterScreen5");
        } catch (err) {
          console.log(JSON.stringify(err));
          ToastCall("error", Languages[language].GENERAL.ERRORS.GeneralError, language);
        } finally {
          setLoader(false);
        }

        return;
      }

      navigation.navigate("RegisterScreen4");
    } catch (err) {
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };

  /*  useEffect(() => {
    if (Platform.OS === "android") requestSmsPermission();
  }, []); */

  function extractNumbers(input: string) {
    // Utilizar una expresión regular para encontrar los números en la cadena
    const regex = /\d+/;
    const match = input.match(regex);
    return match ? match[0] : null;
  }

  useEffect(() => {
    if (activeTimer1 && timer1 > 0) {
      intervalTimer = setInterval(() => {
        setTimer1((remainingSecs) => remainingSecs - 1);
      }, 1000);
    } else if (!activeTimer1 || timer1 === 0) {
      clearInterval(intervalTimer);
    }
    return () => clearInterval(intervalTimer);
  }, [activeTimer1, timer1]);

  useEffect(() => {
    if (activeTimer2 && timer2 > 0) {
      intervalTimer2 = setInterval(() => {
        setTimer2((remainingSecs) => remainingSecs - 1);
      }, 1000);
    } else if (!activeTimer2 || timer2 === 0) {
      clearInterval(intervalTimer2);
    }
    return () => clearInterval(intervalTimer2);
  }, [activeTimer2, timer2]);

  useEffect(() => {
    if (activeTimer3 && timer3 > 0) {
      intervalTimer3 = setInterval(() => {
        setTimer3((remainingSecs) => remainingSecs - 1);
      }, 1000);
    } else if (!activeTimer3 || timer3 === 0) {
      clearInterval(intervalTimer3);
    }
    return () => clearInterval(intervalTimer3);
  }, [activeTimer3, timer3]);

  useEffect(() => {
    if (activeTimer4 && timer4 > 0) {
      intervalTimer4 = setInterval(() => {
        setTimer4((remainingSecs) => remainingSecs - 1);
      }, 1000);
    } else if (!activeTimer4 || timer4 === 0) {
      clearInterval(intervalTimer4);
    }
    return () => clearInterval(intervalTimer4);
  }, [activeTimer4, timer4]);

  useEffect(() => {
    reSubmit("SMS", registerReq.phone);
  }, []);

  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-5">
        <View className="w-full justify-center items-center my-8">
          <RegisteIMG4 width={Platform.OS === 'web' ? 180 : width * 0.35} height={Platform.OS === 'web' ? 180 : width * 0.35} />
          <Text style={[font.Bold, { fontSize: 18, textAlign: "center", width: "90%", marginTop: 10 }]}>
            Para nosotros tu seguridad es importante
          </Text>
        </View>

        <View className="w-full px-5">
          <View className="w-full mb-4">
            <Text style={[styles2.subTitle, { marginBottom: 10, fontSize: 16 }]}>
              {Languages["ES"].SCREENS.VerifyContactsScreen.text1}
              <MaterialIcons name="message" size={18} color="black" />
            </Text>
            <Input
              placeholder={Languages["ES"].SCREENS.VerifyContactsScreen.placeholder1}
              onChangeText={(e: string) => change(e.replace(/[^0-9]/g, ""), "sms")}
              value={state.sms}
              keyboardType="numeric"
              maxLength={6}
            />
            <View className="flex-row items-center justify-between px-2 mt-2">
              <TouchableOpacity
                disabled={timer2 ? true : false}
                onPress={() => {
                  if (counter >= limitMessage) {
                    ToastCall("warning", "Has superado la cantidad de intentos.", "ES");
                    return;
                  }
                  setCounter((state) => state + 1);
                  reSubmit("SMS", registerReq.phone);
                }}
              >
                <Text style={[styles2.textOptions, { fontSize: 14, color: timer2 > 0 ? Colors.danger : Colors.green }]}>
                  {Languages["ES"].SCREENS.VerifyContactsScreen.textSubmit}{" "}
                  {timer2 > 0 ? `${formatNumber(timer2)}s` : null}
                </Text>
              </TouchableOpacity>
              <Text style={[styles2.textOptions, { fontSize: 14, color: timer1 > 10 ? Colors.green : Colors.danger }]}>
                {mins1}:{secs1}
              </Text>
            </View>
          </View>
        </View>

        <View className="w-full flex-row justify-between px-5 mt-5">
          <View className="w-[48%]">
            <Button
              text={"Volver"}
              onPress={() => {
                navigation.goBack();
              }}
              typeButton="white"
            />
          </View>
          <View className="w-[48%]">
            <Button text={"Siguiente"} disabled={disable()} onPress={onSubmit} />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  );
}

export default RegisterScreen3;

const styles2 = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    color: Colors.blackBackground,
    fontFamily: "Regular",
    fontSize: 28,
    marginVertical: 15,
  },
  subTitle: {
    color: Colors.blackBackground,
    fontFamily: "Regular",
    fontSize: 18,
    marginTop: 5,
  },
  textOptions: {
    color: Colors.green,
    fontFamily: "Regular",
    fontSize: 18,
  },
  logo: {
    height: 150,
    borderRadius: 10,
    width: 150,
  },
});

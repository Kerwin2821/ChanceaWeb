import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { width, height, ToastCall, GetHeader } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { useAuth, useRender } from "../../context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { HttpService } from "../../services";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import ScreenContainerForm from "../../components/ScreenContainerForm";

function ChangePasswordBusinessScreen() {
  const { TokenAuthApi, setUser } = useAuth();
  const { language, setLoader } = useRender();

  const [password, setPassword] = useState("")
  const [Code, setCode] = useState("")

  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [countLength, setCountLength] = useState<boolean>(false);
  const [countUpperCase, setCountUpperCase] = useState<boolean>(false);
  const [countLowerCase, setCountLowerCase] = useState<boolean>(false);
  const [countNumbers, setCountNumbers] = useState<boolean>(false);
  const [countSymbols, setCountSymbols] = useState<boolean>(false);
  const [equals, setEquals] = useState<boolean>(false);
  const [credentialRepeat, setcredentialRepeat] = useState<string>("");

  const route = useRoute();
  const data = route.params as { phone:string, email:string };

  const disable = () => {
    return !(password?.length >= 8) || !(credentialRepeat.length >= 8);
  };

  const onSubmit = async () => {
    try {
      setLoader(true);

      if (password !== credentialRepeat) {
        ToastCall(
          "warning",
          Languages[language].SCREENS.PasswordScreen.ERRORS.message2,
          language
        );
        return;
      }

      console.log(Code.length)
      if (!Code || Code.length < 6) {
        ToastCall(
          "warning",
          "Código muy corto",
          language
        );
        return;
      }
      const host = process.env.APP_BASE_API;
      const url: string =
        "/api/appchancea/customers/recoverPasswordBusines";
      const headers = GetHeader(TokenAuthApi, "application/json");
      const req = {
        "email":data.email,
        "phoneNumber": data.phone,
        "token": Code,
        "channelType": "SMS",
        "newPassword": password
      }
      
      const response = await HttpService("post", host, url, req, headers);
      
            console.log(req)
            console.log(response)
    
      if(response.codigoRespuesta !== "00"){
        ToastCall(
          "error",
          Languages[language].GENERAL.ERRORS.TokenInvalid,
          language
        );
        return 
      }
      

      navigation.navigate("ResetPassBusinessSuccessScreen");
    } catch (err) {
      console.log(JSON.stringify(err));
      ToastCall(
        "error",
        Languages[language].GENERAL.ERRORS.GeneralError,
        language
      );
    } finally {
      setLoader(false);
    }
  };

  const reSubmit = async (type: "SMS" | "EMAIL", contact: string) => {
    const host = process.env.APP_BASE_API;
    const url: string = "/api/appchancea/business/tokens/generate/recover";
    const req = {
      customerId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: "SMS",
    };
    const headers = GetHeader(TokenAuthApi, "application/json");
    try {
      const response: any = await HttpService("post", host, url, req, headers, setLoader);
      if(response.codigoRespuesta === "53"){
        ToastCall("warning", "Ya has hecho muchos intentos", "ES");
        navigation.goBack()
        return;
      }
      if (!response) {
        ToastCall("error", Languages["ES"].GENERAL.ERRORS.RequestError, "ES");
        return;
      }

    } catch (err) {
      console.log("erro", JSON.stringify(err));
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };
  const validatePassword = useCallback(
    (e: any) => {
      let password = e;

      const val1 = /(?=.*[a-z])/g; //Minuscula
      const val2 = /(?=.*[A-Z])/g; //Mayuscula
      const val3 = /(?=.*\d)/g; //Digito
      const val4 = /(?=.*\W)/g; //Caracter Especial

      if (val1.test(password)) {
        setCountLowerCase(true);
      } else {
        countLowerCase && setCountLowerCase(false);
      }

      if (val2.test(password)) {
        setCountUpperCase(true);
      } else {
        countUpperCase && setCountUpperCase(false);
      }

      if (val3.test(password)) {
        setCountNumbers(true);
      } else {
        countNumbers && setCountNumbers(false);
      }

      if (val4.test(password)) {
        setCountSymbols(true);
      } else {
        countSymbols && setCountSymbols(false);
      }

      if (password.length >= 8) {
        setCountLength(true);
      } else {
        countLength && setCountLength(false);
      }

      if (password.length === 0) {
        setCountLowerCase(false);
        setCountUpperCase(false);
        setCountNumbers(false);
        setCountSymbols(false);
        setCountLength(false);
        setEquals(false);
      }
    },
    [password]
  );

  const change = (value: string, key: string) => {
    key === "password" && validatePassword(value);

    setPassword(value);
  };
  useEffect(() => {
    setEquals(
      password.length && password.length ? password === credentialRepeat : false
    );
  }, [password, credentialRepeat]);

  useEffect(() => {
    
    reSubmit("SMS", data.phone);

  }, [])
  
  return (
    <ScreenContainerForm>
      <View style={{ height: Platform.OS === "ios" ? height * .9 : height}}>

      <View className=" flex-1 ">
          <Text style={styles.title}>
            Recuperar contraseña
          </Text>
        <View style={styles.contentContainer}>
          <View style={{ justifyContent: "center" }}>
            <Text style={[styles.subTitle, { fontSize: 20 }]}>
              {Languages[language].SCREENS.PasswordScreen.text2}
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!countLength ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text3}
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!countUpperCase ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text4}
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!countLowerCase ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text5}
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!countNumbers ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text6}
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!countSymbols ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text7}{" "}
              <Text
                style={[styles.subTitle, { color: Colors.green, fontSize: 16 }]}
              >
                {" "}
                # ? ! $ % & * - . ,
              </Text>
            </Text>
            <Text style={[styles.subTitle]}>
              {" "}
              {!equals ? (
                "●"
              ) : (
                <Feather name="check-circle" size={16} color={Colors.green} />
              )}{" "}
              {Languages[language].SCREENS.PasswordScreen.text8}
            </Text>
          </View>
          <View>
            <Input
              placeholder={
                Languages[language].SCREENS.PasswordScreen.placeholder1
              }
              secureTextEntry={true}
              onChangeText={(e: string) => {
                change(e, "password");
              }}
              keyboardType="default"
              value={password}
              maxLength={12}
              placeholderColor={Colors.transparent}
            />

            <Input
              placeholder={
                Languages[language].SCREENS.PasswordScreen.placeholder2
              }
              secureTextEntry={true}
              onChangeText={(e: string) => {
                setcredentialRepeat(e);
              }}
              keyboardType="default"
              value={credentialRepeat}
              maxLength={12}
              placeholderColor={Colors.transparent}
              styleContainer={{marginBottom:10}}
            />
            <Input
              placeholder={
                Languages[language].SCREENS.PasswordScreen.placeholder2
              }
              onChangeText={(e: string) => {
                setCode(e.replace(/[^0-9]/g, ""))
              }}
              labelText="Ingrese el código que le enviamos a su teléfono por SMS o Whatsapp"
              keyboardType="default"
              value={Code}
              maxLength={6}
              placeholderColor={Colors.transparent}
            />
          </View>
        </View>
      </View>
      <View className="absolute bottom-10 w-full flex-row justify-between px-5">
        <View className="w-[45%] items-center">
          <Button
            text={"Volver"}
            onPress={() => {
              navigation.goBack();
            }}
            typeButton="white"
          />
        </View>
        <View className="w-[45%] items-center">
          <Button
            text={"Siguiente"}
            disabled={disable()}
            onPress={() => {
              onSubmit();
            }}
          />
        </View>
      </View>
      </View>
    </ScreenContainerForm>
  );
}

export default ChangePasswordBusinessScreen;

const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  title: {
    textAlign: "center",
    color: Colors.black,
    fontFamily: "Bold",
    fontSize: 20,
    marginTop: width * 0.10,
  },
  subTitle: {
    textAlign: "left",
    color: Colors.primary,
    fontFamily: "Bold",
    fontSize: 12,
    width: "100%",
    marginVertical: 5,
  },
  paragraph: {
    fontFamily: "Bold",
    fontSize: 24,
    paddingHorizontal: width * 0.1,
  },
  contentContainer: {
    width: width * 0.80,
    marginHorizontal: width * 0.07,
    justifyContent: "flex-start",
    marginTop:height * 0.05,
    flex: 1,
    gap:20
  },
  cancelButton: {
    backgroundColor: Colors.transparent,
    elevation: 0,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: Colors.blackBackground,
  },
  select: {
    color: Colors.blackBackground,
    borderBottomColor: Colors.blackBackground,
    borderStyle: "solid",
    borderBottomWidth: 2,
  },
});

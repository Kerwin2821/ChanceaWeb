import React, { useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Platform, Linking, TouchableOpacity } from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { width, height, ToastCall, GetHeader } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { useAuth, useFormRegister, useRender } from "../../context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { HttpService } from "../../services";
import { RegisterRequestNew } from "../../context/registerContext/RegisterInterfaces";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenContainerForm from "../../components/ScreenContainerForm";

import { CheckBox } from "@rn-vui/themed";
import { font } from "../../../styles";

function RegisterScreen4() {
  const { TokenAuthApi, setUser } = useAuth();
  const { language, setLoader } = useRender();
  const { registerReq, setRegisterReq, initialStateRegister, partPhoto } = useFormRegister();

  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [countLength, setCountLength] = useState<boolean>(false);
  const [countUpperCase, setCountUpperCase] = useState<boolean>(false);
  const [countLowerCase, setCountLowerCase] = useState<boolean>(false);
  const [countNumbers, setCountNumbers] = useState<boolean>(false);
  const [countSymbols, setCountSymbols] = useState<boolean>(false);
  const [equals, setEquals] = useState<boolean>(false);
  const [terminosycondiciones, setTerminosycondiciones] = useState<boolean>(false);
  const [credentialRepeat, setcredentialRepeat] = useState<string>("");

  const disable = () => {
    const { password } = registerReq;
    return !(password?.length >= 8) || !(credentialRepeat.length >= 8) || !terminosycondiciones;
  };

  const openLink = () => {
    Linking.openURL("https://chanceavenezuela.com/terminos-y-condiciones-chancea");
  };

  const onSubmit = async () => {
    try {
      setLoader(true);

      const { password } = registerReq;
      const deviceId = await AsyncStorage.getItem("deviceId");
      await AsyncStorage.setItem("LocationPermissonData", "1");

      if (password !== credentialRepeat) {
        ToastCall("warning", Languages[language].SCREENS.PasswordScreen.ERRORS.message2, language);
        return;
      }

      console.log({ ...registerReq, externalId: deviceId as string }, "Req");
      const host = process.env.APP_BASE_API;
      const url: string = "/api/appchancea/customers";
      const headers = GetHeader(TokenAuthApi, "application/json");
      const req: RegisterRequestNew = { ...registerReq, externalId: deviceId as string };

      const response = await HttpService("post", host, url, req, headers);

      console.log(response);
      console.log(req.password);
      console.log(req.email);
      await AsyncStorage.setItem("RegisterData", JSON.stringify({ credencial: req.password, email: req.email }));
      setRegisterReq(initialStateRegister);
      navigation.navigate("RegisterScreen5");
    } catch (err) {
      console.log(JSON.stringify(err));
      ToastCall("error", Languages[language].GENERAL.ERRORS.GeneralError, language);
    } finally {
      setLoader(false);
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
    [registerReq.password]
  );

  const change = (value: string, key: string) => {
    key === "password" && validatePassword(value);

    setRegisterReq({
      ...registerReq,
      [key]: value,
    });
  };
  useEffect(() => {
    const { password } = registerReq;
    setEquals(password.length && password.length ? password === credentialRepeat : false);
  }, [registerReq.password, credentialRepeat]);
  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-5">
        <View className="w-full px-5 mt-8">
          <Text style={[font.Bold, { fontSize: 22, textAlign: "center", color: Colors.black, marginBottom: 15 }]}>
            {Languages[language].SCREENS.PasswordScreen.text1}
          </Text>

          <View className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
            <Text style={[font.Bold, { fontSize: 16, color: Colors.primary, marginBottom: 10 }]}>
              {Languages[language].SCREENS.PasswordScreen.text2}
            </Text>

            <View className="gap-y-1">
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!countLength ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text3}
              </Text>
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!countUpperCase ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text4}
              </Text>
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!countLowerCase ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text5}
              </Text>
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!countNumbers ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text6}
              </Text>
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!countSymbols ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text7}
                <Text style={{ color: Colors.green, fontSize: 13 }}> # ? ! $ % & * - . ,</Text>
              </Text>
              <Text style={[styles.subTitle, { width: '100%' }]}>
                {!equals ? "●" : <Feather name="check-circle" size={14} color={Colors.green} />} {Languages[language].SCREENS.PasswordScreen.text8}
              </Text>
            </View>
          </View>

          <View className="w-full mb-4">
            <Input
              placeholder={Languages[language].SCREENS.PasswordScreen.placeholder1}
              secureTextEntry={true}
              onChangeText={(e: string) => {
                change(e, "password");
              }}
              keyboardType="default"
              value={registerReq.password}
              maxLength={12}
              placeholderColor={Colors.transparent}
            />
          </View>

          <View className="w-full mb-4">
            <Input
              placeholder={Languages[language].SCREENS.PasswordScreen.placeholder2}
              secureTextEntry={true}
              onChangeText={(e: string) => {
                setcredentialRepeat(e);
              }}
              keyboardType="default"
              value={credentialRepeat}
              maxLength={12}
              placeholderColor={Colors.transparent}
            />
          </View>

          <View className="w-full items-center mt-2">
            <TouchableOpacity onPress={openLink} className="mb-2">
              <Text style={[font.Regular, { color: Colors.primary, textDecorationLine: "underline", fontSize: 14 }]}>
                Ver términos y condiciones
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center justify-start w-full">
              <CheckBox
                containerStyle={{ backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginRight: 0 }}
                textStyle={[font.Regular, { fontSize: 13, fontWeight: 'normal' }]}
                checked={terminosycondiciones}
                onPress={() => setTerminosycondiciones(!terminosycondiciones)}
                title="He leído y aceptado los términos y condiciones."
              />
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

export default RegisterScreen4;

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
    marginTop: width * 0.1,
  },
  subTitle: {
    textAlign: "left",
    color: Colors.primary,
    fontFamily: "Bold",
    fontSize: 12,
    width: "100%",
    marginVertical: 3,
  },
  paragraph: {
    fontFamily: "Bold",
    fontSize: 24,
    paddingHorizontal: width * 0.1,
  },
  contentContainer: {
    width: width * 0.8,
    marginHorizontal: width * 0.07,
    justifyContent: "flex-start",
    marginTop: height * 0.02,
    flex: 1,
    gap: 20,
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

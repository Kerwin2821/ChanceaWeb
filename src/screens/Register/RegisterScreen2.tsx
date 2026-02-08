import { View, StyleSheet, ScrollView, Text, Platform } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import { useAuth, useFormRegister, useRender } from "../../context";
import { HttpService } from "../../services";
import Languages from "../../utils/Languages.json";

import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { useNavigation } from "@react-navigation/native";
import InputPhoneNumber from "../../components/InputPhoneNumber/InputPhoneNumber";
import { font } from "../../../styles";
import ScreenContainer from "../../components/ScreenContainer";
import RegisteIMG3 from "../../components/imgSvg/RegisteIMG3";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import InputDisabled from "../../components/InputDisabledComponent/InputDisabled";
import ScreenContainerForm from "../../components/ScreenContainerForm";

const formatNumber = (number: number) => `0${number}`.slice(-2);

const getRemaining = (time: number) => {
  const mins = Math.floor(time / 60);
  const secs = time - mins * 60;
  return { mins: formatNumber(mins), secs: formatNumber(secs) };
};

let regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const regexTelefonoVenezolano =
  /^(412|414|416|424|413|415|426|428|422|422)\d{7}$/;

export default function RegisterScreen2() {
  const {
    registerReq,
    registerReq: { email, phone },
    setRegisterReq,
    IsGoogleRegister
  } = useFormRegister();
  const { TokenAuthApi } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [isCorreo, setIsCorreo] = useState<boolean | "pending">("pending");
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">(
    "pending"
  );
  const change = useCallback(
    (value: string | number, key: string | number) => {
      setRegisterReq({
        ...registerReq,
        [key]: value,
      });
    },
    [registerReq]
  );

  useEffect(() => {
    if (registerReq.email) {
      setIsCorreo(regex.test(registerReq.email));
    }
  }, [registerReq.email]);
  useEffect(() => {
    if (registerReq.phone) {
      setIsNumberPhone(
        regexTelefonoVenezolano.test(registerReq.phone.slice(3))
      );
    }
  }, [registerReq.phone]);

  async function ValidateData() {
    try {
      const host = process.env.APP_BASE_API;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const url2 = `/api/appchancea/customers/validEmail/`;
      const url3 = `/api/appchancea/customers/validPhonumber/`;
      const response2 = HttpService("post", host, url2, {
        email
      }, header, setLoader);
      const response3 = HttpService("post", host, url3, {
        phone
      }, header, setLoader);

      console.log("aqui");
      const dataReq = await Promise.all([response2, response3]);
      if (dataReq[0].codigoRespuesta !== "20") {
        ToastCall("warning", "Esta email ya esta registrada", "ES");
        return;
      }
      if (dataReq[1].codigoRespuesta !== "20") {
        ToastCall("warning", "Esta teléfono ya esta registrada", "ES");
        return;
      }
      navigation.navigate("RegisterScreen3");
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } // Displaying the stringified data in an alert popup
  }

  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-5">
        <View className="w-full justify-center items-center my-8">
          <RegisteIMG3 width={Platform.OS === 'web' ? 180 : width * 0.35} height={Platform.OS === 'web' ? 180 : width * 0.35} />
          <Text style={[font.Bold, { fontSize: 18, textAlign: "center", width: "90%", marginTop: 10 }]}>
            Ahora déjanos tu teléfono y correo.
          </Text>
        </View>

        <View className="w-full px-5">
          <View className="w-full mb-4">
            <InputPhoneNumber
              labelText="Número de Teléfono"
              keyboardType="default"
              value={phone}
              onChangeText={(e: string) => {
                if (e.length < 15) change(e, "phone");
              }}
            />
            {registerReq.phone.slice(0, 3) === "+58" && !isNumberPhone ? (
              <Text className="text-xs text-red-400 mt-1" style={font.Regular}>
                No es un Número de teléfono
              </Text>
            ) : null}
          </View>

          <View className="w-full mb-4">
            {IsGoogleRegister ? (
              <InputDisabled labelText="Correo Electrónico" value={email} />
            ) : (
              <Input
                labelText="Correo Electrónico"
                placeholder="correo@gmail.com"
                keyboardType="email-address"
                value={email}
                maxLength={50}
                onChangeText={(e: string) => {
                  change(e, "email");
                }}
              />
            )}
            {!isCorreo ? (
              <Text className="text-xs text-red-400 mt-1" style={font.Regular}>
                No es un Email
              </Text>
            ) : null}
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
              disabled={
                !email ||
                !phone ||
                !isCorreo ||
                (registerReq.phone.slice(0, 3) === "+58" ? !isNumberPhone : false)
              }
              onPress={ValidateData}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  );
}
const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 150,
    borderRadius: 10,
    width: 150,
  },
});

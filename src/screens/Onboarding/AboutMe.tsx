import { Text, View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import Button from "../../components/ButtonComponent/Button";
import { GetHeader, ToastCall, height } from "../../utils/Helpers";
import Input from "../../components/InputComponent/Input";
import { useAuth, useRender } from "../../context";
import { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { font } from "../../../styles";

import { HttpService } from "../../services";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import RegisteIMG7 from "../../components/imgSvg/RegisteIMG7";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dataDescription from "../../utils/dataDescription.json";
import { FontAwesome6 } from "@expo/vector-icons";
import ScreenContainerForm from "../../components/ScreenContainerForm";

export interface CustumerIntereses {
  customers: any;
  description: string;
  iconsrc: string;
  id: number;
  name: string;
  select: boolean;
}

import OnboardingValidate from "../../utils/OnboardingValidate";

export default function AboutMe() {
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [TextData, setTextData] = useState<string>("");
  const route = useRoute();
  const data = route.params as { TextData: string } | undefined;

  async function GetIntereses() {
    if (!TextData.length || TextData.length < 30) {
      ToastCall("warning", "Texto debe ser mayor a 30 caracteres.", "ES");
      return;
    }
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("put", host, url, { ...user, aboutme: TextData }, header, setLoader);
      const updatedUser = { ...user, ...response, aboutme: TextData };
      setUser(updatedUser);
      await AsyncStorage.setItem("Sesion", JSON.stringify(updatedUser));

      if (data) {
        navigation.goBack();
        return;
      }

      const validate = await OnboardingValidate(updatedUser, navigation, setUser, {
        longitude: updatedUser.postionX,
        latitude: updatedUser.postionY
      }, { TokenAuthApi, SesionToken })

      if (!validate) return

      navigation.replace("Home");
    } catch (err: any) {
      console.error("Error in AboutMe onSubmit:", err);
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  useEffect(() => {
    if (data) {
      setTextData(data.TextData);
    } else {
      const indiceAleatorio = Math.floor(Math.random() * dataDescription.length);
      const descripcionAleatoria = dataDescription[indiceAleatorio];
      setTextData(descripcionAleatoria);
    }
  }, []);

  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto">
        <View style={styles.headerRow}>
          {data ? (
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome6 name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          ) : <View style={{ width: 44 }} />}

          <View style={styles.titleContainer}>
            <Text style={[font.Bold, styles.headerText]}>
              Sobre mí
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <View className="flex-1 px-6 pb-8">
          <View className="items-center mb-6 mt-4">
            <RegisteIMG7 width={Platform.OS === 'web' ? 120 : 100} height={Platform.OS === 'web' ? 120 : 100} />
            <Text style={[font.Bold, { textAlign: "center", marginTop: 15, fontSize: 16, color: "#333", lineHeight: 22 }]}>
              Para tener la oportunidad de encontrar a tu pareja ideal, comparte un poco acerca de ti. Esto ayudará a quienes estén interesados en ti a conocerte mejor.
            </Text>
          </View>

          <View className="flex-1">
            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              <Input
                value={TextData}
                onChangeText={(e) => {
                  setTextData(e);
                }}
                placeholder="Soy una persona muy divertida y me gusta viajar..."
                styleContainer={{ height: 180, width: '100%', borderWidth: 0 }}
                styleInput={{ height: '100%', width: '100%', textAlignVertical: 'top', paddingTop: 10, fontSize: 15 }}
                keyboardType="default"
                multiline
              />
            </View>
            <Text style={[font.Bold, { color: "#AA8ED6", marginTop: 8, textAlign: "right", fontSize: 13 }]}>
              {TextData.length}/150
            </Text>
          </View>

          <View className="mt-8">
            <Button
              text={!data ? "Siguiente" : "Guardar"}
              onPress={() => {
                GetIntereses();
              }}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: "#FFFFFF",
    minHeight: 60,
  },
  backButtonStyle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: "black",
  },
});

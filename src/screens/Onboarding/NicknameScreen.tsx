import { Text, View, StyleSheet, FlatList, Platform, TouchableOpacity, ScrollView } from "react-native";
import { CustomersHome, Items } from "../../utils/Interface";
import Button from "../../components/ButtonComponent/Button";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import Input from "../../components/InputComponent/Input";
import { useAuth, useFormRegister, useRender } from "../../context";
import { useCallback, useEffect, useState } from "react";
import Select from "../../components/Select/SelectComponent";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import { font } from "../../../styles";
import { HttpService } from "../../services";
import { Chip } from "@rn-vui/themed";
import { Colors } from "../../utils";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import { AxiosError } from "axios";
import { useStore } from "../../context/storeContext/StoreState";
import CacheImage from "../../components/CacheImage/CacheImage";
import OnboardingValidate from "../../utils/OnboardingValidate";

export interface Nickname {
  id: number;
  name: string;
  description: string;
  imagen: any;
  imagenContentType: string;
  url: string;
  gender: string;
}

export default function NicknameScreen() {
  const { TokenAuthApi, user, setUser, logOut, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { setCustomers, setCustomers2 } = useStore();
  const [InteresesCustomer, setInteresesCustomer] = useState<Nickname[]>([]);
  const [InteresesCustomerSelect, setInteresesCustomerSelect] = useState<Nickname | undefined>();
  const route = useRoute();
  const data = route.params as { Nickname: Nickname | undefined } | undefined;
  const [Loading, setLoading] = useState(false)

  async function GetNicknames() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/nicknames/${SesionToken}?gender.in=${user?.gender}&page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: Nickname[] = await HttpService("get", host, url, {}, header, setLoader);

      if (data) {
        setInteresesCustomerSelect(data.Nickname);
      }
      setInteresesCustomer(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  async function Submit() {
    if (!InteresesCustomerSelect) {
      ToastCall("warning", "Elige algún gusto", "ES");
      return;
    }
    try {
      setLoader(true)
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "put",
        host,
        url,
        { ...user, nickname: InteresesCustomerSelect },
        header
      );

      const updatedUser = { ...user, ...response, nickname: InteresesCustomerSelect };
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
      navigation.replace("Home")
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false)
    }
  }

  const SelectItem = (e: Nickname) => {
    if (!InteresesCustomerSelect) return setInteresesCustomerSelect(e);
    if (e.id === InteresesCustomerSelect.id) {
      setInteresesCustomerSelect(undefined);
    }
    setInteresesCustomerSelect(e);
  };

  useEffect(() => {
    GetNicknames();
  }, []);

  useEffect(() => {
    setLoading(false)
    setTimeout(() => {
      setLoading(true)
    }, 0);
  }, [InteresesCustomerSelect])

  return (
    <ScreenContainer backgroundColor="#FFFFFF" disabledPaddingBottom={true}>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto">
        <View style={styles.headerRow}>
          {data ? (
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome6 name="arrow-left" size={24} color={Colors.black} />
            </TouchableOpacity>
          ) : <View style={{ width: 44 }} />}

          <View style={styles.titleContainer}>
            <Text style={[font.Bold, styles.headerText]}>
              Identidad
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <View className="flex-1 px-6 pb-8">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            style={{ flex: 1 }}
          >
            <View className="items-center mb-6 mt-4">
              <Text style={[font.Bold, { fontSize: 18, textAlign: "center", marginBottom: 20, color: Colors.black, lineHeight: 24 }]}>
                ¿Con cuál de estas opciones te identificas más como Venezolano?
              </Text>

              <View style={{ height: 150, width: 150, justifyContent: 'center', alignItems: 'center' }}>
                {!InteresesCustomerSelect && (
                  <Image
                    source={require("../../../assets/items/Recurso3.svg")}
                    style={{ height: 100, width: 120 }}
                    transition={{ duration: 300 }}
                  />
                )}
                {(!Loading || InteresesCustomerSelect) && (
                  <CacheImage
                    source={InteresesCustomerSelect?.url || ""}
                    styleImage={{ height: 150, width: 150, borderRadius: 20 }}
                  />
                )}
              </View>
            </View>

            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 min-h-[300px]">
              <View className="flex-row flex-wrap justify-center">
                {InteresesCustomer.map((e) => (
                  <View style={{ margin: 5 }} key={e.id}>
                    {e.id == InteresesCustomerSelect?.id ? (
                      <Chip
                        title={e.description}
                        icon={{
                          name: "clear",
                          type: "material-icon",
                          size: 14,
                          color: Colors.white,
                        }}
                        iconRight
                        onPress={() => SelectItem(e)}
                        color={Colors.primary}
                        titleStyle={[font.SemiBold, { fontSize: 13 }]}
                      />
                    ) : (
                      <Chip
                        title={e.description}
                        onPress={() => SelectItem(e)}
                        type="outline"
                        buttonStyle={{ borderColor: "#E5E7EB" }}
                        titleStyle={[font.Regular, { fontSize: 13, color: "#666" }]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="mt-6">
            <Button
              text={!data ? "Siguiente" : "Guardar"}
              onPress={() => Submit()}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: Colors.white,
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
    color: Colors.black,
  },
});

import { Text, View, StyleSheet, FlatList, Platform, TouchableOpacity, ScrollView } from "react-native";
import { Items } from "../../utils/Interface";
import Button from "../../components/ButtonComponent/Button";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import Input from "../../components/InputComponent/Input";
import { useAuth, useFormRegister, useRender } from "../../context";
import { useCallback, useEffect, useState } from "react";
import Select from "../../components/Select/SelectComponent";
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { font } from "../../../styles";
import { HttpService } from "../../services";
import { Chip } from "@rn-vui/themed";
import { Colors } from "../../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { FontAwesome6 } from "@expo/vector-icons";
import OnboardingValidate from "../../utils/OnboardingValidate";

export interface CustumerIntereses {
  customers: any;
  description: string;
  iconsrc: string;
  id: number;
  name: string;
  select: boolean;
}

export default function InteresSelect() {
  const { TokenAuthApi, setUser, user, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [InteresesCustomer, setInteresesCustomer] = useState<CustumerIntereses[]>([]);
  const [InteresesCustomerSelect, setInteresesCustomerSelect] = useState<CustumerIntereses[]>([]);
  const route = useRoute();
  const data = route.params as { customerInterestings: CustumerIntereses[] } | undefined;

  async function GetIntereses() {
    try {
      let array;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer-interestings/${SesionToken}?page=0&size=100`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: CustumerIntereses[] = await HttpService("get", host, url, {}, header, setLoader);

      if (data) {
        setInteresesCustomerSelect(data.customerInterestings);
        array = response.map((ele) => {
          const validate = data.customerInterestings.some((e) => e.id === ele.id);
          return { ...ele, select: validate };
        });
      } else {
        array = response.map((ele) => ({ ...ele, select: false }));
      }
      setInteresesCustomer(array);
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
    if (!InteresesCustomerSelect.length) {
      ToastCall("warning", "Elige algún interes", "ES");
      return;
    }
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      const response = await HttpService(
        "put",
        host,
        url,
        { ...user, customerInterestings: InteresesCustomerSelect },
        header,
        setLoader
      );

      const updatedUser = { ...user, ...response, customerInterestings: InteresesCustomerSelect };
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
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  const SelectInteres = (e: CustumerIntereses) => {
    const validate = InteresesCustomerSelect.some((ele) => e.id === ele.id);

    if (!validate) {
      setInteresesCustomer(
        InteresesCustomer.map((ele) => {
          if (ele.id === e.id) {
            ele.select = true;
          }
          return ele;
        })
      );
      setInteresesCustomerSelect([...InteresesCustomerSelect, e]);
    } else {
      setInteresesCustomer(
        InteresesCustomer.map((ele) => {
          if (ele.id === e.id) {
            ele.select = false;
          }
          return ele;
        })
      );
      setInteresesCustomerSelect(InteresesCustomerSelect.filter((ele) => ele.id !== e.id));
    }
  };

  useEffect(() => {
    GetIntereses();
  }, []);

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
              Mis Intereses
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
              <Text style={[font.Bold, { fontSize: 18, textAlign: "center", marginBottom: 15, color: Colors.black }]}>
                ¿Con cuáles de estos intereses te identificas?
              </Text>
              <Image
                source={require("../../../assets/items/Recurso4.svg")}
                style={{ height: Platform.OS === 'web' ? 100 : width * 0.3, width: Platform.OS === 'web' ? 120 : width * 0.4 }}
                transition={{ duration: 300 }}
              />
            </View>

            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 min-h-[300px]">
              <View className="flex-row flex-wrap justify-center">
                {InteresesCustomer.map((e) => (
                  <View style={{ margin: 5 }} key={e.id}>
                    {e.select ? (
                      <Chip
                        title={e.description}
                        icon={{
                          name: "clear",
                          type: "material-icon",
                          size: 14,
                          color: Colors.white,
                        }}
                        iconRight
                        onPress={() => SelectInteres(e)}
                        color={Colors.primary}
                        titleStyle={[font.SemiBold, { fontSize: 13 }]}
                      />
                    ) : (
                      <Chip
                        title={e.description}
                        onPress={() => SelectInteres(e)}
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

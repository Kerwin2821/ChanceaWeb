import { View, Text, Platform, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { environmet } from "../../../env";
import { useAuth, useRender } from "../../context";
import { GetHeader, ToastCall, height } from "../../utils/Helpers";
import { HttpService } from "../../services";
import { AntDesign, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { font } from "../../../styles";
import { Colors } from "../../utils";
import { FAB, Slider } from "@rn-vui/themed";
import { CustomersHome, Items } from "../../utils/Interface";
import Select from "../../components/Select/SelectComponent";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DialogSure from "../../components/Dialog/SureDialog";
import { PreferenceFind } from "../../context/AuthContext/AuthInterface";
import { useStore } from "../../context/storeContext/StoreState";
import { AxiosError } from "axios";
import { getPreference, savePreference } from "../../services/PreferenceAsyncStorage";
import {
  getCustomerProfilesStorage,
  saveCustomerProfilesStorage,
} from "../../services/CacheStorage/CustomerProfiles/CustomerProfileStorage";
import useGradualFetch from "../../components/CacheImageCard/useGradualFetch";
import { useImageCacheStore } from "../../context/ImageCacheHook/imageCacheStore";

export interface ResponsePreferenceFind {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  preferenceFind: PreferenceFind;
}

const generos: Items[] = [
  {
    label: "Hombres",
    value: "MASCULINO",
  },
  {
    label: "Mujeres",
    value: "FEMENINO",
  },
  {
    label: "Otros",
    value: "AMBOS",
  },
];

const PreferenceScreen = () => {
  const { user, TokenAuthApi, PreferenceFindUser, setPreferenceFindUser, logOut, SesionToken } = useAuth();
  const { setLoader, language } = useRender();
  const [value, setValue] = useState(0);
  const [ageRangeMin, setageRangeMin] = useState(0);
  const [ageRangeMax, setageRangeMax] = useState(0);
  const [Edit, setEdit] = useState(false);
  const [DialogActive, setDialogActive] = useState(false);
  const [GenderSelect, setGenderSelect] = useState<string | number | undefined>();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { setCustomers, setCustomers2 } = useStore();
  const { setImageCache } = useImageCacheStore();

  async function GetPreference() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/preference-finds-by-customer/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ResponsePreferenceFind = await HttpService("get", host, url, {}, header);

      let data = response.preferenceFind
      setPreferenceFindUser(data);
      setValue(data.distance);
      setageRangeMin(data.ageRangeMin);
      setageRangeMax(data.ageRangeMax);
      setGenderSelect(data.preferenceGender);
      savePreference(response.preferenceFind);
    } catch (err: any) {
      console.error(JSON.stringify(err));
    }
  }

  async function GetCustomer() {
    setLoader(true);
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/listOrderLocatorFormal2/${SesionToken}?page=0&size=10`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      console.log(url);
      const response: CustomersHome[] = await HttpService("get", host, url, {}, header);

      console.log(response);

      setCustomers(response);
      setCustomers2(response);
      const CacheImage = await getCustomerProfilesStorage();
      setImageCache(CacheImage);
      setTimeout(() => {
        setLoader(false);
      }, 2000);
      const gradual = await useGradualFetch(response, CacheImage, setImageCache);
      // Guardar toda la caché
      console.log(gradual, "gradual");
      await saveCustomerProfilesStorage(gradual);
    } catch (err: any) {
      const errors = err as AxiosError;

      if (errors.response?.status === 400) {
        console.log(errors.response);
        return;
      }

      if (errors.response?.status === 412) {
        /* if (Platform.OS !== "ios") {
          navigation.navigate("SubscriptionScreen");
        } */
        navigation.navigate("SubscriptionScreen");
        return;
      }
      if (errors.response?.status === 413) {
        ToastCall("error", `Se volverán a mostrar los usuario que le diste no me cuadra`, "ES");
        return;
      }
      if (errors.response?.status === 414) {
        if (Platform.OS === "ios") {
          navigation.navigate("Login");
        } else {
          navigation.navigate("Prelogin");
        }

        setTimeout(() => {
          logOut();
        }, 100);
        return;
      }
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      /* setLoader(false); */
    }
  }

  async function UpdateUser() {
    setLoader(true);
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/create-preference-finds-app/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: ResponsePreferenceFind = await HttpService(
        "post",
        host,
        url,
        {
          ageRangeMin: ageRangeMin,
          ageRangeMax: ageRangeMax,
          distance: value,
          sessionToken: SesionToken,
          preferenceGender: GenderSelect,
        },
        header
      );
      console.log(response);
      if (response.codigoRespuesta === "59") {
        ToastCall("warning", "No hay chances con esa preferencia", "ES");
        return;
      }
      ToastCall("success", "Preferencias actualizadas", language);
      setPreferenceFindUser(response.preferenceFind);
      setValue(response.preferenceFind.distance);
      setageRangeMin(response.preferenceFind.ageRangeMin);
      setageRangeMax(response.preferenceFind.ageRangeMax);
      setGenderSelect(response.preferenceFind.preferenceGender);
      savePreference(response.preferenceFind);
      setEdit(false);
      await GetCustomer();
    } catch (err: any) {
      console.error(err);
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
    (async () => {
      const data = await getPreference();
      console.log(data);
      if (data) {
        setPreferenceFindUser(data);
        setValue(data.distance);
        setageRangeMin(data.ageRangeMin);
        setageRangeMax(data.ageRangeMax);
        setGenderSelect(data.preferenceGender);
      } else {
        GetPreference();
      }
    })();
  }, []);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (Edit) {
          // If we don't have unsaved changes, then we don't need to do anything
          e.preventDefault();
          setDialogActive(true);
          return;
        }

        // Prevent default behavior of leaving the screen

        navigation.dispatch(e.data.action);
      }),
    [navigation, Edit]
  );

  return (
    <ScreenContainer>
      <View className=" h-[85vh] px-2">
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-10 "
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <View className=" flex-row justify-center p-3 mb-2 ">
          <Text className=" text-lg text-primary " style={font.Bold}>
            Preferencias de Busqueda
          </Text>
        </View>
        {PreferenceFindUser && (
          <>
            <View className=" flex-row w-full justify-around mt-5 items-center">
              <Text className=" text-base" style={{ fontFamily: "Bold" }}>
                Distancia de busqueda
              </Text>
              <Text className="text-gray-500 text-xl" style={{ fontFamily: "Regular" }}>
                {"Km "}
                <Text className="text-gray-950">{value}</Text>
              </Text>
            </View>
            <View className=" justify-center w-full items-stretch mt-2 px-5">
              <Slider
                value={value}
                onValueChange={(e) => {
                  setValue(e), setEdit(true);
                }}
                maximumValue={1000}
                minimumValue={1}
                step={1}
                allowTouchTrack
                animationType="timing"
                trackStyle={{
                  height: 10,
                  borderRadius: 10,
                  backgroundColor: "transparent",
                }}
                thumbStyle={{
                  height: 25,
                  width: 25,
                  backgroundColor: "transparent",
                }}
                thumbProps={{
                  children: (
                    <View
                      className=" w-8 h-8 justify-center items-center rounded-full bottom-2"
                      style={{ backgroundColor: Colors.primary }}
                    >
                      <Ionicons name="location-sharp" size={20} color="white" />
                    </View>
                  ),
                }}
              />
            </View>

            <View className="mt-5 justify-center items-center">
              <View className="w-[90%] justify-center items-center ">
                <Select
                  items={generos}
                  labelText="Muestrame"
                  value={GenderSelect || ""}
                  onChange={(e: string | number) => {
                    setGenderSelect(e);
                    setEdit(true);
                  }}
                />
              </View>
            </View>
            <View className=" flex-row w-full justify-around mt-5 items-center">
              <View className="text-gray-500 flex-row gap-x-2 items-center">
                <Text className=" text-base" style={{ fontFamily: "Bold" }}>
                  Rango de edad de
                </Text>

                <Text className="text-gray-950 text-lg" style={{ fontFamily: "Bold" }}>
                  {ageRangeMin}
                </Text>
                <Text className="text-gray-950" style={font.Regular}>
                  hasta
                </Text>
                <Text className="text-gray-950 text-lg" style={{ fontFamily: "Bold" }}>
                  {ageRangeMax}
                </Text>
                <Text className="text-gray-950" style={font.Regular}>
                  años
                </Text>
              </View>
            </View>
            <View className=" justify-center items-center">
              <MultiSlider
                values={[ageRangeMin, ageRangeMax]}
                min={18}
                max={85}
                customMarker={() => <View className=" h-5 w-5 rounded-full bg-primary"></View>}
                selectedStyle={{ backgroundColor: Colors.black, height: 10 }}
                unselectedStyle={{ height: 10, borderRadius: 10 }}
                onValuesChange={(e) => {
                  if (ageRangeMin !== e[0]) setageRangeMin(e[0]);
                  if (ageRangeMax !== e[0]) setageRangeMax(e[1]);
                  setEdit(true);
                }}
              />
            </View>
          </>
        )}

        <FAB
          visible={Edit && !!GenderSelect }
          icon={<AntDesign name="save" size={24} color={"white"} />}
          color={Colors.primary}
          style={{ position: "absolute", bottom: 10, right: 10 }}
          onPress={() => UpdateUser()}
        />
        <DialogSure
          isActive={DialogActive}
          setActive={setDialogActive}
          Text="¿Estas seguro de volver sin editar?"
          onPress={() => {
            setEdit(false),
              setTimeout(() => {
                navigation.goBack();
              }, 100);
          }}
        />
      </View>
    </ScreenContainer>
  );
};

export default PreferenceScreen;

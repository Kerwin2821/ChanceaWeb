"use client";
import { useEffect, useState, useRef } from "react";
import CustomMap from "../../../components/CustomMap/CustomMap";
import { View, TouchableOpacity, Text } from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { FAB } from "@rn-vui/themed";
/* import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete" */
import { useAuth, useRender } from "../../../context";
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import Button from "../../../components/ButtonComponent/Button";
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness";
import { initialFormCreateTienda, type Stores } from "../../../context/storeBusinessHooks/StoreBusinessInterface";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { Colors } from "../../../utils";
import { mapStyle } from "../../../utils/Theme";
import HeaderApp from "../../../components/HeaderApp";

export default function StoreUbication() {
  const { setLoader } = useRender();
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { FormCreateTienda, setFormCreateTienda, Stores, setStores } = useStoreBusiness();
  const { TokenAuthApi, SesionToken } = useAuth();
  const [LocationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const [ShowMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const { DataCoordenadas } = useAuth();
  const route = useRoute();
  const data = route.params as { store: Stores } | undefined;

  const getLocation = async () => {
    if (data?.store) {
      setLocationData({
        latitude: data?.store?.positionY,
        longitude: data?.store?.positionX,
      });
      focusCuponMapUser({
        latitude: data?.store?.positionY,
        longitude: data?.store?.positionX,
      });
      return;
    }
    setLocationData({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
    focusCuponMapUser({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
  };

  const focusCuponMapUser = (e?: { latitude: number; longitude: number }) => {
    if (e) {
      setMapRegion({
        latitude: e.latitude as number,
        longitude: e.longitude as number,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
    } else {
      setMapRegion({
        latitude: LocationData.latitude,
        longitude: LocationData.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      });
    }
  };

  async function sendUpdate() {
    try {
      if (!data) return;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/store-businesses?sessionToken=${SesionToken}&businessId=${data.store.id}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const updateData = {
        ...data.store,
        positionY: LocationData.latitude,
        positionX: LocationData.longitude,
        updateDate: new Date().toISOString(),
      } as any;
      const response = await HttpService("put", host, url, updateData, header, setLoader);
      const newArray = Stores.map((item) => (item.id === data.store.id ? { ...item, ...updateData } : item));
      setStores(newArray);
      setFormCreateTienda(initialFormCreateTienda);
      ToastCall("success", "Tienda actualizada exitosamente", "ES");
      navigation.goBack();
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  useEffect(() => {
    getLocation();
    setTimeout(() => {
      setShowMap(true);
    }, 1000);
  }, []);

  if (!ShowMap) {
    return <></>;
  }

  return (
    <View className="h-full relative">
      {/* Header */}
      <HeaderApp title={data?.store ? "Actualizar Ubicación" : "Seleccionar Ubicación"} />

      {/* Search Bar */}
      <View className="absolute top-[100] left-0 right-0 z-20 px-4">
        <View className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* <GooglePlacesAutocomplete
            placeholder="Buscar ubicación"
            fetchDetails={true}
            onPress={(data, details = null) => {
              if (details?.geometry.location) {
                focusCuponMapUser({
                  longitude: details?.geometry.location.lng,
                  latitude: details?.geometry.location.lat,
                })
                setLocationData({
                  longitude: details?.geometry.location.lng,
                  latitude: details?.geometry.location.lat,
                })
              }
            }}
            query={{
              key: "AIzaSyCSg_0h9oLoHP8ik85nz9Th90IgenijeD8",
              language: "es",
            }}
            styles={{
              container: {
                flex: 0,
              },
              textInputContainer: {
                backgroundColor: "transparent",
              },
              textInput: {
                height: 50,
                color: "#5d5d5d",
                fontSize: 16,
                paddingHorizontal: 16,
              },
              predefinedPlacesDescription: {
                color: Colors.primary,
              },
              listView: {
                backgroundColor: "white",
              },
              row: {
                padding: 13,
                height: 50,
                flexDirection: "row",
              },
              separator: {
                height: 0.5,
                backgroundColor: "#c8c7cc",
              },
            }}
          /> */}
        </View>
      </View>

      {/* Instructions Card */}
      <View className="absolute top-[15%] left-0 right-0 z-20 px-4">
        <View className="bg-white/90 rounded-lg p-3 shadow-sm">
          <View className="flex-row items-center">
            <MaterialIcons name="info-outline" size={20} color={Colors.secondary} />
            <Text className="text-secondary font-semibold ml-2">Instrucciones</Text>
          </View>
          <Text className="text-gray-700 text-sm mt-1">
            Toca en el mapa para seleccionar la ubicación exacta de tu tienda.
          </Text>
        </View>
      </View>

      {/* Map */}
      {isFocused && (
        <CustomMap
          region={mapRegion || {
            latitude: LocationData.latitude,
            longitude: LocationData.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          onMapPress={(e) => {
            setLocationData({
              longitude: e.coordinate.longitude,
              latitude: e.coordinate.latitude,
            });
          }}
          onMapReady={getLocation}
          markers={[{
            id: 'selected-location',
            coordinate: {
              latitude: LocationData.latitude,
              longitude: LocationData.longitude,
            }
          }]}
        />
      )}

      {/* My Location Button */}
      <View className="absolute bottom-[15%] right-4 z-10">
        <FAB
          icon={(() => <MaterialIcons name="my-location" size={24} color="white" />) as any}
          color={Colors.primary}
          onPress={() => focusCuponMapUser()}
        />
      </View>

      {/* Action Buttons */}
      <View className="absolute bottom-5 left-0 right-0 z-10 flex-row justify-between px-5">
        <View className="w-[45%]">
          <Button
            text="Volver"
            onPress={() => {
              navigation.goBack();
            }}
            typeButton="white"
          />
        </View>
        <View className="w-[45%]">
          <Button
            text={data?.store ? "Guardar" : "Continuar"}
            disabled={!LocationData.latitude || !LocationData.longitude}
            onPress={() => {
              if (data?.store) {
                sendUpdate();
              } else {
                setFormCreateTienda({
                  ...FormCreateTienda,
                  positionY: LocationData.latitude,
                  positionX: LocationData.longitude,
                });
                navigation.navigate("StorePassword");
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}
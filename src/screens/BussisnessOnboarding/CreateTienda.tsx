import { useEffect, useState, useRef } from "react";
import CustomMap from "../../components/CustomMap/CustomMap";
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator } from "react-native";
import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CommonActions, useIsFocused, useNavigation } from "@react-navigation/native";
import { useAuth, useFormRegister, useRender } from "../../context";
import { FAB } from "@rn-vui/themed";
import Button from "../../components/ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import useRegisterNegociosReqStore from "../../context/RegisterBusinessHooks/useRegisterNegociosReqStore";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Colors } from "../../utils";
import { Bstore } from "../../context/storeBusinessHooks/StoreBusinessInterface";
import { GetHeader, haversineDistance, ToastCall } from "../../utils/Helpers";
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness";
import DialogCrearTienda from "../../components/Dialog/DialogCrearTienda/DialogCrearTienda";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import { HttpService } from "../../services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness";

export default function CreateTienda() {
  const { setLoader } = useRender();
  const isFocused = useIsFocused();
  const { TokenAuthApi, SesionToken } = useAuth();
  const { sesionBusiness, setSesionBusiness } = useSesionBusinessStore();

  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { Stores, setStores } = useStoreBusiness();
  const [LocationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });

  const [DirectionAct, setDirectionAct] = useState(false);
  const [ShowMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState<any>(null);
  const [CuponSelect, setCuponSelect] = useState<any>();
  const [StoreArray, setStoreArray] = useState<Bstore[]>([]);
  const { DataCoordenadas } = useAuth();
  const [openDialog, setopenDialog] = useState(false);

  const getLocation = async () => {
    setLocationData({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
    focusCuponMapUser({
      latitude: DataCoordenadas?.coords?.latitude,
      longitude: DataCoordenadas?.coords?.longitude,
    });
  };

  const focusCuponMap = (e: any) => {
    setLoader(true);
    setCuponSelect(e);
    setStoreArray(e.bstores);
    setStoreArray(
      e.bstores.sort(function (a: any, b: any) {
        const distA = haversineDistance(
          DataCoordenadas.coords.latitude,
          DataCoordenadas.coords.longitude,
          a.latitude,
          a.longitude
        );
        const distB = haversineDistance(
          DataCoordenadas.coords.latitude,
          DataCoordenadas.coords.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB; // Ordenar en orden ascendente (más cercano primero)
      })
    );
    setDestination({
      latitude: e.bstores[0].latitude,
      longitude: e.bstores[0].longitude,
    });

    setMapRegion({
      latitude: e.bstores[0].latitude,
      longitude: e.bstores[0].longitude,
      latitudeDelta: 0.002,
      longitudeDelta: 0.002,
    });

    setTimeout(() => {
      setLoader(false);
    }, 2000);
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

  const sendData = async () => {
    if (!sesionBusiness) return;
    setLoader(true);
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/store-businesses`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      const response = await HttpService(
        "post",
        host,
        url,
        {
          id: null,
          name: sesionBusiness.name,
          description: sesionBusiness.name,
          creationDate: "2025-02-24T04:27:41.837Z",
          updateDate: "2025-02-24T04:27:41.837Z",
          endingDate: "2025-02-24T04:27:41.837Z",
          statusBusiness: "ACTIVO",
          phoneNumber: sesionBusiness.phoneNumber,
          email: sesionBusiness.email,
          positionX: LocationData.longitude,
          positionY: LocationData.latitude,
          business: sesionBusiness,
          direccion: null,
        },
        header
      );
      /* setSesionBusiness(response.business);
      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(response.business));*/
      setStores([...Stores, response])
      const validate = await OnboardingValidateBusiness(response.business, navigation, setSesionBusiness, [...Stores, response]);

      if (!validate) return;

      navigation.replace("HomeBusiness");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }],
        })
      );
    } catch (error: any) {
      console.error(JSON.stringify(error));
      if (error && error?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false);
    }
  };

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
    <View style={styles.container}>
      <View className="flex-row justify-between items-center w-[90%] mx-5 mt-5 z-20 absolute top-[2%]">
        {/*  <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Entypo name="menu" size={32} color="black" />
        </TouchableOpacity> */}
        <View>
          <TouchableOpacity
            style={{
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            {/* <Avatar
              size={height / 15}
              rounded
              source={Sesion?.userImagen ? { uri: Sesion?.userImagen.url.replace('http://18.237.32.248', 'https://back.zaccoapp.com') }: undefined}
              title={Sesion ? Sesion?.name[0] + Sesion?.lastName[0] : 'NP'}
              containerStyle={{ backgroundColor: 'blue'}}
            ></Avatar> */}
          </TouchableOpacity>
        </View>
      </View>
      {/*   <View className="w-full justify-center items-center absolute z-10 bottom-[80%]">
        <View className=" w-[70%] ">
          <Tab
        value={index}
        onChange={(e) => setIndex(e)}
        variant="default"
        style={{
          alignItems: 'center',
          backgroundColor: Colors.gray,
          height:"80%",
          borderRadius:20
        }}
        indicatorStyle={{
          backgroundColor: Colors.primary,
          height: "100%",
          zIndex:-10,
          borderRadius:20
        }}
      >
        <Tab.Item
          title="Inicio"
          titleStyle={(active) => ({
            color: Colors.black,
            fontFamily: 'Regular',
            fontSize:14,
          })}
        />
        <Tab.Item
          title="MiCupones"
          titleStyle={(active) => ({
            color: Colors.black,
            fontFamily: 'Regular',
            fontSize:14,
            width:"100%"
          })}
        />
      </Tab>
        </View>
      </View> */}
      <View className=" absolute z-10 bottom-[50%] right-4">
        <FAB
          icon={(() => <Entypo name="ticket" size={24} color="white" />) as any}
          color="green"
          onPress={() => {
            /* navigation.navigate('Cupon', CuponSelect); */
          }}
          visible={!!destination.latitude}
        />
      </View>
      <View className=" absolute z-10 bottom-[40%] right-4">
        <FAB
          icon={(() => <FontAwesome5 name="walking" size={24} color="white" />) as any}
          color="green"
          onPress={() => {
            setDirectionAct(!DirectionAct);
          }}
          visible={!!destination.latitude}
        />
      </View>
      <View className=" absolute z-10 bottom-[30%] right-4">
        <FAB
          icon={(() => <MaterialIcons name="my-location" size={24} color="white" />) as any}
          color="green"
          onPress={() => focusCuponMapUser()}
          visible={!!destination.latitude}
        />
      </View>
      {/*  <View className=" absolute z-10 bottom-[5%]">
        <FlatList
          data={DataCupouns}
          horizontal
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View className='flex-1 justify-center items-center'>
              <ActivityIndicator size={64} color={Colors.primary}/>
            </View>
          }
          renderItem={(e) => (
            <TouchableOpacity
              style={[{
                width: 140,
                backgroundColor: Colors.white,
                borderRadius: 10,
                padding: 10,
                margin: 5,
                elevation: 0.4,
              },(CuponSelect?.id === e.item.id?{ borderWidth:2,
                borderColor:Colors.primary}:{})]}
              onPress={() => {focusCuponMap(e.item)}}
            >
              <Image source={{ uri: e.item.collections[0].url }} style={{ width: 120, height: 50, borderRadius: 9 }} />
              <Text
                numberOfLines={2}
                style={{
                  fontFamily: 'raleway-bold',
                  fontSize: 16,
                  marginTop: 5
                }}
              >
                {e.item.loteName}
              </Text>
              <Text
                numberOfLines={2}
                style={{ fontFamily: 'raleway', fontSize: 13, marginTop: 5, color: Colors.graySemiDark }}
              >
                {e.item.description}
              </Text>
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 5,
                  flexDirection: 'row',
                  marginBottom: -5
                }}
              ></View>
            </TouchableOpacity>
          )}
        />
      </View> */}
      <View className="w-full z-20 absolute justify-center top-[5%] bg-white h-[5%]">
        <Text className=" font-bold text-center ">Selecciona la ubicacion de tu sede principal</Text>
      </View>
      <View className="w-full z-20 absolute top-[10%]">
        {/* { <GooglePlacesAutocomplete
          placeholder="Buscar Tienda"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details?.geometry.location) {
              focusCuponMapUser({
                longitude: details?.geometry.location.lng,
                latitude: details?.geometry.location.lat
              });
              setLocationData({
                longitude: details?.geometry.location.lng,
                latitude: details?.geometry.location.lat
              });
            }
          }}
          query={{
            key: 'AIzaSyBT0geak9KMhEmo8ml5O0RLx67t8_gR9J8',
            language: 'es'
          }}
        />} */}
      </View>

      {isFocused && (
        <CustomMap
          region={mapRegion || {
            latitude: LocationData.latitude,
            longitude: LocationData.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          onMapReady={getLocation}
          onMapPress={(e) => {
            setLocationData({
              longitude: e.coordinate.longitude,
              latitude: e.coordinate.latitude,
            });
          }}
          style={styles.map}
          markers={[{
            id: 'selected-location',
            coordinate: {
              latitude: LocationData.latitude,
              longitude: LocationData.longitude,
            }
          }]}
        />
      )}
      <View className=" absolute z-10 bottom-[5%] w-full flex-row justify-between px-5">
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
            disabled={!LocationData.latitude || !LocationData.longitude}
            onPress={() => {
              sendData();
            }}
          />
        </View>
      </View>
      {/* <DialogCrearTienda active={openDialog} setActive={setopenDialog} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "110%",
  },
});

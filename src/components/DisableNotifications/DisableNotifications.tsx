import { Animated, TouchableWithoutFeedback, View, Text, Permission, Linking} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import DialogReport from "../Dialog/DialogReport/DialogReport";
import DialogBloquear from "../Dialog/DialogBloquear/DialogBloquear";
import { BottomSheet, ListItem } from "@rn-vui/themed";
import DialogDeleteMatch from "../Dialog/DialogDeleteMatch/DialogDeleteMatch";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "../../utils";
import Button from "../ButtonComponent/Button";
import { font } from "../../../styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import { useAuth, useRender } from "../../context";
import { GetHeader } from "../../utils/Helpers";
import { HttpService } from "../../services";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  navigation?: NavigationScreenNavigationType;
};

const DisableNotifications = ({ active, setActive }: props) => {
  const { SesionToken } = useAuth()
  const openAppSettings = () => {
    Linking.openSettings();
  };

  const { setDeviceId, user,TokenAuthApi,setUser } = useAuth();

  const permisosCheck = async () => {
    const { status: existingStatus } = await Notifications.requestPermissionsAsync();

    let finalStatus = existingStatus;
    if(finalStatus === "denied"){
      openAppSettings()
    }

    if(finalStatus === "granted"){
      await GenerateDeviceId();
    }
    setActive(false)

  };

  const GenerateDeviceId = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    setDeviceId(token);
    const host = process.env.APP_BASE_API;
    const url = `/api/appchancea/customers/${SesionToken}`;
    const header = await GetHeader(TokenAuthApi, "application/json");
    const response = await HttpService(
      "put",
      host,
      url,
      { ...user, externalId: token, customerStatus: "CONFIRMED" },
      header,
    );
    setUser(response);
    await AsyncStorage.setItem("Sesion", JSON.stringify(response));
    const deviceId = await AsyncStorage.getItem("deviceId");
    if (!deviceId) {
      await AsyncStorage.setItem("deviceId", token);
    } else {
      if (deviceId !== token) {
        await AsyncStorage.clear();
      }
    }
    console.log(token, "deviceId");
    return;
  };

  // Crear un valor animado para la posición vertical (Y)
  const bounceValue = useRef(new Animated.Value(0)).current;
  // Función para manejar la animación constante de rebote
  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -5, // Simula la caída del botón (más allá de su posición original)
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(bounceValue, {
          toValue: 0, // Rebote hacia la posición original
          bounciness: 10, // Controla la fuerza del rebote
          speed: 5, // Ajusta la velocidad del rebote
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Iniciar la animación al montar el componente
  useEffect(() => {
    startBounceAnimation();
  }, []);

  return (
    <>
      <BottomSheet modalProps={{}} isVisible={active} onBackdropPress={() => setActive(false)}>
        <View className=" h-[50vh]  ">
          <View className=" h-[27%] w-full flex-row justify-center items-end absolute pointer-events-none">
            <View className=" bg-white rounded-full z-10 h-16 ">
              <Ionicons name="notifications-circle" size={64} color={Colors.primary} />
            </View>
          </View>
          <View className=" h-[20%] "></View>
          <View className=" h-[80%] bg-white rounded-t-2xl pt-0 px-4 ">
            <View className=" flex-1 justify-center items-center">
              <Text style={[font.Bold, { textAlign: "center", fontSize: 20, paddingVertical: 10 }]}>
                ¡Notificaciones desactivadas!
              </Text>
              <Text style={[font.Regular, { textAlign: "center", fontSize: 16, paddingVertical: 10 }]}>
                Al activarlas no te pierdas de nada de tus cuadres, chances y salidas que puedan enviarte.
              </Text>
            </View>
            <View className=" flex-row gap-x-2">
              <View className="flex-1">
                <Button typeButton="white" text={"No"} onPress={() => setActive(false)} />
              </View>
              <View className="flex-1">
                <Animated.View style={{ transform: [{ translateY: bounceValue }] }}>
                  <Button styleText={{ color: "white" }} text={"Activar"} onPress={permisosCheck} />
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

export default DisableNotifications;

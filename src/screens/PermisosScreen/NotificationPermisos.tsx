import { View, Text, Platform, ScrollView } from "react-native";
import { Image } from "expo-image";
import { SVG } from "../../../assets";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import { useAuth, useRender } from "../../context";
import { ToastCall, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation } from "@react-navigation/native";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import * as Notifications from "expo-notifications";
import NotificationCallService from "../../services/NotificationCallService";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationPermisos = () => {
  const { setDeviceId } = useAuth();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const permisosCheck = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status: existingStatus } = await Notifications.requestPermissionsAsync();
        let finalStatus = existingStatus;

        if (finalStatus !== "granted") {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          finalStatus = newStatus;
        }

        if (finalStatus === "granted") {
          await GenerateDeviceId();
        }
      }
    } catch (error) {
      console.error("Error in permisosCheck:", error);
      // Even if it fails, we want the user to be able to proceed to login
      // ToastCall("error", "Error al procesar notificaciones", "ES");
    } finally {
      navigation.push("Prelogin");
    }
  };

  const GenerateDeviceId = async () => {
    try {
      const msg = messaging();
      if (typeof (msg as any).registerDeviceForRemoteMessages === "function") {
        await (msg as any).registerDeviceForRemoteMessages();
      }
      const token = await msg.getToken();
      if (token) {
        setDeviceId(token);
        const deviceId = await AsyncStorage.getItem("deviceId");
        if (!deviceId) {
          await AsyncStorage.setItem("deviceId", token);
        } else {
          if (deviceId !== token) {
            await AsyncStorage.clear();
          }
        }
        console.log(token, "deviceId");
      }
    } catch (error) {
      console.error("Error in GenerateDeviceId:", error);
    }
    return;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-8 px-5">
          <View className="flex-1">
            <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center", marginTop: 20, marginBottom: 20, color: "#000" }}>
              Activar los servicios de Notificaciones nos permite ofrecer funciones como:
            </Text>

            <View className="w-full items-center mb-8">
              <Image
                style={{
                  height: Platform.OS === "web" ? 220 : 180,
                  width: Platform.OS === "web" ? 220 : 180
                }}
                source={SVG.Group12716}
                transition={{ duration: 300 }}
                contentFit="contain"
              />
            </View>

            <View className="gap-y-6">
              <View className="flex-row items-center gap-x-4">
                <View className="bg-primary p-4 rounded-full shadow-sm">
                  <Ionicons name="notifications-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Bold", fontSize: 16, color: "#000" }}>Alertas de Cuadre:</Text>
                  <Text style={{ fontFamily: "Regular", fontSize: 13, color: "#666", marginTop: 2 }}>
                    Notificar a los usuarios sobre los cuadres que tiene.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-x-4">
                <View className="bg-primary p-4 rounded-full shadow-sm">
                  <Ionicons name="heart-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Bold", fontSize: 16, color: "#000" }}>Avisarte de tus chanceos:</Text>
                  <Text style={{ fontFamily: "Regular", fontSize: 13, color: "#666", marginTop: 2 }}>
                    Avisar mensajes o cuadres que tengas en tus chanceos ademas de avisarte cuando cuadraste.
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-x-4">
                <View className="bg-primary p-4 rounded-full shadow-sm">
                  <Ionicons name="calendar-outline" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text style={{ fontFamily: "Bold", fontSize: 16, color: "#000" }}>Aviso de Eventos</Text>
                  <Text style={{ fontFamily: "Regular", fontSize: 13, color: "#666", marginTop: 2 }}>
                    Notificar a los usuarios sobre eventos a los cuales aumentaran tus chances de cuadrar.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="w-full mt-10">
            <Button text={"Siguiente"} onPress={permisosCheck} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPermisos;

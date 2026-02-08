import { View, Text, Platform } from "react-native";
import React, { useContext } from "react";
import { Image } from "expo-image";
import { SVG } from "../../../assets";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { useRender } from "../../context";
import { ToastCall, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { SafeAreaView } from "react-native-safe-area-context";

const CamaraPermisos = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const permisosCheck = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();

    navigation.replace("NotificationPermisos");
  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-8 px-5">
        <View className="flex-1">
          <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: 'center', marginTop: 20, marginBottom: 20, color: '#000' }}>
            Activar los servicios de la cámara nos permite ofrecer funciones como:
          </Text>

          <View className="w-full items-center mb-8">
            <Image
              style={{ height: Platform.OS === 'web' ? 180 : 150, width: Platform.OS === 'web' ? 180 : 150 }}
              source={SVG.Group12714}
              transition={{ duration: 300 }}
              contentFit="contain"
            />
          </View>

          <View className="gap-y-6">
            <View className="flex-row items-center gap-x-4">
              <View className="bg-primary p-4 rounded-full shadow-sm">
                <Ionicons name="images-outline" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Bold", fontSize: 16, color: '#000' }}>Personalización</Text>
                <Text style={{ fontFamily: "Regular", fontSize: 13, color: '#666', marginTop: 2 }}>
                  Chancea necesita acceso a tu galería para que puedas subir fotos a tu perfil. Esto te permitirá compartir
                  imágenes y mejorar tu experiencia en la aplicación
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-x-4">
              <View className="bg-primary p-4 rounded-full shadow-sm">
                <Ionicons name="videocam-outline" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "Bold", fontSize: 16, color: '#000' }}>Verificación de Usuario</Text>
                <Text style={{ fontFamily: "Regular", fontSize: 13, color: '#666', marginTop: 2 }}>
                  Chancea necesita acceder a tu cámara para verificar tu identidad mediante la captura de un video. Esto nos
                  ayuda a asegurar que tu perfil sea genuino y confiable para otros usuarios.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full mt-5">
          <Button text={"Siguiente"} onPress={permisosCheck} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CamaraPermisos;

import { View, Text, Platform, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useState } from "react";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAuth, useRender } from "../../context";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { Colors } from "../../utils";
import { HttpService } from "../../services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingValidate from "../../utils/OnboardingValidate";
import ScreenContainer from "../../components/ScreenContainer";
import { font } from "../../../styles";

const SharedLocation = () => {
  const { setLoader } = useRender();
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [checked, setChecked] = useState(true);

  const send = async () => {
    try {
      if (!user) return

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/updateShareLocationByCustomerId/${SesionToken}/${checked}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      await HttpService("get", host, url, {}, header, setLoader);

      const updatedUser = { ...user, shareLocation: checked };
      setUser(updatedUser);
      await AsyncStorage.setItem("Sesion", JSON.stringify(updatedUser));

      const validate = await OnboardingValidate(updatedUser, navigation, setUser, {
        longitude: updatedUser.postionX,
        latitude: updatedUser.postionY
      }, { TokenAuthApi, SesionToken })

      if (!validate) return

      navigation.replace("Home");
    } catch (err: any) {
      console.error("Error in SharedLocation send:", err);
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  return (
    <ScreenContainer backgroundColor="#FFFFFF">
      <View className="flex-1 w-full md:max-w-lg md:mx-auto px-6">
        <TouchableOpacity
          className="flex-row py-4 items-center"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={24} color="black" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="items-center mb-8 mt-4">
            <FontAwesome6 name="map-location-dot" size={80} color={Colors.primary} />
          </View>

          <Text style={[font.Bold, { fontSize: 24, textAlign: "center", marginBottom: 20 }]}>
            Compartir Ubicación
          </Text>

          <Text style={[font.Regular, { fontSize: 15, color: "#333", lineHeight: 22, marginBottom: 20 }]}>
            Cuando compartes tu ubicación, otros usuarios podrán ver tu ubicación aproximada y sabrán si estás cerca.
            Esta funcionalidad está diseñada para mejorar la interacción y coordinación entre los usuarios.
          </Text>

          <View className="mb-6 space-y-4">
            <View className="flex-row items-start mr-4">
              <Text className="mr-2 mt-1 text-primary">•</Text>
              <Text style={[font.Bold, { fontSize: 14, color: "#444", lineHeight: 20 }]}>
                La ubicación mostrada es aproximada y no exacta.
              </Text>
            </View>
            <View className="flex-row items-start mr-4">
              <Text className="mr-2 mt-1 text-primary">•</Text>
              <Text style={[font.Bold, { fontSize: 14, color: "#444", lineHeight: 20 }]}>
                Puedes elegir cuándo dejar de compartir tu ubicación en cualquier momento desde la configuración de la aplicación.
              </Text>
            </View>
          </View>

          <Text style={[font.Regular, { fontSize: 14, color: "#666", lineHeight: 20, fontStyle: "italic" }]}>
            Al compartir tu ubicación, consientes que otros usuarios vean tu posición aproximada en tiempo real.
            Esto puede ser útil para organizar encuentros, compartir actividades y mejorar la comunicación dentro de la comunidad.
          </Text>

          <View className="flex-row justify-center items-center mt-10 p-4 bg-gray-50 rounded-2xl">
            <TouchableOpacity onPress={() => setChecked(false)} className="px-4">
              <Text style={[font.SemiBold, { fontSize: 14, color: !checked ? Colors.danger : "#999" }]}>
                No Compartir
              </Text>
            </TouchableOpacity>

            <View className="mx-2">
              <Switch
                value={checked}
                onValueChange={(value) => setChecked(value)}
                trackColor={{ false: "#D1D5DB", true: Colors.primary + "80" }}
                thumbColor={checked ? Colors.primary : "#F3F4F6"}
              />
            </View>

            <TouchableOpacity onPress={() => setChecked(true)} className="px-4">
              <Text style={[font.SemiBold, { fontSize: 14, color: checked ? "#10B981" : "#999" }]}>
                Compartir
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View className="absolute bottom-10 left-6 right-6">
          <Button
            text="Siguiente"
            onPress={send}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

export default SharedLocation;

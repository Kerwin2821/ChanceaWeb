import { View, Text, Platform, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { Image } from "expo-image";
import { SVG } from "../../../assets";
import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { useRender } from "../../context";
import { ToastCall, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenContainer from "../../components/ScreenContainer";

const InfoValidateIdentification = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as { onboarding: boolean } | undefined;

  return (
    <ScreenContainer>
      <View className="h-[95vh] px-5 gap-y-3">
        {!data?.onboarding ? (
          <TouchableOpacity
            className=" absolute left-3 top-3 flex-row items-center z-10"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
        ) : null}
        <View className=" w-full justify-center items-center h-1/4 ">
          <Image style={{ height: "75%", width: "36%" }} source={require("../../../assets/items/InfoValidate.png")}   transition={{ duration: 300 }}/>
        </View>
        <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center" }}>Verificación anti-fototrampa</Text>
        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          Para verificar que no seas foto trampa, utilizaremos un breve video con nuestra tecnología de reconocimiento
          facial. Para obtener los mejores resultados, te pedimos que:
        </Text>

        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Te encuentres en un lugar con buena iluminación.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Te retires lentes, gorras o cualquier otro elemento que cubra tu rostro.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Evites realizar movimientos bruscos durante la grabación.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Mires directamente a la cámara y muestres parte de tu torso{" "}
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          El proceso solo tomará unos segundos y tu privacidad estará protegida en todo momento.
        </Text>

        <View
          style={{
            position: "absolute",
            bottom: 80,
            width,
            paddingHorizontal: width * 0.05,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: "90%", alignItems: "center" }}>
            <Button
              text={"Continuar"}
              onPress={() =>
                data?.onboarding
                  ? navigation.navigate("ValidateIdentification", { onboarding: true })
                  : navigation.navigate("ValidateIdentification")
              }
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default InfoValidateIdentification;

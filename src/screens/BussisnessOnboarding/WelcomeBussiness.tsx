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

const WelcomeBussiness = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as { onboarding: boolean } | undefined;

  return (
    <ScreenContainer>
      <View className="h-full  px-5 gap-y-3">
 
        <View className=" w-full justify-center items-center h-1/4 ">
          <Image style={{ height: "100%", width: "55%" }} source={require('./../../../assets/intro/WelcomeImg1.svg')}   transition={{ duration: 300 }}/>
        </View>
        <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center" }}>Bienvenido a Chancea Negocios</Text>
        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          A continuación te pediremos ciertos requerimientos para que puedas empezar a formar parte de nuestra red de negocios:
        </Text>

        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Rif de tu empresa o negocio.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
             Logo de tu empresa o negocio.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Ubicación de tu empresa o negocio.
            </Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Datos bancarios para los pagos a tu negocio o empresa.
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          El proceso solo tomará unos segundos y tu privacidad estará protegida en todo momento.
        </Text>

        <View
          style={{
            position: "absolute",
            bottom: 60,
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
                navigation.navigate("LoadAssetsBusiness")
              }
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default WelcomeBussiness;

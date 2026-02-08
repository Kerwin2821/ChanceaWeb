import { View, Text, Platform, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import { Image } from "expo-image";
import { SVG } from "../../../assets";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import { useRender } from "../../context";
import { height, ToastCall, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenContainer from "../../components/ScreenContainer";
import { UserData } from "../../context/AuthContext/AuthInterface";
import {  getCalendarPermissions } from "../../utils/CalendarService";

const DateTutorial = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as {
    user: UserData;
  };

  const onDate = async () => {
    await getCalendarPermissions
    navigation.navigate("FormDate", { user: data.user })
  }

  return (
    <ScreenContainer>
      <View className="h-full pt-10  px-5 gap-y-3">
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-10"
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <View className=" w-full justify-center items-center h-1/4 ">
          <Image
            style={{ height: "100%", width: "60%" }}
            source={require("../../../assets/intro/WelcomeImg2.svg")}
            transition={{ duration: 300 }}
          />
        </View>
        <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center" }}>Crea Citas</Text>
        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          El proceso de creación de citas es simple. Primero, seleccionas un producto y ves su precio. Luego, envías un
          mensaje personalizado y completas los campos necesarios, como la fecha y hora. Finalmente, confirmas la cita
          para registrar todos los detalles correctamente:
        </Text>

        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>Selecciona un producto.</Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>Envía un mensaje.</Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>Visualiza el precio del producto.</Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>Completa los campos de la cita.</Text>
          </View>
        </View>
        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className=" ">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>Confirma la cita.</Text>
          </View>
        </View>

        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          El proceso solo tomará unos segundos y podrás hacer mas sencillo el tener una cita.
        </Text>

        <View
          style={{
            position: "absolute",
            bottom: height * 0.05,
            width,
            paddingHorizontal: width * 0.05,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: "90%", alignItems: "center" }}>
            <Button
              text={"Continuar"}
              onPress={()=> onDate()}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

export default DateTutorial;

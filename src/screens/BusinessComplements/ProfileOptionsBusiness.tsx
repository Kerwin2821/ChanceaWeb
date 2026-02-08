import { View, Text, Platform } from "react-native";
import React, { useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { height, width } from "../../utils/Helpers";
import { TouchableOpacity } from "react-native";
import { AntDesign, Entypo, Feather, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import { font } from "../../../styles";
import { ListItem } from "@rn-vui/themed";
import { Colors } from "../../utils";
import DialogDeleteAccount from "../../components/Dialog/DialogDeleteAccount/DialogDeleteAccount";
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteSesionToken } from "../../services/AsyncStorageMethods";


const ProfileOptionsBusiness = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { resetSesion } = useSesionBusinessStore();

  const [ShowModalDelete, setShowModalDelete] = useState(false);

  function closeSesion() {
    // Detectar la pantalla objetivo
    const targetScreen = Platform.OS === "ios" ? "Login" : "Prelogin";

    // Navegar a la pantalla
    navigation.navigate(targetScreen);

    // Escuchar el evento de finalización de transición de la navegación
    const unsubscribe = navigation.addListener("transitionEnd", async () => {
      // Llamar a la función de cierre de sesión solo cuando la navegación ha terminado
      resetSesion();
      await deleteSesionToken()
      await AsyncStorage.setItem("SesionBusiness", "");
      // Dejar de escuchar el evento después de que se ejecute una vez
      unsubscribe();
    });
  }

  return (
    <ScreenContainer>
      <DialogDeleteAccount active={ShowModalDelete} setActive={setShowModalDelete} navigation={navigation} />
      <View className=" h-[90vh] ">
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-10 "
          onPress={() => navigation.goBack()}
        >
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
        <View className=" flex-row justify-center p-3 mb-2 ">
          <Text className=" text-2xl text-primary " style={font.Bold}>
            Opciones de Perfil
          </Text>
        </View>
        <View className=" px-3 ">
          <Text className=" text-lg  " style={font.Bold}>
            Cuenta
          </Text>
        </View>

        <View className=" mt-3">
          <ListItem
            onPress={() => {
              navigation.navigate("UpdateBusinessPassword");
            }}
            bottomDivider
          >
            <MaterialIcons name="password" size={24} color={Colors.primary} />
            <ListItem.Content>
              <ListItem.Title>Cambio de contraseña</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          
        </View>
        <TouchableOpacity style={{ position: "absolute", bottom: 16, zIndex: 10, width: width }} onPress={closeSesion}>
        <ListItem>
          <Feather name="log-out" size={24} color={Colors.primary} />
          <ListItem.Content>
            <ListItem.Title>Cerrar sesión</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      </TouchableOpacity>
      </View>
      
    </ScreenContainer>
  );
};

export default ProfileOptionsBusiness;

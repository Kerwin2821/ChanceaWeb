import { View, Text, Platform, Alert } from "react-native";
import React, { useState } from "react";
import ScreenContainer from "../../components/ScreenContainer";
import { height, width } from "../../utils/Helpers";
import { TouchableOpacity } from "react-native";
import { AntDesign, Entypo, Feather, FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import { font } from "../../../styles";
import { ListItem } from "@rn-vui/themed";
import { Colors } from "../../utils";
import DialogDeleteAccount from "../../components/Dialog/DialogDeleteAccount/DialogDeleteAccount";
import { useAuth } from "../../context";

const ProfileOptions = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const { user, TokenAuthApi, logOut } = useAuth();

  const [ShowModalDelete, setShowModalDelete] = useState(false);

  function closeSesion() {
    performLogout();
  }

  function performLogout() {
    // Detectar la pantalla objetivo
    const targetScreen = "Prelogin";

    // Navegar a la pantalla
    navigation.navigate(targetScreen);

    // Escuchar el evento de finalización de transición de la navegación
    const unsubscribe = navigation.addListener("transitionEnd", async () => {
      // Llamar a la función de cierre de sesión solo cuando la navegación ha terminado
      await logOut();
      // Dejar de escuchar el evento después de que se ejecute una vez
      unsubscribe();
    });
  }

  return (
    <ScreenContainer disabledPaddingBottom={true} backgroundColor="white">
      <DialogDeleteAccount active={ShowModalDelete} setActive={setShowModalDelete} navigation={navigation} />
      <View style={{ flex: 1, paddingHorizontal: 10, maxHeight: Platform.OS === 'web' ? 700 : undefined }}>
        <TouchableOpacity
          className=" absolute left-3 top-3 flex-row items-center z-20 "
          onPress={() => navigation.goBack()}
          style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
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
        <View className=" mt-3 px-2">
          <ListItem
            onPress={() => {
              navigation.navigate("ReceiptsScreen");
            }}
            bottomDivider
            containerStyle={{ borderRadius: 10, marginBottom: 5 }}
          >
            <FontAwesome6 name="receipt" size={24} color={Colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={font.SemiBold}>Transacciones</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem
            onPress={() => {
              navigation.navigate("NotLikeScreen");
            }}
            bottomDivider
            containerStyle={{ borderRadius: 10, marginBottom: 5 }}
          >
            <Ionicons name="heart-dislike" size={24} color={Colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={font.SemiBold}>Historial no me cuadra</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem
            onPress={() => {
              setShowModalDelete(true);
            }}
            bottomDivider
            containerStyle={{ borderRadius: 10, marginBottom: 5 }}
          >
            <MaterialCommunityIcons name="account-remove" size={24} color={Colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={font.SemiBold}>Eliminar Cuenta</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={{ marginBottom: 20, width: '100%' }} onPress={closeSesion}>
          <ListItem containerStyle={{ borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <Feather name="log-out" size={24} color={Colors.primary} />
            <ListItem.Content>
              <ListItem.Title style={[font.Bold, { color: Colors.primary }]}>Cerrar sesión</ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

export default ProfileOptions;

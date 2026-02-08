import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { useNavigation } from "@react-navigation/native";
import { HttpService } from "../../services";
import { useAuth, useRender } from "../../context";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import ScreenContainer from "../../components/ScreenContainer";
import Button from "../../components/ButtonComponent/Button";
import { font } from "../../../styles";
import Input from "../../components/InputComponent/Input";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import LogotipoYLogoV from "../../components/imgSvg/LogotipoYLogoV";
import { FontAwesome6 } from "@expo/vector-icons";

const ResetPasswordBusinessScreen = () => {
  const { setLoader, language } = useRender();
  const { TokenAuthApi } = useAuth();
  const [Email, setEmail] = useState("");
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const onSubmit = async () => {
    try {
      console.log("hola");
      const host = process.env.APP_BASE_API;
      const url: string = `/api/appchancea/business/getInfoRecover/${Email}`;
      const headers = GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, headers, setLoader);

      if (response.codigoRespuesta === "00") {
        if (response.customerStatus === "INACTIVE") {
          return ToastCall("warning", "Usuario Inactivo por favor comunícate con nosotros", "ES");
        }

        navigation.navigate("ChangePasswordBusinessScreen", { phone: response.phone, email: Email });

        setEmail("");

        return;
      }

      ToastCall("error", "Usuario no existe favor regístrate.", "ES");
    } catch (err) {
      console.log("erro", JSON.stringify(err));
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };
  useEffect(() => {}, []);
  return (
    <ScreenContainer>
      <View className="h-full w-full bg-primary ">
        <View className=" absolute left-3 top-3 p-2 bg-white/20 rounded-full z-10">
          <TouchableOpacity onPress={() => navigation.navigate("Prelogin")}>
            <FontAwesome6 name="arrow-left" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <View className=" relative top-[10%]">
            <LogotipoYLogoV />
          </View>
        </View>
        <View style={styles.containerForm}>
          <Text className=" text-xl text-center text-white w-2/3" style={font.Bold}>
            Recuperar contraseña Negocios
          </Text>
          <Input
            labelText="Email"
            keyboardType="email-address"
            placeholder="example@"
            value={Email}
            onChangeText={(e: string) => setEmail(e)}
          />

          <View
            style={{
              width: width * 0.9,
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ width: width * 0.4, alignItems: "center" }}>
              <Button
                text={"Volver"}
                onPress={() => {
                  navigation.goBack();
                }}
                typeButton="white"
              />
            </View>
            <View style={{ width: width * 0.4, alignItems: "center" }}>
              <Button
                text={Languages[language].SCREENS.VerifyContactsScreen.textSubmit3}
                onPress={onSubmit}
                typeButton="white"
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
  },
  containerForm: {
    width: width * 0.9,
    height: height * 0.5,
    borderRadius: 30,
    marginHorizontal: width * 0.05,
    justifyContent: "space-between",
    alignItems: "center",
  },
  textTitle: {
    color: Colors.blackBackground,
    fontSize: 20,
    fontFamily: "Bold",
    marginBottom: 20,
    textAlign: "center",
    width: "100%",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    width,
  },
  logo: {
    width: 200,
    height: 115,
  },
  text: {
    color: Colors.black,
    fontFamily: "Regular",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  containerRow: {
    flexDirection: "row",
  },
  containerWidth: {
    width: "100%",
  },
  buttonRender: {
    width: "auto",
    paddingHorizontal: 20,
  },
  buttonRenderWhite: {
    borderColor: Colors.transparent,
    shadowColor: Colors.transparent,
  },
  line: {
    width: "40%",
    height: 0,
    borderBottomWidth: 1,
  },
  circle: {
    width: 8,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
  },
  colorFormat: {
    borderStyle: "solid",
    borderColor: "#898989",
  },
});

export default ResetPasswordBusinessScreen;

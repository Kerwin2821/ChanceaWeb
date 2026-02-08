import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { useNavigation } from "@react-navigation/native";
import { HttpService } from "../../services";
import { useAuth, useRender } from "../../context";
import { GetHeader, ToastCall, width } from "../../utils/Helpers";
import ScreenContainerForm from "../../components/ScreenContainerForm";
import Button from "../../components/ButtonComponent/Button";
import { font } from "../../../styles";
import Input from "../../components/InputComponent/Input";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import LogotipoYLogoV from "../../components/imgSvg/LogotipoYLogoV";
import { FontAwesome6 } from "@expo/vector-icons";
import DialogNoActualizado from "../../components/Dialog/DialogNoActualizado/DialogNoActualizado";

const ResetPasswordScreen = () => {
  const { setLoader, language, UpdateShow } = useRender();
  const { TokenAuthApi } = useAuth();
  const [Email, setEmail] = useState("");
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const onSubmit = async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url: string = `/api/appchancea/customers/getInfoRecover/${Email}`;
      const headers = GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, headers, setLoader);

      if (response.codigoRespuesta === "00") {
        if (response.customerStatus === "INACTIVE") {
          return ToastCall("warning", "Usuario Inactivo por favor comunícate con nosotros", "ES");
        }

        navigation.navigate("ChangePasswordScreen", { phone: response.phone });

        setEmail("")

        return;
      }

      ToastCall("error", "Usuario no existe favor regístrate.", "ES");
    } catch (err) {
      console.log("erro", JSON.stringify(err));
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };

  return (
    <ScreenContainerForm contentContainerStyle={{ backgroundColor: Colors.primary }}>
      <View style={styles.container}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          <LogotipoYLogoV className="mb-10" />

          <Text style={[font.Bold, styles.title]}>
            Recuperar contraseña
          </Text>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Input
              labelText="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="email@ejemplo.com"
              styleLabel={{ color: Colors.white, marginBottom: 8 }}
              styleContainer={styles.inputContainer}
              value={Email}
              onChangeText={(e: string) => setEmail(e)}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonWrapper}>
            <Button
              text={Languages[language].SCREENS.VerifyContactsScreen.textSubmit3}
              onPress={onSubmit}
              typeButton="white"
              styleButton={styles.actionButton}
              styleText={styles.actionButtonText}
            />
          </View>
        </View>
      </View>
      <DialogNoActualizado IsUpdate={UpdateShow && !Number(process.env.DEV)} />
    </ScreenContainerForm>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
    justifyContent: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    color: Colors.white,
    marginBottom: 30,
    marginTop: 10,
    textAlign: "center",
  },
  formContainer: {
    width: '100%',
    marginVertical: 20,
  },
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    borderWidth: 0,
    height: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonWrapper: {
    width: "70%",
    marginTop: 30,
    marginBottom: 20,
  },
  actionButton: {
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.primary,
  },
});

export default ResetPasswordScreen;

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { width, height, ToastCall, GetHeader } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import Input from "../../components/InputComponent/Input";
import { useAuth, useRender } from "../../context";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { HttpService } from "../../services";
import ScreenContainerForm from "../../components/ScreenContainerForm";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import LogotipoYLogoV from "../../components/imgSvg/LogotipoYLogoV";
import { font } from "../../../styles";

function ChangePasswordScreen() {
  const { TokenAuthApi } = useAuth();
  const { language, setLoader } = useRender();

  const [password, setPassword] = useState("");
  const [Code, setCode] = useState("");

  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [countLength, setCountLength] = useState<boolean>(false);
  const [countUpperCase, setCountUpperCase] = useState<boolean>(false);
  const [countLowerCase, setCountLowerCase] = useState<boolean>(false);
  const [countNumbers, setCountNumbers] = useState<boolean>(false);
  const [countSymbols, setCountSymbols] = useState<boolean>(false);
  const [equals, setEquals] = useState<boolean>(false);
  const [credentialRepeat, setcredentialRepeat] = useState<string>("");

  const route = useRoute();
  const data = route.params as { phone: string; code: string };

  const disable = () => {
    return (
      !countLength ||
      !countUpperCase ||
      !countLowerCase ||
      !countNumbers ||
      !countSymbols ||
      !equals ||
      Code.length < 6
    );
  };

  const onSubmit = async () => {
    try {
      setLoader(true);

      if (password !== credentialRepeat) {
        ToastCall(
          "warning",
          Languages[language].SCREENS.PasswordScreen.ERRORS.message2,
          language
        );
        return;
      }

      if (!Code || Code.length < 6) {
        ToastCall("warning", "Código muy corto", language);
        return;
      }
      const host = process.env.APP_BASE_API;
      const url: string = "/api/appchancea/customers/recoverPassword";
      const headers = GetHeader(TokenAuthApi, "application/json");
      const req = {
        phoneNumber: data.phone,
        token: Code,
        channelType: "SMS",
        newPassword: password,
      };

      const response = await HttpService("post", host, url, req, headers);

      if (response.codigoRespuesta !== "00") {
        ToastCall(
          "error",
          Languages[language].GENERAL.ERRORS.TokenInvalid,
          language
        );
        return;
      }

      navigation.navigate("ResetPassSuccessScreen");
    } catch (err) {
      console.log(JSON.stringify(err));
      ToastCall(
        "error",
        Languages[language].GENERAL.ERRORS.GeneralError,
        language
      );
    } finally {
      setLoader(false);
    }
  };

  const reSubmit = async (type: "SMS" | "EMAIL", contact: string) => {
    const host = process.env.APP_BASE_API;
    const url: string = "/api/appchancea/tokens/generate";
    const req = {
      customerId: null,
      email: type === "EMAIL" ? contact : null,
      phoneNumber: type === "SMS" ? contact.replace("+", "") : null,
      channelType: "SMS",
    };
    const headers = GetHeader(TokenAuthApi, "application/json");
    try {
      const response: any = await HttpService(
        "post",
        host,
        url,
        req,
        headers,
        setLoader
      );
      if (response.codigoRespuesta === "53") {
        ToastCall("warning", "Ya has hecho muchos intentos", "ES");
        navigation.goBack();
        return;
      }
      if (!response) {
        ToastCall("error", Languages["ES"].GENERAL.ERRORS.RequestError, "ES");
        return;
      }
    } catch (err) {
      console.log("erro", JSON.stringify(err));
      ToastCall("error", Languages["ES"].GENERAL.ERRORS.GeneralError, "ES");
    }
  };

  const validatePassword = useCallback(
    (e: any) => {
      let password = e;

      const val1 = /(?=.*[a-z])/g; //Minuscula
      const val2 = /(?=.*[A-Z])/g; //Mayuscula
      const val3 = /(?=.*\d)/g; //Digito
      const val4 = /(?=.*\W)/g; //Caracter Especial

      if (val1.test(password)) {
        setCountLowerCase(true);
      } else {
        countLowerCase && setCountLowerCase(false);
      }

      if (val2.test(password)) {
        setCountUpperCase(true);
      } else {
        countUpperCase && setCountUpperCase(false);
      }

      if (val3.test(password)) {
        setCountNumbers(true);
      } else {
        countNumbers && setCountNumbers(false);
      }

      if (val4.test(password)) {
        setCountSymbols(true);
      } else {
        countSymbols && setCountSymbols(false);
      }

      if (password.length >= 8) {
        setCountLength(true);
      } else {
        countLength && setCountLength(false);
      }

      if (password.length === 0) {
        setCountLowerCase(false);
        setCountUpperCase(false);
        setCountNumbers(false);
        setCountSymbols(false);
        setCountLength(false);
        setEquals(false);
      }
    },
    [password]
  );

  const change = (value: string, key: string) => {
    key === "password" && validatePassword(value);
    setPassword(value);
  };

  useEffect(() => {
    setEquals(
      password.length && password.length ? password === credentialRepeat : false
    );
  }, [password, credentialRepeat]);

  useEffect(() => {
    reSubmit("SMS", data.phone);
  }, []);

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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LogotipoYLogoV className="mb-8" />

          <Text style={[font.Bold, styles.title]}>
            Establecer nueva contraseña
          </Text>

          {/* Checklist Section */}
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>
              {Languages[language].SCREENS.PasswordScreen.text2}
            </Text>

            <View style={styles.checkItem}>
              {countLength ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, countLength && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text3}
              </Text>
            </View>

            <View style={styles.checkItem}>
              {countUpperCase ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, countUpperCase && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text4}
              </Text>
            </View>

            <View style={styles.checkItem}>
              {countLowerCase ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, countLowerCase && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text5}
              </Text>
            </View>

            <View style={styles.checkItem}>
              {countNumbers ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, countNumbers && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text6}
              </Text>
            </View>

            <View style={styles.checkItem}>
              {countSymbols ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, countSymbols && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text7}{" "}
                <Text style={{ color: Colors.green }}># ? ! $ % & * - . ,</Text>
              </Text>
            </View>

            <View style={styles.checkItem}>
              {equals ? (
                <Feather name="check-circle" size={16} color={Colors.green} />
              ) : (
                <View style={styles.dot} />
              )}
              <Text style={[styles.checkText, equals && styles.checkTextActive]}>
                {Languages[language].SCREENS.PasswordScreen.text8}
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Input
              placeholder={Languages[language].SCREENS.PasswordScreen.placeholder1}
              secureTextEntry={true}
              onChangeText={(e: string) => change(e, "password")}
              keyboardType="default"
              value={password}
              maxLength={12}
              styleContainer={styles.inputContainer}
            />

            <Input
              placeholder={Languages[language].SCREENS.PasswordScreen.placeholder2}
              secureTextEntry={true}
              onChangeText={(e: string) => setcredentialRepeat(e)}
              keyboardType="default"
              value={credentialRepeat}
              maxLength={12}
              styleContainer={[styles.inputContainer, { marginTop: 15 }]}
            />

            <Input
              placeholder="000000"
              onChangeText={(e: string) => setCode(e.replace(/[^0-9]/g, ""))}
              labelText="Código de verificación"
              keyboardType="number-pad"
              value={Code}
              maxLength={6}
              styleLabel={{ color: Colors.white, marginTop: 15, marginBottom: 8 }}
              styleContainer={styles.inputContainer}
            />
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              text="Actualizar Contraseña"
              disabled={disable()}
              onPress={onSubmit}
              typeButton="white"
              styleButton={styles.submitButton}
              styleText={styles.submitButtonText}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenContainerForm>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 20 : 10,
    backgroundColor: Colors.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
    justifyContent: "center",
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    color: Colors.white,
    textAlign: "center",
    marginBottom: 25,
  },
  checklistContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
  },
  checklistTitle: {
    fontFamily: "Bold",
    fontSize: 16,
    color: Colors.white,
    marginBottom: 15,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Medium",
  },
  checkTextActive: {
    color: Colors.white,
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  inputContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    borderWidth: 0,
    height: 54,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    width: "80%",
    marginTop: 10,
  },
  submitButton: {
    height: 56,
    borderRadius: 28,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: "Bold",
    color: Colors.primary,
  },
});

export default ChangePasswordScreen;

import React from "react";
import { Text, View, StyleSheet, Platform } from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { useRender } from "../../context";
import { height, width } from "../../utils/Helpers";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import RegisteIMG6 from "../../components/imgSvg/RegisteIMG6";
import { font } from "../../../styles";
import ScreenContainerForm from "../../components/ScreenContainerForm";

const ResetPassSuccessScreen = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  return (
    <ScreenContainerForm contentContainerStyle={{ backgroundColor: Colors.primary }}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.imageContainer}>
            <RegisteIMG6 />
          </View>

          <View style={styles.textContainer}>
            <Text style={[font.Bold, styles.title]}>
              {Languages[language].SCREENS.ResetPassSuccessScreen.title}
            </Text>
            <Text style={[font.Regular, styles.subtitle]}>
              Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión.
            </Text>
          </View>

          <View style={styles.buttonWrapper}>
            <Button
              text="Iniciar Sesión"
              onPress={() => navigation.navigate("Login")}
              typeButton="white"
              styleButton={styles.actionButton}
              styleText={styles.actionButtonText}
            />
          </View>
        </View>
      </View>
    </ScreenContainerForm>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    color: Colors.white,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    width: "70%",
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

export default ResetPassSuccessScreen;

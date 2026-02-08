import { Text, View, StyleSheet } from "react-native";
import { Colors } from "../../utils";
import Languages from "../../utils/Languages.json";
import { useRender } from "../../context";
import { height, width } from "../../utils/Helpers";
import { useNavigation } from "@react-navigation/native";
import Button from "../../components/ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import RegisteIMG6 from "../../components/imgSvg/RegisteIMG6";

const ResetPassBusinessSuccessScreen = () => {
  const { language } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  return (
    <>
      <View style={styles.container}>
        <RegisteIMG6></RegisteIMG6>

        <View style={styles.containerForm}>
          <Text
            style={{
              color: Colors.blackBackground,
              fontSize: 26,
              textAlign: "center",
              fontFamily: "Bold",
            }}
          >
            {Languages[language].SCREENS.ResetPassSuccessScreen.title}
          </Text>
        </View>
        <View style={{ width: width * 0.3, alignItems: "center" }}>
          <Button styleText={{ fontSize: 16 }} onPress={() => navigation.push("Login")} />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "column",
  },
  imageContainer: {
    height: height * 0.2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  containerForm: {
    width: width * 0.9,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: width * 0.05,
  },
});

export default ResetPassBusinessSuccessScreen;

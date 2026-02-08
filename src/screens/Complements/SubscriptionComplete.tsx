import { View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { GetHeader, height, ToastCall, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import MatchIMG from "../../components/imgSvg/MatchIMG";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../utils";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { useEffect } from "react";
import { HttpService } from "../../services";
import { useAuth } from "../../context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import CacheImage from "../../components/CacheImage/CacheImage";
import { clearOrden } from "../../services/CacheStorage/Orden/OrdenStorage";

const SubscriptionComplete = () => {
  const navigation= useNavigation<NavigationScreenNavigationType>();
  const { user, TokenAuthApi, SesionToken, setUser } = useAuth();

  const getCustomer = async () => {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${user?.id}?sessionToken=${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      let req = {};
      const response = await HttpService("get", host, url, req, header);

      console.log(response, "getCustomer");

      if (response) {
        setUser(response);
        await AsyncStorage.setItem("Sesion", JSON.stringify(response));
      }
    } catch (err: any) {
      const errors = err as AxiosError;
      console.error(err, "User");
      if (errors && errors.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  };
  useEffect(() => {
    getCustomer();
    clearOrden()
  }, []);
    
  return (
    <View className="flex-1 pt-7 bg-white ">
      <View className=" w-screen flex-1 justify-center items-center">
        {/* <View className="absolute rounded-xl z-30 top-7 right-3 justify-end bg-white ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign name="close" size={width * 0.1} color={Colors.black} />
            </TouchableOpacity>
          </View> */}
        <CacheImage
          classNameImage="absolute top-0 h-full w-full"
          styleImage={{ width: width, height: height }}
          source={{uri:"https://chancea.s3.us-east-1.amazonaws.com/confirmationPago.png"}}
        />

        <View className=" absolute bottom-1  w-full items-center">
          <View className="flex-row pb- justify-center items-center w-full z-30">
            <View className=" w-1/2">
              <Button
                text={"¡Seguir chanceando!"}
                typeButton="normal"
                onPress={() => navigation.navigate("Home")}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SubscriptionComplete;

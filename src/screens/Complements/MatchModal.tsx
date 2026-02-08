import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Text,
  Pressable,
  Platform,
} from "react-native";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import Animated, {
  BounceIn,
  FadeInDown,
  RotateInDownLeft,
} from "react-native-reanimated";
import Button from "../../components/ButtonComponent/Button";
import { useEffect, useState } from "react";
import { font } from "../../../styles";
import { BottomTabNavigationType } from "../../navigation/BottomTab";
import { useAuth, useRender } from "../../context";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { CustomersHome } from "../../utils/Interface";
import MatchIMG from "../../components/imgSvg/MatchIMG";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../utils";
import { UserData } from "../../context/AuthContext/AuthInterface";
import { useChat } from "../../context/ChatContext/ChatProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { environmet } from "../../../env";
import { MatchResponse } from "../../context/storeContext/StoreInterface";
import { HttpService } from "../../services";
import { useStore } from "../../context/storeContext/StoreState";
import { SafeAreaView } from "react-native-safe-area-context";
import { manageMatchsLocal } from "../../services/MatchsAsyncStorage";
import CacheImage from "../../components/CacheImage/CacheImage";

const MatchModal = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const route = useRoute();
  const data = route.params as { Customer: UserData };
  const [Index, setIndex] = useState(0);
  const { user, TokenAuthApi, PreferenceFindUser, SesionToken} = useAuth();
  const { setLoader,soundSave } = useRender();
  const { Customers, setCustomers, setMatch, Match } = useStore();
  const isFocus = useIsFocused();
  const { agregarMensajeDesdePerfil } = useChat()

  const sendMessage = async (userPara: UserData) => {
    navigation.goBack()
    setLoader(true)
    try {
      
      await agregarMensajeDesdePerfil(userPara,navigation)
    } catch (error) {
      
    }finally{
      setLoader(false)
    }
  }
  const Next = () => {
    if (data.Customer.customerProfiles.length - 1 !== Index)
      setIndex(Index + 1);
    if (data.Customer.customerProfiles.length - 1 === Index) setIndex(0);
  };

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1);
  };

  async function GetMatch() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=1000`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      console.log(url);
      const response: MatchResponse = await HttpService(
        "get",
        host,
        url,
        {},
        header
      );

      if(response.codigoRespuesta == "00"){
        setMatch(response.customers);
       /*  manageMatchsLocal(response.customers) */
      }

      if(response.codigoRespuesta == "12"){
        ToastCall("warning", "Te invitamos a comprar un plan para que sigas chanceando", "ES");
      }

      if(response.codigoRespuesta == "05"){
       /*  ToastCall("warning", "Te invitamos a comprar un plan para que sigas chanceando", "ES"); */
      }

      if(response.codigoRespuesta == "13"){
        /* if(Platform.OS !== "ios"){
          navigation.navigate("SubscriptionScreen");
        } */
          navigation.navigate("SubscriptionScreen");
      }


    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        setMatch([])
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    }
  }

  useEffect(() => {
    if (isFocus) if (TokenAuthApi) if (user) GetMatch();
  }, [user, TokenAuthApi, Customers, PreferenceFindUser]);

  useEffect(() => {
    soundSave()
  }, []);

  return (
    <SafeAreaView
      className="h-screen"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.9)",
      }}
    >
      <View style={{ height: height }} className=" justify-center items-center">
        <View className="absolute rounded-xl z-30 top-7 right-3 justify-end bg-white ">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={width * 0.1} color={Colors.black} />
          </TouchableOpacity>
        </View>
        {!data.Customer.customerProfiles.length ? null : (
          <CacheImage
            classNameImage="absolute top-0 h-full w-full"
            styleImage={{ width: width, height: height * 0.75 }}
            source={{ uri: data.Customer.customerProfiles[Index]?.link }}

          />
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.7)","rgba(0,0,0,0.6)", "rgba(0,0,0,0.5)","transparent"]}
          className=" flex-row h-[4%] p-2 mt-6 "
        >
          {data.Customer.customerProfiles.map((e, index) => (
            <View
              key={index}
              className={
                index === Index
                  ? " flex-1  bg-white rounded-xl mx-1 "
                  : " flex-1  bg-white rounded-xl mx-1 opacity-50 "
              }
            ></View>
          ))}
        </LinearGradient>

        <View className=" h-full flex-row z-20">
          <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
          <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
        </View>

        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.7)",
            "rgba(0,0,0,1)",
            "rgba(0,0,0,1)",
            "rgba(0,0,0,1)",
          ]}
          className={Platform.OS === "ios" ?"absolute bottom-12 pb-10 w-full items-center z-50": "absolute bottom-0 pb-28 w-full items-center  z-50"}
        >
          <MatchIMG />
          <View className="flex-row justify-center items-center w-full ">
            <View className=" w-1/2">
              <Button
                text={"Chancear"}
                typeButton="normal"
                onPress={() => sendMessage(data.Customer)}
              />
            </View>
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default MatchModal;

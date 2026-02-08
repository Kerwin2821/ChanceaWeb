import { View, TouchableOpacity, AppState } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { GetHeader, height, width } from "../../utils/Helpers";
import Button from "../../components/ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import MatchIMG from "../../components/imgSvg/MatchIMG";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../utils";
import { environmet } from "../../../env";
import { useAuth, useRender } from "../../context";
import { HttpService } from "../../services";
import { Plan } from "../../utils/Interface";
import { useEffect, useState } from "react";
import { useStore } from "../../context/storeContext/StoreState";
import CacheImage from "../../components/CacheImage/CacheImage";

const SubscriptionScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [CanBack, setCanBack] = useState(false);
  const { TokenAuthApi } = useAuth();
  const { Plans } = useStore();
  const { setLoader } = useRender();
  const [ImageStr, setImageStr] = useState("");

  const route = useRoute();
  const data = route.params as {
    canBack: boolean | undefined;
  };

  useEffect(() => {
    setImageStr(Plans[0].imgSrc);
  }, []);

  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        data.canBack
        if (!data.canBack) {
          e.preventDefault();
        }

        // Prevent default behavior of leaving the screen

        /* navigation.dispatch(e.data.action) */
      }),
    [navigation]
  );

  return (
    <View className="flex-1 pt-7 bg-white ">
      <View className=" w-screen flex-1 justify-center items-center">
        {/* <View className="absolute rounded-xl z-30 top-7 right-3 justify-end bg-white ">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign name="close" size={width * 0.1} color={Colors.black} />
            </TouchableOpacity>
          </View> */}
        {ImageStr ? (
          <CacheImage
            classNameImage="absolute top-0 h-full w-full"
            styleImage={{ width: width * 0.9, height: height * 0.9 }}
            source={{ uri: ImageStr }}
          />
        ) : null}
        <View className=" absolute bottom-10  w-full items-center">
          <View className="flex-row pb- justify-center items-center w-full z-30">
            <View className=" w-1/2">
              <Button
                text={"¡Unirme Ya!"}
                typeButton="normal"
                onPress={() => navigation.navigate("PagoMovilPayment")}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SubscriptionScreen;

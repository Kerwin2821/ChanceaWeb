import { View, Platform, Text } from "react-native";
import { useEffect, useState } from "react";
import { Dialog } from "@rn-vui/themed";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { Image } from "expo-image";
import { height, width } from "../../../utils/Helpers";
import { UserData } from "../../../context/AuthContext/AuthInterface";
import Button from "../../ButtonComponent/Button";
import { font } from "../../../../styles";
import { useStore } from "../../../context/storeContext/StoreState";
import { CommonActions } from "@react-navigation/native";
import { BottomTabNavigationType } from "../../../navigation/BottomTab";
import CacheImage from "../../CacheImage/CacheImage";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: UserData | null;
  navigation?: NavigationScreenNavigationType;
  navigationBottom?: BottomTabNavigationType;
};

const DialogDate = ({ active, setActive, data, navigation,navigationBottom }: props) => {
  const { setBoxPackage } = useStore();
  const toggleDialog1 = () => {
    setActive(false);
  };
  const toggleClose = () => {
    setActive(false);
    setBoxPackage(undefined);
    navigation?.navigate("Home")
    navigationBottom?.navigate("Dates")
    navigationBottom?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Dates" }],
      })
    );
  };
  if(!active){
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      className="justify-center text-center bg-white"
      overlayStyle={{
        borderRadius: 14,
        width: width * 0.9,
        height: height * 0.7,
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View className=" items-center">
        <View>
          <Image
            className=" h-full w-full rounded-2xl"
            style={{ width: 200, height: 140 }}
            source={require("../../../../assets/items/DateIcon.svg")}
          />
          <View className=" items-center justify-center absolute bottom-2 right-2">
            <View className=" w-12 h-12 bg-black rounded-full overflow-hidden">
              <CacheImage classNameImage="w-12 h-12" source={{ uri: (data?.customerProfiles as any)[0].link }} />
            </View>
          </View>
        </View>
        <Text className=" text-lg text-center" style={font.Bold}>
          Cita enviada con éxito
        </Text>
        <View className=" p-5">
          <Text className=" text-center " style={font.SemiBold}>
            Su invitación a {data?.firstName} ha sido enviada. Una vez que la acepte, podrás proceder a
            realizar el pago para completar el encuentro.
          </Text>
          <Text className=" text-xs text-center  mt-2" style={font.Bold}>
            ¡Esperamos que tenga suerte y que {data?.firstName} acepte la invitación!
          </Text>
        </View>
      </View>
      <View className=" flex items-center w-full">
        <View className=" w-1/2">
          <Button
            typeButton="normal"
            onPress={() => {
              if (navigation) toggleClose();
            }}
          />
        </View>
      </View>
    </Dialog>
  );
};

export default DialogDate;

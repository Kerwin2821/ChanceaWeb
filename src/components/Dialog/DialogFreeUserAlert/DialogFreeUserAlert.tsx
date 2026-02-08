import { View, Text, Linking, BackHandler, Platform } from "react-native";
import React, { useEffect } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { Image } from "expo-image";
import { height, width } from "../../../utils/Helpers";
import { Parameter } from "../../../utils/Interface";
import moment from 'moment';

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: Parameter;
  navigation?: NavigationScreenNavigationType;
};
const DialogFreeUserAlert = ({ active, setActive, data, navigation }: props) => {
  const { user } = useAuth();
  const toggleDialog1 = () => {
    setActive(false);
  };

  const today = moment();
  const creation = moment(user?.creationDate);

  if(!active){
    return <></>
  }
  
  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      className="justify-center text-center bg-white"
      overlayStyle={{ borderRadius: 14, width: "90%", padding: 0, paddingVertical: 10 }}
    >
      <View className=" p-2">
        <Image
          className=" h-full w-full"
          style={{ width: width * 0.8, height: height * (Platform.OS === "ios" ?0.5 : 0.6) }}
          source={require("../../../../assets/items/ImgFreeUserAlert.png")}
          transition={{ duration: 300 }}
        />
      </View>

        <View className=" flex items-center absolute top-32 w-full">
          <Text className=" text-xl" style={{ fontFamily: "Bold" }}>
            {" "}
            {`Quedan ${data ? data.quantityFree - today.diff(creation, 'days') : 0 } días Gratis.`}
          </Text>
        </View>
      <View className=" flex items-center absolute bottom-5 w-full">
        <View className=" w-1/2">
          <Button
            text={"¡Unirme Ya!"}
            typeButton="normal"
            onPress={() => {
              if (navigation) toggleDialog1() , navigation.navigate("PagoMovilPayment");
            }}
          />
        </View>
      </View>
    </Dialog>
  );
};

export default DialogFreeUserAlert;

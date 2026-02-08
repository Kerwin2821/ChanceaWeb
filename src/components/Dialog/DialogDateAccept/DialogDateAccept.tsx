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
import CacheImage from "../../CacheImage/CacheImage";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: UserData | null;
  navigation?: NavigationScreenNavigationType;
};

const DialogDateAccept = ({ active, setActive, data, navigation }: props) => {
  const { setBoxPackage } = useStore();
  const toggleDialog1 = () => {
    setActive(false);
  };
  const toggleClose = () => {
    setActive(false);
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
            transition={{ duration: 300 }}
          />
          <View className=" items-center justify-center absolute bottom-2 right-2">
            <View className=" w-12 h-12 bg-black rounded-full overflow-hidden">
              <CacheImage classNameImage="w-12 h-12" source={{ uri: (data?.customerProfiles as any)[0].link }}   />
            </View>
          </View>
        </View>
        <Text className=" text-lg text-center" style={font.Bold}>
          Has aceptado la invitación
        </Text>
        <View className=" p-5">
          <Text className=" text-center " style={font.SemiBold}>
            Le aceptaste la invitación de {data?.firstName}. Desde Chancea esperamos que disfrutes tu cita.
            Esta quedará pendiente por pagar a la persona que te invito.
          </Text>
          <Text className=" text-xs text-center  mt-2" style={font.Bold}>
            ¡Esperamos que tenga suerte y que te vaya bien con {data?.firstName}!
          </Text>
        </View>
      </View>
      <View className=" flex items-center w-full">
        <View className=" w-1/2">
          <Button
            typeButton="normal"
            onPress={() => {
              toggleClose();
            }}
          />
        </View>
      </View>
    </Dialog>
  );
};

export default DialogDateAccept;

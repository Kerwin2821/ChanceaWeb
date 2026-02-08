import { Modal as RNModal, View, Text, StyleSheet, Pressable, Linking, Platform, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dialog } from "@rn-vui/themed";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { Image } from "expo-image";
import { height, width } from "../../../utils/Helpers";
import { Advertisements } from "../../../screens/BottomBar/Promotions";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: Advertisements[];
  navigation?: NavigationScreenNavigationType;
  onClose: () => void
};

function elegirElementoAleatorio(array: any[]) {
  if (array.length === 0) {
    return null; // o algún valor adecuado en caso de array vacío
  }
  const indiceAleatorio = Math.floor(Math.random() * array.length);
  return array[indiceAleatorio];
}
const DialogAdvertisements = ({ active, setActive, data, navigation, onClose }: props) => {
  const [ImagesAds, setImagesAds] = useState<Advertisements | undefined>();

  const toggleDialog1 = () => {
    setActive(false);
    onClose()
  };

  const filterImg = () => {
    if (data) {
      const datos = data.filter((e) => e.name.includes("#"));
      setImagesAds(elegirElementoAleatorio(datos));
      console.log(elegirElementoAleatorio(datos), "elegirElementoAleatorio(datos)")
    }
  };

  useEffect(() => {
    filterImg();
  }, [data]);
  if (!active) {
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      className="justify-center text-center bg-white"
      overlayStyle={{
        backgroundColor: "transparent",
        borderRadius: 14,
        width: Platform.OS === "web" ? "100%" : width * 0.9,
        maxWidth: 500,
        height: Platform.OS === "web" ? 600 : "auto",
        maxHeight: "80%",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "transparent",
        overflow: "visible",
      }}
    >
      <View className="w-full h-full items-center justify-center relative">
        <TouchableOpacity
          onPress={toggleDialog1}
          className="absolute top-2 right-2 z-50 bg-white rounded-full p-1"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}
        >
          <AntDesign name="close" size={20} color="black" />
        </TouchableOpacity>
        {ImagesAds ? (
          <Image
            className=" h-full w-full rounded-2xl"
            style={{ width: "100%", height: "100%" }}
            source={{ uri: ImagesAds.advertisementUrl }}
            contentFit="contain"
            transition={{ duration: 300 }}
            priority={"high"}
          />
        ) : null}
      </View>
      {/* <View className=" flex items-center absolute bottom-0 w-full">
        <View className=" w-1/3">
          <Button
            text={"¡Unirme Ya!"}
            typeButton="normal"
            onPress={() => {
              if (navigation) toggleDialog1(), navigation.navigate("PagoMovilPayment");
            }}
          />
        </View>
      </View> */}
    </Dialog>
  );
};

export default DialogAdvertisements;

import { View, Text, Linking, BackHandler, Platform, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { Image } from "expo-image";
import { height, width } from "../../../utils/Helpers";
import { CustomerProfile, Parameter } from "../../../utils/Interface";
import moment from "moment";
import { font } from "../../../../styles";
import { Colors } from "../../../utils";
import CacheImage from "../../CacheImage/CacheImage";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: CustomerProfile[];
  navigation?: NavigationScreenNavigationType;
};
const DialogFotoTrampa = ({ active, setActive, data, navigation }: props) => {
  const { user } = useAuth();
  const [Index, setIndex] = useState(0);
  const toggleDialog1 = () => {
    setActive(false);
  };

  const Next = () => {
    if (data && data.length - 1 !== Index) setIndex(Index + 1);
    if (data && data.length - 1 === Index) setIndex(0);
  };

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1);
  };

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
      {/*   <View className=" p-2">
        <Image
          className=" h-full w-full"
          style={{ width: width * 0.8, height: height * (Platform.OS === "ios" ?0.5 : 0.6) }}
          source={require("../../../../assets/items/FotoTrampa.png")}
        />
      </View> */}

      <View className=" flex items-center w-full">
        <View className=" w-[80%]">
          <Text style={[font.Bold, { textAlign: "center", color: Colors.danger, fontSize: 16, marginVertical: 10 }]}>
            {" "}
            El sistema a determinado que eres foto trampa{" "}
          </Text>
        </View>

        {data?.length ? (
          <View className=" flex items-center">
            <View className=" absolute z-10 top-0 left-0 -rotate-12">
              <Image
                className=" h-full w-full"
                style={{ width: 80, height: 80 }}
                source={require("../../../../assets/items/FTTrap.png")}
                transition={{ duration: 300 }}
              />
            </View>
            <View className=" w-[60vw] h-[30vh]">
              {data && !data.length ? null : (
                <CacheImage
                  classNameImage="absolute top-0 h-full w-full rounded-2xl"
                  source={{ uri: data && data[Index]?.link }}
                />
              )}

              <View className=" flex-row h-[20px] p-2 ">
                {data &&
                  data.map((e, index) => (
                    <View
                      key={index}
                      className={
                        index === Index
                          ? " flex-1  bg-white rounded-xl mx-1 "
                          : " flex-1  bg-black rounded-xl mx-1 opacity-50 shadow-lg shadow-white "
                      }
                    ></View>
                  ))}
              </View>

              <View className=" h-full flex-row">
                <Pressable onPress={Previus} className=" h-full flex-1"></Pressable>
                <Pressable onPress={Next} className=" h-full flex-1"></Pressable>
              </View>
            </View>
          </View>
        ) : null}
        <View className=" w-[70%]">
          <Text style={[font.Bold, { textAlign: "center", fontSize: 11, color:Colors.danger }]}>Fotos que han sido negadas. </Text>
        </View>
        <View className=" w-[70%]">
          <Text style={[font.Bold, { textAlign: "justify", fontSize: 16, marginVertical: 16 }]}>
            Por favor vuelve a realizar el proceso de verificación de usuario y que todas las fotos sean tuyas.{" "}
          </Text>
        </View>
      </View>
    </Dialog>
  );
};

export default DialogFotoTrampa;

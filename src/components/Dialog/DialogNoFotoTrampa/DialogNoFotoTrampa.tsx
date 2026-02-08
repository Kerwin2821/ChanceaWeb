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
const DialogNoFotoTrampa = ({ active, setActive, data, navigation }: props) => {
  const { user } = useAuth();
  const [Index, setIndex] = useState(0);
  const toggleDialog1 = () => {
    setActive(false);
  };

  const Next = () => {
    if (user?.customerProfiles && user?.customerProfiles.length - 1 !== Index) setIndex(Index + 1);
    if (user?.customerProfiles && user?.customerProfiles.length - 1 === Index) setIndex(0);
  };

  const Previus = () => {
    if (Index !== 0) setIndex(Index - 1);
  };

  if (!active) {
    return <></>;
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
          <Text style={[font.Bold, { textAlign: "center", color: Colors.green, fontSize: 20, marginVertical: 10 }]}>
            {" "}
            ¡Felicidades!{" "}
          </Text>
        </View>

        {user?.customerProfiles?.length ? (
          <View className=" flex items-center">
            <View className=" absolute z-10 top-0 left-0 -rotate-12">
              <Image
                className=" h-full w-full"
                style={{ width: 80, height: 80 }}
                source={require("../../../../assets/items/NoFTTrap.png")}
                transition={{ duration: 300 }}
              />
            </View>
            <View className=" w-[60vw] h-[30vh]">
              {user?.customerProfiles && !user?.customerProfiles.length ? null : (
                <CacheImage
                  classNameImage="absolute top-0 h-full w-full rounded-2xl"
                  source={{ uri: user?.customerProfiles && user?.customerProfiles[Index]?.link }}
                />
              )}

              <View className=" flex-row h-[20px] p-2 ">
                {user?.customerProfiles &&
                  user?.customerProfiles.map((e, index) => (
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
          <Text style={[font.Bold, { textAlign: "justify", fontSize: 16, marginVertical: 16 }]}>
            El sistema ha determinado que no eres foto trampa, por lo que gozarás de tu sello de no foto trampa.{" "}
          </Text>
        </View>
        <View className=" w-[50%] justify-center items-center">

        <Button
          onPress={toggleDialog1}
          text="Listo"
        />
        </View>
      </View>
    </Dialog>
  );
};

export default DialogNoFotoTrampa;

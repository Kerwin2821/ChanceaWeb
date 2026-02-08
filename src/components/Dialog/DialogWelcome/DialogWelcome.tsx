import {
  View,
  Text,
  Linking,
  BackHandler,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { CheckBox, Dialog, ListItem, TabView } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { Colors } from "../../../utils";
import { environmet } from "../../../../env";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { font } from "../../../../styles";
import Input from "../../InputComponent/Input";
import { Entypo, FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { useStore } from "../../../context/storeContext/StoreState";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { useCopilot } from "react-native-copilot";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
};

const DialogWelcome = ({ active, setActive }: props) => {
  const { start } = useCopilot();

  const toggleDialog1 = () => {
    setActive(!active);
  };
  const initTutorial = () => {
    setActive(false);
    setTimeout(() => {
      start()
    }, 1000);
  };

  if(!active){
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      /* onBackdropPress={toggleDialog1} */
      overlayStyle={{ borderRadius: 14, width: "90%", maxHeight: "60%" }}
    >
      <View className=" items-center">
        <View className="w-[90%]">
          <Text style={[{ textAlign: "center", fontSize: 20, color: Colors.primary }, font.Bold]}>
            Bienvenido a Chancea
          </Text>
        </View>
        <View className="w-[90%]">
          <Text style={[{ textAlign: "center", fontSize: 14, marginVertical: 16 }, font.SemiBold]}>
           ¿Deseas conocer cómo funciona Chancea?
          </Text>
        </View>
      </View>
      <View className="mt-5">
        {/* <Button text={"Si tengo"} typeButton="white" onPress={() => SendBlock()} /> */}
        <Button showIcon icon={<Entypo name="check" size={24} color="white" />} IconDirection="left" styleButton={{backgroundColor:Colors.green}} text={"Sí, quiero."} onPress={initTutorial} />

        <Button showIcon icon={<FontAwesome name="close" size={24} color="white" />} IconDirection="left" styleButton={{backgroundColor:Colors.danger}} text={"No, gracias."} onPress={toggleDialog1} />

        {/* <Button styleText={{ color: 'white' }} text={'No'} onPress={toggleDialog1} /> */}
      </View>
    </Dialog>
  );
};

export default DialogWelcome;

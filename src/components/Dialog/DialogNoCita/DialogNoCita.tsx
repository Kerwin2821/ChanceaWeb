import { View, Text, Linking, BackHandler } from "react-native";
import React, { useEffect } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { font } from "../../../../styles";
import { CustomerProfile } from "../../../utils/Interface";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  navigation: NavigationScreenNavigationType;
};

const DialogNoCita = ({ active, setActive, navigation }: props) => {
  const toggleDialog1 = () => {
    setActive(false);
    navigation.goBack();
  };

  if(!active){
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      className="justify-center text-center bg-white"
      overlayStyle={{ borderRadius: 14, width: "80%", paddingVertical: 10 }}
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
    >
      <Text style={[font.Bold, { textAlign: "center", fontSize: 20, paddingVertical: 10 }]}>
        ¡Tus Citas te esperan!
      </Text>
      <Text style={[font.Regular, { textAlign: "center", fontSize: 16, paddingVertical: 10 }]}>
        Continúa explorando la pantalla inicial para encontrarlas y unirte a la diversión.
      </Text>
      <View className=" mt-5">
        <Button styleText={{ color: "white" }} text={"Ok"} onPress={toggleDialog1} />
      </View>
    </Dialog>
  );
};

export default DialogNoCita;

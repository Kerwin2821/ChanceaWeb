import { View, Text, Linking, BackHandler } from "react-native";
import React, { useEffect } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";

const DialogNoConnection = ({ isConnected }: { isConnected: boolean }) => {
  const { IsConnected, setIsConnected } = useAuth();

  useEffect(() => {
    setIsConnected(isConnected);
  }, [isConnected]);

  const handleClosePress = () => {
    BackHandler.exitApp();
  };

  if (!isConnected) {
    return <></>;
  }
  return (
    <Dialog isVisible={isConnected} className="justify-center text-center bg-white">
      <Dialog.Title titleStyle={{ textAlign: "center" }} title="¿Parece que no tienes internet?" />
      <View className=" mt-5">
        <Button text={"Si tengo"} typeButton="white" onPress={() => Linking.openSettings()} />

        <Button styleText={{ color: "white" }} text={"No"} onPress={handleClosePress} />
      </View>
    </Dialog>
  );
};

export default DialogNoConnection;

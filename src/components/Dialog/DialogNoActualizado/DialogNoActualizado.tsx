import { View, Text, Linking, BackHandler } from "react-native";
import React, { useEffect } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { font } from "../../../../styles";

const DialogNoActualizado = ({ IsUpdate }: { IsUpdate: boolean }) => {
  const { setIsUpdate } = useAuth();

  useEffect(() => {
    setIsUpdate(IsUpdate);
  }, [IsUpdate]);
  const openAppInfo = () => {
    const appUrl = "https://play.google.com/store/apps/details?id=com.chanceaappp.chanceaapp"; // Reemplaza con tu ID de paquete
    Linking.canOpenURL(appUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(appUrl);
        } else {
          console.log("No se puede abrir la URL:", appUrl);
        }
      })
      .catch((err) => console.error("Error al abrir la URL:", err));
  };

  const handleClosePress = () => {
    BackHandler.exitApp();
  };

  if(!IsUpdate){
    return <></>
  }

  return (
    <Dialog isVisible={IsUpdate} className="justify-center text-center bg-white">
      <Dialog.Title
        titleStyle={[font.Bold, { textAlign: "center" }]}
        title="Se informa que la aplicación está desactualizada."
      />
      <View>
        <Text style={[font.Regular, { textAlign: "center", fontSize: 14 }]}>
          ¿Desea actualizarla para disfrutar de las mejoras que ofrece Chancea?
        </Text>
      </View>
      <View className=" mt-5">
        <Button text={"Actualizar"} typeButton="white" onPress={openAppInfo} />

        <Button styleText={{ color: "white" }} text={"No actualizar"} onPress={handleClosePress} />
      </View>
    </Dialog>
  );
};

export default DialogNoActualizado;

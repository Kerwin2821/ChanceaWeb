import {
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Dialog } from "@rn-vui/themed";
import Button from "../../ButtonComponent/Button";
import { useAuth } from "../../../context";
import { Colors } from "../../../utils";
import { encrypt, GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { font } from "../../../../styles";
import { useStore } from "../../../context/storeContext/StoreState";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { MatchResponse } from "../../../context/storeContext/StoreInterface";
import { BottomTabNavigationType } from "../../../navigation/BottomTab";
import { useRoute } from "@react-navigation/native";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: { idDestino: string };
  navigation?: BottomTabNavigationType;
};

const DialogDeleteMatch = ({ active, setActive, data,navigation }: props) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const { Match, setMatch } = useStore();
  const route = useRoute();

  const toggleDialog1 = () => {
    setActive(!active);
  };

  async function DeleteMatch() {
    try {
      setLoad(true);
      if (!process.env.ENCRYPTION_KEY) {
        ToastCall("success", "Cuadre eliminado", "ES");
        return;
      }
      console.log(data?.idDestino)
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer-matches/canceleCustomerMatch/${SesionToken}/${data?.idDestino}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: MatchResponse = await HttpService("get", host, url, {}, header);
      if(Match) setMatch(Match.filter((ele) => ele.id !== Number(data?.idDestino)));
      toggleDialog1()
      ToastCall("success", "Cuadre eliminado", "ES");
      route.name === "CustomerProfile" && navigation?.navigate("Megustas")
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    } // Displaying the stringified data in an alert popup
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      overlayStyle={{ borderRadius: 14, width: "90%", maxHeight: "60%" }}
    >
      {Load && (
        <View
          className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.primary} size={64} />
        </View>
      )}
       <Dialog.Title titleStyle={{ textAlign: "center" }} title="¿Estas seguro?" />
        <Text style={[{ textAlign: "center" }, font.Regular]}>
          Al eliminar este usuario no podras recuperar los chanceos ni los cuadres
        </Text>
        <View className=" mt-5">
          <Button text={"Si estoy seguro"} typeButton="white" onPress={() => DeleteMatch()} />

          <Button styleText={{ color: "white" }} text={"Cancelar"} onPress={toggleDialog1} />
        </View>
    </Dialog>
  );
};

export default DialogDeleteMatch;

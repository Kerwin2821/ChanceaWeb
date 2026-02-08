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
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { font } from "../../../../styles";
import { Entypo } from "@expo/vector-icons";
import { useStore } from "../../../context/storeContext/StoreState";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { useChat } from "../../../context/ChatContext/ChatProvider";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: { idDestino: string };
  navigation?: NavigationScreenNavigationType;
  back: boolean;
  onSuccess?: () => void;
};

export interface TypeReport {
  id: number;
  name: string;
  description: string;
  complaintCategory: ComplaintCategory;
}

export interface ComplaintCategory {
  id: number;
  name: string;
  description: string;
}

const DialogBloquear = ({ active, setActive, data, navigation, back, onSuccess }: props) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const { Match, setMatch, } = useStore();
  const { Customers, setCustomers, Customers2, setCustomers2, CitasRecibidas, CitasEnviadas, setCitasRecibidas, setCitasEnviadas } = useStore();
  const { setChats, Chats } = useChat();

  const toggleDialog1 = () => {
    setActive(!active);
  };

  async function SendBlock() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/generateBlockedCustomer/${SesionToken}/${data?.idDestino}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header);


      if (data) {
        const userId = Number(data.idDestino);
        setCustomers(Customers.filter(e => e.id !== userId));
        setCustomers2(Customers2.filter(e => e.id !== userId));
      }

      if (Match) {
        setMatch(Match.filter((ele) => ele.id !== Number(data?.idDestino)));
      }
      if (Chats) {
        setChats(Chats.filter((ele) => Number(ele.infoUser.userId) !== Number(data?.idDestino)));
      }
      if (CitasRecibidas) {
        setCitasRecibidas(CitasRecibidas.filter((ele) => ele.customerSource.id !== Number(data?.idDestino)));
      }
      if (CitasEnviadas) {
        setCitasEnviadas(CitasEnviadas.filter((ele) => ele.customerDestination.id !== Number(data?.idDestino)));
      }

      toggleDialog1();
      ToastCall("success", "Usuario bloqueado con éxito", "ES");
      onSuccess && onSuccess();
      back && navigation?.goBack()
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

      <View className=" items-center">
        <View className="w-[90%]">
          <Text style={[{ textAlign: "center", fontSize: 18, color: Colors.primary }, font.Bold]}>
            ¿Seguro que desea bloquear este chance?
          </Text>
        </View>
        <View className="w-[90%]">
          <Text style={[{ textAlign: "justify", fontSize: 14, marginVertical: 16 }, font.SemiBold]}>
            Al bloquear este chance, no podrás volver a verlo ni acceder a esta oportunidad nuevamente.
          </Text>
        </View>
      </View>
      <View className="">
        {/* <Button text={"Si tengo"} typeButton="white" onPress={() => SendBlock()} /> */}
        <Button showIcon icon={<Entypo name="block" size={24} color="white" />} IconDirection="left" styleButton={{ backgroundColor: Colors.danger }} text={"Bloquear"} onPress={SendBlock} />

        {/* <Button styleText={{ color: 'white' }} text={'No'} onPress={toggleDialog1} /> */}
      </View>
    </Dialog>
  );
};

export default DialogBloquear;

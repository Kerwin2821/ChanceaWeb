import { View, Text, ActivityIndicator } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { Avatar, Dialog, ListItem } from "@rn-vui/themed";
import { font } from "../../../../styles";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { useAuth, useRender } from "../../../context";
import { Colors } from "../../../utils";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { Bank, CustomersHome } from "../../../utils/Interface";
import { environmet } from "../../../../env";
import Input from "../../InputComponent/Input";
import Button from "../../ButtonComponent/Button";
import Select from "../../Select/SelectComponent";
import AsyncStorage from "@react-native-async-storage/async-storage";
type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: CustomersHome;
};

const documents = [
  {
    value: "V",
    label: "V",
  },
  {
    value: "J",
    label: "J",
  },
  {
    value: "E",
    label: "E",
  },
  {
    value: "P",
    label: "P",
  },
  {
    value: "G",
    label: "G",
  },
];
const initForm = {
  customerId: "",
  reference: "",
  payerPhone: "",
  payerCedula: "",
  conditionType: "V",
};

const DialogValidateIDPayment = ({ active, setActive, data }: props) => {
  const { user, setUser, TokenAuthApi, SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const [Banks, setBanks] = useState<Bank[]>([]);
  const [CustomPiropo, setCustomPiropo] = useState(false);
  const [Data, setData] = useState(initForm);

  const toggleDialog1 = () => {
    setActive(!active);
  };

  async function sendData() {
    try {
      setLoad(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customers/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService(
        "put",
        host,
        url,
        { ...user, identifcatorPayment: Data.conditionType + Data.payerCedula },
        header
      );

      console.log(response);

      setUser(response);
      await AsyncStorage.setItem("Sesion", JSON.stringify(response));
      ToastCall("success", "Guardado con Éxito", "ES");
      toggleDialog1();
    } catch (err: any) {
      console.error(JSON.stringify(err), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    }
  }

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setData({
        ...Data,
        [key]: value,
      });
    },
    [Data]
  );

  /*  useEffect(() => {
    if (active) {
      queryPiropo();
    }
  }, [active]); */

  if (!active) {
    return <></>;
  }

  return (
    <Dialog isVisible={active} overlayStyle={{ borderRadius: 14, width: "90%" }}>
      {Load && (
        <View
          className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.primary} size={64} />
        </View>
      )}
      <View className=" mb-5 mx-2">
        <Text style={[{ textAlign: "center", fontSize: 18 }, font.Bold]}>Guardar Cedula</Text>
        <Text style={[{ textAlign: "center", fontSize: 12 }, font.Regular]}>
          Se ve a solicitar tu cedula de identidad para facilitar la validación a la hora de recibir el pago.
        </Text>
      </View>

      <View className="w-full">
        <View className=" w-full">
          <Text style={font.SemiBold}>Cédula</Text>
        </View>
        <View className=" flex-row w-full justify-between items-center">
          <View style={{ width: "30%" }}>
            <Select
              items={documents}
              onChange={(e: string | number) => change(e, "conditionType")}
              styleText={{ paddingHorizontal: 0 }}
              value={Data.conditionType}
            />
          </View>
          <View style={{ width: "65%" }}>
            <Input
              placeholder={"Example: 121109771"}
              onChangeText={(e: string) => change(e.replace(/[^0-9a-zA-Z]/g, ""), "payerCedula")}
              value={Data.payerCedula}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>
        </View>
      </View>
      <View className=" w-full items-center">
        <View className="w-[45%] items-center mt-4">
          <Button text={"Guardar"} disabled={!Data.payerCedula} onPress={() => sendData()} />
        </View>
      </View>
    </Dialog>
  );
};

export default DialogValidateIDPayment;

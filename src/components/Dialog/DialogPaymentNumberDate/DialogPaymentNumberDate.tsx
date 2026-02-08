import { View, Text, ActivityIndicator, Pressable, Keyboard, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Dialog, FAB, ListItem } from "@rn-vui/themed";
import { font, shadow } from "../../../../styles";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { useAuth, useRender } from "../../../context";
import { Colors } from "../../../utils";
import { FontAwesome5, Fontisto, MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Input from "../../InputComponent/Input";
import Button from "../../ButtonComponent/Button";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import { environmet } from "../../../../env";
import dataBancos from "../../../utils/dataBancos.json";
import Select from "../../Select/SelectComponent";
import { AxiosError } from "axios";
import DialogSelectBank from "../DialogSelectBank/DialogSelectBank";
import { Cita, Estado } from "../../../utils/Date.interface";
import { useStore } from "../../../context/storeContext/StoreState";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data: Cita;
  navigation: NavigationScreenNavigationType;
  amount: number;
};

let regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const regexTelefonoVenezolano =
  /^(0412|0414|0416|0424|0413|0415|0426|0426|0428)\d{7}$/;

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
  abaBank: "",
  payerCedula: "",
  conditionType: "",
};

const DialogPaymentNumberDate = ({ active, setActive, data, navigation, amount }: props) => {
  const { TokenAuthApi, user, SesionToken } = useAuth();
  const { CitasEnviadas, CitasRecibidas, setCitasEnviadas } = useStore();
  const [TextError, setTextError] = useState<string | undefined>();
  const [Load, setLoad] = useState(false);
  const [SelectBank, setSelectBank] = useState(false);
  const [Email, setEmail] = useState("");
  const [Data, setData] = useState(initForm);
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">("pending");

  const bankData = useMemo(() => {
    const data = dataBancos.find((e) => e.value === Data.abaBank);
    if (data) return data.label;

    return "0000";
  }, [Data.abaBank]);

  const toggleDialog1 = () => {
    if (Load) return;
    setEmail("");
    setData(initForm);
    setActive(false);
  };
  async function UpdateCita() {
    try {
      const { id, acceptanceDate } = data;
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/appchanceaUpdateInvitationsStatus`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      await HttpService(
        "post",
        host,
        url,
        {
          invitationId: id,
          tokenSessionId: SesionToken,
          acceptanceDate,
          statusInvitation: "ACEPTADA",
        },
        header
      );
      console.log(CitasEnviadas.find((e) => e.id == id));
      console.log(CitasRecibidas.find((e) => e.id == id));
      setCitasEnviadas(
        CitasEnviadas.map((e) => {
          if (e.id === id) {
            return {
              ...e,
              acceptanceDate,
              statusInvitation: "ACEPTADA",
            };
          }
          return e;
        })
      );
    } catch (err) {
      const errors = err as AxiosError;

      console.log(errors, "UpdateCitas");
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

  async function query() {
    try {
      setLoad(true);

      console.log(Data);

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer/puchasePlanValidatorBDV/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("post", host, url, Data, header);
      console.log(response);

      if (response.codigoRespuesta == "56") {
        setTextError("Servicio no disponible.");
      }
      if (response.codigoRespuesta == "38") {
        setTextError("Código de referencia usado.");
      }
      if (response.codigoRespuesta == "37") {
        setTextError("No existe una orden pendiente para esta operación.");
      }
      if (response.codigoRespuesta == "29") {
        setTextError("Verifica que los datos ingresados sean los correctos.");
      }
      if (response.codigoRespuesta == "00") {
        toggleDialog1();
        await UpdateCita();
        ToastCall("success", "Transacción exitosa.", "ES");
        navigation.navigate("PaymentDateSuccess", { data, amount });
        /* if (navigation) {
          navigation.goBack();
        } */
      }
    } catch (err: any) {
      const errors = err as AxiosError;
      console.error(JSON.stringify(errors), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoad(false);
    }
  }
  useEffect(() => {
    if (Data.payerPhone) {
      setIsNumberPhone(regexTelefonoVenezolano.test(Data.payerPhone));
    }
  }, [Data.payerPhone]);

  useEffect(() => {
    if (user)
      setData({
        ...Data,
        abaBank: dataBancos[0].value,
        customerId: user?.id.toString(),
        payerPhone: "0" + user?.phone.slice(3),
      });

    console.log(amount);
  }, [user, active]);

  if (!active) {
    return <></>;
  }
  return (
    <Dialog
      isVisible={active}
      className="justify-center text-center"
      overlayStyle={{
        borderRadius: 14,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        maxHeight: "80%",
      }}
    >
      <View className=" absolute -top-2 -right-1">
        <FAB
          icon={<MaterialCommunityIcons name="close" size={20} color="white" />}
          onPress={toggleDialog1}
          size="small"
        />
      </View>
      {Load && (
        <View
          className=" absolute top-0 left-0 right-0 bottom-0 justify-center z-10"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <ActivityIndicator color={Colors.primary} size={64} />
        </View>
      )}
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <Text style={[{ textAlign: "center", fontSize: 20 }, font.Bold]}>Validar Pago</Text>
        {TextError && (
          <View className=" border rounded-xl border-error mt-2">
            <Text style={[{ textAlign: "center", fontSize: 12, color: Colors.danger }, font.Bold]}>{TextError}</Text>
          </View>
        )}
        <ScrollView className=" mt-4" contentContainerStyle={{alignItems:"center"}}>
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
            <Text className=" text-xs text-right " style={font.Regular}>
              Cédula del pagador
            </Text>
          </View>
          <View className="mt-2">
            <Input
              labelText="Teléfono"
              placeholder="04164567894"
              keyboardType="number-pad"
              value={Data.payerPhone}
              maxLength={12}
              onChangeText={(e: string) => {
                change(e, "payerPhone");
              }}
            />
            {Data.payerPhone ? (
              !isNumberPhone ? (
                <Text className=" text-xs text-red-400 " style={font.Regular}>
                  No es un Número de teléfono
                </Text>
              ) : null
            ) : null}
             <Text className=" text-xs  text-right " style={font.Regular}>
              Número de teléfono del pagador
            </Text>
          </View>
          <View className="mt-2">
            <Input
              labelText="Número de referencia"
              placeholder="00000001234567"
              keyboardType="number-pad"
              value={Data.reference}
              maxLength={20}
              onChangeText={(e: string) => {
                change(e, "reference");
              }}
            />
             <Text className=" text-xs text-right" style={font.Regular}>
             Número de referencia del pago móvil
            </Text>
          </View>
          {/* <Select
          labelText='Banco de origen'
          items={dataBancos}
          value={Data.abaBank}
          onChange={(e) => {
            change(e,"abaBank");
          }}
        /> */}
          <View className="w-full">
            <Text className=" w-full pl-[8px] mb-2" style={{ fontFamily: "SemiBold" }}>
              Banco origen
            </Text>
            <Button typeButton="white" text={bankData} onPress={() => setSelectBank(true)} />
            <Text className=" text-xs text-right " style={font.Regular}>
              Banco de donde se origino el pago móvil
            </Text>
          </View>

          <View className="w-[45%] items-center mt-4">
            <Button
              text={"Siguiente"}
              disabled={!Data.abaBank || !Data.payerPhone || !Data.reference || !isNumberPhone || !Data.payerCedula}
              onPress={() => query()}
            />
          </View>
        </ScrollView>
        <DialogSelectBank
          active={SelectBank}
          setActive={setSelectBank}
          onChange={(e) => {
            change(e, "abaBank");
          }}
        />
      </Pressable>
    </Dialog>
  );
};

export default DialogPaymentNumberDate;

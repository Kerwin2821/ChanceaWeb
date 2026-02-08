import { View, Text, ActivityIndicator, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Dialog, ListItem } from "@rn-vui/themed";
import { font, shadow } from "../../../../styles";
import { GetHeader, ToastCall } from "../../../utils/Helpers";
import { HttpService } from "../../../services";
import { useAuth, useRender } from "../../../context";
import { Colors } from "../../../utils";
import { FontAwesome5, Fontisto } from "@expo/vector-icons";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Keyboard } from "react-native";
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness";
import { initialFormCreateTienda } from "../../../context/storeBusinessHooks/StoreBusinessInterface";
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks";

type props = {
  active: boolean;
  setActive: (e: boolean) => void;
  data?: any;
  navigation?: NavigationScreenNavigationType;
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

const DialogCrearTienda = ({ active, setActive, data, navigation }: props) => {
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth();
  const [Load, setLoad] = useState(false);
  const [SelectBank, setSelectBank] = useState(false);
  const [TextError, setTextError] = useState<string | undefined>();
  const [Email, setEmail] = useState("");
  const {FormCreateTienda, setFormCreateTienda} = useStoreBusiness();
  const {sesionBusiness } = useSesionBusinessStore();
  const [isNumberPhone, setIsNumberPhone] = useState<boolean | "pending">("pending");
  const { KeyboardStatus } = useRender();

  const toggleDialog1 = () => {
    if (Load) return;
    setEmail("");
    setFormCreateTienda(initialFormCreateTienda);
    setActive(false);
    setTextError(undefined);
  };

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setFormCreateTienda({
        ...FormCreateTienda,
        [key]: value,
      });
    },
    [FormCreateTienda]
  );

  useEffect(() => {
    if (FormCreateTienda.phoneNumber) {
      setIsNumberPhone(regexTelefonoVenezolano.test(FormCreateTienda.phoneNumber));
    }
  }, [FormCreateTienda.phoneNumber]);

  useEffect(() => {
    if (sesionBusiness)
      setFormCreateTienda({
        ...FormCreateTienda,
        phoneNumber: sesionBusiness.phoneNumber,
        email:sesionBusiness.email,
        name:sesionBusiness.name,
        description:sesionBusiness.name
      });
  }, [sesionBusiness, active]);

  if (!active) {
    return <></>;
  }
  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      overlayStyle={{
        borderRadius: 14,
        padding: 16,
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        maxHeight: "80%",
      }}
    >
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
        {/* <ScrollView className=" mt-4 "  contentContainerStyle={{alignItems:"center"}}>
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
          <View className="w-full mt-2">
            <Text className=" w-full pl-[8px] mb-2" style={{ fontFamily: "SemiBold" }}>
              Banco origen
            </Text>
            <Button typeButton="white" text={bankData} onPress={() => setSelectBank(true)} />
            <Text className=" text-xs text-right " style={font.Regular}>
              Banco de donde se origino el pago móvil
            </Text>
          </View>
          <View className=" w-full items-center">
            <View className="w-[45%] items-center mt-4">
              <Button
                text={"Siguiente"}
                disabled={!Data.abaBank || !Data.payerPhone || !Data.reference || !isNumberPhone || !Data.payerCedula}
                onPress={() => query()}
              />
            </View>
          </View>
        </ScrollView> */}
      </Pressable>

      <DialogSelectBank
        active={SelectBank}
        setActive={setSelectBank}
        onChange={(e) => {
          change(e, "abaBank");
        }}
      />
    </Dialog>
  );
};

export default DialogCrearTienda;

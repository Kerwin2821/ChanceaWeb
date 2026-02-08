import { Text, View, StyleSheet, Platform } from "react-native";
import { Items } from "../../utils/Interface";
import Button from "../../components/ButtonComponent/Button";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import Input from "../../components/InputComponent/Input";
import { useAuth, useFormRegister, useRender } from "../../context";
import { useCallback, useEffect, useMemo, useState } from "react";
import Select from "../../components/Select/SelectComponent";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import { font } from "../../../styles";
import CustomDatePicker from "../../components/CustomDatePicker";
import moment from "moment";
import InputDisabled from "../../components/InputDisabledComponent/InputDisabled";
import { Colors } from "../../utils";

import { Symbol } from "../../context/registerContext/RegisterInterfaces";
import { HttpService } from "../../services";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import RegisteIMG5 from "../../components/imgSvg/RegisteIMG5";
import ScreenContainerForm from "../../components/ScreenContainerForm";

export default function RegisterScreen1() {
  const {
    registerReq,
    registerReq: { age, birthDate, symbol },
    setRegisterReq,
  } = useFormRegister();
  const { TokenAuthApi, deviceId, DataCoordenadas } = useAuth();
  const { setLoader } = useRender();
  const [DateBirthDate, setDateBirthDate] = useState(new Date(new Date().getTime() - 18.5 * 24 * 60 * 60 * 1000 * 365));
  const [DocumentType, setDocumentType] = useState<string>("V");
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [open, setOpen] = useState(false);
  const [SignoData, setSignoData] = useState<Symbol[]>([]);
  const [SignoSelect, setSignoSelect] = useState<Symbol | undefined>(undefined);
  const change = useCallback(
    (value: string | number | Symbol, key: string | number) => {
      setRegisterReq({
        ...registerReq,
        [key]: value,
      });
    },
    [registerReq]
  );
  const edad = useMemo(() => {
    var nacimiento = moment(DateBirthDate);
    var hoy = moment();
    var anios = hoy.diff(nacimiento, "years");
    return anios;
  }, [DateBirthDate]);


  async function GetData() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/zodiac-symbols`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: Symbol[] = await HttpService("get", host, url, {}, header, setLoader);

      response.map((ele) => ({ ...ele, select: false }));
      setSignoData(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } // Displaying the stringified data in an alert popup
  }

  useEffect(() => {
    GetData();
  }, []);

  useEffect(() => {
    if (SignoSelect || DateBirthDate) {
      var nacimiento = moment(DateBirthDate);
      var hoy = moment();
      var anios = hoy.diff(nacimiento, "years");

      setRegisterReq({
        ...registerReq,
        birthDate: nacimiento.toDate().toISOString(),
        age: anios,
        symbol: SignoSelect,
        externalId: deviceId,
        postionX: DataCoordenadas.coords.longitude,
        postionY: DataCoordenadas.coords.latitude,
      });
    }
  }, [SignoSelect, deviceId, DataCoordenadas, DateBirthDate]);

  useEffect(() => {
    console.log(registerReq);
  }, [registerReq]);

  /* async function ValidateCedula() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/appchancea/cuponapp/customers/validateIdentificacionNumber/${identificationNumber}`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService(
        'get',
        host,
        url,
        {},
        header,
        setLoader
      );
      if (response.codigoRespuesta === '50') {
        ToastCall('error', 'Esta Cedula ya esta registrada', 'ES');
        return;
      }
      change(identificationNumber, 'identificationNumber')
      navigation.navigate('RegisterStep1');
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall('error', 'error de conexión en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexión', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  } */

  /* useEffect(() => {
    setRegisterReq(initialStateRegister);
  }, []); */

  return (
    <ScreenContainerForm>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-5">
        <View className="w-full justify-center items-center my-8">
          <RegisteIMG5 width={Platform.OS === 'web' ? 180 : width * 0.35} height={Platform.OS === 'web' ? 180 : width * 0.35} />
          <Text style={[font.Bold, { fontSize: 18, textAlign: "center", width: "90%", marginTop: 10 }]}>
            Chamo o chama, olvídate de complejos, coloca tu fecha de nacimiento
          </Text>
        </View>

        <View className="w-full px-5">
          <View className="w-full mb-4 justify-center items-start">
            <Text style={[font.Bold, { textAlign: "left", width: "100%", marginBottom: 5 }]}>Fecha de Nacimiento</Text>
            <Button
              typeButton="white"
              text={moment(DateBirthDate.toISOString()).format("DD/MM/YYYY")}
              onPress={() => {
                setOpen(true);
              }}
            />
          </View>

          <View className="w-full mb-4 justify-center items-start">
            <Text style={[font.Bold, { textAlign: "left", width: "100%", marginBottom: 5 }]}>Edad</Text>
            <Button
              typeButton="normal"
              styleButton={{ backgroundColor: Colors.primary }}
              disabled
              text={edad.toString() + " años"}
            />
          </View>
        </View>

        <View className="w-full flex-row justify-between px-5 mt-5">
          <View className="w-[48%]">
            <Button
              text={"Volver"}
              onPress={() => {
                navigation.goBack();
              }}
              typeButton="white"
            />
          </View>
          <View className="w-[48%]">
            <Button
              text={"Siguiente"}
              disabled={!DateBirthDate}
              onPress={() => {
                navigation.navigate("RegisterScreen2");
              }}
            />
          </View>
        </View>
      </View>
      <CustomDatePicker
        modal
        theme="light"
        title=" Fecha de Nacimiento"
        open={open}
        maximumDate={new Date(new Date().getTime() - 18 * 24 * 60 * 60 * 1000 * 365)}
        minimumDate={new Date(new Date().getTime() - 85 * 24 * 60 * 60 * 1000 * 365)}
        date={DateBirthDate}
        mode="date"
        confirmText="Ok"
        onConfirm={(date: any) => {
          setOpen(false);
          console.log(date);
          setDateBirthDate(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
    </ScreenContainerForm>
  );
}
const styles = StyleSheet.create({
  container: {
    height,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    height: 150,
    borderRadius: 10,
    width: 150,
  },
});

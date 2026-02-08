import { Text, View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import Button from "../../components/ButtonComponent/Button";
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers";
import { useAuth, useFormRegister, useRender } from "../../context";
import { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import ScreenContainer from "../../components/ScreenContainer";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { font } from "../../../styles";
import { HttpService } from "../../services";
import { Chip } from "@rn-vui/themed";
import { Colors } from "../../utils";
import { FontAwesome6 } from "@expo/vector-icons";

export interface CustumerIntereses {
  customers: any;
  description: string;
  iconsrc: string;
  id: number;
  name: string;
  select:boolean
}

export default function LanguageSelect() {
  const { registerReq, setRegisterReq, initialStateRegister } =
    useFormRegister();
  const { TokenAuthApi } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  const [InteresesCustomer, setInteresesCustomer] = useState<CustumerIntereses[]>([]);
  const [InteresesCustomerSelect, setInteresesCustomerSelect] = useState<CustumerIntereses[]>([]);

  const change = useCallback(
    (value: string | number, key: string | number) => {
      setRegisterReq({
        ...registerReq,
        [key]: value,
      });
    },
    [registerReq]
  );

  async function GetIntereses() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer-languages`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response:CustumerIntereses[] = await HttpService(
        "get",
        host,
        url,
        {},
        header,
        setLoader
      );

      response.map(ele => ({...ele, select: false}))
      setInteresesCustomer(response);
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } // Displaying the stringified data in an alert popup
  }

  const SelectInteres = (e:CustumerIntereses) => {
    const validate = InteresesCustomerSelect.some(ele => e.id === ele.id )

    if (!validate) {
      setInteresesCustomer(InteresesCustomer.map(ele => {
        if(ele.id === e.id){
          ele.select = true
        }
        return ele
      }))
      setInteresesCustomerSelect([...InteresesCustomerSelect,e])
    }else{
      setInteresesCustomer(InteresesCustomer.map(ele => {
        if(ele.id === e.id){
          ele.select = false
        }
        return ele
      }))
      setInteresesCustomerSelect(InteresesCustomerSelect.filter(ele => ele.id !== e.id))
    }
  }

  useEffect(() => {
    GetIntereses();
  }, []);

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
    <ScreenContainer>
       {Platform.OS === "ios" ? (
          <TouchableOpacity
            className=" absolute left-3 top-3 flex-row items-center z-10"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
        ) : null}
      <View style={{ height: height }} className="  px-2">
        <View className=" mb-5  w-full justify-center items-center">
          {/* <RegisterImg1></RegisterImg1> */}
          <Text style={font.Bold}>Que Idiomas Hablas</Text>
        </View>
        <View className=" flex-row flex-wrap gap-x-2 mt-5">
          {/* s */}
        </View>

        <View className="absolute bottom-5 w-full flex-row justify-center px-5 mt-10 ">
          <View className="w-[45%] items-center">
            <Button
              text={"Siguiente"}
              /*  disabled={!gender || !lastName || !identificationNumber || !name} */
              onPress={() => {
                /* ValidateCedula(); */
              }}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
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

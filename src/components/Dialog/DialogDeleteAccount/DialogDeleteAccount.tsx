import { View, Text, ActivityIndicator, Platform } from 'react-native'
import React, { useState } from 'react'
import Button from '../../ButtonComponent/Button'
import { NavigationScreenNavigationType } from '../../../navigation/StackNavigator';
import { Colors } from '../../../utils';
import { font } from '../../../../styles';
import { environmet } from '../../../../env';
import { GetHeader, ToastCall } from '../../../utils/Helpers';
import { HttpService } from '../../../services';
import { useAuth } from '../../../context';
import { Dialog } from '@rn-vui/themed';

type props = {
    active: boolean;
    setActive: (e: boolean) => void;
    data?: { idDestino: string };
    navigation?: NavigationScreenNavigationType;
  };

const DialogDeleteAccount = ({active, setActive, data, navigation}:props) => {
    const [Load, setLoad] = useState(false);
    const { user, TokenAuthApi, logOut, SesionToken} = useAuth();

    const toggleDialog1 = () => {
        setActive(false)
    }

    const ConfirDelete = async () => {
        try {
          setLoad(true);
          const host = process.env.APP_BASE_API;
          const header = await GetHeader(TokenAuthApi, "application/json");
          const url2 = `/api/appchancea/customers/deleteCustomer/${SesionToken}`;
          const response = await HttpService("get", host, url2, {}, header);
    
          if (response.codigoRespuesta === "00") {
            toggleDialog1();
            ToastCall("success", "Cuenta Eliminado con exito", "ES");
            await logOut();
          }
        } catch (error: any) {
          console.log(JSON.stringify(error));
          ToastCall("error", "Tienes problemas de conexión", "ES");
        } finally {
          setLoad(false);
        }
    };

    if(!active){
      return <></>
    }

   
  return (
    <Dialog isVisible={active} onBackdropPress={toggleDialog1} className="justify-center text-center">
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
          Al eliminar este usuario no podra recuperar los chances y los cuadres
        </Text>
        <View className=" mt-5">
          <Button text={"Si estoy seguro"} typeButton="white" onPress={ConfirDelete} />

          <Button styleText={{ color: "white" }} text={"Cancelar"} onPress={toggleDialog1} />
        </View>
      </Dialog>
  )
}

export default DialogDeleteAccount
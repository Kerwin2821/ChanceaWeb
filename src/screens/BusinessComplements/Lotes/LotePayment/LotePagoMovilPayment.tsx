import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useAuth, useRender } from '../../../../context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RegisterLoginScreenNavigationType } from '../../../../navigation/StackNavigation';
import { GetHeader, ToastCall, width } from '../../../../utils/Helpers';
import { HttpService } from '../../../../services';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { font } from '../../../../../styles';
import { Colors } from '../../../../utils';
import { useStoreBusiness } from '../../../../context/storeContextBusiness/StoreBusinessState';

const LotePagoMovilPayment = () => {
  const { Sesion, TokenAuthApi } = useAuth();
  const { setLoader,PrecioDolar } = useRender();
  const [Amount, setAmount] = useState(0)
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const { FormCreateLote } = useStoreBusiness();

  async function generatePMIntention() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/services/cuponservices/api/cuponapp/cupons/generateOrdenLoteWithPromotion`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('post', host, url, FormCreateLote, header, setLoader);

      console.log(response)

      if (response.codigoRespuesta === '00') {
        ToastCall('success', 'Intencion de pago creada correctamente', 'ES');
        setAmount(response.orden.totalAmount)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), 'User');
      if (err && err?.status) {
        ToastCall('error', 'error de conexion en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexion', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  }

  useEffect(() => {
    generatePMIntention()
  }, []);

  return (
    <View className=" flex-1  bg-white">
      <View className="flex-row justify-start mx-2 mt-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className="items-center">
        <Image
          style={{ width: width * 0.4, height: width * 0.4 }}
          source={require('../../../../../assets/items/shield.svg')}
        ></Image>
        <Text className="mx-2 text-xl text-primary " style={font.SemiBold}>
          !Importante!
        </Text>
        <Text className="mx-2 text-center " style={{...font.SemiBold, fontSize:10}}>
          El monto debe incluir los decimales sin redondear las cifras, el sistema solo procesará el pago por el MONTO
          EXACTO. El teléfono debe ser el mismo con el que realizaste el pago. Para realizar el pago móvil, debes
          ingresar en cualquier banco del sistema financiero venezolano.
        </Text>
      </View>
      <View className="w-full p-2">
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>{Sesion?.identificationNumber}</Text>
          <TouchableOpacity
            onPress={() => {
              /* copyToClipboard(`${Sesion?.identificationNumber}`, true); */
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>04129757892 </Text>
          <TouchableOpacity
            onPress={() => {
              /*  copyToClipboard('04129757892', false); */
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>
            {Amount} Bs
          </Text>
          <TouchableOpacity
            onPress={() => {
              /*  copyToClipboard('04129757892', false); */
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={{...styles.text, fontSize:14}}>(0191)Mi Banco, Banco Microfinanciero</Text>
        </View>
      </View>
    </View>
  );
};

export default LotePagoMovilPayment;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    width,
    justifyContent: 'space-between',
    flexGrow: 1
  },
  containerText: {
    height: 50,
    backgroundColor: Colors.white,
    borderColor: Colors.blackBackground,
    borderWidth: 2,
    borderRadius: 50,
    borderStyle: 'solid',
    marginVertical: 10,
    paddingHorizontal: 8,
    position: 'relative'
  },
  text: {
    color: Colors.black,
    fontFamily: 'DosisSemiBold',
    fontSize: 16
  },
  title: {
    fontSize: 18,
    marginVertical: 20,
    fontFamily: 'Dosis',
    color: Colors.black,
    textAlign: 'center'
  },
  containerRow: {
    flexDirection: 'row'
  },
  containerCenter: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerWidth: {
    width: '100%'
  },
  containerIcon: {
    position: 'absolute',
    width: 38,
    height: 38,
    top: 0,
    right: 5
  },
  containerButton: {
    width,
    paddingHorizontal: width * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  }
});

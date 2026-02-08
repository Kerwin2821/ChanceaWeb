import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { GetHeader, ToastCall, width } from '../../utils/Helpers';
import { font } from '../../../styles';
import { Colors } from '../../utils';
import { AntDesign, FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { useAuth, useRender } from '../../context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HttpService } from '../../services';
import { NavigationScreenNavigationType } from '../../navigation/StackNavigator';
import Button from '../../components/ButtonComponent/Button';
import DialogPaymentNumber from '../../components/Dialog/DialogPaymentNumber/DialogPaymentNumber';
import { environmet } from '../../../env';
import * as FileSystem from 'expo-file-system';
import * as Clipboard from 'expo-clipboard';
import { Cita } from '../../utils/Date.interface';
import DialogPaymentNumberDate from '../../components/Dialog/DialogPaymentNumberDate/DialogPaymentNumberDate';
import Share from 'react-native-share';
import DialogValidateIDPayment from '../../components/Dialog/DialogValidateIDPayment/DialogValidateIDPayment';
import { saveOrden } from '../../services/CacheStorage/Orden/OrdenStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebViewWebWrapper from '../../components/WebViewWebWrapper';

const bankData = {
  miBanco: {
    name: "Mi Banco",
    tel: "04241934005",
    bank: "(0169 Mi Banco)",
    cedula: "J505226231",
  },
  bdv: {
    name: "Banco de Venezuela",
    tel: "04241934005",
    bank: "(0102 Banco de Venezuela)",
    cedula: "J505226231",
  },
};
const PagoMovilPaymentCitas = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth();
  const { setLoader, PrecioDolar } = useRender();
  const [Active, setActive] = useState(false)
  const [Amount, setAmount] = useState(0)
  const [ActiveValidate, setActiveValidate] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("")
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const route = useRoute();
  const data = route.params as Cita;
  const [selectedBank, setSelectedBank] = useState<"miBanco" | "bdv">("miBanco");
  // Get current bank data based on selection
  const datosPagoMovil = selectedBank === "miBanco" ? bankData.miBanco : bankData.bdv;

  async function generatePMIntention() {
    try {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer/generateOrdenBoxPackage/${data.id}/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, 'application/json');
      const response = await HttpService('get', host, url, {}, header, setLoader);

      if (response.codigoRespuesta === '00') {
        ToastCall('success', 'Intención de pago creada correctamente', 'ES');
        setAmount(response.orden.totalAmount)
        saveOrden(response.orden);

        const webViewUrl = `https://v0-react-native-payment-app-self.vercel.app/payment?orderId=${response.orden.id}&sessionTokenId=${SesionToken}&amount=${response.orden.totalAmount}`
        setPaymentUrl(webViewUrl)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), 'User');
      if (err && err?.status) {
        ToastCall('error', 'error de conexión en con el Servidor', 'ES');
      } else {
        ToastCall('error', 'Tienes problemas de conexión', 'ES');
      }
    } // Displaying the stringified data in an alert popup
  }

  const imageUrl = 'https://chancea.s3.us-east-1.amazonaws.com/ImagenQR.png';

  const downloadAndShareImage = async () => {
    const fileUri = FileSystem.documentDirectory + 'ImagenQR.png';

    try {
      // Descargar la imagen
      const response = await FileSystem.downloadAsync(imageUrl, fileUri);
      /* Alert.alert('Descarga completa', `Archivo guardado en: ${response.uri}`); */

      // Compartir la imagen
      const shareOptions = {
        title: 'Compartir Imagen',
        url: response.uri,
        message: 'QR para Pago de Chancea',
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error(error);
      /*  Alert.alert('Error', 'Hubo un error al descargar o compartir la imagen.'); */
    }
  };

  const copyToClipboard = async (text: string | number) => {
    await Clipboard.setStringAsync(text.toString());
  };

  useEffect(() => {
    if (!user?.identifcatorPayment) {
      setActiveValidate(true);
      return
    }
    generatePMIntention();
  }, [user]);


  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row justify-start mx-2 mt-5 bg-white px-2 py-2 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>
      <WebViewWebWrapper source={{ uri: paymentUrl }} style={{ flex: 1 }} javaScriptEnabled={true} domStorageEnabled={true} />
    </SafeAreaView>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View className="flex-row justify-start mx-2 mt-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
        </TouchableOpacity>
      </View>
      {/* Bank Selection Switch */}
      <View className="flex-row justify-center items-center my-3">
        <View className="flex-row items-center bg-gray-100 rounded-full p-1">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full flex-row items-center ${selectedBank === "miBanco" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setSelectedBank("miBanco")}
          >
            <Image style={{ width: 18, height: 18, marginRight: 10, borderRadius: 10 }} source={require("../../../assets/img/B-R4.png")} />
            <Text className={`font-medium ${selectedBank === "miBanco" ? "text-white" : "text-gray-600"}`}>
              Mi Banco
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full flex-row items-center ${selectedBank === "bdv" ? "bg-primary" : "bg-transparent"}`}
            onPress={() => setSelectedBank("bdv")}
          >
            <Image style={{ width: 18, height: 18, marginRight: 10, borderRadius: 10 }} source={require("../../../assets/img/B-BDV.png")} />
            <Text className={`font-medium ${selectedBank === "bdv" ? "text-white" : "text-gray-600"}`}>BDV</Text>
          </TouchableOpacity>
        </View>
      </View>


      <View className="items-center">
        <Image
          style={{ width: width * 0.3, height: width * 0.3 }}
          source={require('../../../assets/items/paymentImg.svg')}
          transition={{ duration: 300 }}
        ></Image>
        <Text className="mx-2 text-xl text-primary " style={font.SemiBold}>
          !Importante!
        </Text>
        <Text className="mx-2 text-center " style={{ ...font.SemiBold, fontSize: 10 }}>
          El monto debe incluir los decimales sin redondear las cifras, el sistema solo procesará el pago por el MONTO
          EXACTO. El teléfono debe ser el mismo con el que realizaste el pago. Para realizar el pago móvil, debes
          ingresar en cualquier banco del sistema financiero venezolano.
        </Text>
      </View>
      <View className="w-full p-2">
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>{datosPagoMovil.cedula}</Text>
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(datosPagoMovil.cedula);
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>{datosPagoMovil.tel} </Text>
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(datosPagoMovil.tel);
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={styles.text}>
            {(Amount).toFixed(2)} Bs
          </Text>
          <TouchableOpacity
            onPress={() => {
              copyToClipboard(Amount);
            }}
            style={[styles.containerIcon, styles.containerCenter]}
          >
            <FontAwesome name="clipboard" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.containerCenter, styles.containerText]}>
          <Text style={{ ...styles.text, fontSize: 14 }}>{datosPagoMovil.bank}</Text>
        </View>
        {datosPagoMovil.name !== "Mi Banco" ? (
          <View className="flex-row justify-center items-center mt-10">
            <View className=" w-1/4 items-center justify-center h-[10vh]">
              <TouchableOpacity onPress={downloadAndShareImage}>
                <AntDesign name="qrcode" size={32} color="black" />
              </TouchableOpacity>
            </View>
            <View className=" w-3/4">
              <Button text="Ya pagué" onPress={() => setActive(true)} />
            </View>
          </View>
        ) : (
          <Text className="mx-2 text-center " style={{ ...font.SemiBold, fontSize: 10 }}>
            Una vez realizado el pago móvil, el producto o servicio será provisionado de forma inmediata y exitosa.
            Estaremos notificándote constantemente sobre el estado de tu transacción para que estés siempre al tanto.
          </Text>
        )}
      </View>
      <DialogPaymentNumberDate active={Active} setActive={setActive} navigation={navigation} data={data} amount={Amount} />
      <DialogValidateIDPayment
        active={ActiveValidate}
        setActive={setActiveValidate}
      />
    </SafeAreaView>
  );
};

export default PagoMovilPaymentCitas;

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

import { Animated, View, Text, Pressable, StyleSheet, useWindowDimensions, Alert, Platform } from 'react-native';
import { useCardAnimation } from '@react-navigation/stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CardField, CardForm, useStripe } from '@stripe/stripe-react-native';
import { RegisterLoginScreenNavigationType } from '../../../../navigation/StackNavigation';
import { useState } from 'react';
import { useAuth, useRender } from '../../../../context';
import { GetHeader, ToastCall } from '../../../../utils/Helpers';
import { Lote, PaymentStripeResponse } from '../../../../utils/Interface';
import { HttpService } from '../../../../services';
import Button from '../../../../components/ButtonComponent/Button';
import { Colors } from '../../../../utils';
import { Details } from '@stripe/stripe-react-native/lib/typescript/src/types/components/CardFormView';
import { useStoreBusiness } from '../../../../context/storeContextBusiness/StoreBusinessState';

export interface Response {
  codigoRespuesta: string
  mensajeRespuesta: string
  lote: Lote
}

const styles = StyleSheet.create({
  viewAnimated: {
    width: '100%'
  },
  viewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 20
  }
});
function LoteModalHalfPayment() {
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const { FormCreateLote, setFormCreateLote, InitCreateLote } = useStoreBusiness();
  const { height } = useWindowDimensions();
  const { current } = useCardAnimation();
  const { createToken } = useStripe();
  const [cardInfo, setcardInfo] = useState<null | Details>(null);
  const { TokenAuthApi, Sesion } = useAuth();
  const { setLoader, loader, KeyboardStatus } = useRender();

  const _createToken = async () => {
    setLoader(true);
    const { error, token } = await createToken({
      ...cardInfo,
      type: 'Card',
      currency: 'USD'
    });

    if (error) {
      setLoader(false);
      ToastCall('warning', error.code + ' ' + error.message, 'ES');
    } else if (token) {
      try {
        const host = process.env.APP_BASE_API;
        const url = `/services/cuponservices/api/cuponapp/cupons/generateLoteWithPaymentInfoWithPromotion`;
        const header = await GetHeader(TokenAuthApi, 'application/json');
        const response: Response = await HttpService('post', host, url, {...FormCreateLote, token:token.id}, header, setLoader);
        if (response.codigoRespuesta === '00') {
          // Código para el caso "00"
          navigation.goBack();
          navigation.goBack();
          navigation.navigate('LoteSuccessPayment',response.lote);
          setLoader(false);
        } else if (response.codigoRespuesta === '27') {
          // Código para el caso "27" (LOTE_NOT_FOUND)
          ToastCall('error', 'Lote no encontrado', 'ES');
        } else if (response.codigoRespuesta === '33') {
          // Código para el caso "33" (CUPON_EXPIRED)
          ToastCall('error', 'Cupon Expirado', 'ES');
        } else if (response.codigoRespuesta === '08') {
          // Código para el caso "08" (CUSTOMER_ID_NOT_FOUND)
          ToastCall('error', 'Id de usuario no encotrado', 'ES');
        } else if (response.codigoRespuesta === '75') {
          // Código para el caso "75" (CUPONS_SOLD_OUT)
          ToastCall('error', 'Cupon agotado', 'ES');
        } else if (response.codigoRespuesta === '63') {
          // Código para el caso "63" (ERROR_IN_PAYMENT)
          ToastCall('error', 'Error en el pago', 'ES');
        } else if (response.codigoRespuesta === '64') {
          // Código para el caso "64" (PAYMENT_DECLINED)
          ToastCall('error', 'Pago declinado', 'ES');
        } else if (response.codigoRespuesta === '01') {
          // Código para el caso "01" (INVALID_DATA)
          ToastCall('error', 'Data invalida', 'ES');
        } else if (response.codigoRespuesta === '65') {
          // Código para el caso "65" (BALANCE_INSUFFICIENT)
          ToastCall('error', 'Monto insuficiente', 'ES');
        } else if (response.codigoRespuesta === '66') {
          // Código para el caso "66" (CARD_EXPIRED)
          ToastCall('error', 'Tarjeta expirada', 'ES');
        } else if (response.codigoRespuesta === '67') {
          // Código para el caso "67" (CARD_TYPE_INVALID)
          ToastCall('error', 'Tipo de Tarjeta invalida', 'ES');
        } else if (response.codigoRespuesta === '68') {
          // Código para el caso "68" (CARD_NUMBER_INVALID)
          ToastCall('error', 'Numero de Tarjeta Invalida', 'ES');
        } else if (response.codigoRespuesta === '69') {
          // Código para el caso "69" (PAYMENT_METHOD_NOT_AVAILABLE)
          ToastCall('error', 'Metodo de pago no habilitado', 'ES');
        } else {
          // Código para cualquier otro caso no contemplado
          ToastCall('error', response.mensajeRespuesta, 'ES');
        }
      } catch (error) {
        console.log(JSON.stringify(error));
        setLoader(false);
      } finally {
        setLoader(false);
      }
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        onPress={() => navigation.goBack()}
      />
      <Animated.View
        style={[
          {
            height: height,
            transform: [
              {
                translateY: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    height,
                    Platform.OS === 'ios' ? (KeyboardStatus ? height * 0.4 : height * 0.7) : height * 0.4
                  ],
                  extrapolate: 'clamp'
                })
              }
            ]
          },
          styles.viewAnimated
        ]}
      >
        <View style={styles.viewContainer}>
          {Platform.OS === 'ios' ? (
            <>
              <CardField
                postalCodeEnabled={false} // Oculta el campo de código postal si no es necesario
                cardStyle={{
                  cursorColor: '#000000',
                  borderWidth: 1,
                  borderRadius: 16,
                  fontFamily: 'Regular'
                }}
                style={{
                  width: '100%',
                  height: 90,
                  marginBottom: 32
                }}
              />
              <Button text={'Pagar'} onPress={_createToken} disabled={loader} />
            </>
          ) : (
            <>
              <CardForm
                placeholders={{
                  number: 'NUMERO DE TARJETA'
                }}
                cardStyle={{
                  backgroundColor: Colors.blackBackground,
                  textColor: Colors.grayLight,
                  placeholderColor: Colors.grayLight,
                  cursorColor: '#000000',
                  borderWidth: 1,
                  borderRadius: 16,
                  fontFamily: 'Regular'
                }}
                style={{
                  width: '100%',
                  height: '50%'
                }}
                onFormComplete={(e) => setcardInfo(e)}
              />
              <Button text={'Pagar' } onPress={_createToken} disabled={loader} />
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

export default LoteModalHalfPayment;

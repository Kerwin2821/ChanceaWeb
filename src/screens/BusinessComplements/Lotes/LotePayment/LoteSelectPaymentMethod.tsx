import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Lote } from '../../../../utils/Interface';
import { RegisterLoginScreenNavigationType } from '../../../../navigation/StackNavigation';
import { useRender } from '../../../../context';
import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import PaymentImg from '../../../../../assets/register/PaymentImg';
import Button from '../../../../components/ButtonComponent/Button';
import { Colors } from '../../../../utils';
import { font, shadow } from '../../../../../styles';
import { ListItem } from '@rn-vui/themed';
import { width } from '../../../../utils/Helpers';
import { useStoreBusiness } from '../../../../context/storeContextBusiness/StoreBusinessState';
import { useStore } from '../../../../context/storeContext/StoreState';
import DialogMethodPayLote from '../../../../components/dialog/DialogMethodPayLote/DialogMethodPayLote';

const LoteSelectPaymentMethod = () => {
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const { FormCreateLote,setFormCreateLote } = useStoreBusiness();
  const { DataCategory } = useStore();
  const [Moneda, setMoneda] = useState<'Bs' | 'USD'>('Bs');
  const [DialogAcive, setDialogAcive] = useState(false);
  const { PrecioDolar } = useRender();
  const [Precio, setPrecio] = useState(0);
  const ChangeMoneda = () => {
    if (Moneda === 'Bs') setMoneda('USD');
    if (Moneda === 'USD') setMoneda('Bs');
  };

  useEffect(() => {
    const category = DataCategory.find((e) => e.id === FormCreateLote.categoryId);
    if (category) {
      setPrecio(FormCreateLote.quantiTy * category.price);
      setFormCreateLote({...FormCreateLote, totalPayment:FormCreateLote.quantiTy * category.price})
    }
  }, []);

  return (
    <View className=" flex-1  bg-white ">
      <View className="flex-row justify-start mx-2 mt-5">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <FontAwesome5 name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <Text className=" text-base text-center px-2 mt-5" style={font.SemiBold}>
        Por favor seleccione un método de pago
      </Text>
      <View className=" items-center">
        <PaymentImg />
      </View>

      <View className=" flex-row px-5 w-full items-center  justify-center">
        <View className="w-[50%] mr-2">
          <Button
            typeButton={Moneda === 'Bs' ? 'normal' : 'white'}
            text="Pago Móvil"
            onPress={() => {
              setMoneda('Bs');
            }}
            styleText={Moneda === 'Bs' ? undefined : { color: Colors.graySemiDark }}
            styleButton={Moneda === 'Bs' ? undefined : { borderColor: Colors.graySemiDark }}
          />
        </View>
        <View className="w-[50%] ml-2">
          <Button
            typeButton={Moneda !== 'Bs' ? 'normal' : 'white'}
            text="Tarjeta de Credito"
            onPress={() => {
              setMoneda('USD');
            }}
            styleText={Moneda !== 'Bs' ? undefined : { color: Colors.graySemiDark }}
            styleButton={Moneda !== 'Bs' ? undefined : { borderColor: Colors.graySemiDark }}
          />
        </View>
      </View>

      <View className=" flex-row  justify-center ">
        {Moneda === 'Bs' ? (
          <Text className=" text-lg text-center px-2 mt-2" style={font.SemiBold}>
            Tasa BCV {PrecioDolar} {'Bs'}
          </Text>
        ) : null}
      </View>

      <View className="  h-1/4 px-5">
        <View className=" bg-white rounded-2xl " style={shadow.shadow}>
          <ListItem bottomDivider containerStyle={{ borderTopRightRadius: 16, borderTopLeftRadius: 16 }}>
            <ListItem.Content>
              <Text style={[font.SemiBold, { fontSize: 12 }]}> Monto </Text>
            </ListItem.Content>
            <ListItem.Content right>
              <ListItem.Title style={[font.SemiBold, { fontSize: 12 }]}>
                {Moneda === 'Bs'
                  ? (
                      Number(Precio) * Number(PrecioDolar.toFixed(2)) -
                      Number(Precio) * Number(PrecioDolar.toFixed(2)) * 0.16
                    ).toFixed(2)
                  : Number(Precio) - Number(Precio) * 0.16}{' '}
                {Moneda}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem bottomDivider>
            <ListItem.Content>
              <Text style={[font.SemiBold, { fontSize: 12 }]}> IGTF </Text>
            </ListItem.Content>
            <ListItem.Content right>
              <ListItem.Title style={[font.SemiBold, { fontSize: 12 }]}>0.00 {Moneda}</ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem bottomDivider>
            <ListItem.Content>
              <Text style={[font.SemiBold, { fontSize: 12 }]}> IVA </Text>
            </ListItem.Content>
            <ListItem.Content right>
              <ListItem.Title style={[font.SemiBold, { fontSize: 12 }]}>
                {Moneda === 'Bs'
                  ? (Number(Precio) * Number(PrecioDolar.toFixed(2)) * 0.16).toFixed(2)
                  : Number(Precio) * 0.16}{' '}
                {Moneda}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
          <ListItem bottomDivider containerStyle={{ borderBottomRightRadius: 16, borderBottomLeftRadius: 16 }}>
            <ListItem.Content>
              <Text style={[font.SemiBold, { fontSize: 18 }]}> Total </Text>
            </ListItem.Content>
            <ListItem.Content right>
              <ListItem.Title style={[font.SemiBold, { fontSize: 18 }]}>
                {Moneda === 'Bs' ? (Number(Precio) * Number(PrecioDolar.toFixed(2))).toFixed(2) : Precio} {Moneda}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </View>
      </View>

      <View className=" w-full flex-row flex-1 justify-center items-center p-5 mt-10">
        {Moneda === 'Bs' ? (
          <Button text="Pagar con Pago Móvil" onPress={() => navigation.navigate('LotePagoMovilPayment')} />
        ) : (
          <Button text="Pagar con Tarjeta de Credito" onPress={() => setDialogAcive(true)} />
        )}
      </View>
      <DialogMethodPayLote active={DialogAcive} setActive={setDialogAcive} />
    </View>
  );
};

export default LoteSelectPaymentMethod;

const renderItem2 = (data: any) => {
  return (
    <View className=" justify-center items-center" key={data.id + 'renderItem2'}>
      <View className=" rounded-2xl overflow-hidden">
        <Image style={{ width: width * 0.95, height: width * 0.4 }} source={{ uri: data.url }} />
      </View>
    </View>
  );
};

const paymentMethod = [
  {
    key: 's1',
    title: 'Pagomovil',
    icon: <MaterialIcons name="mobile-friendly" size={32} color={Colors.primary} />,
    path: 'PagoMovilPayment'
  },
  {
    key: 's2',
    title: 'Tarjeta de Credito',
    icon: <FontAwesome5 name="cc-mastercard" size={32} color={Colors.primary} />,
    path: 'CardPayment'
  }
];

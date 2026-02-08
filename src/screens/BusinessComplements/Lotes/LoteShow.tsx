import { View, Text, TouchableOpacity, ActivityIndicator, Platform, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import { CheckBox, Dialog } from '@rn-vui/themed';
import CustomImageViewer from '../../../components/CustomImageViewer';
import { LoteBusiness } from '../../../context/storeContextBusiness/StoreBusinessInterface';
import { getColors } from 'react-native-image-colors';
import { Colors } from '../../../utils';
import Carousel, { Pagination } from 'react-native-x-carousel';
import { width } from '../../../utils/Helpers';
import { Collection } from '../../../utils/Interface';
import { useAuth } from '../../../context';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import { font, label } from '../../../../styles';
import Button from '../../../components/ButtonComponent/Button';
import Input from '../../../components/InputComponent/Input';
import moment from 'moment';

const LoteShow = () => {
  const route = useRoute();
  const data = route.params as LoteBusiness;
  const [colors, setColors] = useState<any>(null);
  const [ImageData, setImageData] = useState('');
  const [visible, setIsVisible] = useState(false);
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();

  useEffect(() => {
    if (data.promotion) {
      getColors(data.promotion.urlImagen, {
        fallback: Colors.primary,
        cache: true,
        key: data.promotion.urlImagen
      }).then(setColors);
      setImageData(data.promotion.urlImagen);
    }
    console.log(data);
  }, []);

  useEffect(() => { }, [colors]);

  return (
    <View className="flex-1  " style={{ backgroundColor: colors?.lightVibrant }}>
      <View className="flex-row justify-start mx-2 mt-5">
        <TouchableOpacity className=" w-1/4" onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <View
        className=" w-screen h-1/3 justify-center items-center"
        style={{
          shadowColor: 'black',
          shadowRadius: 50,
          shadowOffset: { width: 0, height: 50 },
          shadowOpacity: 0.7
        }}
      >
        <View className=" justify-center items-center" key={data.id + 'renderItem2'}>
          <View className=" rounded-2xl overflow-hidden">
            {/*  <Image style={{ width: width * 0.95, height: width * 0.4 }} source={{ uri: data.promotion.urlImagen }} /> */}

            <Carousel
              pagination={Pagination}
              renderItem={(data: Collection, index: number) => (
                <TouchableOpacity key={index} onPress={() => { setIsVisible(true), console.log(index) }}>
                  <Image style={{ width: width * 0.95, height: width * 0.4 }} source={{ uri: data.url }} />
                </TouchableOpacity>
              )}
              data={data.collections}
              autoPlay
              loop
            />
          </View>
        </View>
      </View>

      <MyCupons data={data as LoteBusiness} />
      <CustomImageViewer images={data.collections.map((e: any) => ({ uri: e.url }))} imageIndex={0} visible={visible} onRequestClose={() => setIsVisible(false)} FooterComponent={(props: { imageIndex: number }) => <Text style={font.SemiBold} className=' text-white text-xl  p-5 text-center'>{props.imageIndex + 1}/{data.collections.length}</Text>} />
    </View>
  );
};

export default LoteShow;

const MyCupons = ({ data }: { data: LoteBusiness }) => {
  const { Sesion, TokenAuthApi } = useAuth();
  const [Load, setLoad] = useState(false);
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const [visible1, setVisible1] = useState(false);
  const [TransferActive, setTransferActive] = useState(false);

  const romperCupon = () => {
    toggleDialog1();
  };

  const toggleDialog1 = () => {
    setVisible1(!visible1);
  };

  return (
    <View className=" bg-white flex-1 px-4 space-y-2" style={{ borderTopLeftRadius: 45, borderTopRightRadius: 45 }}>
      <ScrollView>
        <View className="items-center flex-row  mt-8">
          <Text className="  text-xl " style={{ fontFamily: 'Bold' }}>
            {data.promotion.name}
          </Text>
          {data.isFree ? (
            <View>
              <View className=" bg-primary px-2 py-1 rounded-md ml-3">
                <Text style={font.SemiBold} className="text-white text-center">
                  Gratis
                </Text>
              </View>
            </View>
          ) : null}
        </View>
        <View className="flex-row justify-between">
          <Text className=" text-gray-500 " style={{ fontFamily: 'SemiBold' }}>
            Categoria:{' '}
            <Text className=" text-gray-800 " style={{ fontFamily: 'Bold' }}>
              {data.category.name}
            </Text>
          </Text>
          <Text className=" text-gray-500 " style={{ fontFamily: 'SemiBold' }}>
            Cantidad{' '}
            <Text className=" text-gray-800 " style={{ fontFamily: 'Bold' }}>
              {data.availableQuantity}
            </Text>
          </Text>
        </View>
        {!data.isFree ? (
          <View className="flex-row justify-end gap-x-2">
            <Text className=" text-gray-500 line-through text-lg " style={{ fontFamily: 'SemiBold' }}>
              {data.previousCost?.toFixed(2)}$
            </Text>
            <Text className=" text-lg" style={{ fontFamily: 'Bold' }}>
              {data.cost}$
            </Text>
            <View className=" px-2 bg-primary rounded-md">
              <Text className=" text-lg text-white" style={{ fontFamily: 'Bold' }}>
                {(100 - (Number(data.cost) * 100) / Number(data.previousCost)).toFixed(0)}% OFF
              </Text>
            </View>
          </View>
        ) : null}

        <View className=" flex-1 px-5 w-full bg-white ">
          <View className=" justify-center items-center  ">
            <Input
              labelText="Descripción de cupon"
              placeholder="Una oferta de descuento que no te puedes perder..."
              keyboardType="default"
              value={data.promotion.description}
              multiline
              styleInput={{ fontSize: 12 }}
              maxLength={250}
              disabled
            />
          </View>

          <Text style={label.label}> Fecha de subasta.</Text>
          <View className=" flex-row justify-center gap-x-3 ">
            <View className=" w-[50%]">
              <Button
                typeButton="white"
                text={'Ini: ' + moment(data.auctionDate).format('DD/MM/YYYY')}
                disabled={true}
              />
            </View>
            <View className=" w-[50%]">
              <Button typeButton="white" text={'Fin: ' + moment(data.endAuctionDate).format('DD/MM/YYYY')} disabled />
            </View>
          </View>

          <Text style={label.label}> Fecha de expiración</Text>
          <View className=" flex-row justify-center gap-x-3 ">
            <View className=" w-[80%]">
              <Button typeButton="white" text={'Ini: ' + moment(data.expirationDate).format('DD/MM/YYYY')} disabled />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

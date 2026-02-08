import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCardAnimation } from '@react-navigation/stack';
import { RegisterLoginScreenNavigationType } from '../../../../navigation/StackNavigation';
import { BottomTabNavigationType } from '../../../../navigation/BottomTab';
import { useRender } from '../../../../context';
import { useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { font } from '../../../../../styles';
import { Image } from 'expo-image';
import { width } from '../../../../utils/Helpers';
import Button from '../../../../components/ButtonComponent/Button';
import { DrawerNavigationBusinessType } from '../../../../navigation/DrawerNavBusiness';
import { LoteBusiness } from '../../../../context/storeContextBusiness/StoreBusinessInterface';
import CarruselComLoteBusiness from '../../../../components/Cupones/CarruselComLoteBusiness';
import { useStoreBusiness } from '../../../../context/storeContextBusiness/StoreBusinessState';
import { useStore } from '../../../../context/storeContext/StoreState';

const LoteSuccessPayment = () => {
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const navigationDrawerBusinesss = useNavigation<DrawerNavigationBusinessType>();
  const { soundSave } = useRender();
  const route = useRoute();
  const data = route.params as LoteBusiness;
  const { setFormCreateLote, InitCreateLote, FormCreateLote } = useStoreBusiness();
  const { DataCategory } = useStore();

  useEffect(() => {
    soundSave();
  }, []);

  return (
    <View
      className="flex-1  "
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)'
      }}
    >
      <View className="flex-row justify-end mx-2 mt-5">
        <TouchableOpacity onPress={() => () => {
                navigationDrawerBusinesss.navigate('Lotes');
                setFormCreateLote(InitCreateLote);
              }}>
          <AntDesign name="close" size={32} color="white" />
        </TouchableOpacity>
      </View>

      <View
        className=" w-screen flex-1 justify-start items-center"
        style={{
          shadowColor: 'black',
          shadowRadius: 50,
          shadowOffset: { width: 0, height: 50 },
          shadowOpacity: 0.7
        }}
      >
        <View>
          <Text className=" mb-8 text-3xl text-white" style={font.SemiBold}>
            Felicidades
          </Text>
        </View>
        <View className=" justify-center items-center h-[70%]">
          <View className=" rounded-2xl w-[90%] overflow-hidden bg-white">
            <Text className="  text-2xl  text-center mt-8 mb-2" style={font.Bold}>
              Has creado un lote.
            </Text>
            {/*  <Image
              style={{ width: width * 0.90, height: width * 0.35 }}
              source={{ uri: data.collections[0].url }}
            /> */}
            <CarruselComLoteBusiness data={data} />
            <View className="py-8 justify-center items-center">
              <Text className=" text-xl  w-[60%] text-center uppercase " style={font.SemiBold}>
                {data.loteName}
              </Text>
              <View>
                <Text className=" text-md   text-center " style={font.SemiBold}>
                  cant: {data.quantity}
                </Text>
                <Text className=" text-md   text-center " style={font.SemiBold}>
                  cupon: {DataCategory.find((e) => e.id === FormCreateLote.categoryId)?.price}$
                </Text>
              </View>
              <Text className=" text-lg   text-center " style={font.SemiBold}>
                Precio Total: {FormCreateLote.totalPayment}$
              </Text>
            </View>
          </View>
        </View>

        <View className="absolute bottom-[0%] w-full flex-row justify-center items-center">
          <View className=" w-1/2">
            <Button
              text={'Volver'}
              typeButton="white"
              onPress={() => {
                navigationDrawerBusinesss.navigate('Lotes');
                setFormCreateLote(InitCreateLote);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default LoteSuccessPayment;

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

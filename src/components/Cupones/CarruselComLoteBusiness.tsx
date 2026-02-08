import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import { LinearGradient } from 'react-native-svg';
import { font, label} from '../../../styles';
import moment from 'moment';
import CacheImage from '../CacheImage/CacheImage';
import { Paquetes } from '../../context/storeBusinessHooks/StoreBusinessInterface';
import { NavigationScreenNavigationType } from '../../navigation/StackNavigator';

const { width } = Dimensions.get('window');
const mask = {
  width: width * 0.9,
  height: width * 0.4,
  bgColor: 'red'
};
type Props = {
  data: Paquetes;
  navigation?: NavigationScreenNavigationType;
  index?: number;
};

function CarruselComLoteBusiness({ data, navigation, index }: Props) {
  return (
    <View className=" justify-center items-center m-2">
      <View className="w-full px-1">
        <Text style={label.label}> {data.nombre} </Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          /* navigation && navigation.navigate('LoteShow', { ...data }); */
        }}
        disabled={!navigation}
      >
        <View style={styles.cardContainer}>
          <View style={styles.cardWrapper}>
            <CacheImage styleImage={styles.card} source={{ uri: data.imagenUrl }}    />
           
          </View>
        </View>
      </TouchableOpacity>

      <View className=" w-full px-4 flex-row" style={{ justifyContent: 'space-between' }}>
        <View className="w-16">
          <View
            className=" bg-primary px-2 py-1 rounded-b-md"
            style={{ display: 'flex' }}
          >
            <Text style={font.SemiBold} className="text-white text-center">
              Gratis
            </Text>
          </View>
        </View>
{/*         <Text style={{...font.SemiBold, color:moment(data.expirationDate).isSameOrBefore(moment()) ? "red" : "black"}} className="py-1">
          {moment(data.expirationDate).format("DD/MM/YY - hh a")}
        </Text> */}
{/* 
        <Text style={font.SemiBold} className=" py-1 ">
          Cant: {data.availableQuantity}
        </Text> */}
      </View>
    </View>
  );
}

export default CarruselComLoteBusiness;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: width * 0.8
  },
  cardWrapper: {
    borderRadius: 8,
    overflow: 'hidden'
  },
  card: {
    width: width * 0.8,
    height: width * 0.3
  }
});

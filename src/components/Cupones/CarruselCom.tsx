import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { Lote } from '../../utils/Interface';
import { RegisterLoginScreenNavigationType } from '../../navigation/StackNavigation';
import { useState } from 'react';
import { Skeleton } from '@rn-vui/themed';
import { LinearGradient } from 'react-native-svg';
import { CachedImage } from '../../utils/ImageCached';
import { font } from '../../../styles';
import CacheImage from '../CacheImage/CacheImage';

const { width } = Dimensions.get('window');
const mask = {
  width: width * 0.9,
  height: width * 0.4,
  bgColor: 'red'
};
type Props = {
  data: Lote;
  navigation: RegisterLoginScreenNavigationType;
  index?: number;
};

function CarruselCom({ data, navigation, index }: Props) {
  return (
    <View className=" justify-center items-center my-2">
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Cupon', { ...data });
        }}
      >
        <View style={styles.cardContainer}>
          <View style={styles.cardWrapper}>
            <CacheImage styleImage={styles.card} source={ data.collections[0].url }    />
            {!data.isFree ? (
              <View className=" absolute bg-gray-200  rounded-t-md bottom-0 right-0">
                <View className="flex-row justify-end gap-x-2 items-center">
                  <View className='flex-row items-center gap-x-2'>
                    <Text className=" text-gray-500 line-through text-md " style={{ fontFamily: 'SemiBold' }}>
                      {data.previousCost}.00$
                    </Text>
                    <Text className=" text-lg " style={{ fontFamily: 'Bold' }}>
                      {data.cost}$
                    </Text>
                  </View>

                  <View className=" px-2 bg-primary">
                    <Text className=" text-lg text-white" style={{ fontFamily: 'Bold' }}>
                      {(100 - (Number(data.cost) * 100) / Number(data.previousCost)).toFixed(0)}% OFF
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>

      <View className=" w-full px-4 flex-row" style={{ justifyContent: 'space-between' }}>
        {/* {data.isFree ? (
          
        ) : null} */}
        <View className="w-16">
          <View
            className=" bg-primary px-2 py-1 rounded-b-md"
            style={data.isFree ? { display: 'flex' } : { display: 'none' }}
          >
            <Text style={font.SemiBold} className="text-white text-center">
              Gratis
            </Text>
          </View>
        </View>
        <Text style={font.SemiBold} className="py-1">
          {data.distanceBStore < 1
            ? `${(data.distanceBStore * 1000).toFixed(2)} mtrs `
            : `${data.distanceBStore.toFixed(2)}Km `}
        </Text>

        <Text style={font.SemiBold} className="py-1">
          Disponible:{data.availableQuantity}
        </Text>
      </View>
    </View>
  );
}

export default CarruselCom;

export const _renderItem = (data: any) => {
  return (
    <TouchableOpacity
      key={data.id + data.index}
      onPress={() => {
        data.navigation.navigate('Cupon', { ...data.info });
      }}
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          <CacheImage styleImage={styles.card} source={data.url}    />
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
    width: width + 10
  },
  cardWrapper: {
    borderRadius: 8,
    overflow: 'hidden'
  },
  card: {
    width: width * 0.95,
    height: width * 0.4
  }
});

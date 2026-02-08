import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../utils';
import { Category } from '../screens/Citas/MarketPaquetes';
import { CategoryRegalos } from '../screens/Regalos/MarketRegalos';
import CacheImage from './CacheImage/CacheImage';

type Props = {
  item: CategoryRegalos;
  index: number;
  onPress: (item: CategoryRegalos) => void
  itemSelect: CategoryRegalos
};

const { width, height } = Dimensions.get('window');

function InstaImagCategoryRegalos({ item, index, onPress, itemSelect }: Props) {

  const ChangeCategory = () => onPress(item)
  return (
    <View
      className='mt-1'
    >
      <TouchableOpacity
        style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
          gap: 5
        }}
        onPress={ChangeCategory}
      >
        <View style={item.id === itemSelect.id ? { borderWidth: 2, padding: 4, borderRadius: 100, borderColor: Colors.primary } : { borderWidth: 2, padding: 4, borderRadius: 100, borderColor: Colors.white }} >

          {item.description === "TODOS" ? (
            <Image
              style={{
                width: height / 14,
                height: height / 14,
                borderRadius: height / 10,
                backgroundColor: Colors.secondary
              }}
              source={require("../../assets/items/AllCategories.png")}
            /*  */
            />
          ) : (
            <CacheImage
              styleImage={{
                width: height / 14,
                height: height / 14,
                borderRadius: height / 10,
                backgroundColor: Colors.secondary
              }}
              source={`${process.env.CLOUDFRONT}/${item.description}.png`}
            />
          )}
        </View>

        <Text style={{ fontSize: 9, textAlign: 'center' }}>
          {item.description.slice(0, 12)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default InstaImagCategoryRegalos;

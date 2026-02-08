import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../utils';
import { Category } from '../screens/Citas/MarketPaquetes';
import { CategoryRegalos } from '../screens/Regalos/MarketRegalos';
import CacheImage from './CacheImage/CacheImage';

type Props = {
  item: Category;
  index: number;
  onPress: (item:Category) => void
  itemSelect:Category
};

const { width, height } = Dimensions.get('window');

function InstaImagCategory({ item, index, onPress,itemSelect }: Props) {

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
        <View style={index === index? {borderWidth:2, padding:4, borderRadius:100, borderColor: Colors.primary} : {borderWidth:2, padding:4, borderRadius:100, borderColor: Colors.white}} >

        {!item.imageUrl ? (
          <Image
            style={{
              width: height / 12,
              height: height / 12,
              borderRadius: height / 10,
              backgroundColor: Colors.secondary
            }}
            source={require("../../assets/items/AllCategories.png")}
            /*  */
          />
        ) : (
          <CacheImage
            styleImage={{
              width: height / 12,
              height: height / 12,
              borderRadius: height / 10,
              backgroundColor: Colors.secondary
            }}
            source={item.imageUrl}
          />
        )}
        </View>

        <Text style={{ fontSize: 9, textAlign: 'center' }}>
          {item.category.slice(0, 12)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default InstaImagCategory;

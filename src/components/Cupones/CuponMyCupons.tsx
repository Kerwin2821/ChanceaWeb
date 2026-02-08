import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'expo-image';
import { RegisterLoginScreenNavigationType } from '../../navigation/StackNavigation';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { CuponMyCupons } from '../../screens/MyCoupons/MyCuponsIntreface';
import moment from 'moment';

const { width } = Dimensions.get('window');
const mask = {
  width: width * 0.9,
  height: width * 0.4,
  bgColor: 'red'
};
type Props = {
  data: CuponMyCupons;
  navigation: RegisterLoginScreenNavigationType;
  index: number;
  setCuponSelect:(e:CuponMyCupons) => void
};

function CuponMyCuponsComponent({ data, navigation, index,setCuponSelect }: Props) {

  const date = useMemo(() => moment(data.lote.expirationDate).format('DD/MM/YYYY'), []);
  return (
    <View
    >
       <TouchableOpacity
      key={data.id}
      onPress={() => {
        navigation.navigate('Cupon', { ...data });
      }}
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          <Image style={styles.card} source={{ uri: data.collections[0].url }}    transition={{ duration: 300 }}/>
          {/* <View style={[styles.cornerLabel, { backgroundColor: data.cornerLabelColor }]}>
            <Text style={styles.cornerLabelText}>{data.cornerLabelText}</Text>
          </View> */}
        </View>
      </View>
    </TouchableOpacity>
      <View className=" flex-row items-center w-screen justify-between px-5 ">
        <View className=" flex-row gap-3 items-center py-2">
          {/* <TouchableOpacity>
            <Ionicons name="wallet-outline" size={28} color="black" />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={() => setCuponSelect(data)}>
            <Feather name="send" size={24} color="black" />
          </TouchableOpacity>
          {/* <TouchableOpacity>
            <AntDesign name="qrcode" size={28} color="black" />
          </TouchableOpacity> */}
        </View>
          <Text style={{ fontFamily: 'Regular' }} className=" text-xs px-2 w-[60%] ">
            {' '}
            {data.lote.loteName.slice(0,40)}...
          </Text>
          <Text style={{ fontFamily: 'Regular' }} className=" text-xs ">
            {'Exp: '} 
            {date}
          </Text>
        
      </View>
    </View>
  );
}

export default CuponMyCuponsComponent;

const _renderItem = (data: any) => {
  return (
    <TouchableOpacity
      key={data.id}
      onPress={() => {
        data.navigation.navigate('Cupon', { ...data.info });
      }}
    >
      <View style={styles.cardContainer}>
        <View style={styles.cardWrapper}>
          <Image style={styles.card} source={{ uri: data.url }}  transition={{ duration: 300 }} />
          {/* <View style={[styles.cornerLabel, { backgroundColor: data.cornerLabelColor }]}>
            <Text style={styles.cornerLabelText}>{data.cornerLabelText}</Text>
          </View> */}
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

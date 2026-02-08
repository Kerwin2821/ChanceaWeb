import { View, Text, Platform } from 'react-native';
import React, { useContext } from 'react';
import { Image } from 'expo-image';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth, useRender } from '../../context';
import { useNavigation } from '@react-navigation/native';
import { GetHeader, ToastCall, width } from '../../utils/Helpers';
import Button from '../../components/ButtonComponent/Button';
import { SVG } from '../../../assets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationScreenNavigationType } from '../../navigation/StackNavigator';
import { environmet } from '../../../env';
import { HttpService } from '../../services';
import { SafeAreaView } from 'react-native-safe-area-context';

const LocalizationPScreen = () => {
  const { language, setLocationPermisson } = useRender();
  const { user, TokenAuthApi } = useAuth();
  const navigation = useNavigation<NavigationScreenNavigationType>()

  const permisosCheck = async () => {

    let { status } = await Location.requestForegroundPermissionsAsync();

    /* if (status === 'denied') {
      if(Platform.OS !== "ios"){
        navigation.navigate('LocalizationP');
        return;
      }
    } */

    if (status !== 'granted') {
      setLocationPermisson(false)
      await AsyncStorage.setItem("LocationPermissonData", "0")
    }
    if (status === 'granted') {
      setLocationPermisson(true)
      await AsyncStorage.setItem("LocationPermissonData", "1")
    }

    navigation.push('CamaraPermisos');

  };

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className="flex-1 w-full md:max-w-lg md:mx-auto justify-between pb-8 px-5">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Bold', fontSize: 22, textAlign: 'center', marginTop: 20, marginBottom: 20, color: '#000' }}>
            Activar los servicios de ubicación nos permite ofrecer funciones como:
          </Text>

          <View className="w-full items-center mb-8">
            <Image
              style={{ height: Platform.OS === 'web' ? 180 : 150, width: Platform.OS === 'web' ? 180 : 150 }}
              source={SVG.Group127132}
              transition={{ duration: 300 }}
              contentFit="contain"
            />
          </View>

          <View className="gap-y-6">
            <View className="flex-row items-center gap-x-4">
              <View className="bg-primary p-4 rounded-full shadow-sm">
                <AntDesign name="lock1" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Bold', fontSize: 16, color: '#000' }}>Mostrar los chances en tu zona cercana:</Text>
                <Text style={{ fontFamily: 'Regular', fontSize: 13, color: '#666', marginTop: 2 }}>
                  Permite mostrar a los chances disponibles en las zona aledañas a su dispositivo
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-x-4">
              <View className="bg-primary p-4 rounded-full shadow-sm">
                <Ionicons name="map-outline" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Bold', fontSize: 16, color: '#000' }}>Mostrar los chances en Mapa:</Text>
                <Text style={{ fontFamily: 'Regular', fontSize: 13, color: '#666', marginTop: 2 }}>
                  Permite mostrar a los chances disponibles la ubicación para que te consigan mas rápido y puedan tener más chances.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="w-full mt-5">
          <Button text={'Siguiente'} onPress={permisosCheck} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LocalizationPScreen;

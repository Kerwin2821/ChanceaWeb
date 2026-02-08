import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { useRender } from '../../../context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import ScreenContainer from '../../../components/ScreenContainer';
import { Image } from 'expo-image';
import { width } from '../../../utils/Helpers';
import Button from '../../../components/ButtonComponent/Button';
import { FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStoreBusiness } from '../../../context/storeContextBusiness/StoreBusinessState';

const LoteCreateInit = () => {
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const { setFormCreateLote, InitCreateLote } = useStoreBusiness();

  useEffect(() => {
    setFormCreateLote(InitCreateLote)
  }, [])
  

  return (
    <SafeAreaView className='flex-1'>
      <View className="flex-1 px-5 gap-y-3">
          <TouchableOpacity
            className=" flex-row items-center z-10"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome5 name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
        <View className=" w-full justify-center items-center h-1/4 ">
          {/* <Image style={{ height: "80%", width: "100%" }} source={require("../../../../assets/items/ImgCreateLote.png")} /> */}
        </View>
        <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center" }}>Indicaciones para crear Lotes de Cupones</Text>
        <Text style={{ fontFamily: "Bold", fontSize: 14, textAlign: "justify" }}>
        Para una experiencia óptima: 
        </Text>

        <Text style={{ fontFamily: "Regular", fontSize: 14, textAlign: "justify" }}>
        Asegúrate de que las imágenes de tus cupones respeten los márgenes indicados. De esta manera, podrás disfrutar de cupones nítidos y fáciles de leer, tanto para ti como para nuestros colaboradores. ¡Tu comodidad es nuestra prioridad!
        </Text>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            width,
            paddingHorizontal: width * 0.05,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ width: "90%", alignItems: "center" }}>
            <Button
              text={"Continuar"}
              onPress={() =>
                  navigation.navigate("LoteImg")
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LoteCreateInit


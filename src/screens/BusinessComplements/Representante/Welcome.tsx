import { View, Text } from 'react-native'
import React from 'react'
import { useRender } from '../../../context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RegisterLoginScreenNavigationType } from '../../../navigation/StackNavigation';
import ScreenContainer from '../../../components/ScreenContainer';
import { Image } from 'expo-image';
import { width } from '../../../utils/Helpers';
import Button from '../../../components/ButtonComponent/Button';

const Welcome = () => {
  const { language } = useRender();
  const navigation = useNavigation<RegisterLoginScreenNavigationType>();
  const route = useRoute();
  const data = route.params as { onboarding: boolean } | undefined;

  return (
    <ScreenContainer>
      <View className="flex-1 px-5 gap-y-3">
        {/* {Platform.OS === "ios" ? (
          <TouchableOpacity
            className=" absolute left-3 top-3 flex-row items-center z-10"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="chevron-left" size={28} color="black" />
          </TouchableOpacity>
        ) : null} */}
        <View className=" w-full justify-center items-center h-1/4 ">
          <Image style={{ height: "100%", width: "60%" }} source={require("../../../../assets/register/registerimg2.png")} />
        </View>
        <Text style={{ fontFamily: "Bold", fontSize: 22, textAlign: "center" }}>Te damos la Bienvenida a Zacco Business</Text>
        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "justify" }}>
          Es la función para negocios de Zacco donde podras administrar tus cupones,
          para crear cupones necesitaras un representante legal donde recibiras lo pagos de las transacciones.
        </Text>

        <View className=" flex-row  justify-center items-center gap-x-3 ">
          <View className="">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>●</Text>
          </View>
          <View className="w-3/4">
            <Text style={{ fontFamily: "SemiBold", fontSize: 14 }}>
              Es importante los datos que ingreses esten en sintonia con los de tu cuenta bancaria para facilitar la verificación de los pagos.
            </Text>
          </View>
        </View>


        <Text style={{ fontFamily: "SemiBold", fontSize: 14, textAlign: "left" }}>
          El proceso solo tomará unos segundos y tu privacidad estará protegida en todo momento.
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
                  navigation.navigate("RepForm")
              }
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  )
}

export default Welcome


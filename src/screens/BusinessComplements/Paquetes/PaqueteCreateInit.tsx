"use client"

import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { useEffect } from "react"
import { useNavigation } from "@react-navigation/native"
import ScreenContainer from "../../../components/ScreenContainer"
import Button from "../../../components/ButtonComponent/Button"
import { FontAwesome5, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { initialBoxPackage } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import { Colors } from "../../../utils"
import HeaderApp from "../../../components/HeaderApp"

const { width } = Dimensions.get("window")

const PaqueteCreateInit = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { setFormCreateBoxPackage, Stores } = useStoreBusiness()

  const initForm = () => {
    setFormCreateBoxPackage({ ...initialBoxPackage, storedIds: Stores.map((e) => e.id) })
    navigation.navigate("PaqueteForm")
  }

  return (
    <ScreenContainer>
      <View className="h-full bg-white">
        <HeaderApp />

        <View className="flex-1 px-5">
          {/* Icon and Title */}
          <View className="items-center justify-center my-5">
            <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
              <MaterialCommunityIcons name="package-variant-closed" size={40} color={Colors.primary} />
            </View>
            <Text className="text-xl font-bold text-center text-secondary">Crea Paquetes Atractivos</Text>
          </View>

          {/* Tips Section */}
          <View className="mb-4">
            <View className="flex-row items-center mb-3">
              <Feather name="info" size={16} color={Colors.primary} />
              <Text className="text-base font-bold text-secondary ml-2">Consejos para crear paquetes exitosos:</Text>
            </View>

            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-start mb-3">
                <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-primary text-xs font-bold">1</Text>
                </View>
                <Text className="text-sm text-gray-700 flex-1">Usa imágenes de calidad que representen tu marca</Text>
              </View>

              <View className="flex-row items-start mb-3">
                <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-primary text-xs font-bold">2</Text>
                </View>
                <Text className="text-sm text-gray-700 flex-1">Escribe descripciones claras y detalladas</Text>
              </View>

              <View className="flex-row items-start">
                <View className="w-5 h-5 rounded-full bg-primary/20 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-primary text-xs font-bold">3</Text>
                </View>
                <Text className="text-sm text-gray-700 flex-1">Establece precios competitivos y atractivos</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <Text className="text-sm text-gray-700">
              Asegúrate de que las imágenes de tus productos representen tu marca. De esta manera, podrás disfrutar de
              claridad para estos, tanto para ti como para tus futuros clientes.
            </Text>
            <Text className="text-sm font-semibold text-primary mt-2">¡Tu comodidad es nuestra prioridad!</Text>
          </View>
        </View>

        {/* Continue button */}
        <View className="px-5 py-6 items-center border-t border-gray-100">
          <Button text={"Continuar"} onPress={initForm} />
        </View>
      </View>
    </ScreenContainer>
  )
}

export default PaqueteCreateInit


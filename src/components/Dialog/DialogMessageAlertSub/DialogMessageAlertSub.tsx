"use client"

import { View, Text } from "react-native"
import { Dialog } from "@rn-vui/themed"
import Button from "../../ButtonComponent/Button"
import { useAuth } from "../../../context"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { Colors } from "../../../utils"
import moment from "moment"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import type { Parameter } from "../../../utils/Interface"

type props = {
  active: boolean
  setActive: (e: boolean) => void
  data?: Parameter
  navigation?: NavigationScreenNavigationType
  message?: string
}

const DialogMessageAlertSub = ({ active, setActive, data, navigation, message }: props) => {
  const { user } = useAuth()

  const toggleDialog = () => {
    setActive(false)
  }

  const today = moment()
  const creation = moment(user?.creationDate)
  const daysLeft = data ? data.quantityFree - today.diff(creation, "days") : 0

  if (!active) {
    return null
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog}
      overlayStyle={{
        borderRadius: 16,
        width: "90%",
        padding: 0,
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      {/* Colorful Header */}
      <View className="w-full bg-primary py-5 items-center">
        <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-2">
          <FontAwesome5 name="crown" size={32} color="white" />
        </View>
        <Text className="text-white text-xl font-bold">Plan Premium</Text>
      </View>

      {/* Content */}
      <View className="p-6">
        {/* Days Left Counter */}
        <View className="items-center mb-6">
          {!message ? (
            <>
              <Text className="text-gray-600 text-base mb-2">Tu período de prueba termina en</Text>
              <View className="flex-row items-center">
                <Text className="text-3xl font-bold text-primary">{daysLeft}</Text>
                <Text className="text-xl font-bold text-primary ml-2">días</Text>
              </View>
            </>
          ) : (
            <Text className="text-lg text-center text-gray-700 font-medium">{message}</Text>
          )}
        </View>

        {/* Benefits Section */}
        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-secondary font-bold mb-3">Beneficios Premium:</Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            <Text className="ml-2 text-gray-700">Acceso ilimitado a todas las funciones</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            <Text className="ml-2 text-gray-700">Soporte prioritario</Text>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
            <Text className="ml-2 text-gray-700">Sin restricciones ni publicidad</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between">
          <View className="w-[45%]">
            <Button text="Más tarde" typeButton="white" onPress={toggleDialog} />
          </View>
          <View className="w-[45%]">
            <Button
              text="¡Unirme Ya!"
              onPress={() => {
                toggleDialog()
                if (navigation) {
                  navigation.navigate("PagoMovilPayment")
                }
              }}
            />
          </View>
        </View>
      </View>
    </Dialog>
  )
}

export default DialogMessageAlertSub

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native"
import { Icon } from "@rn-vui/themed"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Animated, { FadeInDown } from "react-native-reanimated"
import { CommonActions, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { FontAwesome6 } from "@expo/vector-icons";

// Local imports
import { font } from "../../../styles"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useAuth, useRender } from "../../context"
import { Colors } from "../../utils"
import ScreenContainer from "../../components/ScreenContainer"
import OnboardingValidate from "../../utils/OnboardingValidate"
import Button from "../../components/ButtonComponent/Button";

export interface CustomerSource {
  id: number
  name: string
  description: string
  enabled: boolean
  creationDate: string
}

const CustomerSourceScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [loading, setLoading] = useState(false)
  const [sources, setSources] = useState<CustomerSource[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth()
  const { setLoader } = useRender()

  async function fetchCustomerSources() {
    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customer-sources?sessionToken=${SesionToken}&page=0&size=20`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: CustomerSource[] = await HttpService("get", host, url, {}, header)

      setSources(response)
    } catch (err: any) {
      console.error(JSON.stringify(err), "Customer Sources")
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerSources()
  }, [])

  function handleSelect(source: CustomerSource) {
    setSelectedId(source.id)
  }

  const handleSaveSource = async (selectedSource: CustomerSource) => {
    try {
      setLoader(true)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("put", host, url, { ...user, customerSource: selectedSource }, header)

      const updatedUser = { ...user, ...response, customerSource: selectedSource };
      setUser(updatedUser);
      await AsyncStorage.setItem("Sesion", JSON.stringify(updatedUser));

      const validate = await OnboardingValidate(updatedUser, navigation, setUser, {
        longitude: updatedUser.postionX,
        latitude: updatedUser.postionY
      }, { TokenAuthApi, SesionToken })

      if (!validate) return
      navigation.replace("Home");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );

    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
      throw err
    } finally {
      setLoader(false)
    }
  }

  const handleSave = async () => {
    if (selectedId) {
      const selectedSource = sources.find((source) => source.id === selectedId)
      if (selectedSource) {
        setSaving(true)
        try {
          await handleSaveSource(selectedSource)
        } catch (error) {
          console.error("Error al guardar:", error)
          ToastCall("error", "Error al guardar los cambios", "ES")
        } finally {
          setSaving(false)
        }
      }
    }
  }

  return (
    <ScreenContainer backgroundColor="#FFFFFF">
      <View className="flex-1 w-full md:max-w-lg md:mx-auto">
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButtonStyle}
            onPress={() => navigation.goBack()}
          >
            <FontAwesome6 name="arrow-left" size={24} color="black" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[font.Bold, styles.headerText]}>
              Origen
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <View className="flex-1 px-6 pb-8">
          <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-8 mt-4">
            <Icon
              name="question-circle"
              type="font-awesome"
              color={Colors.primary}
              size={50}
            />
            <Text style={[font.Regular, { textAlign: "center", marginTop: 15, fontSize: 16, color: "#333", lineHeight: 22 }]}>
              Nos gustaría saber cómo nos encontraste. Esta información nos ayuda a mejorar nuestros servicios.
            </Text>
          </Animated.View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator color={Colors.primary} size="large" />
              <Text style={[font.Regular, { marginTop: 15, color: "#666" }]}>Cargando opciones...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              style={{ flex: 1 }}
            >
              {sources.length > 0 ? (
                sources.map((source, index) => (
                  <Animated.View key={source.id} entering={FadeInDown.delay(200 + index * 100).springify()}>
                    <TouchableOpacity
                      onPress={() => handleSelect(source)}
                      style={[
                        styles.sourceItem,
                        selectedId === source.id ? styles.selectedItem : styles.unselectedItem
                      ]}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                          <Text style={[
                            font.SemiBold,
                            { fontSize: 16, color: selectedId === source.id ? Colors.primary : "#444" }
                          ]}>
                            {source.name}
                          </Text>
                          {source.description && source.description !== source.name && (
                            <Text style={[font.Regular, { fontSize: 14, color: "#888", marginTop: 2 }]}>
                              {source.description}
                            </Text>
                          )}
                        </View>
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedId === source.id ? 'border-primary' : 'border-gray-300'}`}>
                          {selectedId === source.id && <View className="w-3 h-3 rounded-full bg-primary" />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              ) : (
                <View className="flex-1 justify-center items-center py-10">
                  <Icon name="exclamation-circle" type="font-awesome" color={Colors.primary} size={40} />
                  <Text style={[font.Regular, { marginTop: 15, color: "#666", textAlign: "center" }]}>No hay opciones disponibles</Text>
                  <TouchableOpacity className="mt-4 px-6 py-2 bg-gray-100 rounded-full" onPress={fetchCustomerSources}>
                    <Text style={[font.SemiBold, { color: Colors.primary }]}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}

          <View className="mt-6">
            <Button
              text="Siguiente"
              disabled={!selectedId || saving}
              onPress={handleSave}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    backgroundColor: Colors.white,
    minHeight: 60,
  },
  backButtonStyle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    color: Colors.black,
  },
  sourceItem: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08", // Very light primary tint
  },
  unselectedItem: {
    borderColor: "#F3F4F6",
    backgroundColor: "white",
  },
})

export default CustomerSourceScreen

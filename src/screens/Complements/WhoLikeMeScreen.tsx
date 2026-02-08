"use client"

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useEffect, useState, useCallback } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, ToastCall, width } from "../../utils/Helpers"
import CardLayout from "../../components/CardLayout/CardLayout"
import { font } from "../../../styles"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { HttpService } from "../../services"
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers"
import { FontAwesome6 } from "@expo/vector-icons"
import { useStore } from "../../context/storeContext/StoreState"

const WhoLikeMeScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { user, TokenAuthApi, SesionToken } = useAuth()
  const { WhoLikeMeList } = useStore();
  const { setLoader } = useRender()
  const isFocus = useIsFocused()
  const [isVisible, setIsVisible] = useState(false)
  const [UserSelect, setUserSelect] = useState<number>(0)

  // Nuevos estados para la paginación
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const PAGE_SIZE = 20 // Tamaño de página más pequeño para mejor experiencia

  // Función modificada para soportar paginación



  async function Consult(item: any) {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/${item?.id}?sessionToken=${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, header, setLoader)
      navigation.navigate("CustomerProfile", { Customer: response, type: "NotLike" })
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }

  // Componente para el pie de lista (indicador de carga)
  const renderFooter = () => {
    if (!loading) return null

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

 

  return (
    <ScreenContainer>
      <View className=" px-5 py-2  items-start ">
        <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
          <FontAwesome6 name="arrow-left" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" px-3 my-2">
        <Text className=" text-2xl text-primary" style={font.Bold}>
          ¿Quién le dio me gusta a mí?
        </Text>
      </View>
      <View className=" items-center h-[85vh]">
        {WhoLikeMeList.length > 0 || loading ? (
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={WhoLikeMeList}
            renderItem={({ item, index }) => {
              return (
                <CardLayout
                  idUser={item.id}
                  photo={{ uri: item.customerProfiles.length ? item.customerProfiles[0].link : undefined }}
                  key={item.id}
                  onPress={() => Consult(item)}
                  onLongPress={() => {
                    /* setUserSelect(item.id);
                    setIsVisible(true); */
                  }}
                >
                  <Text className=" text-md " style={font.Bold}>
                    {item.firstName}
                  </Text>
                </CardLayout>
              )
            }}
            style={{ width: width, gap: 10 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              loading ? (
                <View className="flex-1 justify-center items-center" style={{ height: 300 }}>
                  <ActivityIndicator size={64} color={Colors.primary} />
                </View>
              ) : null
            }
            // Propiedades para la paginación
           
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            refreshing={loading && page === 0}
         
          />
        ) : (
          <View className=" w-[90%] h-1/2 items-center justify-center border rounded-2xl border-primary ">
            <Text
              style={[
                font.Bold,
                {
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: Colors.primary,
                },
              ]}
            >
              Todavía no le haz dado no me gusta con ningún chance.
            </Text>
          </View>
        )}
      </View>
      <OptionsBaseCustomers active={isVisible} setActive={setIsVisible} data={{ idDestino: UserSelect.toString() }} />
    </ScreenContainer>
  )
}

export default WhoLikeMeScreen

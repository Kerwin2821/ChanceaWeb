"use client"

import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, ToastCall, height, width } from "../../utils/Helpers"
import CardLayout from "../../components/CardLayout/CardLayout"
import InstaImagCategory from "../../components/InstagramCategorys/InstaImagCategory"
import CacheImage from "../../components/CacheImage/CacheImage"
import { font } from "../../../styles"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { useStore } from "../../context/storeContext/StoreState"
import { HttpService, WholikemeSaveUsers } from "../../services"
import type { MatchResponse } from "../../context/storeContext/StoreInterface"
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers"
import DialogNoMatch from "../../components/Dialog/DialogNoMatch/DialogNoMatch"
import { Ionicons } from "@expo/vector-icons"
import { Asset } from "expo-asset"

export default function MatchScreen() {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const { WhoLikeMeList, setWhoLikeMeList, Match, setMatch } = useStore()
  const isFocus = useIsFocused()
  const [isVisible, setIsVisible] = useState(false)
  const [NoMatchShow, setNoMatchShow] = useState(false)
  const [UserSelect, setUserSelect] = useState<number>(0)

  async function GetWhoLikeMeList() {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/get-who-like-me/${SesionToken}?page=0&size=100`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: MatchResponse = await HttpService("get", host, url, {}, header)
      console.log(response)
      if (response.codigoRespuesta == "00") {
        setWhoLikeMeList(response.customers)
        WholikemeSaveUsers(response.customers)
      }

      if (response.codigoRespuesta == "12") {
        /* if(Platform.OS !== "ios"){
          navigation.navigate("SubscriptionScreen");
        } */
        navigation.navigate("SubscriptionScreen")
      }

      if (response.codigoRespuesta == "05") {
        /*  ToastCall("warning", "Te invitamos a comprar un plan para que sigas chanceando", "ES"); */
      }

      if (response.codigoRespuesta == "13") {
        /* if(Platform.OS !== "ios"){
          navigation.navigate("SubscriptionScreen");
        } */
        navigation.navigate("SubscriptionScreen")
      }
      return response.customers ? response.customers.length : 0
    } catch (err: any) {
      console.error(err, "GetWhoLikeMeList")
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoader(false)
    }
  }
  async function GetMatch() {
    setLoader(true)
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=100`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: MatchResponse = await HttpService("get", host, url, {}, header)

      setMatch(response.customers)
      /* manageMatchsLocal(response.customers) */

      return response.customers ? response.customers.length : 0
    } catch (err: any) {
      console.error(err, "GetMatch")
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }
  useEffect(() => {
    if (isFocus) {
      ; (async () => {
        const validateMatch = await GetMatch()
        const validateWholike = await GetWhoLikeMeList()

        console.log(!validateMatch && !validateWholike)
        console.log(validateMatch)
        console.log(validateWholike)
        console.log(WhoLikeMeList, "WhoLikeMeList")
        if (!validateMatch && !validateWholike) {
          setMatch([])
          setWhoLikeMeList([])
          setNoMatchShow(true)
        }
      })()
    }
  }, [isFocus])

  return (
    <ScreenContainer>
      <View className=" px-5 py-2 mb-2 flex-row justify-between ">
        <Text className=" text-2xl text-primary" style={font.Bold}>
          Mis Cuadres
        </Text>
        <TouchableOpacity
          className=" p-1 border rounded-lg border-primary"
          onPress={() => navigation.navigate("LikeScreen")}
        >
          <Ionicons name="heart-circle" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <View className=" px-5">
        <Text style={[font.Bold]}>Le gustaste</Text>
      </View>
      <View
        style={{
          height: 120,
          backgroundColor: "#fff",
          width: "100%",
          paddingHorizontal: 7,
        }}
      >
        {WhoLikeMeList.length ? (
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={WhoLikeMeList.slice(0, 10)}
            renderItem={({ item, index }) => {
              if (index === 9)
                return (
                  <InstaImagCategory
                    item={{
                      firstName: "Ver todos",
                      customerProfiles: [
                        {
                          link: Asset.fromModule(require("../../../assets/adaptive-icon.png")).uri,
                        },
                      ],
                    } as any}
                    index={index}
                    onPress={(e) => {
                      navigation.navigate("WhoLikeMeScreen")
                    }}
                  />
                )
              return (
                <InstaImagCategory
                  item={item}
                  index={index}
                  onPress={(e) => {
                    navigation.navigate("CustomerProfile", { Customer: item, type: "WhoLikeMe" })
                  }}
                />
              )
            }}
            initialNumToRender={7}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ width: "100%", gap: 10 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size={64} color={Colors.primary} />
              </View>
            }
          ></FlatList>
        ) : (
          <View className=" w-full h-full items-center justify-center border rounded-2xl border-primary">
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
              Todavía no hay personas que haya visto tu perfil, mejora tus fotos para que más personas le gustes.
            </Text>
          </View>
        )}
      </View>
      <View className=" px-5 mt-2">
        <Text style={[font.Bold]}>Cuadres</Text>
      </View>
      <View className="flex-1 bg-white px-2">
        {Match && Match.length ? (
          <FlatList
            keyExtractor={(item) => item.id.toString()}
            data={Match}
            numColumns={2}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    margin: 5,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    height: 200,
                  }}
                  onPress={() => navigation.navigate("CustomerProfile", { Customer: item, type: "Match" })}
                  onLongPress={() => {
                    setUserSelect(item.id)
                    setIsVisible(true)
                  }}
                >
                  <View style={{ flex: 1, overflow: 'hidden', borderTopLeftRadius: 15, borderTopRightRadius: 15 }}>
                    <CacheImage
                      source={item.customerProfiles[0].link}
                      styleImage={{ width: '100%', height: '100%' }}
                    />
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={[font.Bold, { fontSize: 16 }]} numberOfLines={1}>
                      {item.firstName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            }}
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size={64} color={Colors.primary} />
              </View>
            }
          ></FlatList>
        ) : (
          <View className=" w-full h-[300px] items-center justify-center border rounded-2xl border-primary mt-4 self-center">
            <Text
              style={[
                font.Bold,
                {
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: Colors.primary,
                  padding: 20
                },
              ]}
            >
              Todavía no haz cuadrado con nadie, mejora tus fotos para que más personas le gustes.
            </Text>
          </View>
        )}
      </View>
      <OptionsBaseCustomers active={isVisible} setActive={setIsVisible} data={{ idDestino: UserSelect.toString() }} />
      <DialogNoMatch active={NoMatchShow} setActive={setNoMatchShow} navigation={navigation} />
    </ScreenContainer>
  )
}

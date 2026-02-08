"use client"

import { useIsFocused, useNavigation } from "@react-navigation/native"
import { View, Text, TouchableOpacity, Platform } from "react-native"
import useAuth from "../../context/AuthContext/AuthProvider"
import { useEffect, useRef, useState } from "react"
import { FontAwesome6 } from "@expo/vector-icons"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { GetHeader, ToastCall, width, height } from "../../utils/Helpers";
import { Colors } from "../../utils";
import { HttpService, consultarPiropos, saveUserLike, WholikemeSaveUsers } from "../../services"
import { useRender } from "../../context"
import CardComponent from "../../components/CardComponent/CardComponent"
import type { CustomersHome, Parameter, Piropo3 } from "../../utils/Interface"
import LogoTipoD from "../../components/imgSvg/LogoTipoD"
import { useStore } from "../../context/storeContext/StoreState"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import Svg, { Path } from "react-native-svg"
import { Badge } from "@rn-vui/themed"
import DialogMethodPiropos from "../../components/Dialog/DialogMethodPiropos/DialogMethodPiropos"
import type { AxiosError } from "axios"
import Toast from "react-native-simple-toast"
import DialogAstrologyCompa from "../../components/Dialog/DialogAstrologyCompa/DialogAstrologyCompa"
import DialogNoMorePeople from "../../components/Dialog/DialogNoMorePeople/DialogNoMorePeople"
import DialogAdvertisements from "../../components/Dialog/DialogAdvertisements/DialogAdvertisements"
import CopilotStepComponent from "../../components/CopilotStep/CopilotStepComponent"
import { getUserData, saveUserData, getSeenUsers, saveSeenUser } from "../../services/AsyncStorageMethods"
import { piroposVisto } from "../../services/PiroposServices"
import OptionsBaseCustomers from "../../components/OptionsBaseCustomers/OptionsBaseCustomers"
import DialogWelcome from "../../components/Dialog/DialogWelcome/DialogWelcome"
import messaging from "@react-native-firebase/messaging"
import * as Notifications from "expo-notifications"
import DisableNotifications from "../../components/DisableNotifications/DisableNotifications"
import { sendNotification } from "../../utils/sendNotification"
import {
  getCustomerProfilesStorage,
  saveCustomerProfilesStorage,
} from "../../services/CacheStorage/CustomerProfiles/CustomerProfileStorage"

import { useImageCacheStore } from "../../context/ImageCacheHook/imageCacheStore"
import DialogNoActualizado from "../../components/Dialog/DialogNoActualizado/DialogNoActualizado"
import type { MatchResponse } from "../../context/storeContext/StoreInterface"
import { useOrdenStore } from "../../context/OrderContext/useOrder"
import TinderSwiper from "../../components/Swiper/TinderSwiper"
import useGradualFetch from "../../components/CacheImageCard/useGradualFetch";
import { SafeAreaView } from "react-native-safe-area-context"

const HomeScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const SwiperRef = useRef<any>(null)
  const { user, setUser, TokenAuthApi, PreferenceFindUser, setTokenAuthApi, setDataCoordenadas, logOut, SesionToken } =
    useAuth()
  const { setLoader, loader, LocationPermisson, setLocationPermisson, UpdateShow, DataAds, setPlayVideo } = useRender()
  const isFocus = useIsFocused()
  const {
    Customers, setCustomers,
    Customers2, setCustomers2,
    setMatch, Match,
    Piropos, setPiropos,
    setWhoLikeMeList,
    SwiperIndex, setSwiperIndex
  } = useStore()
  const { HandlerOrden } = useOrdenStore()
  const [CustomersLike, setCustomersLike] = useState<CustomersHome[]>([])
  const [ModalPiropo, setModalPiropo] = useState(false)
  const [ModalAstrology, setModalAstrology] = useState(false)
  const [ShowDialoGFree, setShowDialoGFree] = useState(false)
  const [ShowDisableNotification, setShowDisableNotification] = useState(false)
  const [ShowNoMorePeople, setShowNoMorePeople] = useState(false)
  const [LikeScreen, setLikeScreen] = useState(false)
  const [ShowAds, setShowAds] = useState(false)
  const [ShowAdsOneTime, setShowAdsOneTime] = useState(false)
  const [ShowAdsV, setShowAdsV] = useState(false)
  const isInitialLoad = useRef(true) // Guard for initial load
  const [ShowTutorial, setShowTutorial] = useState(false)
  const [SubValidate, setSubValidate] = useState(true)
  const [DataDialoGFree, setDataDialoGFree] = useState<Parameter | undefined>()
  const [CustomSelect, setCustomSelect] = useState<CustomersHome | undefined>()
  // Use global SwiperIndex instead of local currentIndex
  const [currentIndexNext, setCurrentIndexNext] = useState(SwiperIndex + 1)
  const [Counter, setCounter] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isNoDataCustomer, setIsNoDataCustomer] = useState(false)
  const isFetchingData = useRef(false) // Strict guard for async fetches
  const { setImageCache } = useImageCacheStore()



  const saveCurrentCardId = async (id: string) => {
    try {
      console.log(`[Persistence] Saving active card ID: ${id}`)
      await AsyncStorage.setItem("currentCardId", id)
    } catch (error) {
      console.error("Error saving current card ID:", error)
    }
  }

  const clearCurrentCardId = async () => {
    try {
      await AsyncStorage.removeItem("currentCardId")
    } catch (error) {
      console.error("Error clearing current card ID:", error)
    }
  }

  const onSwiped = (cardIndex: number) => {
    const card = Customers2[cardIndex]
    if (card?.id) {
      saveSeenUser(card.id.toString())
    }
    const newIndex = cardIndex + 1
    setSwiperIndex(newIndex)
  }

  const GetTokenAPI = async () => {
    try {
      const username = process.env.AUTH_API_USERNAME
      const password = process.env.AUTH_API_PASSWORD
      const host = process.env.APP_BASE_API
      const url = "/api/authenticate"
      const req = { username, password }
      const response = await HttpService("post", host, url, req)
      if (response) {
        setTokenAuthApi(response.id_token)
      }
    } catch (err: any) {
      console.error(JSON.stringify(err), "User")
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    }
  }

  const loadCardData = async (page = 0) => {
    if (isFetchingData.current) {
      console.log(`[Persistence] loadCardData blocked: Already fetching.`);
      return;
    }
    isFetchingData.current = true; // Lock

    if (page === 0) setLoader(true)
    try {
      // ... (rest of function)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/listOrderLocatorFormal2/${SesionToken}?page=${page}&size=100`
      const header = await GetHeader(TokenAuthApi, "application/json")

      console.log(`[Persistence] Fetching data... Page: ${page}`);
      const response: CustomersHome[] = await HttpService("get", host, url, {}, header)

      if (!response || !Array.isArray(response)) {
        console.log("Invalid response format");
        if (page === 0) {
          setCustomers([])
          setCustomers2([])
          setLoader(false)
        }
        return
      }

      // 1. FILTER SEEN USERS
      const seenUsers = await getSeenUsers()
      const filteredResponse = response.filter((c) => !seenUsers.includes(c.id.toString()))

      if (filteredResponse.length === 0 && response.length > 0) {
        console.log(`Page ${page} entirely filtered out. Fetching page ${page + 1}`)
        await new Promise((resolve) => setTimeout(resolve, 500))
        await loadCardData(page + 1) // Recursive call with new name
        return
      }

      if (filteredResponse.length === 0 && response.length === 0) {
        if (page === 0) {
          setCustomers([])
          setCustomers2([])
          setIsNoDataCustomer(true)
        } else {
          setShowNoMorePeople(true)
        }
        setLoader(false)
        return
      }

      // 2. APPLY PERSISTENCE (SLICE)
      const savedCardId = await AsyncStorage.getItem("currentCardId")
      console.log(`[Persistence] Hydrating... Saved ID from storage: ${savedCardId}`)

      let finalCustomers = [...filteredResponse];

      if (savedCardId && page === 0) {
        const foundIndex = filteredResponse.findIndex(c => c.id.toString() === savedCardId)
        console.log(`[Persistence] Search Result -- ID: ${savedCardId}, Found Index: ${foundIndex}`)

        if (foundIndex !== -1) {
          console.log(`[Persistence] Slicing list to start from card ${savedCardId}. Removes ${foundIndex} previous cards.`)
          finalCustomers = finalCustomers.slice(foundIndex);
        } else {
          console.log(`[Persistence] WARNING: Saved ID ${savedCardId} not found. Starting from beginning.`)
        }
      }

      // 3. PRE-CACHE CRITICAL IMAGES (ATOMIC)
      console.log(`[Persistence] Pre-caching images for ${finalCustomers.length} cards...`);
      /* await clearCustomerProfilesStorage() */
      const currentCache = await getCustomerProfilesStorage();
      setImageCache(currentCache);

      // We start the cache process here, but we can wait for at least the first image if we want to be super strict.
      // For now, initiating it before setting state is a huge improvement.
      const updatedCache = await useGradualFetch(finalCustomers, currentCache, setImageCache);
      await saveCustomerProfilesStorage(updatedCache);

      // 4. RENDER (SET STATE)
      console.log(`[Persistence] Images processed. Rendering UI now.`);
      setCustomers(finalCustomers)
      setCustomers2(finalCustomers)
      setSwiperIndex(0)

      if (!savedCardId && finalCustomers.length > 0) {
        // If no saved ID was found (e.g. first boot or cleared), save the first card immediately
        const firstCardId = finalCustomers[0].id.toString();
        console.log(`[Persistence] No saved ID found. Defaulting to first card: ${firstCardId}`);
        await saveCurrentCardId(firstCardId);
      } else if (!savedCardId) {
        await clearCurrentCardId()
      }

      // Small delay to allow React to paint the first frame correctly before removing loader
      setTimeout(() => {
        console.log(`[Persistence] Turning off loader.`);
        setLoader(false)
      }, 100);

    } catch (err) {
      setLoader(false)
      console.error(err, "loadCardData Error")
      // Error handling code remains similar but simplified for brevity in this chunk
      const errors = err as AxiosError
      if (errors.response?.status === 400) return
      if (errors.response?.status === 412) {
        setSubValidate(false)
        navigation.navigate("SubscriptionScreen")
        return
      }
      // ... rest of error logic
      if (errors.response?.status === 413) {
        ToastCall("warning", "Suscripción vencida.", "ES")
        setSubValidate(false)

        setTimeout(() => {
          navigation.navigate("SubscriptionScreen")
        }, 1000)
        return
      }
      if (errors.response?.status === 414) {
        if (Platform.OS === "ios") {
          navigation.navigate("Login")
        } else {
          navigation.navigate("Prelogin")
        }

        setTimeout(() => {
          logOut()
        }, 100)
        return
      }
      if (errors.response?.status === 415) {
        setShowNoMorePeople(true)
        await new Promise((resolve) => setTimeout(resolve, 500))
        loadCardData(page + 1) // Recursive call with new name
        return
      }
      if (errors.response?.status === 421) {
        setCustomers([])
        setCustomers2([])
        setIsNoDataCustomer(true)
        return
      }
    } finally {
      isFetchingData.current = false; // Unlock
    }
  }

  const Like = async (e: number) => {
    if (Customers2[e].id) {
      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/createView`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const response = await HttpService(
          "post",
          host,
          url,
          {
            isChecked: true,
            customerSourceId: SesionToken,
            customerDestionationId: Customers2[e].id,
          },
          header,
        )

        saveUserLike(Customers2[e])

        /* setCustomersLike([...CustomersLike, Customers[e]]); */

        setLikeScreen(true)

        /* resetTimer(); */

        /* resetTimer(); */
        if (response.codigoRespuesta == "11") {
          navigation.push("MatchModal", { Customer: Customers2[e] })
          sendNotification(
            `Cuadraste con ${user?.firstName.split(" ")[0]}`,
            `Caudrates con ${user?.firstName.split(" ")[0]} ya puedes chancearle. `,
            Customers2[e].externalId,
            { sesionToken: SesionToken, TokenApi: TokenAuthApi },
            {
              code: "001",
              CustomerId: user?.id.toString(),
            },
          )
        }
        if (response.codigoRespuesta == "12") {
          ToastCall("warning", "No tienes suscripción.", "ES")
          navigation.navigate("SubscriptionScreen")
          SwiperRef.current?.swipeBack()
        }
        if (response.codigoRespuesta == "13") {
          ToastCall("warning", "Suscripción expirada.", "ES")
          navigation.navigate("SubscriptionScreen")
          SwiperRef.current?.swipeBack()
        }
      } catch (err: any) {
        Toast.show("No tienes conexión a Internet", 3)
        SwiperRef.current?.swipeBack()
        console.error(JSON.stringify(err))
        console.error(err, "clg")
      }
    }
  }

  const Dislike = async (e: number) => {
    console.log(Customers.length)
    console.log(Customers2.length)
    if (Customers2[e].id) {
      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/createView`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const response = await HttpService(
          "post",
          host,
          url,
          {
            isChecked: false,
            customerSourceId: SesionToken,
            customerDestionationId: Customers2[e].id,
          },
          header,
        )

        setCustomersLike([...CustomersLike, Customers[e]])
        /* resetTimer(); */
      } catch (err: any) {
        Toast.show("No tienes conexión a Internet", 3)
        SwiperRef.current?.swipeBack()
        console.log(e)
        console.error(JSON.stringify(err))
        console.error(err)
      }
    }
  }

  const OnSelectCustomer = (e: CustomersHome, type: "Piropos" | "AstrologyC" | "Denuncia") => {
    switch (type) {
      case "Piropos":
        setModalPiropo(true)
        break
      case "AstrologyC":
        setModalAstrology(true)
        break
      case "Denuncia":
        setIsVisible(true)
        break

      default:
        break
    }

    setCustomSelect(e)
  }

  const validateNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync()
    if (status === "denied") {
      setTimeout(() => {
        setShowDisableNotification(true)
      }, 1000)
    }
    if (status === "granted") {
      const token = await messaging().getToken()

      if (user?.externalId !== token) {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/customers/${SesionToken}`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const response = await HttpService(
          "put",
          host,
          url,
          { ...user, externalId: token, customerStatus: "CONFIRMED" },
          header,
          setLoader,
        )

        setUser(response)
        await AsyncStorage.setItem("Sesion", JSON.stringify(response))
      }
    }
    HandlerOrden(navigation)
  }

  const validateLocation = async () => {
    if (!LocationPermisson) {
      const { status } = await Location.requestForegroundPermissionsAsync()
    }

    if (!LocationPermisson) setLocationPermisson(true)
  }

  const GetMatch = async () => {
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=100`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: MatchResponse = await HttpService("get", host, url, {}, header)

      if (response.codigoRespuesta == "00") {
        setMatch(response.customers)
      }
    } catch (err: any) {
      setMatch([])
      console.error(JSON.stringify(err))
    }
  }

  const GetWhoLikeMeList = async () => {
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

  useEffect(() => {
    if (isFocus) {
      if (!Match) {
        GetMatch()
        GetWhoLikeMeList()
      }

      // Only fetch if we have no customers
      if (Customers2.length === 0 && !loader && !isNoDataCustomer) {
        loadCardData()
      }
    }
  }, [Match, isFocus])


  useEffect(() => {
    if (isFocus) {
      if (LocationPermisson) {
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).then(async (position) => {
          setDataCoordenadas(position)
          await AsyncStorage.setItem("location", JSON.stringify(position))
          await AsyncStorage.setItem("LocationPermissonData", "1")
        }).catch(err => {
          console.error("Location error in HomeScreen:", err);
          // Safety: ensure loader is cleared and data is fetched even if location fails
          setLoader(false)
          loadCardData()
        })
      } else {
        validateLocation()
      }
    }
  }, [LocationPermisson, isFocus])

  useEffect(() => {
    if (user) {
      if (!TokenAuthApi) {
        GetTokenAPI()
        return
      }
    }
  }, [TokenAuthApi, user])

  useEffect(() => {
    setTimeout(() => {
      setLoader(false)
    }, 5000)
  }, [isFocus])

  useEffect(() => {
    if (user) {
      try {
        const subscribe = consultarPiropos(user).onSnapshot((documentSnapshot: any) => {
          if (!documentSnapshot || !documentSnapshot.docs) return;
          const res = documentSnapshot.docs.map((e: any) => {
            return {
              ...e.data(),
              key: e.id,
            };
          });
          if (!Piropos.length && res.length !== Piropos.length) {
          }
          setPiropos(res)
        })
        return subscribe
      } catch (err) {
        console.error("Error subscribing to piropos:", err);
      }
    }
  }, [Match, isFocus, user])

  useEffect(() => {
    const checkAndUpdateUserData = async () => {
      const data = await getUserData()
      console.log(data && user?.id.toString() === data.id.toString() && !data.firstTimeLogin, "checkAndUpdateUserData")
      if (data && user?.id.toString() === data.id.toString() && !data.firstTimeLogin) {
        const updatedUserData = { ...data, firstTimeLogin: true, customerStatus: "CONFIRMED" }
        await saveUserData(updatedUserData)
        setShowTutorial(true)
      } else {
        if (!ShowAdsOneTime) {
          setShowAds(true)
          setShowAdsOneTime(true)
        }
      }
    }
    if (isFocus) {
      if (!loader) {
        setTimeout(() => {
          checkAndUpdateUserData()
        }, 1000)
      }
    }
  }, [isFocus, loader, SubValidate])


  useEffect(() => {
    ; (async () => {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customer-sessions/validate/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, header, setLoader)
      if (response.codigoRespuesta === "18") {
        logOut()
        ToastCall("warning", "Sesión Expirada", "ES")
      }
    })()
  }, [])

  useEffect(() => {
    if (isInitialLoad.current) {
      // Preventing double execution on mount if handled elsewhere or strict mode
      isInitialLoad.current = false;
    }

    if (!isFocus) {
      setPlayVideo(false)
    } else {
      setPlayVideo(true)
    }

  }, [isFocus])

  const MainContainer = Platform.OS === "web" ? View : SafeAreaView;

  console.log("HomeScreen Render Start", { loader, customersCount: Customers2?.length });

  return (
    <MainContainer style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#f0f0f0' : 'transparent', alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 500 : '100%', backgroundColor: 'white' }}>
        <DialogMethodPiropos active={ModalPiropo} setActive={setModalPiropo} data={CustomSelect} />
        <DialogAstrologyCompa active={ModalAstrology} setActive={setModalAstrology} data={CustomSelect} />
        <DialogNoMorePeople active={ShowNoMorePeople} setActive={setShowNoMorePeople} />
        <DialogAdvertisements active={ShowAds} setActive={setShowAds} onClose={validateNotification} data={DataAds} />
        <DialogWelcome active={ShowTutorial} setActive={setShowTutorial} />
        <View className="flex-1">
          <View
            className={
              "flex-row justify-between items-center h-14 px-2 "
            }
          >
            {Platform.OS === "ios" ? (
              <View className=" items-center  rounded-xl ">
                <LogoTipoD />
              </View>
            ) : (
              <LogoTipoD />
            )}
            <View className="flex flex-row gap-x-2">

              <View className=" p-2 items-center rounded-xl " style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
                <View className="h-8 w-8">
                  <CopilotStepComponent message="Aquí puedes ver los piropos que te envían." step={8} name="VerPiropos">
                    <TouchableOpacity
                      onPress={() => {
                        if (Piropos.length) {
                          navigation.navigate("PiroposScreen"), piroposVisto(user)
                        } else {
                          ToastCall("warning", "No tienes piropos todavía.", "ES")
                          return
                        }
                      }}
                      className="relative h-8 w-8"
                    >
                      {Piropos.some((e) => !e.visto) ? (
                        <Badge containerStyle={{ position: "absolute", top: -5, right: -10 }}>
                          {Piropos.reduce((count, element) => {
                            return element.visto === false ? count + 1 : count
                          }, 0)}
                        </Badge>
                      ) : null}
                      <ChanceaIcon size={32} />
                    </TouchableOpacity>
                  </CopilotStepComponent>
                </View>
              </View>


              <View
                className=" p-2 px-3 pr-1 items-center  rounded-xl "
                style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
              >
                <View className="h-8 w-8">
                  <CopilotStepComponent
                    message="Aquí puedes ver y cambiar tus preferencias de acerca de lo que te gusta en tu cuadre."
                    step={9}
                    name="Preferencias"
                  >
                    <TouchableOpacity onPress={() => navigation.navigate("PreferenceScreen")}>
                      <FontAwesome6 name="sliders" size={24} color={Colors.secondary} />
                    </TouchableOpacity>
                  </CopilotStepComponent>
                </View>
              </View>
              <View
                className=" justify-center  px-0 items-center  rounded-xl "
                style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}
              >
                <View className="h-8 w-8">
                  <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}>
                    <FontAwesome6 name="bell" size={24} color={Colors.secondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          <View className="flex-1">
            {!loader && Customers2 && Customers2.length > 0 ? (
              <TinderSwiper
                ref={SwiperRef}
                data={Customers2}
                indexInitial={SwiperIndex}
                renderCard={(card, index, isFocused) => {
                  if (card) {
                    return (
                      <CardComponent
                        key={card.id}
                        index={index}
                        focusCard={isFocused}
                        card={card}
                        SwiperRef={SwiperRef}
                        selectCustomer={OnSelectCustomer}
                      />
                    )
                  }
                  return <></>
                }}
                onSwipeLeft={(i, e) => {
                  Dislike(e)
                  onSwiped(e)
                }}
                onSwipeRight={(i, e) => {
                  Like(e)
                  onSwiped(e)
                }}
                onSwipedAll={() => {
                  setTimeout(() => {
                    loadCardData()
                  }, 500)
                }}
                onFocusChange={(index, item) => {
                  if (item?.id) {
                    saveCurrentCardId(item.id.toString())
                  }
                }}
                stackSize={3}
                cardHorizontalMargin={10}
                cardVerticalMargin={10}
              />
            ) : !loader ? (
              !isNoDataCustomer ? (
                <View className="h-full w-full justify-center items-center bg-white">
                  <Text
                    style={{ fontFamily: "Bold", fontSize: 16, width: "50%", textAlign: "center", color: Colors.secondary }}
                  >
                    Buscando los mejores cuadres para tí.
                  </Text>
                </View>
              ) : (
                <View className="h-full w-full justify-center items-center bg-white">
                  <Text
                    style={{ fontFamily: "Bold", fontSize: 16, width: "50%", textAlign: "center", color: Colors.secondary }}
                  >
                    Arrasaste todos tus Chances, ya no te quedan más.
                  </Text>
                </View>
              )
            ) : null}
          </View>

          <OptionsBaseCustomers
            active={isVisible}
            setActive={setIsVisible}
            data={{ idDestino: CustomSelect ? CustomSelect?.id.toString() : "" }}
            onSuccess={() => {
              loadCardData(0)
            }}
          />
          <DisableNotifications active={ShowDisableNotification} setActive={setShowDisableNotification} />
          {/*  <DialogFreeUserAlert
          active={ShowDialoGFree}
          setActive={setShowDialoGFree}
          data={DataDialoGFree}
          navigation={navigation}
        /> */}
          <DialogNoActualizado IsUpdate={UpdateShow && !Number(process.env.DEV)} />
        </View>
      </View>
    </MainContainer>
  )
}

function ChanceaIcon({ focused, ...props }: any) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size}
      height={props.size}
      viewBox="0 0 143 122"
      fill="none"
      className="-z-10"
      {...props}
    >
      <Path
        d="M30.761 7.323l97.048 11.362c3.07 2.864 5.843 4.959 7.555 7.172a11.12 11.12 0 012.185 8.383l-9.032 61.568c-.885 6.082-6.523 10.271-12.604 9.386l-27.744-4.073a3.573 3.573 0 00-3.07 1.004l-18.15 17.887a3.647 3.647 0 01-4.96.148c-.295-.267-6.402-5.727-6.612-6.11l-6.436-17.209a3.694 3.694 0 00-2.658-1.86L18.54 90.907a11.237 11.237 0 01-5.255-2.242c-.679-.531-8.826-6.938-9.592-9.975l14.493-61.952c.885-6.081 6.522-10.3 12.575-9.415z"
        fill="#DFC5FC"
      />
      <Path
        d="M16.247 32.156C-4.108 27.042-.832 10.342 2.426 1.682 3.159-.265 5.79-.611 6.95 1.115c3.207 4.77 8.974 8.249 13.312 10.35 5.23 2.532 9.17 7.213 10.538 12.857 1.43 5.894-.332 11.409-14.558 7.834h.004zM117.469 46.078c20.6 4.001 24.721-12.507 25.443-21.734.163-2.077-2.073-3.507-3.857-2.434-4.926 2.961-11.625 3.662-16.447 3.723-5.811.072-11.361 2.64-14.998 7.172-3.796 4.731-4.54 10.474 9.859 13.273z"
        fill={true ? Colors.secondary : Colors.graySemiDark}
      />
      <Path
        d="M37.292 15.35c-9.595 0-20.942-9.172-24.493-12.697a7.432 7.432 0 00-8.104-1.61A7.43 7.43 0 00.102 7.91c0 12.865 6.218 37.19 29.752 37.19a7.44 7.44 0 006.653-4.112l7.438-14.876a7.436 7.436 0 00-6.653-10.763zm92.106-14.308a7.423 7.423 0 00-8.108 1.615c-3.295 3.29-14.865 12.693-24.494 12.693a7.431 7.431 0 00-6.325 3.529 7.453 7.453 0 00-.328 7.237l7.439 14.877a7.44 7.44 0 006.653 4.109c23.534 0 29.753-24.326 29.753-37.19a7.432 7.432 0 00-4.59-6.87z"
        fill={focused ? Colors.primary : Colors.graySemiDark}
      />
      <Path
        d="M62.788 36.515c3.189.473 4.547 2.065 5.991 4.427 2.066-1.83 3.807-2.98 6.996-2.539.411.058.827.148 1.267.268 2.716.679 5.547 3.69 5.226 8.588l-.235 1.621c-.986 4.392-5.002 9.343-15.171 14.735a2.372 2.372 0 01-2.778-.408c-8.209-8.086-10.61-13.984-10.329-18.458l.235-1.622c1.09-4.81 4.663-6.876 7.498-6.728.473 0 .885.058 1.3.12M25.98 32.618c3.189.473 4.546 2.066 5.991 4.428 2.066-1.831 3.807-2.98 6.996-2.54.411.059.827.149 1.267.268 2.716.68 5.547 3.691 5.226 8.588l-.235 1.622c-.986 4.391-5.002 9.343-15.172 14.735a2.373 2.373 0 01-2.777-.409c-8.209-8.086-10.61-13.983-10.329-18.458l.235-1.621c1.09-4.81 4.662-6.877 7.497-6.729.474.029.914.058 1.3.119"
        fill={Platform.OS === 'web' ? Colors.white : Colors.white}
      />
    </Svg>
  )
}

export default HomeScreen

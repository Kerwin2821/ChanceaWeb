"use client"

import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native"
import { useEffect, useState, useCallback } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, width } from "../../utils/Helpers"
import { font } from "../../../styles"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { useStore } from "../../context/storeContext/StoreState"
import { HttpService, setRegalosEnviadasS, setRegalosRecibidasS } from "../../services"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import type { AxiosError } from "axios"
import DialogNoRegalo from "../../components/Dialog/DialogNoRelgado/DialogNoRegalo"
import CardRegalo from "../../components/CardRegalo/CardRegalo"
import type { GiftData, TipoDeRegalo } from "./interface.regalos"
import DialogGiftDetails from "../../components/Dialog/DialogGiftDetails/DialogGiftDetails"

const SWITCH_WIDTH = Math.min(width * 0.75, 380)
const SWITCH_HEIGHT = 48
const PAGE_SIZE = 10

export default function RegaloScreen() {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const translateX = useSharedValue(0)
  const [isActive, setIsActive] = useState(true)
  const { TokenAuthApi, user, SesionToken } = useAuth()
  const { setLoader, loader } = useRender()
  const isFocus = useIsFocused()
  const { Regalos, RegalosEnviadas, setRegalosEnviadas, RegalosRecibidas, setRegalosRecibidas } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Modal state for details
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedGift, setSelectedGift] = useState<GiftData | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<TipoDeRegalo | null>(null)

  const openDetails = (data: GiftData, tipo: TipoDeRegalo) => {
    setSelectedGift(data)
    setSelectedTipo(tipo)
    setDetailsVisible(true)
  }

  const [receivedPage, setReceivedPage] = useState(0)
  const [hasMoreReceived, setHasMoreReceived] = useState(true)
  const [isLoadingMoreReceived, setIsLoadingMoreReceived] = useState(false)

  const [sentPage, setSentPage] = useState(0)
  const [hasMoreSent, setHasMoreSent] = useState(true)
  const [isLoadingMoreSent, setIsLoadingMoreSent] = useState(false)

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const toggleSwitch = () => {
    const nextState = !isActive
    setIsActive(nextState)
    translateX.value = withTiming(nextState ? 0 : (SWITCH_WIDTH / 2 - 4), {
      duration: 300,
    })
  }

  // Function to get received gifts with pagination
  const GetRegalosDestination = useCallback(
    async (page = 0, reset = false) => {
      if (reset) {
        setReceivedPage(0)
        setHasMoreReceived(true)
        page = 0
      }

      if (!hasMoreReceived && page > 0) return 0

      if (page === 0) setLoader(true)
      else setIsLoadingMoreReceived(true)

      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/gifs?customerDestinationId.equals=${user?.id}&page=${page}&size=${PAGE_SIZE}&sort=creationDate%2Cdesc`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const responseRegaloRecibidas: GiftData[] = await HttpService("get", host, url, {}, header)

        // Filter out gifts with status "POR_PAGAR"
        const filteredGifts = responseRegaloRecibidas.filter((e) => e.statusGif !== "POR_PAGAR")

        // Check if we have more data to load
        setHasMoreReceived(filteredGifts.length === PAGE_SIZE)

        if (reset || page === 0) {
          // Replace all data
          setRegalosRecibidas(filteredGifts)
          setRegalosRecibidasS(filteredGifts)
        } else {
          // Append new data, avoiding duplicates
          const newGifts = [...RegalosRecibidas]
          filteredGifts.forEach((gift) => {
            if (!newGifts.some((existing) => existing.id === gift.id)) {
              newGifts.push(gift)
            }
          })

          setRegalosRecibidas(newGifts)
          setRegalosRecibidasS(newGifts)
        }

        // Update page counter for next load
        setReceivedPage(page + 1)

        return filteredGifts.length
      } catch (err) {
        const errors = err as AxiosError
        console.log(errors, "GetRegalosDestination")
        return 0
      } finally {
        setLoader(false)
        setIsLoadingMoreReceived(false)
        setRefreshing(false)
      }
    },
    [TokenAuthApi, user, RegalosRecibidas, hasMoreReceived],
  )

  // Function to get sent gifts with pagination
  const GetRegalosSource = useCallback(
    async (page = 0, reset = false) => {
      if (reset) {
        setSentPage(0)
        setHasMoreSent(true)
        page = 0
      }

      if (!hasMoreSent && page > 0) return 0

      if (page === 0) setLoader(true)
      else setIsLoadingMoreSent(true)

      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/gifs?customerSourceId.equals=${user?.id}&page=${page}&size=${PAGE_SIZE}&sort=creationDate%2Cdesc`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const responseRegaloEnviadas: GiftData[] = await HttpService("get", host, url, {}, header)

        // Check if we have more data to load
        setHasMoreSent(responseRegaloEnviadas.length === PAGE_SIZE)

        if (reset || page === 0) {
          // Replace all data
          setRegalosEnviadas(responseRegaloEnviadas)
          setRegalosEnviadasS(responseRegaloEnviadas)
        } else {
          // Append new data, avoiding duplicates
          const newGifts = [...RegalosEnviadas]
          responseRegaloEnviadas.forEach((gift) => {
            if (!newGifts.some((existing) => existing.id === gift.id)) {
              newGifts.push(gift)
            }
          })

          setRegalosEnviadas(newGifts)
          setRegalosEnviadasS(newGifts)
        }

        // Update page counter for next load
        setSentPage(page + 1)

        return responseRegaloEnviadas.length
      } catch (err) {
        const errors = err as AxiosError
        console.log(errors, "GetRegalosSource")
        return 0
      } finally {
        setLoader(false)
        setIsLoadingMoreSent(false)
        setRefreshing(false)
      }
    },
    [TokenAuthApi, user, RegalosEnviadas, hasMoreSent],
  )

  // Function to load more received gifts
  const loadMoreReceivedGifts = useCallback(() => {
    if (!isLoadingMoreReceived && hasMoreReceived) {
      GetRegalosDestination(receivedPage)
    }
  }, [receivedPage, isLoadingMoreReceived, hasMoreReceived, GetRegalosDestination])

  // Function to load more sent gifts
  const loadMoreSentGifts = useCallback(() => {
    if (!isLoadingMoreSent && hasMoreSent) {
      GetRegalosSource(sentPage)
    }
  }, [sentPage, isLoadingMoreSent, hasMoreSent, GetRegalosSource])

  // Function to refresh both lists
  const refreshLists = useCallback(async () => {
    setRefreshing(true)
    if (isActive) {
      await GetRegalosDestination(0, true)
    } else {
      await GetRegalosSource(0, true)
    }
    setRefreshing(false)
  }, [isActive, GetRegalosDestination, GetRegalosSource])

  // Render footer for received gifts list
  const renderReceivedFooter = () => {
    if (!isLoadingMoreReceived) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Cargando más regalos...</Text>
      </View>
    )
  }

  // Render footer for sent gifts list
  const renderSentFooter = () => {
    if (!isLoadingMoreSent) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Cargando más regalos...</Text>
      </View>
    )
  }

  useEffect(() => {
    ; (async () => {
      if (isFocus) {
        // Reset pagination when screen comes into focus
        setReceivedPage(0)
        setSentPage(0)
        setHasMoreReceived(true)
        setHasMoreSent(true)

        const env = await GetRegalosSource(0, true)
        const rec = await GetRegalosDestination(0, true)

        if (!rec && !env) {
          setIsVisible(true)
        }

        if (!rec && env) {
          setIsActive(false)
          translateX.value = withTiming(SWITCH_WIDTH / 2.03, {
            duration: 200,
          })
        }
      }
    })()
  }, [isFocus])

  return (
    <ScreenContainer backgroundColor="#f2f4f7" disabledPaddingBottom={true}>
      <View style={{ flex: 1, backgroundColor: '#f2f4f7' }}>
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Pressable onPress={toggleSwitch} style={styles.pressable}>
            <View style={styles.switch}>
              <Animated.View style={[styles.circle, animatedCircleStyle]} />
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
                <Text style={[font.Bold, styles.statusText, { color: isActive ? Colors.primary : Colors.gray }]}>Recibidas</Text>
                <Text style={[font.Bold, styles.statusText, { color: !isActive ? Colors.primary : Colors.gray }]}>Enviadas</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          {isActive ? (
            RegalosRecibidas.length ? (
              <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ alignItems: "center" }}
                data={RegalosRecibidas}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshLists} />}
                renderItem={({ item, index }) => {
                  if (item.statusGif !== "POR_PAGAR") {
                    return (
                      <CardRegalo
                        onPress={() => {
                          openDetails(item, "RECIBIDA")
                        }}
                        data={item}
                        tipoRegalo="RECIBIDA"
                      />
                    )
                  }
                  return null
                }}
                ListFooterComponent={renderReceivedFooter}
                onEndReached={loadMoreReceivedGifts}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size={64} color={Colors.primary} />
                  </View>
                }
              ></FlatList>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconPlaceholder}>
                  <Text style={{ fontSize: 40 }}>🎁</Text>
                </View>
                <Text style={[font.Bold, styles.emptyTitle]}>Sin regalos recibidos</Text>
                <Text style={[font.Regular, styles.emptyText]}>
                  Todavía no has recibido regalos. ¡Mejora tu perfil para llamar la atención!
                </Text>
              </View>
            )
          ) : RegalosEnviadas.length ? (
            <FlatList
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ alignItems: "center" }}
              data={RegalosEnviadas}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshLists} />}
              renderItem={({ item, index }) => {
                return (
                  <CardRegalo
                    onPress={() => {
                      openDetails(item, "ENVIADA")
                    }}
                    data={item}
                    tipoRegalo="ENVIADA"
                  />
                )
              }}
              ListFooterComponent={renderSentFooter}
              onEndReached={loadMoreSentGifts}
              onEndReachedThreshold={0.3}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size={64} color={Colors.primary} />
                </View>
              }
            ></FlatList>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconPlaceholder}>
                <Text style={{ fontSize: 40 }}>💝</Text>
              </View>
              <Text style={[font.Bold, styles.emptyTitle]}>Sin regalos enviados</Text>
              <Text style={[font.Regular, styles.emptyText]}>
                ¿Viste a alguien que te gusta? ¡Anímate a enviarle un detalle!
              </Text>
            </View>
          )}
        </View>
      </View>
      <DialogGiftDetails
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        data={selectedGift}
        tipo={selectedTipo}
      />
      <DialogNoRegalo active={isVisible} setActive={setIsVisible} navigation={navigation} />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  pressable: {
    marginVertical: 10,
  },
  switch: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    backgroundColor: "#EEF2F6",
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    position: "relative",
  },
  circle: {
    width: SWITCH_WIDTH / 2 - 4,
    height: SWITCH_HEIGHT - 8,
    borderRadius: (SWITCH_HEIGHT - 8) / 2,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "absolute",
    left: 4,
  },
  statusText: {
    fontSize: 14,
    zIndex: 1,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIconPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#374151",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.gray,
  },
  // Keep some old styles for modal if they are still used
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0,0,0,.5)",
  },
  modalView: {
    width: "80%",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: Colors.blackBackground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "relative",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "DosisBold",
    fontSize: 18,
  },
})

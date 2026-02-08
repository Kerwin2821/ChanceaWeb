"use client"

import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native"
import { useCallback, useEffect, useState } from "react"
import ScreenContainer from "../../components/ScreenContainer"
import { Colors } from "../../utils"
import { GetHeader, ToastCall, width } from "../../utils/Helpers"
import { font } from "../../../styles"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { useAuth, useRender } from "../../context"
import { useStore } from "../../context/storeContext/StoreState"
import { HttpService, setCitasEnviadasS, setCitasRecibidasS } from "../../services"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import CardDate from "../../components/CardDate/CardDate"
import type { Cita } from "../../utils/Date.interface"
import type { AxiosError } from "axios"
import { Ionicons } from "@expo/vector-icons"
import DialogNoCita from "../../components/Dialog/DialogNoCita/DialogNoCita"
import DialogDateDetails from "../../components/Dialog/DialogDateDetails/DialogDateDetails"
import { TipoDeCita } from "../../utils/Date.interface"

const SWITCH_WIDTH = Math.min(width * 0.9, 380)
const SWITCH_HEIGHT = 48
const PAGE_SIZE = 10 // Reduced page size for smoother pagination

export default function DateScreen() {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const translateX = useSharedValue(0)
  const [isActive, setIsActive] = useState(true)
  const { TokenAuthApi, user, SesionToken } = useAuth()
  const { setLoader, loader } = useRender()
  const isFocus = useIsFocused()
  const { CitasEnviadas, setCitasEnviadas, CitasRecibidas, setCitasRecibidas } = useStore()
  const [refreshing, setRefreshing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Modal state for details
  const [detailsVisible, setDetailsVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Cita | null>(null)
  const [selectedTipo, setSelectedTipo] = useState<TipoDeCita | null>(null)

  const openDetails = (data: Cita, tipo: TipoDeCita) => {
    setSelectedDate(data)
    setSelectedTipo(tipo)
    setDetailsVisible(true)
  }

  // Pagination state for received dates
  const [receivedPage, setReceivedPage] = useState(0)
  const [hasMoreReceived, setHasMoreReceived] = useState(true)
  const [isLoadingMoreReceived, setIsLoadingMoreReceived] = useState(false)

  // Pagination state for sent dates
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

  // Function to get received dates with pagination
  const GetCitasDestination = useCallback(
    async (page = 0, reset = false) => {
      if (page === 0) setLoader(true)
      if (page > 0) setIsLoadingMoreReceived(true)

      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/invitations/${SesionToken}?customerDestinationId.equals=${user?.id}&page=${page}&size=${PAGE_SIZE}&sort=id%2Cdesc`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const responseCitaRecibidas: Cita[] = await HttpService("get", host, url, {}, header)

        // Check if we have more data to load
        if (responseCitaRecibidas.length < PAGE_SIZE) {
          setHasMoreReceived(false)
        } else {
          setHasMoreReceived(true)
        }

        // Update state based on whether this is a refresh or pagination
        if (reset || page === 0) {
          setCitasRecibidas(responseCitaRecibidas)
          setCitasRecibidasS(responseCitaRecibidas)
          setReceivedPage(0)
        } else {
          // Filter out duplicates when appending new data
          const newData = [...CitasRecibidas, ...responseCitaRecibidas]
          const uniqueData = newData.filter((date, index, self) => index === self.findIndex((d) => d.id === date.id))
          setCitasRecibidas(uniqueData)
          setCitasRecibidasS(uniqueData)
        }

        return responseCitaRecibidas.length
      } catch (err) {
        const errors = err as AxiosError
        console.log(errors, "GetCitasDestination")
        setHasMoreReceived(false)
        ToastCall("error", "Error al cargar las citas recibidas", "ES")
        return 0
      } finally {
        if (page === 0) setLoader(false)
        setIsLoadingMoreReceived(false)
        setRefreshing(false)
      }
    },
    [TokenAuthApi, SesionToken, user, CitasRecibidas],
  )

  // Function to get sent dates with pagination
  const GetCitasSource = useCallback(
    async (page = 0, reset = false) => {
      if (page === 0) setLoader(true)
      if (page > 0) setIsLoadingMoreSent(true)

      try {
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/invitations/${SesionToken}?customerSourceId.equals=${user?.id}&page=${page}&size=${PAGE_SIZE}&sort=id%2Cdesc`
        const header = await GetHeader(TokenAuthApi, "application/json")
        const responseCitaEnviadas: Cita[] = await HttpService("get", host, url, {}, header)

        // Check if we have more data to load
        if (responseCitaEnviadas.length < PAGE_SIZE) {
          setHasMoreSent(false)
        } else {
          setHasMoreSent(true)
        }

        // Update state based on whether this is a refresh or pagination
        if (reset || page === 0) {
          setCitasEnviadas(responseCitaEnviadas)
          setCitasEnviadasS(responseCitaEnviadas)
          setSentPage(0)
        } else {
          // Filter out duplicates when appending new data
          const newData = [...CitasEnviadas, ...responseCitaEnviadas]
          const uniqueData = newData.filter((date, index, self) => index === self.findIndex((d) => d.id === date.id))
          setCitasEnviadas(uniqueData)
          setCitasEnviadasS(uniqueData)
        }

        return responseCitaEnviadas.length
      } catch (err) {
        const errors = err as AxiosError
        console.log(errors, "GetCitasSource")
        setHasMoreSent(false)
        ToastCall("error", "Error al cargar las citas enviadas", "ES")
        return 0
      } finally {
        if (page === 0) setLoader(false)
        setIsLoadingMoreSent(false)
        setRefreshing(false)
      }
    },
    [TokenAuthApi, SesionToken, user, CitasEnviadas],
  )

  // Function to load more received dates
  const loadMoreReceivedDates = useCallback(() => {
    if (!isLoadingMoreReceived && hasMoreReceived) {
      const nextPage = receivedPage + 1
      setReceivedPage(nextPage)
      GetCitasDestination(nextPage)
    }
  }, [receivedPage, isLoadingMoreReceived, hasMoreReceived, GetCitasDestination])

  // Function to load more sent dates
  const loadMoreSentDates = useCallback(() => {
    if (!isLoadingMoreSent && hasMoreSent) {
      const nextPage = sentPage + 1
      setSentPage(nextPage)
      GetCitasSource(nextPage)
    }
  }, [sentPage, isLoadingMoreSent, hasMoreSent, GetCitasSource])

  // Function to refresh both lists
  const refreshLists = useCallback(() => {
    setRefreshing(true)
    setReceivedPage(0)
    setSentPage(0)
    setHasMoreReceived(true)
    setHasMoreSent(true)

    if (isActive) {
      GetCitasDestination(0, true)
    } else {
      GetCitasSource(0, true)
    }
  }, [isActive, GetCitasDestination, GetCitasSource])

  // Render footer for received dates list
  const renderReceivedFooter = () => {
    if (!isLoadingMoreReceived) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando más citas...</Text>
      </View>
    )
  }

  // Render footer for sent dates list
  const renderSentFooter = () => {
    if (!isLoadingMoreSent) return null
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando más citas...</Text>
      </View>
    )
  }

  useEffect(() => {
    ; (async () => {
      if (isFocus) {
        const env = await GetCitasSource(0, true)
        const rec = await GetCitasDestination(0, true)

        if (!rec && !env) {
          setIsVisible(true)
        }

        if (!rec && env) {
          setIsActive(false)
          translateX.value = withTiming(SWITCH_WIDTH / 2 - 4, {
            duration: 300,
          })
        }
      }
    })()
  }, [isFocus])

  return (
    <ScreenContainer disabledPaddingBottom={true}>
      <View style={styles.mainContainer}>
        <Pressable onPress={toggleSwitch} style={styles.pressable}>
          <View style={styles.switch}>
            <Animated.View style={[styles.circle, animatedCircleStyle]} />
            <Text style={[font.Bold, styles.statusText, isActive ? styles.textActive : styles.textInactive]}>Recibidas</Text>
            <Text style={[font.Bold, styles.statusText, !isActive ? styles.textActive : styles.textInactive]}>Enviadas</Text>
          </View>
        </Pressable>

        <View style={styles.listContainer}>
          {isActive ? (
            CitasRecibidas.length ? (
              <FlatList
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                data={CitasRecibidas}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshLists} />}
                renderItem={({ item }) => (
                  <CardDate
                    onPress={() => openDetails(item, "RECIBIDA")}
                    data={item}
                    tipoCita="RECIBIDA"
                  />
                )}
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size={64} color={Colors.primary} />
                  </View>
                }
                ListFooterComponent={renderReceivedFooter}
                onEndReached={loadMoreReceivedDates}
                onEndReachedThreshold={0.3}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={80} color={Colors.primary} style={{ opacity: 0.5 }} />
                <Text style={[font.Bold, styles.emptyText]}>
                  Todavía no tienes citas con nadie. Mejora tus fotos para gustarle a más personas.
                </Text>
              </View>
            )
          ) : CitasEnviadas.length ? (
            <FlatList
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
              data={CitasEnviadas}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshLists} />}
              renderItem={({ item }) => (
                <CardDate
                  onPress={() => openDetails(item, "ENVIADA")}
                  data={item}
                  tipoCita="ENVIADA"
                />
              )}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size={64} color={Colors.primary} />
                </View>
              }
              ListFooterComponent={renderSentFooter}
              onEndReached={loadMoreSentDates}
              onEndReachedThreshold={0.3}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="send-outline" size={80} color={Colors.primary} style={{ opacity: 0.5 }} />
              <Text style={[font.Bold, styles.emptyText]}>
                Todavía no has enviado invitaciones a nadie. Ve al inicio y elige a alguien con quien cuadrar y chancear para salir.
              </Text>
            </View>
          )}
        </View>
      </View>

      <DialogNoCita active={isVisible} setActive={setIsVisible} navigation={navigation} />

      <DialogDateDetails
        visible={detailsVisible}
        onClose={() => setDetailsVisible(false)}
        data={selectedDate}
        tipo={selectedTipo}
      />
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f2f4f7", // Matches gifts screen background
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayDark,
    marginTop: 20,
    fontSize: 15,
    lineHeight: 22,
  },
  pressable: {
    marginVertical: 20,
  },
  switch: {
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    borderRadius: SWITCH_HEIGHT / 2,
    backgroundColor: "#E4E4E7",
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    justifyContent: "space-between",
  },
  circle: {
    width: (SWITCH_WIDTH / 2) - 4,
    height: SWITCH_HEIGHT - 8,
    borderRadius: (SWITCH_HEIGHT - 8) / 2,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "absolute",
    left: 4,
  },
  statusText: {
    flex: 1,
    textAlign: "center",
    zIndex: 1,
    fontSize: 14,
  },
  textActive: {
    color: Colors.primary,
  },
  textInactive: {
    color: "#71717A",
  },
  footerLoader: {
    marginVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "DosisMedium",
    color: Colors.primary,
  },
})

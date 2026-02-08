"use client"

import { View, Text, Dimensions } from "react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog } from "@rn-vui/themed"
import { font } from "../../../../styles"
import { GetHeader, height, ToastCall, width } from "../../../utils/Helpers"
import { HttpService } from "../../../services"
import { useAuth } from "../../../context"
import { ScrollView } from "react-native"
import type { CustomersHome } from "../../../utils/Interface"
import Button from "../../ButtonComponent/Button"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import type { UserData } from "../../../context/AuthContext/AuthInterface"
import AnimationLoadChancea from "../../accesories/AnimationLoadChancea"
import ViewShot from "react-native-view-shot"
import Share from "react-native-share"
import CacheImage from "../../CacheImage/CacheImage"
import type { JSX } from "react"

type props = {
  active: boolean
  setActive: (e: boolean) => void
  data?: CustomersHome
}

export interface Response {
  id: string
  object: string
  created: number
  model: string
  choices: Choice[]
  usage: Usage
  system_fingerprint: any
}

export interface Choice {
  index: number
  message: Message
  logprobs: any
  finish_reason: string
}

export interface Message {
  role: string
  content: string
}

export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

const signo = (customer: CustomersHome | UserData | null | undefined) => {
  if (customer) {
    var date = new Date(customer.birthDate)
    var d = date.getDate()
    var m = date.getMonth()
    let Texto
    if ((d >= 23 && m == 10) || (d <= 22 && m == 11)) {
      Texto = <MaterialCommunityIcons name="zodiac-sagittarius" size={32} color="white" />
    } else if ((d >= 23 && m == 11) || (d <= 20 && m == 0)) {
      Texto = <MaterialCommunityIcons name="zodiac-capricorn" size={32} color="white" />
    } else if ((d >= 21 && m == 0) || (d <= 19 && m == 1)) {
      Texto = <MaterialCommunityIcons name="zodiac-aquarius" size={32} color="white" />
    } else if ((d >= 20 && m == 1) || (d <= 20 && m == 2)) {
      Texto = <MaterialCommunityIcons name="zodiac-pisces" size={32} color="white" />
    } else if ((d >= 21 && m == 2) || (d <= 21 && m == 3)) {
      Texto = <MaterialCommunityIcons name="zodiac-aries" size={32} color="white" />
    } else if ((d >= 22 && m == 3) || (d <= 21 && m == 4)) {
      Texto = <MaterialCommunityIcons name="zodiac-taurus" size={32} color="white" />
    } else if ((d >= 22 && m == 4) || (d <= 21 && m == 5)) {
      Texto = <MaterialCommunityIcons name="zodiac-gemini" size={32} color="white" />
    } else if ((d >= 22 && m == 5) || (d <= 22 && m == 6)) {
      Texto = <MaterialCommunityIcons name="zodiac-cancer" size={32} color="white" />
    } else if ((d >= 23 && m == 6) || (d <= 22 && m == 7)) {
      Texto = <MaterialCommunityIcons name="zodiac-leo" size={32} color="white" />
    } else if ((d >= 23 && m == 7) || (d <= 22 && m == 8)) {
      Texto = <MaterialCommunityIcons name="zodiac-virgo" size={32} color="white" />
    } else if ((d >= 23 && m == 8) || (d <= 22 && m == 9)) {
      Texto = <MaterialCommunityIcons name="zodiac-libra" size={32} color="white" />
    } else if ((d >= 23 && m == 9) || (d <= 22 && m == 10)) {
      Texto = <MaterialCommunityIcons name="zodiac-scorpio" size={32} color="white" />
    }
    return Texto
  }
}

const { height: screenHeight } = Dimensions.get("window")

const DialogAstrologyCompa = ({ active, setActive, data }: props) => {
  const { user, TokenAuthApi, SesionToken } = useAuth()
  const [Load, setLoad] = useState(false)
  const [Texto, setTexto] = useState("")
  const viewShotRef = useRef<any>(null)
  const [expanded, setExpanded] = useState(false)

  // 🎯 FUNCIONES SIMPLIFICADAS SIN ANIMACIONES
  const toggleExpand = () => {
    setExpanded(true)
  }

  const toggleClose = () => {
    setExpanded(false)
  }

  const toggleDialog1 = () => {
    // 🚀 Sin delay - cierre inmediato
    setActive(!active)
    setTexto("")
    setExpanded(false) // Reset del estado expandido
  }

  // 🎯 ESTRELLAS MEMOIZADAS (sin cambios)
  const Stars = useMemo(
    () =>
      new Array(18).fill(0).map((value, index) => (
        <Ionicons
          key={index}
          name="star"
          size={24}
          color={"rgba(255,255,255,0.2)"}
          style={{
            transform: [
              { rotate: Math.floor(360 - 20 * Math.random()).toString() + "rad" },
              { translateX: (width * 0.9 - 20) * Math.random() },
              { translateY: (height * 0.09 - 20) * Math.random() },
            ],
          }}
        />
      )),
    [],
  )

  async function queryTexto() {
    try {
      setLoad(true)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/getAstralCompatibility/${SesionToken}/${data?.id}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: Response = await HttpService("get", host, url, {}, header)
      setTexto(response.choices[0].message.content)
      // 🚀 Expansión inmediata sin animación
      toggleExpand()
    } catch (err: any) {
      console.error(JSON.stringify(err), "User")
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoad(false)
    }
  }

  const splitTextIntoParagraphs = (text: string): JSX.Element[] => {
    return text
      .split(".")
      .filter((sentence) => sentence.trim() !== "")
      .map((sentence, index) => (
        <Text key={index} style={[font.Bold, { fontSize: 14, textAlign: "justify", marginBottom: 10 }]}>
          {sentence.trim() + "."}
        </Text>
      ))
  }

  const splitTextIntoParagraphs2 = (text: string): string => {
    return text
      .split(".")
      .filter((sentence) => sentence.trim() !== "")
      .map((sentence, index) => sentence.trim() + ". \n\n")
      .join("")
  }

  const onImageLoad = useCallback(async () => {
    const uri = await viewShotRef.current.capture()
    await Share.open({
      url: uri,
      title: "Compartir Captura de Pantalla",
      failOnCancel: false,
    })
  }, [])

  useEffect(() => {
    if (active) {
      queryTexto()
    }
  }, [active])

  if (!active) {
    return <></>
  }

  return (
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog1}
      overlayStyle={{ backgroundColor: "black", borderRadius: 14, padding: 0, width: "90%", maxHeight: "80%" }}
    >
      {Load && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 justify-center z-10 flex items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <AnimationLoadChancea />
        </View>
      )}

      <ViewShot ref={viewShotRef} options={{ fileName: "Your-File-Name", format: "jpg", quality: 0.9 }}>
        <LinearGradient
          colors={[
            "rgba(0,71,103,0)",
            "rgba(0,30,103,0.1)",
            "rgba(0,30,103,0.3)",
            "rgba(0,30,103,0.5)",
            "rgba(0,30,103,0.8)",
            "rgba(0,30,103,1)",
          ]}
          className="h-full w-full rounded-xl"
        >
          <View className="absolute top-0 left-0 h-full w-full justify-center items-center rounded-xl gap-y-3 z-10">
            {/* Header */}
            <View className="flex-row gap-x-2 items-center">
              <Text style={[font.Bold, { fontSize: 20, color: "white" }]}>Compatibilidad Astral</Text>
              <Image
                source={require("../../../../assets/items/astrology.png")}
                style={{ height: 28, width: 28 }}
                cachePolicy="disk"
              />
            </View>

            {/* User profiles section */}
            {active && (
              <View className="h-[20%] w-[90%] rounded-xl flex-row justify-evenly items-center">
                <View className="relative w-24 h-24">
                  <CacheImage
                    classNameImage="w-20 h-20 rounded-full"
                    source={{ uri: (user?.customerProfiles as any)[0].link }}
                  />
                  <View className="absolute right-0 bottom-0">{signo(user)}</View>
                </View>
                <View>
                  <AntDesign name="heart" size={32} color={"white"} />
                </View>
                <View className="relative w-24 h-24">
                  <CacheImage
                    classNameImage="w-20 h-20 rounded-full"
                    source={{ uri: (data?.customerProfiles as any)[0].link }}
                  />
                  <View className="absolute right-0 bottom-0">{signo(data)}</View>
                </View>
              </View>
            )}

            {/* Content section - SIN ANIMACIÓN */}
            {active && (
              <View
                style={{
                  height: expanded ? screenHeight * 0.4 : screenHeight * 0.1,
                  width: "90%",
                }}
              >
                <ScrollView
                  className="p-3 w-full rounded-xl"
                  style={{
                    height: expanded ? height * 0.4 : height * 0.1,
                    backgroundColor: "rgba(255,255,255,0.8)",
                  }}
                >
                  <View>
                    <Text style={[font.Bold, { fontSize: 18, textAlign: "center", marginBottom: 10 }]}>
                      {user?.symbol?.name} y {data?.symbol?.name}
                    </Text>
                  </View>
                  {expanded && splitTextIntoParagraphs(Texto)}
                </ScrollView>
              </View>
            )}

            <Button text="Compartir" typeButton="normal" onPress={onImageLoad} />
          </View>

          {Stars}
        </LinearGradient>
      </ViewShot>
    </Dialog>
  )
}

export default DialogAstrologyCompa

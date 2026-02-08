"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { Image } from "expo-image"
import { GetHeader, ToastCall, width } from "../../utils/Helpers"
import { font } from "../../../styles"
import { Colors } from "../../utils"
import { AntDesign, FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { useAuth, useRender } from "../../context"
import { useNavigation, useRoute } from "@react-navigation/native"
import { HttpService } from "../../services"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import Button from "../../components/ButtonComponent/Button"
import * as FileSystem from "expo-file-system"
import * as Clipboard from "expo-clipboard"
import Share from "react-native-share"
import WebViewWebWrapper from "../../components/WebViewWebWrapper"
import DialogPaymentNumberRegalos from "../../components/Dialog/DialogPaymentNumberRegalo/DialogPaymentNumberRegalo"
import type { GiftData } from "./interface.regalos"
import type { BoxPackageV2 } from "../../utils/Date.interface"
import DialogValidateIDPayment from "../../components/Dialog/DialogValidateIDPayment/DialogValidateIDPayment"
import { saveOrden } from "../../services/CacheStorage/Orden/OrdenStorage"
import { SafeAreaView } from "react-native-safe-area-context"

// Bank data for different payment options
const bankData = {
  miBanco: {
    name: "Mi Banco",
    tel: "04241934005",
    bank: "(0169 Mi Banco)",
    cedula: "J505226231",
  },
  bdv: {
    name: "Banco de Venezuela",
    tel: "04241934005",
    bank: "(0102 Banco de Venezuela)",
    cedula: "J505226231",
  },
}

const PagoMovilPaymentRegalos = () => {
  const { user, TokenAuthApi, SesionToken } = useAuth()
  const { setLoader, PrecioDolar } = useRender()
  const [Active, setActive] = useState(false)
  const [ActiveValidate, setActiveValidate] = useState(false)
  const [Amount, setAmount] = useState(0)
  const [showWebView, setShowWebView] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [showFinishButton, setShowFinishButton] = useState(false)
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const route = useRoute()
  const data = route.params as {
    box: BoxPackageV2
    gif: { customerDestinationId: string; message: string; gif?: GiftData }
  }
  const [GiftToPay, setGiftToPay] = useState<GiftData | null>(null)

  // State for bank selection
  const [selectedBank, setSelectedBank] = useState<"miBanco" | "bdv">("miBanco")

  // Get current bank data based on selection
  const datosPagoMovil = selectedBank === "miBanco" ? bankData.miBanco : bankData.bdv

  async function generatePMIntention() {
    console.log(data.box)
    try {
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customer/generateOrdenGifProduct`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService(
        "post",
        host,
        url,
        {
          boxPackageId: data.box.id,
          sessionToken: SesionToken,
          customerDestinationId: data.gif.customerDestinationId,
          message: data.gif.message,
          gifId: data.gif?.gif?.id ? data.gif.gif.id : null,
        },
        header,
        setLoader,
      )

      const url2 = `/api/appchancea/gifs?customerSourceId.equals=${user?.id}&page=0&size=20&sort=creationDate%2Cdesc`
      let response2

      if (data.gif) {
        response2 = data.gif.gif
      } else {
        response2 = (await HttpService("get", host, url2, {}, header, setLoader))[0]
      }
      console.log(response)
      console.log(response.orden.id, 'orden.id')
      if (response.codigoRespuesta === "00") {
        ToastCall("success", "Intención de pago creada correctamente", "ES")
        setAmount(response.orden.totalAmount)
        setResponse(response)
        saveOrden(response.orden)
        setGiftToPay(response2)

        // Construir la URL con los parámetros correctos
        const webViewUrl = `https://v0-react-native-payment-app-self.vercel.app/payment?orderId=${response.orden.id}&sessionTokenId=${SesionToken}&amount=${response.orden.totalAmount}`
        setPaymentUrl(webViewUrl)
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

  const imageUrl = "https://chancea.s3.us-east-1.amazonaws.com/ImagenQR.png"

  const downloadAndShareImage = async () => {
    const fileUri = FileSystem.documentDirectory + "ImagenQR.png"

    try {
      const response = await FileSystem.downloadAsync(imageUrl, fileUri)
      const shareOptions = {
        title: "Compartir Imagen",
        url: response.uri,
        message: "QR para Pago de Chancea",
      }
      await Share.open(shareOptions)
    } catch (error) {
      console.error(error)
    }
  }

  const copyToClipboard = async (text: string | number) => {
    await Clipboard.setStringAsync(text.toString())
  }

  useEffect(() => {
    if (!user?.identifcatorPayment) {
      setActiveValidate(true)
      return
    }
    generatePMIntention()
  }, [user])

  const checkButtonScript = `
    setInterval(() => {
      const btn = document.querySelector('#botonFinalizar');
      if (btn) {
         window.ReactNativeWebView.postMessage('SHOW_FINISH_BUTTON');
      }
    }, 1000);
    true;
  `;

  if (paymentUrl) {
    return (
      <SafeAreaView className="flex-1">
        {
          !showFinishButton ? (
            <View className="flex-row justify-start mx-2 mt-5 bg-white px-2 py-2 z-10">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <FontAwesome6 name="arrow-left" size={28} color={Colors.black} />
              </TouchableOpacity>
            </View>
          ) : null
        }

        <View style={{ flex: 1 }}>
          <WebViewWebWrapper
            source={{ uri: paymentUrl }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={checkButtonScript}
            onMessage={(event: any) => {
              if (event.nativeEvent.data === "SHOW_FINISH_BUTTON") {
                setShowFinishButton(true)
              }
            }}
          />
          {showFinishButton && (
            <View style={{ position: "absolute", bottom: 20, left: 0, right: 0, paddingHorizontal: 20 }}>
              <Button
                text="Finalizar"
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  })
                }}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    )
  }
}

export default PagoMovilPaymentRegalos

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    width,
    justifyContent: "space-between",
    flexGrow: 1,
  },
  containerText: {
    height: 50,
    backgroundColor: Colors.white,
    borderColor: Colors.blackBackground,
    borderWidth: 2,
    borderRadius: 50,
    borderStyle: "solid",
    marginVertical: 10,
    paddingHorizontal: 8,
    position: "relative",
  },
  text: {
    color: Colors.black,
    fontFamily: "DosisSemiBold",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    marginVertical: 20,
    fontFamily: "Dosis",
    color: Colors.black,
    textAlign: "center",
  },
  containerRow: {
    flexDirection: "row",
  },
  containerCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  containerWidth: {
    width: "100%",
  },
  containerIcon: {
    position: "absolute",
    width: 38,
    height: 38,
    top: 0,
    right: 5,
  },
  containerButton: {
    width,
    paddingHorizontal: width * 0.05,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
})

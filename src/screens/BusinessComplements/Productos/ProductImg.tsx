"use client"
import { useEffect, useState } from "react"
import { Text, View, TouchableOpacity, Platform, Alert } from "react-native"
import { CommonActions, useNavigation, useRoute } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { Image } from "expo-image"
import { useAuth, useRender } from "../../../context"
import { Colors } from "../../../utils"
import { GetHeader, ToastCall } from "../../../utils/Helpers"
import Button from "../../../components/ButtonComponent/Button"
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import type { NavigationScreenNavigationType } from "../../../navigation/StackNavigator"
import { useStoreBusiness } from "../../../context/storeBusinessHooks/useStoreBusiness"
import { HttpService } from "../../../services"
import { UploadToS3 } from "../../../utils/UploadToS3"
import * as ImageManipulator from "expo-image-manipulator"
import { useSesionBusinessStore } from "../../../context/AuthBusinessHooks/useAuthBusinessHooks"
import type { ProductResponse } from "../../../context/storeBusinessHooks/StoreBusinessInterface"
import HeaderApp from "../../../components/HeaderApp"

interface File {
  uri: string | undefined | null
  type: string
  name: string | undefined
}

function ProductImg() {
  const { setLoader } = useRender()
  const { TokenAuthApi, SesionToken } = useAuth()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [photoURL, setPhotoURL] = useState<File | null>()
  const [isImageSelected, setIsImageSelected] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { FormCreateProd } = useStoreBusiness()
  const { sesionBusiness } = useSesionBusinessStore()
  const route = useRoute()
  const params = route.params as any
  const [isEditing, setIsEditing] = useState(false)

  // Get presigned URL for S3 upload
  const getPresignedUrl = async (fileName: string) => {
    try {
      const host = process.env.APP_BASE_API
      const url: string = `/api/generate-presigned-url-business/${fileName}/${SesionToken}`
      const headers = GetHeader(TokenAuthApi, "multipart/form-data")
      const response = await HttpService("get", host, url, {}, headers)
      return response.url
    } catch (error) {
      console.error("Error obteniendo URL prefirmada:", error)
      return null
    }
  }

  // Upload image to S3 and get URL
  const createObjSend = async (data: File) => {
    if (!data?.name) return null
    try {
      const urlS3 = await getPresignedUrl(data.name)
      if (!urlS3) throw new Error("No se pudo obtener URL para subir la imagen")
      return await UploadToS3(data, urlS3)
    } catch (error) {
      console.error("Error al preparar imagen para envío:", error)
      return null
    }
  }

  // Handle image upload and product creation/update
  const handleSubmit = async () => {
    if (!photoURL?.uri) {
      ToastCall("warning", "Por favor selecciona una imagen para tu producto", "ES")
      return
    }

    try {
      setLoader(true)
      const urlImg = await createObjSend(photoURL)
      if (!urlImg) {
        ToastCall("error", "Error al subir la imagen. Intenta nuevamente.", "ES")
        return
      }

      const host = process.env.APP_BASE_API

      // Update existing product if in edit mode
      if (isEditing && params) {
        const url = `/api/portal/product/${params.id}?sessionToken=${SesionToken}`
        const header = await GetHeader(TokenAuthApi, "application/json")
        await HttpService(
          "put",
          host,
          url,
          {
            ...params,
            imagenUrl: urlImg,
            imagenProductContentType: "image/png",
          },
          header,
        )
        ToastCall("success", "Producto actualizado exitosamente", "ES")
        navigation.goBack()
        return
      }

      // Create new product
      const url = `/api/portal/product/create?sessionToken=${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: ProductResponse = await HttpService(
        "post",
        host,
        url,
        {
          ...FormCreateProd,
          imagenUrl: urlImg,
          amount: Number(FormCreateProd.amount),
          aditional1: sesionBusiness?.id.toString(),
          sessionToken: SesionToken,
        },
        header,
      )

      ToastCall("success", "Producto creado exitosamente", "ES")
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }, { name: "ProductosBusinessScreen" }],
        }),
      )
    } catch (error: any) {
      console.error(JSON.stringify(error))
      ToastCall("error", "Error al procesar tu solicitud. Intenta nuevamente.", "ES")
    } finally {
      setLoader(false)
    }
  }

  // Handle image selection
  const selectImage = async () => {
    // Request permissions if needed
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitamos permisos para acceder a tu galería")
        return
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
      })

      if (result.canceled || !result.assets || !result.assets[0]) return

      // Check image dimensions
      const { width: imgWidth, height: imgHeight } = result.assets[0]
      if (imgWidth < 500 || imgHeight < 500) {
        ToastCall("warning", "Recomendamos usar imágenes de al menos 500x500 píxeles para mejor calidad", "ES")
      }

      // Process image
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.PNG,
        }
      )

      // Create file object
      const name = manipResult.uri.split("/")
      const file: File = {
        uri: manipResult.uri,
        type: "image/png",
        name: name[name.length - 1],
      }

      setPhotoURL(file)
      setIsImageSelected(true)
      setImageError(false)
    } catch (error) {
      console.error("Error al seleccionar imagen:", error)
      ToastCall("error", "No se pudo procesar la imagen. Intenta con otra.", "ES")
    }
  }

  // Load existing image if editing
  useEffect(() => {
    if (params?.imagenUrl) {
      setIsEditing(true)
      const name = params.imagenUrl.split("/")
      setPhotoURL({
        uri: params.imagenUrl,
        type: "image/png",
        name: name[name.length - 1],
      })
      setIsImageSelected(true)
    }
  }, [params])

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <HeaderApp title={isEditing ? "Actualizar imagen" : "Agregar imagen"} />
      
      <View className="flex-1 px-5 py-6">
        {/* Image Requirements */}
        <View className="bg-gray-50 p-4 rounded-lg mb-6">
          <Text className="text-sm font-semibold text-secondary mb-2">Recomendaciones:</Text>
          <View className="flex-row items-start mb-2">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2" />
            <Text className="text-xs text-gray-600 flex-1">Usa imágenes cuadradas (1:1) para mejor visualización</Text>
          </View>
          <View className="flex-row items-start mb-2">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2" />
            <Text className="text-xs text-gray-600 flex-1">
              Asegúrate que la imagen tenga buena iluminación y calidad
            </Text>
          </View>
          <View className="flex-row items-start">
            <View className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 mr-2" />
            <Text className="text-xs text-gray-600 flex-1">Evita textos pequeños que puedan ser difíciles de leer</Text>
          </View>
        </View>

        {/* Image Upload Area */}
        <View className="items-center mb-6">
          <Text className="text-base font-semibold text-secondary mb-3 self-start">Imagen del producto</Text>
          <TouchableOpacity
            onPress={selectImage}
            className={`w-64 h-64 rounded-xl border-2 ${
              photoURL?.uri ? "border-primary/30" : "border-gray-300 border-dashed"
            } overflow-hidden flex items-center justify-center bg-gray-50`}
            activeOpacity={0.7}
          >
            {photoURL?.uri && !imageError ? (
              <>
                <Image 
                  source={{ uri: photoURL.uri }} 
                  style={{ 
                    width: '100%', 
                    height: '100%' 
                  }}
                  contentFit="cover"
                  onLoadStart={() => setImageLoading(true)}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true)
                    setImageLoading(false)
                  }}
                />
                {imageLoading && (
                  <View className="absolute inset-0 bg-gray-100 items-center justify-center">
                    <MaterialIcons name="image" size={32} color={Colors.gray} />
                    <Text className="text-xs text-gray-500 mt-1">Cargando...</Text>
                  </View>
                )}
                <View className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-sm">
                  <Feather name="edit-2" size={18} color={Colors.primary} />
                </View>
              </>
            ) : (
              <View className="items-center">
                <MaterialIcons 
                  name={imageError ? "broken-image" : "add-photo-alternate"} 
                  size={48} 
                  color={imageError ? Colors.danger : Colors.primary} 
                />
                <Text className="text-sm text-gray-500 mt-2">
                  {imageError ? "Error al cargar imagen" : "Toca para seleccionar"}
                </Text>
                {imageError && (
                  <Text className="text-xs text-gray-400 mt-1">Toca para intentar de nuevo</Text>
                )}
              </View>
            )}
          </TouchableOpacity>

          {photoURL?.uri && !imageError && (
            <View className="mt-4 flex-row items-center">
              <MaterialIcons name="check-circle" size={16} color={Colors.green} />
              <Text className="ml-1 text-sm text-green-600">Imagen seleccionada</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View className="px-5 py-6 border-t border-gray-100">
        <Button 
          text={isEditing ? "Guardar cambios" : "Continuar"} 
          disabled={!isImageSelected || imageError} 
          onPress={handleSubmit} 
        />
      </View>
    </SafeAreaView>
  )
}

export default ProductImg
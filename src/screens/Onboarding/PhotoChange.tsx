"use client"

import { Text, View, TouchableOpacity, Platform, ActivityIndicator, Modal, ScrollView, StyleSheet } from "react-native"
import type { CustomerProfile } from "../../utils/Interface"
import Button from "../../components/ButtonComponent/Button"
import { GetHeader, ToastCall, height } from "../../utils/Helpers"
import { useAuth, useRender } from "../../context"
import { useEffect, useState, useMemo } from "react"
import { useNavigation, useRoute } from "@react-navigation/native"
import ScreenContainer from "../../components/ScreenContainer"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import { font } from "../../../styles"
import * as ImagePicker from "expo-image-picker"
import { Entypo, FontAwesome6, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { Colors } from "../../utils"
import { HttpService } from "../../services"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImageManipulator from "expo-image-manipulator"
import CacheImage from "../../components/CacheImage/CacheImage"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"

interface File {
  uri: string
  type: any
  name: string
}

import OnboardingValidate from "../../utils/OnboardingValidate";

export default function PhotoChange() {
  const { setLoader } = useRender()
  const { TokenAuthApi, user, setUser, SesionToken, logOut } = useAuth()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null, null, null])
  const [photosURLIndex, setPhotosURLIndex] = useState<number[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null)

  const route = useRoute()
  const params = route.params as { customerProfile: CustomerProfile[] } | undefined

  // Calculate how many photos are currently loaded
  const loadedPhotoCount = useMemo(() => {
    return photos.filter((photo) => photo !== null).length
  }, [photos])

  // Check if we have the minimum required photos (3)
  const hasMinimumPhotos = useMemo(() => {
    return loadedPhotoCount >= 3
  }, [loadedPhotoCount])

  const getPhoto = (file: ImageManipulator.ImageResult | undefined): File | null => {
    if (!file) return null

    const name = file?.uri.split("/")

    const data: File = {
      uri: file?.uri,
      type: "image/png",
      name: file?.uri.split("/")[name.length - 1],
    }
    return data
  }

  const PhotoTransform = (link: string) => {
    const name = link.split("/")

    const data: File = {
      uri: link,
      type: "image/png",
      name: link.split("/")[name.length - 1],
    }
    return data
  }

  const openPhotoSourceDialog = (index: number) => {
    setCurrentPhotoIndex(index)
    pickFromGalleryDirect(index)
  }

  const pickFromGalleryDirect = async (index: number) => {
    try {
      setLoader(true)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (status !== "granted") {
        ToastCall(
          "warning",
          "Se necesitan permisos para acceder a la galería para seleccionar una foto.",
          "ES"
        )
        setLoader(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.2,
        aspect: [3, 4],
      })

      if (!result.canceled && result?.assets) {
        if (result.assets[0].width < 500) {
          ToastCall(
            "warning",
            "Esta imagen no posee una alta calidad de resolución, lo cual hace que los detalles no sean claros y se vea borrosa o pixelada.",
            "ES",
          )
          setLoader(false)
          return
        }

        const manipResult = await ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 500 } }], {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.PNG,
          base64: true,
        })

        const foto = getPhoto(manipResult)
        if (!foto) return

        // Update the photos array with the new photo at the specified index
        const updatedPhotos = [...photos]
        updatedPhotos[index] = foto
        setPhotos(updatedPhotos)

        // Track which indices have been modified
        if (!photosURLIndex.includes(index)) {
          setPhotosURLIndex([...photosURLIndex, index])
        }
      }
    } catch (error) {
      console.error("Error selecting image from gallery:", error)
      ToastCall("error", "Error al seleccionar la imagen", "ES")
    } finally {
      setLoader(false)
      setCurrentPhotoIndex(null)
    }
  }



  const deletePhoto = async (index: number) => {
    try {
      const updatedPhotos = [...photos]

      // Simply set the selected photo to null at the specific index
      updatedPhotos[index] = null

      setPhotos(updatedPhotos)

      // Remove the deleted index from photosURLIndex
      const updatedIndices = photosURLIndex.filter((i) => i !== index)
      setPhotosURLIndex(updatedIndices)
    } catch (error) {
      console.error("Error deleting photo:", error)
      ToastCall("error", "Error al eliminar la imagen", "ES")
    }
  }

  const getPresignedUrl = async (fileName: string) => {
    try {
      const host = process.env.APP_BASE_API
      const url: string = `/api/generate-presigned-url/${fileName}/${SesionToken}`
      const headers = GetHeader(TokenAuthApi, "application/json")
      const response = await HttpService("get", host, url, {}, headers)

      return response.url // URL prefirmada
    } catch (error) {
      console.error("Error obteniendo URL prefirmada: ", error)
      throw error
    }
  }

  const uploadToS3 = async (image: File, url: string) => {
    try {
      const response = await fetch(image.uri)
      const blob = await response.blob()

      const result = await fetch(url, {
        method: "PUT",
        body: blob,
        headers: {
          "Content-Type": blob.type,
        },
      })

      return url.split("?")[0]
    } catch (error) {
      console.error("Error uploading image", JSON.stringify(error))
      throw error
    }
  }

  const createObjSend = async (data: File) => {
    const urlS3 = await getPresignedUrl(data.name)
    const imgData = await uploadToS3(data, urlS3 as string)

    const host = process.env.APP_BASE_API
    const url: string = `/api/appchancea/customer-profiles/save`
    const headers = GetHeader(TokenAuthApi, "application/json")

    const response = await HttpService(
      "post",
      host,
      url,
      {
        s3url: imgData,
        sessionToken: SesionToken,
      },
      headers,
    )

    return response
  }

  const sendImages = async () => {
    // Filter out null values to get only valid photos
    const validPhotos = photos.filter((photo): photo is File => photo !== null)

    if (validPhotos.length === 0) {
      ToastCall("warning", "No ha cargado ninguna imagen", "ES")
      return
    }

    // Check if we have at least 3 photos (either new or existing)
    const existingPhotoCount = params?.customerProfile?.length || 0
    if (validPhotos.length < 3 && validPhotos.length + existingPhotoCount < 3) {
      ToastCall("warning", "Debes cargar al menos 3 imágenes", "ES")
      return
    }

    try {
      setIsUploading(true)
      setLoader(true)

      // Prepare data array with the same structure as the original photos array
      const data: any[] = new Array(photos.length).fill(null)

      let hasUploadError = false;

      // Process each photo
      for (let i = 0; i < photos.length; i++) {
        setUploadProgress(Math.round((i / photos.length) * 100))

        if (photos[i] !== null) {
          if (photosURLIndex.includes(i)) {
            // This is a new or modified photo, upload it
            try {
              const res = await createObjSend(photos[i]!)
              if (res?.customerProfile) {
                delete res.customerProfile.customers
                delete res.customerProfile.externalprofile
                data[i] = res.customerProfile
              } else {
                hasUploadError = true;
              }
            } catch (error) {
              console.error(`Error uploading photo ${i}:`, error)
              hasUploadError = true;
            }
          } else if (params?.customerProfile && params.customerProfile[i]) {
            // This is an existing photo that wasn't modified
            data[i] = params.customerProfile[i]
          }
        }
      }

      if (hasUploadError) {
        setLoader(false);
        setIsUploading(false);
        ToastCall("error", "Error al subir algunas imágenes. Por favor intenta de nuevo.", "ES");
        return;
      }

      const finalData = data.filter((item) => item !== null)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      // Merge carefully: local user + server response + newly uploaded profiles
      const response = await HttpService("put", host, url, { ...user, customerProfiles: finalData }, header, setLoader)
      const updatedUser = { ...user, ...response, customerProfiles: finalData, verified: false }

      // Update local storage and context BEFORE validation to be safe
      await AsyncStorage.setItem("Sesion", JSON.stringify(updatedUser))
      setUser(updatedUser)

      const validate = await OnboardingValidate(updatedUser, navigation, setUser, {
        longitude: updatedUser.postionX,
        latitude: updatedUser.postionY
      }, { TokenAuthApi, SesionToken })

      if (!validate) return

      navigation.replace("Home");
    } catch (error: any) {
      console.error("Error sending images:", error)
      if (error && error?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setIsUploading(false)
      setLoader(false)
    }
  }

  useEffect(() => {
    // Priority 1: params (usually from navigation)
    if (params?.customerProfile?.length) {
      const initialPhotos = new Array(6).fill(null)
      params.customerProfile.forEach((profile, index) => {
        if (index < 6) {
          initialPhotos[index] = PhotoTransform((profile as any).link || (profile as any).s3url)
        }
      })
      setPhotos(initialPhotos)
    }
    // Priority 2: global user state (important for onboarding flow)
    else if (user?.customerProfiles?.length) {
      const initialPhotos = new Array(6).fill(null)
      user.customerProfiles.forEach((profile, index) => {
        if (index < 6) {
          initialPhotos[index] = PhotoTransform((profile as any).link || (profile as any).s3url)
        }
      })
      setPhotos(initialPhotos)
    }
  }, [params, user?.customerProfiles])

  // Determine if a specific photo slot can be edited
  const canEditPhoto = (index: number) => {
    // First photo can always be edited
    if (index === 0) return true

    // Other photos can only be edited if the previous one exists
    return photos[index - 1] !== null
  }

  return (
    <ScreenContainer backgroundColor={Colors.white} disabledPaddingBottom={true}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {params && (
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome6 name="arrow-left" size={24} color="black" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.titleContainer}>
          <Text style={[font.Bold, styles.headerText]}>
            Mis Fotos
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await logOut();
              navigation.navigate("Prelogin");
            }}
          >
            <MaterialIcons name="logout" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mainContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          style={{ flex: 1 }}
        >
          {/* Header Info */}
          <View style={styles.introSection}>
            <Text style={[font.Bold, styles.introTitle]}>
              Carga algunas imágenes para que te conozcan un poco más.
            </Text>

            <View style={styles.statsContainer}>
              <Text style={[font.Regular, styles.statsText]}>
                {loadedPhotoCount}/6 fotos cargadas
              </Text>
              <View style={[styles.badge, { backgroundColor: hasMinimumPhotos ? "#e8f5e9" : "#fff8e1" }]}>
                <Text style={[font.Bold, styles.badgeText, { color: hasMinimumPhotos ? "#2e7d32" : "#f57f17" }]}>
                  {hasMinimumPhotos ? "Mínimo alcanzado" : "Mínimo: 3 fotos"}
                </Text>
              </View>
            </View>
          </View>

          {/* Photo Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.row}>
              {[0, 1, 2].map((index) => (
                <View
                  key={`photo-${index}`}
                  style={[styles.photoSlot, { borderColor: photos[index] ? Colors.primary : "#e0e0e0" }]}
                >
                  {photos[index]?.uri ? (
                    <View style={styles.photoWrapper}>
                      <Image source={{ uri: photos[index]?.uri }} style={styles.photoImage} />
                      <TouchableOpacity
                        onPress={() => deletePhoto(index)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => canEditPhoto(index) && openPhotoSourceDialog(index)}
                      style={[styles.emptySlot, { backgroundColor: !canEditPhoto(index) ? "#f5f5f5" : "#fafafa" }]}
                      disabled={!canEditPhoto(index)}
                    >
                      {canEditPhoto(index) ? (
                        <Entypo name="plus" size={28} color={Colors.secondary} />
                      ) : (
                        <MaterialIcons name="lock" size={24} color="#bdbdbd" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.row}>
              {[3, 4, 5].map((index) => (
                <View
                  key={`photo-${index}`}
                  style={[styles.photoSlot, { borderColor: photos[index] ? Colors.primary : "#e0e0e0" }]}
                >
                  {photos[index]?.uri ? (
                    <View style={styles.photoWrapper}>
                      <Image source={{ uri: photos[index]?.uri }} style={styles.photoImage} />
                      <TouchableOpacity
                        onPress={() => deletePhoto(index)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => canEditPhoto(index) && openPhotoSourceDialog(index)}
                      style={[styles.emptySlot, { backgroundColor: !canEditPhoto(index) ? "#f5f5f5" : "#fafafa" }]}
                      disabled={!canEditPhoto(index)}
                    >
                      {canEditPhoto(index) ? (
                        <Entypo name="plus" size={28} color={Colors.secondary} />
                      ) : (
                        <MaterialIcons name="lock" size={24} color="#bdbdbd" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Tip */}
          <LinearGradient
            colors={["#f3e5f5", "#ffffff"]}
            style={styles.tipContainer}
          >
            <View style={styles.tipHeader}>
              <MaterialIcons name="lightbulb" size={20} color={Colors.primary} />
              <Text style={[font.Bold, styles.tipTitleText]}>Consejo</Text>
            </View>
            <Text style={[font.Regular, styles.tipBodyText]}>
              Carga tu mejor foto para que tengas más posibilidades de chancear.
            </Text>
          </LinearGradient>

          {/* Actions */}
          <View style={styles.actionSection}>
            {isUploading ? (
              <View style={styles.uploadingButton}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[font.SemiBold, styles.uploadingText]}>
                  Subiendo... {uploadProgress}%
                </Text>
              </View>
            ) : (
              <Button
                text={!params ? "Siguiente" : "Guardar"}
                disabled={!hasMinimumPhotos}
                onPress={sendImages}
              />
            )}
          </View>
        </ScrollView>
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
  headerLeft: {
    width: 44,
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButtonStyle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  mainContent: {
    flex: 1,
    maxWidth: Platform.OS === "web" ? 500 : "100%",
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  introSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  introTitle: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.secondary,
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
  },
  badge: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
  },
  gridContainer: {
    width: '100%',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  photoSlot: {
    width: "31%",
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  photoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(235, 64, 52, 0.9)",
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deleteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptySlot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f3e5f5",
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitleText: {
    marginLeft: 8,
    color: Colors.secondary,
    fontSize: 14,
  },
  tipBodyText: {
    color: "#444",
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  uploadingButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    minWidth: 200,
  },
  uploadingText: {
    color: 'white',
    marginLeft: 12,
  },
});

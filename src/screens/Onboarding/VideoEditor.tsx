"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useVideoPlayer, VideoView } from "expo-video"
import * as ImagePicker from "expo-image-picker"
import NativeVideoTrim, { showEditor, isValidFile, type Spec } from "react-native-video-trim"
import { Video } from "react-native-compressor"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../context"
import { GetHeader } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useNavigation } from "@react-navigation/native"
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { NativeEventEmitter, NativeModules } from 'react-native';
import Button from "../../components/ButtonComponent/Button"
import { FontAwesome6 } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"

interface File {
  uri: string
  type: any
  name: string
}

export default function VideoEditorDemo() {
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth()
  const [videoUri, setVideoUri] = useState<string | null>(null)
  const [videoData, setVideoData] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [status, setStatus] = useState("Listo para comenzar")
  const [outputPath, setOutputPath] = useState<string | null>(null)
  const [compressedPath, setCompressedPath] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [showFinalPreview, setShowFinalPreview] = useState(false)

  const listeners = useRef<Record<string, any>>({})

  const player = useVideoPlayer(videoUri || "", (player) => {
    player.loop = false
    player.pause()
  })

  const compressedPlayer = useVideoPlayer(compressedPath || "", (player) => {
    player.loop = true
    player.pause()
  })

  const getVideo = (file: ImagePicker.ImagePickerAsset | null, uri: string): File | null => {
    if (!file) return null

    const name = file.uri.split("/")

    const data: File = {
      uri: uri,
      type: file.type,
      name: file.uri.split("/")[name.length - 1],
    }
    return data
  }

  const getPresignedUrl = async (fileName: string) => {
    try {
      const host = process.env.APP_BASE_API
      const url: string = `/api/generate-presigned-url/${fileName}/${SesionToken}`
      const headers = GetHeader(TokenAuthApi, "multipart/form-data")
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

  const createObjSend = async (data: File): Promise<string> => {
    const urlS3 = await getPresignedUrl(data.name)
    const imgData = await uploadToS3(data, urlS3 as string)

    return imgData
  }

  useEffect(() => {



    listeners.current.onFinishTrimming = (NativeVideoTrim as Spec).onFinishTrimming(
      ({ outputPath, startTime, endTime, duration }) => {
        console.log("[v0] Trim finished:", { outputPath, startTime, endTime, duration })
        setOutputPath(outputPath)
        setStatus("¡Video recortado exitosamente!")
        setIsProcessing(false)

        if (player) {
          player.replace(outputPath)
        }
      },
    )

    listeners.current.onError = (NativeVideoTrim as Spec).onError(({ message, errorCode }) => {
      console.log("[v0] Trim error:", message, errorCode)
      setStatus(`Error al recortar: ${message}`)
      setIsProcessing(false)
      navigation.goBack()
    })


    return () => {
      listeners.current.onFinishTrimming?.remove()
      listeners.current.onError?.remove()
      listeners.current.onStartTrimming?.remove()
      listeners.current.onCancelTrimming?.remove()
      listeners.current = {}
    }
  }, [player])

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
      preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
      allowsEditing: false,
      quality: 1,
    })

    console.log(result, "result")
    if (result.canceled) {

      navigation.goBack()

    }

    if (!result.canceled) {
      if (!result.assets) return
      const uri = result.assets[0].uri
      setVideoUri(uri)
      setVideoData(result.assets[0])
      setStatus("Video seleccionado - Presiona 'Abrir Editor' para recortar")
      setOutputPath(null)
      setCompressedPath(null)
      setIsPlaying(false)
      setShowFinalPreview(false)

      if (player) {
        player.replace(uri)
      }
    }
  }

  const openEditor = async () => {
    if (!videoUri) {
      setStatus("Primero selecciona un video")
      return
    }

    const isValid = await isValidFile(videoUri)
    if (!isValid) {
      setStatus("Archivo de video inválido")
      return
    }

    setIsProcessing(true)
    setStatus("Abriendo editor...")

    console.log(videoUri)

    showEditor(videoUri, {
      maxDuration: 10,
      saveToPhoto: false,
      openShareSheetOnFinish: false,
      headerText: "Recortar Video",
      trimmingText: "Recortando video...",
      saveDialogConfirmText: "Guardar",
      saveDialogCancelText: "Cancelar",
      saveDialogTitle: "Guardar video",
      saveDialogMessage: "¿Deseas guardar el video?",
      saveButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      cancelDialogCancelText: "No",
      cancelDialogConfirmText: "Sí",
      cancelDialogTitle: "Cancelar Video",
      cancelDialogMessage: "¿Estás seguro de que deseas cancelar? Se perderán los cambios."
    })
  }

  const compressVideo = async () => {
    if (!outputPath) {
      setStatus("Primero recorta el video")
      return
    }

    setIsCompressing(true)
    setStatus("Comprimiendo video...")
    setCompressionProgress(0)

    try {
      const result = await Video.compress(
        outputPath,
        {
          compressionMethod: "auto",
        },
        (progress) => {
          setCompressionProgress(Math.round(progress * 100))
        },
      )

      setStatus("¡Video comprimido subido!")
      setIsCompressing(false)
      setCompressionProgress(0)
      setShowFinalPreview(true)
      const video = getVideo(videoData, result)
      if (video) {
        const urlVideo = await createObjSend(video)

        setCompressedPath(urlVideo)
        const host = process.env.APP_BASE_API
        const url = `/api/appchancea/customers/video`
        const header = await GetHeader(TokenAuthApi, "application/json")
        if (!user) return
        await HttpService("put", host, url, {
          "sessionToken": SesionToken,
          "srcVideo": urlVideo
        }, header)

        setUser({ ...user, srcVideo: urlVideo })
        await AsyncStorage.setItem("Sesion", JSON.stringify({ ...user, srcVideo: urlVideo }))

      }
    } catch (e: any) {
      setStatus("Error al comprimir: " + e.message)
      setIsCompressing(false)
      setCompressionProgress(0)
    }
  }

  const togglePlayPause = () => {
    if (!player) return

    if (isPlaying) {
      player.pause()
      setIsPlaying(false)
    } else {
      player.play()
      setIsPlaying(true)
    }
  }

  const toggleCompressedPlayPause = () => {
    if (!compressedPlayer) return

    if (isPlaying) {
      compressedPlayer.pause()
      setIsPlaying(false)
    } else {
      compressedPlayer.play()
      setIsPlaying(true)
    }
  }

  const backToEditing = () => {
    setShowFinalPreview(false)
    setIsPlaying(false)
    if (compressedPlayer) {
      compressedPlayer.pause()
    }
  }

  useEffect(() => {
    pickVideo()
  }, [])
  useEffect(() => {
    if (videoUri) openEditor()
  }, [videoUri])
  useEffect(() => {
    if (outputPath) compressVideo()
  }, [outputPath])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#0a0a0a", "#1a1a1a"]} style={styles.gradient}>
        <View className=" px-5 py-2  items-start ">
          <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
            <FontAwesome6 name="arrow-left" size={28} color="white" />
          </TouchableOpacity>
        </View>
        {showFinalPreview && compressedPath ? (
          <>
            <View style={styles.videoContainer}>
              <VideoView player={compressedPlayer} style={styles.video} nativeControls={true} contentFit="contain" />

              <View style={styles.finalPreviewBadge}>
                <Text style={styles.finalPreviewText}>✓ Video Listo</Text>
              </View>
            </View>

            <View style={styles.controlPanel}>


              <View style={styles.buttonContainer}>

                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
                  <Text style={styles.primaryButtonText}>Listo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.videoContainer}>
              <VideoView player={player} style={styles.video} nativeControls={false} contentFit="contain" />

              <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
                <View style={styles.playPauseCircle}>
                  <Text style={styles.playPauseIcon}>{isPlaying ? "⏸" : "▶"}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.controlPanel}>


              {isCompressing && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${compressionProgress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{compressionProgress}%</Text>
                </View>
              )}

              {compressedPath && (
                <View style={styles.outputContainer}>
                  <Text style={styles.outputTitle}>Video listo para subir</Text>
                  <Text style={styles.outputPath} numberOfLines={1}>
                    {compressedPath}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playPauseButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -40 }, { translateY: -40 }],
  },
  playPauseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139, 92, 246, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  playPauseIcon: {
    fontSize: 32,
    color: "#fff",
  },
  finalPreviewBadge: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  finalPreviewText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  finalPreviewInfo: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
  },
  finalPreviewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  controlPanel: {
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  editorSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#aaa",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#333",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#8b5cf6",
    textAlign: "center",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  compressButton: {
    backgroundColor: "#10b981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  compressButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  outputContainer: {
    backgroundColor: "#1a3a1a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a5a2a",
    marginBottom: 12,
  },
  outputTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ade80",
    marginBottom: 4,
  },
  outputPath: {
    fontSize: 12,
    color: "#888",
  },
})

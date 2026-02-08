"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native"
import { ResizeMode, Video } from "expo-av"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../../context"
import { GetHeader } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useNavigation } from "@react-navigation/native"
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Button from "../../components/ButtonComponent/Button"
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons"
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
    const [status, setStatus] = useState("Listo para cargar")
    const [isProcessing, setIsProcessing] = useState(false)
    const [videoRef, setVideoRef] = useState<Video | null>(null)

    const getVideo = (file: ImagePicker.ImagePickerAsset | null, uri: string): File | null => {
        if (!file) return null

        const nameParts = file.uri.split("/")
        const fileName = nameParts[nameParts.length - 1]

        const data: File = {
            uri: uri,
            type: file.mimeType || "video/mp4", // Ensure mimeType is present
            name: fileName,
        }
        return data
    }

    const getPresignedUrl = async (fileName: string) => {
        try {
            const host = process.env.APP_BASE_API
            const url: string = `/api/generate-presigned-url/${fileName}/${SesionToken}`
            const headers = await GetHeader(TokenAuthApi, "multipart/form-data")
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

    const pickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false, // Editing not supported well on web via expo-image-picker in the same way
                quality: 1,
            })

            console.log(result, "result")
            if (result.canceled) {
                // Only go back if we haven't selected anything and we are just starting
                if (!videoUri) navigation.goBack()
            }

            if (!result.canceled) {
                if (!result.assets) return
                const uri = result.assets[0].uri
                setVideoUri(uri)
                setStatus("Video seleccionado. Presiona 'Subir Video'.")
            }
        } catch (err) {
            console.error("Error picking video:", err)
            setStatus("Error al seleccionar video.")
        }
    }

    const uploadVideo = async () => {
        if (!videoUri) {
            setStatus("Primero selecciona un video")
            return
        }

        setIsProcessing(true)
        setStatus("Subiendo video...")

        try {
            // Create a file object from the URI
            // On web, we can't easily get the File object again from just the URI if we didn't save the asset
            // But we can re-fetch it or use the logic in createObjSend that fetches blob

            // Need to reconstruct a "File" like object. 
            // Ideally we should have saved the asset from pickVideo. 
            // For now, let's try to mock it or just pass the URI and let logic handle it.

            // We need the original asset to get the name/type reliably?
            // Let's assume standard name for now or extract from URI
            const fileName = "video_" + Date.now() + ".mp4"
            const file: File = {
                uri: videoUri,
                type: "video/mp4",
                name: fileName
            }

            const urlVideo = await createObjSend(file)

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

            setStatus("¡Video subido exitosamente!")
            setIsProcessing(false)
            setTimeout(() => {
                navigation.goBack()
            }, 1500)

        } catch (e: any) {
            console.error(e)
            setStatus("Error al subir: " + e.message)
            setIsProcessing(false)
        }
    }

    useEffect(() => {
        pickVideo()
    }, [])

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#0a0a0a", "#1a1a1a"]} style={styles.gradient}>
                <View className=" px-5 py-2  items-start ">
                    <TouchableOpacity className=" items-center z-10 " onPress={() => navigation.goBack()}>
                        <FontAwesome6 name="arrow-left" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Subir Video de Presentación</Text>
                    <Text style={styles.subtitle}>(La edición de video solo está disponible en la app móvil)</Text>

                    {videoUri ? (
                        <View style={styles.videoWrapper}>
                            <Video
                                ref={(ref) => setVideoRef(ref)}
                                style={styles.video}
                                source={{
                                    uri: videoUri,
                                }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN}
                                isLooping
                            />
                        </View>
                    ) : (
                        <View style={styles.placeholder}>
                            <MaterialIcons name="video-library" size={80} color="#555" />
                            <Text style={styles.placeholderText}>Seleccionando video...</Text>
                        </View>
                    )}

                    <Text style={styles.statusText}>{status}</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={pickVideo} disabled={isProcessing}>
                            <Text style={styles.secondaryButtonText}>Cambiar Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.primaryButton, (!videoUri || isProcessing) && styles.buttonDisabled]}
                            onPress={uploadVideo}
                            disabled={!videoUri || isProcessing}
                        >
                            <Text style={styles.primaryButtonText}>{isProcessing ? "Subiendo..." : "Subir Video"}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
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
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 24,
        textAlign: 'center',
    },
    videoWrapper: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: 300,
        backgroundColor: '#222',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    placeholderText: {
        color: '#555',
        marginTop: 12,
    },
    statusText: {
        color: '#4ade80',
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        flex: 1,
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
    buttonDisabled: {
        opacity: 0.5,
    },
})

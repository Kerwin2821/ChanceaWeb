import type React from "react"
import { useEffect, useState } from "react"
import { View, ActivityIndicator, Text, StyleSheet, Platform } from "react-native"
import { Video, ResizeMode } from "expo-av"
import * as FileSystem from "expo-file-system"
import { Colors } from "../../utils"
import { useRender } from "../../context"
import { height, width } from "../../utils/Helpers"

interface CachedVideoPlayerProps {
    url: string
    fileName: string,
    isFocus: boolean
}

const CachedVideoPlayer: React.FC<CachedVideoPlayerProps> = ({ url, fileName, isFocus }) => {
    const { soundVideo } = useRender()
    const [videoPath, setVideoPath] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchVideo = async () => {
            if (Platform.OS === 'web') {
                setVideoPath(url);
                setLoading(false);
                return;
            }
            setLoading(true)
            setError(null)

            try {
                const path = `${FileSystem.cacheDirectory}${fileName}`
                const fileInfo = await FileSystem.getInfoAsync(path)

                if (!fileInfo.exists) {
                    await FileSystem.downloadAsync(url, path)
                } else {
                }

                setVideoPath(path)
            } catch (err) {
                console.error("Error downloading video:", err)
                setError("Error al cargar el video")
            } finally {
                setLoading(false)
            }
        }

        fetchVideo()
    }, [url, fileName])

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )
    }

    return (
        <View style={{ height: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", justifyContent: 'center', alignItems: 'center' }} >
            <Video
                source={{ uri: videoPath || "" }}
                style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, bottom: 0, right: 0 }}
                useNativeControls={false}
                resizeMode={ResizeMode.COVER}
                isLooping
                isMuted={!soundVideo}
                shouldPlay={isFocus}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
    errorText: {
        fontSize: 16,
        color: "#ff0000",
        textAlign: "center",
    },
    video: {
        width: "100%",
        height: 200,
    },
})

export default CachedVideoPlayer

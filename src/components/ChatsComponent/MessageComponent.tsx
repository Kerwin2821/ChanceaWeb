import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { chatStyles } from "../../../styles";
import { Mensaje } from "../../context/ChatContext/ChatInterface";
import { UserData } from "../../context/AuthContext/AuthInterface";
import moment from "moment";
import { Audio } from "expo-av";

const AudioMessage = ({ uri, isFromOtherUser }: { uri: string, isFromOtherUser: boolean }) => {
    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playSound = async () => {
        try {
            if (sound) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                setIsLoading(true);
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                });
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);
                setIsLoading(false);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                        newSound.setPositionAsync(0);
                    }
                });
            }
        } catch (error) {
            console.error("Error playing sound", error);
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 5, minWidth: 100 }}>
            <TouchableOpacity
                onPress={playSound}
                style={{
                    backgroundColor: isFromOtherUser ? '#e0e0e0' : 'white',
                    borderRadius: 20,
                    padding: 8,
                }}
            >
                {isLoading ? (
                    <ActivityIndicator color={isFromOtherUser ? "black" : "#6b46c1"} size="small" />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={24}
                        color={isFromOtherUser ? "black" : "#6b46c1"}
                    />
                )}
            </TouchableOpacity>
            <View style={{ marginLeft: 8, height: 2, flex: 1, backgroundColor: isFromOtherUser ? '#bdbdbd' : '#d8b4fe', minWidth: 50 }} />
            <Text style={{ marginLeft: 8, fontSize: 10, color: '#666' }}>Audio</Text>
        </View>
    );
};

export default function MessageComponent({ item, user }: { item: Mensaje; user: UserData | null }) {
    const isFromOtherUser = item.userId.toString() !== user?.id.toString();

    const fecha = useMemo(() => {
        if (item.fecha?.seconds) {
            return moment.unix(item.fecha.seconds).format("DD/MM/YYYY h:mm A");
        }
        if (item.fecha) {
            return moment(item.fecha).format("DD/MM/YYYY h:mm A");
        }
        return "Fecha desconocida";
    }, [item.fecha]);

    const isMissedCall = item.mensaje === "Llamada perdida";

    return (
        <View className={isFromOtherUser ? "ml-3" : "mr-3"}>
            <View
                style={
                    isFromOtherUser
                        ? chatStyles.mmessageWrapper
                        : [chatStyles.mmessageWrapper, { alignItems: "flex-end" }]
                }
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                        style={
                            isFromOtherUser
                                ? chatStyles.mmessage
                                : [chatStyles.mmessage, { backgroundColor: "rgb(194, 243, 194)" }]
                        }
                    >
                        {item.tipoMensaje === 'audio' ? (
                            <AudioMessage uri={item.mensaje} isFromOtherUser={isFromOtherUser} />
                        ) : isMissedCall ? (
                            <View
                                style={{
                                    backgroundColor: "#fef3f2",  // fondo suave rosado
                                    borderColor: "#f87171",       // borde rojo pastel
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    padding: 10,
                                    maxWidth: 250,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <Ionicons name="call-outline" size={22} color="#dc2626" />
                                <View style={{ flexShrink: 1 }}>
                                    <Text
                                        style={{
                                            color: "#b91c1c",       // texto principal rojo fuerte
                                            fontWeight: "bold",
                                            fontSize: 14,
                                        }}
                                    >
                                        Llamada perdida
                                    </Text>
                                    <Text style={{ color: "#7f1d1d", fontSize: 12 }}>
                                        Parece que no pudiste contestar esta llamada.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text>{item.mensaje}</Text>
                        )}
                    </View>
                </View>
                <Text style={{ textAlign: "left", fontSize: 10, marginTop: 3 }}>{fecha}</Text>
            </View>
        </View>
    );
}

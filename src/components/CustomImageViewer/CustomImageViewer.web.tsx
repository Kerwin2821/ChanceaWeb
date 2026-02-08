import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Dialog } from "@rn-vui/themed";
import { Image } from "expo-image";
import { Colors } from "../../utils";
import { font } from "../../../styles";

interface CustomImageViewerProps {
    images: { uri: string }[];
    imageIndex: number;
    visible: boolean;
    onRequestClose: () => void;
    FooterComponent?: (props: { imageIndex: number }) => React.ReactElement | null;
}

const CustomImageViewer = ({
    images,
    imageIndex,
    visible,
    onRequestClose,
    FooterComponent,
}: CustomImageViewerProps) => {
    const [loading, setLoading] = useState(true);

    const imageURl = useMemo(() => {
        const url = images[imageIndex]?.uri;
        if (!url) return null;
        // Apply CloudFront replacement similar to CacheImage
        return url.replace(process.env.AWS_STORAGE as string, process.env.CLOUDFRONT as string);
    }, [images, imageIndex]);

    if (!visible) return null;

    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onRequestClose}
            overlayStyle={styles.overlay}
        >
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeButton} onPress={onRequestClose}>
                    <Text style={[font.Bold, styles.closeText]}>✕</Text>
                </TouchableOpacity>

                <View style={styles.imageContainer}>
                    {imageURl ? (
                        <>
                            {loading && (
                                <ActivityIndicator
                                    size="large"
                                    color={Colors.primary}
                                    style={styles.loader}
                                />
                            )}
                            <Image
                                source={{ uri: imageURl }}
                                style={styles.image as any}
                                contentFit="contain"
                                onLoadStart={() => setLoading(true)}
                                onLoadEnd={() => setLoading(false)}
                            />
                        </>
                    ) : (
                        <Text style={[font.Regular, { color: "white" }]}>Imagen no disponible</Text>
                    )}
                </View>

                {FooterComponent && (
                    <View style={styles.footer}>
                        <FooterComponent imageIndex={imageIndex} />
                    </View>
                )}
            </View>
        </Dialog>
    );
};

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: "rgba(0,0,0,0.9)",
        width: "100%",
        height: "100%",
        padding: 0,
        margin: 0,
        justifyContent: "center",
        alignItems: "center",
        // Use string values for web
        maxWidth: '100vw' as any,
        maxHeight: '100vh' as any,
        borderRadius: 0,
    },
    container: {
        flex: 1,
        width: "100vw" as any,
        height: "100vh" as any,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 100,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeText: {
        color: "white",
        fontSize: 24,
    },
    imageContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "90%",
        height: "90%",
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        alignItems: "center",
    },
});

export default CustomImageViewer;

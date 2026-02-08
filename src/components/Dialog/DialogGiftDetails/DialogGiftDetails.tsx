import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    Pressable,
    ScrollView,
    Dimensions,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { Dialog } from "@rn-vui/themed";
import { FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { font } from "../../../../styles";
import { Colors } from "../../../utils";
import { useAuth, useRender } from "../../../context";
import { HttpService } from "../../../services";
import { GetHeader } from "../../../utils/Helpers";
import { AxiosError } from "axios";
import { useStore } from "../../../context/storeContext/StoreState";
import { Skeleton } from "@rn-vui/themed";
import { LinearGradient } from "expo-linear-gradient";
import CacheImage from "../../CacheImage/CacheImage";
import Button from "../../ButtonComponent/Button";
import { GiftData, TipoDeRegalo, EstadoRegalos } from "../../../screens/Regalos/interface.regalos";
import { Product, ProductData } from "../../../utils/Date.interface";
import CustomImageViewer from "../../CustomImageViewer";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";

const { width, height } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    data: GiftData | null;
    tipo: TipoDeRegalo | null;
};

const DialogGiftDetails = ({ visible, onClose, data, tipo }: Props) => {
    const { TokenAuthApi, SesionToken, user } = useAuth();
    const { setLoader } = useRender();
    const navigation = useNavigation<NavigationScreenNavigationType>();
    const { RegalosEnviadas, RegalosRecibidas } = useStore();
    const [estatus, setEstatus] = useState<EstadoRegalos | undefined>();
    const [imageViewerVisible, setImageViewerVisible] = useState(false);

    useEffect(() => {
        if (visible && data) {
            if (data.statusGif) {
                setEstatus(data.statusGif);
            }
            const Recb = RegalosRecibidas.find((e) => e.id == data.id);
            const Envi = RegalosEnviadas.find((e) => e.id == data.id);
            if (Recb) setEstatus(Recb.statusGif);
            else if (Envi) setEstatus(Envi.statusGif);
        }
    }, [visible, data, RegalosRecibidas, RegalosEnviadas]);

    // Don't return null if visible is true, render the Dialog but check data inside
    const hasData = data && tipo;

    const renderActionButtons = () => {
        if (!hasData) return null;
        const giftData = data as GiftData;

        switch (estatus) {
            case "PAGADO":
                if (tipo === "ENVIADA") {
                    return (
                        <View style={styles.actionContainer}>
                            <Button text={"Pagado"} disabled styleButton={{ backgroundColor: Colors.green, opacity: 0.7 }} />
                        </View>
                    );
                }
                break;
            case "POR_PAGAR":
                if (giftData.customerSource.id === user?.id) {
                    return (
                        <View style={styles.actionContainer}>
                            <Button
                                styleButton={{ backgroundColor: Colors.green }}
                                text={"Pagar Ahora"}
                                onPress={() => {
                                    onClose();
                                    navigation.navigate("PagoMovilPaymentRegalos", {
                                        box: giftData.boxPackage,
                                        gif: {
                                            customerDestinationId: giftData.customerDestination.id,
                                            message: giftData.message,
                                            gif: giftData
                                        }
                                    });
                                }}
                            />
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.actionContainer}>
                            <Button text={"Pendiente de Pago"} disabled styleButton={{ opacity: 0.6 }} />
                        </View>
                    );
                }
            case "EN_PROCESO":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.blue }} text={"En Proceso"} disabled />
                    </View>
                );
            case "CANCELADO":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.danger }} text={"Cancelado"} disabled />
                    </View>
                );
            case "ENTREGADO":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.secondary }} text={"¡Entregado!"} disabled />
                    </View>
                );
            case "ENVIADO":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.blue }} text={"Enviado"} disabled />
                    </View>
                );
            default:
                return null;
        }
        return null;
    };

    const senderName = hasData ? (data as GiftData).customerSource?.firstName?.split(" ")[0] || "Alguien" : "";
    const receiverName = hasData ? (data as GiftData).customerDestination?.firstName?.split(" ")[0] || "Alguien" : "";
    const senderPhoto = hasData ? ((data as GiftData).customerSource as any)?.customerProfiles?.[0]?.link : null;
    const receiverPhoto = hasData ? ((data as GiftData).customerDestination as any)?.customerProfiles?.[0]?.link : null;

    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            overlayStyle={styles.overlay}
            backdropStyle={styles.backdrop}
        >
            <View style={styles.container}>
                {hasData ? (
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[font.Bold, styles.headerTitle]}>Detalles del Regalo</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color={Colors.grayDark} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            style={{ flex: 1, minHeight: 300 }}
                        >
                            {/* Avatars and Message */}
                            <View style={styles.usersSection}>
                                <View style={styles.avatarsWrapper}>
                                    <View style={[styles.avatarContainer, { zIndex: 2 }]}>
                                        <CacheImage
                                            source={{ uri: (data as GiftData).customerSource?.customerProfiles?.[0]?.link }}
                                            styleImage={styles.avatar}
                                        />
                                        <View style={styles.avatarLabel}>
                                            <Text style={[font.Bold, styles.avatarLabelText]}>De</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.avatarContainer, { marginLeft: -15, zIndex: 1 }]}>
                                        <CacheImage
                                            source={{ uri: (data as GiftData).customerDestination?.customerProfiles?.[0]?.link }}
                                            styleImage={styles.avatar}
                                        />
                                        <View style={styles.avatarLabel}>
                                            <Text style={[font.Bold, styles.avatarLabelText]}>Para</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.messageBox}>
                                    <Text style={[font.Bold, styles.dedicationText]}>
                                        {tipo === "RECIBIDA"
                                            ? `${(data as GiftData).customerSource?.firstName?.split(" ")[0] || "Alguien"} te dedicó:`
                                            : `Le dedicaste a ${(data as GiftData).customerDestination?.firstName?.split(" ")[0] || "alguien"}:`}
                                    </Text>
                                    <Text style={[font.Regular, styles.messageText]}>
                                        "{(data as GiftData).message || "Sin mensaje adicional"}"
                                    </Text>
                                </View>
                            </View>

                            {/* Gift Box Section */}
                            <View style={styles.giftSection}>
                                <View style={styles.sectionTitleRow}>
                                    <FontAwesome5 name="gift" size={18} color={Colors.primary} />
                                    <Text style={[font.Bold, styles.sectionTitle]}>Contenido del Detalle</Text>
                                </View>

                                <View style={styles.boxInfoCard}>
                                    <TouchableOpacity
                                        style={styles.boxImageContainer}
                                        onPress={() => setImageViewerVisible(true)}
                                    >
                                        <CacheImage
                                            source={{ uri: (data as GiftData).boxPackage.imagenUrl }}
                                            styleImage={styles.boxImage}
                                        />
                                        <View style={styles.zoomIcon}>
                                            <MaterialIcons name="zoom-out-map" size={16} color="white" />
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.boxDetails}>
                                        <Text style={[font.Bold, styles.boxName]} numberOfLines={2}>
                                            {(data as GiftData).boxPackage.nombre}
                                        </Text>
                                        <BoxComposition BoxId={(data as GiftData).boxPackage.id} />
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={styles.footer}>
                                {renderActionButtons()}
                            </View>
                        </ScrollView>
                    </>
                ) : (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.primary} size="large" />
                    </View>
                )}
            </View>

            {hasData && (
                <CustomImageViewer
                    images={[{ uri: (data as GiftData).boxPackage.imagenUrl }]}
                    imageIndex={0}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
            )}
        </Dialog>
    );
};

const BoxComposition = ({ BoxId }: { BoxId: number }) => {
    const { TokenAuthApi, SesionToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const host = process.env.APP_BASE_API;
                const url = `/api/appchancea/box-package-products/${SesionToken}?boxPackageId.equals=${BoxId}&page=0&size=20&sessionToken=${SesionToken}`;
                const header = await GetHeader(TokenAuthApi, "application/json");
                const response: ProductData[] = await HttpService("get", host, url, {}, header);
                setProducts(response.map((e) => e.product));
            } catch (err) {
                console.log(err, "GetBoxProduc");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [BoxId]);

    if (loading) {
        return (
            <View style={{ marginTop: 5 }}>
                <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={120} height={12} style={{ marginBottom: 4 }} />
                <Skeleton LinearGradientComponent={LinearGradient} animation="wave" width={100} height={12} />
            </View>
        );
    }

    return (
        <View style={styles.productsList}>
            {products.map((p, idx) => (
                <View key={idx} style={styles.productItem}>
                    <View style={styles.dot} />
                    <Text style={[font.Regular, styles.productName]} numberOfLines={1}>{p.name}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        borderRadius: 24,
        width: Math.min(width * 0.9, 450),
        maxHeight: height * 0.8,
        padding: 0,
        backgroundColor: Colors.white,
        overflow: 'hidden',
    },
    backdrop: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
    },
    container: {
        flex: 1,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 18,
        color: Colors.grayDark,
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
        paddingTop: 10,
        flexGrow: 1,
    },
    usersSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: Colors.white,
        backgroundColor: Colors.gray,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
    },
    avatarLabel: {
        position: 'absolute',
        bottom: -5,
        alignSelf: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    avatarLabelText: {
        color: Colors.white,
        fontSize: 10,
        textTransform: 'uppercase',
    },
    messageBox: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    dedicationText: {
        fontSize: 14,
        color: Colors.primary,
        marginBottom: 6,
    },
    messageText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        fontStyle: 'italic',
    },
    giftSection: {
        marginBottom: 24,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        color: Colors.grayDark,
        marginLeft: 8,
    },
    boxInfoCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    boxImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    boxImage: {
        width: '100%',
        height: '100%',
    },
    zoomIcon: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 10,
        padding: 2,
    },
    boxDetails: {
        flex: 1,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    boxName: {
        fontSize: 16,
        color: Colors.grayDark,
        marginBottom: 4,
    },
    productsList: {
        marginTop: 4,
    },
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
        marginRight: 6,
    },
    productName: {
        fontSize: 12,
        color: Colors.gray,
    },
    footer: {
        marginTop: 10,
    },
    actionContainer: {
        width: '100%',
    },
});

export default DialogGiftDetails;

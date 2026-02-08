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
import { Entypo, FontAwesome, FontAwesome5, FontAwesome6, MaterialIcons } from "@expo/vector-icons";
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
import { Cita, Estado, TipoDeCita, Product, ProductData } from "../../../utils/Date.interface";
import CustomImageViewer from "../../CustomImageViewer";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../../../navigation/StackNavigator";
import moment from "moment";
import { useChat } from "../../../context/ChatContext/ChatProvider";
import DialogDateAccept from "../DialogDateAccept/DialogDateAccept";
import { sendNotification } from "../../../utils/sendNotification";
import { UserData } from "../../../context/AuthContext/AuthInterface";
import { CustomerDestination } from "../../../utils/Date.interface";

const { width, height } = Dimensions.get("window");

type Props = {
    visible: boolean;
    onClose: () => void;
    data: Cita | null;
    tipo: TipoDeCita | null;
};

const DialogDateDetails = ({ visible, onClose, data, tipo }: Props) => {
    const { TokenAuthApi, SesionToken, user } = useAuth();
    const { setLoader } = useRender();
    const { agregarMensajeDesdePerfil } = useChat();
    const navigation = useNavigation<NavigationScreenNavigationType>();
    const { CitasEnviadas, CitasRecibidas, setCitasEnviadas, setCitasRecibidas, setCustomers, Customers } = useStore();
    const [estatus, setEstatus] = useState<Estado | undefined>();
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);

    useEffect(() => {
        if (visible && data) {
            setEstatus(data.statusInvitation);
            const Recb = CitasRecibidas.find((e) => e.id == data.id);
            const Envi = CitasEnviadas.find((e) => e.id == data.id);
            if (Recb) setEstatus(Recb.statusInvitation);
            else if (Envi) setEstatus(Envi.statusInvitation);
        }
    }, [visible, data, CitasRecibidas, CitasEnviadas]);

    const hasData = data && tipo;

    async function UpdateCitas(newStatus: Estado) {
        if (!data) return;
        setLoader(true);
        try {
            const { id, customerDestination, customerSource } = data;
            const host = process.env.APP_BASE_API;
            const url = `/api/appchancea/appchanceaUpdateInvitationsStatus`;
            const header = await GetHeader(TokenAuthApi, "application/json");

            await HttpService(
                "post",
                host,
                url,
                {
                    invitationId: id,
                    tokenSessionId: SesionToken,
                    acceptanceDate: newStatus === "PENDIENTE_DE_PAGO" ? new Date().toISOString() : undefined,
                    statusInvitation: newStatus,
                },
                header
            );

            setEstatus(newStatus);
            NotifiChangeStatusCita(
                newStatus,
                user,
                user?.id === customerDestination.id ? customerSource : customerDestination,
                data,
                SesionToken,
                TokenAuthApi
            );

            if (tipo === "RECIBIDA") {
                // Logic for received invitations view tracking
                const otherPerson = data.customerSource;
                setCustomers(Customers.filter((ele) => ele.id !== otherPerson.id));
                setCitasRecibidas(
                    CitasRecibidas.map((e) => {
                        if (e.id === id) {
                            return {
                                ...e,
                                acceptanceDate: newStatus === "PENDIENTE_DE_PAGO" ? new Date().toISOString() : undefined,
                                statusInvitation: newStatus,
                            };
                        }
                        return e;
                    })
                );
            } else {
                setCitasEnviadas(
                    CitasEnviadas.map((e) => {
                        if (e.id === id) {
                            return { ...e, statusInvitation: newStatus };
                        }
                        return e;
                    })
                );
            }
        } catch (err) {
            console.log(err, "UpdateCitas");
        } finally {
            setLoader(false);
        }
    }

    const renderActionButtons = () => {
        if (!hasData) return null;
        const citaData = data as Cita;

        switch (estatus) {
            case "ENVIADA":
                if (tipo === "ENVIADA") {
                    return (
                        <View style={styles.actionContainer}>
                            <Button text={"Pendiente"} disabled styleButton={{ opacity: 0.7 }} />
                        </View>
                    );
                } else {
                    return (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.declineBtn]}
                                onPress={() => UpdateCitas("RECHAZADA")}
                            >
                                <FontAwesome name="close" size={20} color="white" />
                                <Text style={[font.Bold, styles.btnText]}>No, gracias</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.acceptBtn]}
                                onPress={() => {
                                    setShowAcceptModal(true);
                                    UpdateCitas("PENDIENTE_DE_PAGO");
                                }}
                            >
                                <Entypo name="check" size={20} color="white" />
                                <Text style={[font.Bold, styles.btnText]}>¡Sí, quiero!</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }
            case "PENDIENTE_DE_PAGO":
                if (tipo === "ENVIADA") {
                    return (
                        <View style={styles.actionContainer}>
                            <Button
                                styleButton={{ backgroundColor: Colors.green }}
                                text={"Pagar Ahora"}
                                onPress={() => {
                                    onClose();
                                    navigation.navigate("PagoMovilPaymentCitas", citaData);
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
            case "ACEPTADA":
                return (
                    <View style={styles.actionContainer}>
                        <Button
                            styleButton={{ backgroundColor: Colors.secondary }}
                            text={"Chancear / Chat"}
                            onPress={() => {
                                onClose();
                                agregarMensajeDesdePerfil(
                                    (tipo === "ENVIADA" ? citaData.customerDestination : citaData.customerSource) as any,
                                    navigation
                                );
                            }}
                        />
                    </View>
                );
            case "EN_PROCESO":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.blue }} text={"En Proceso"} disabled />
                    </View>
                );
            case "FINALIZADA":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.green }} text={"Finalizada"} disabled />
                    </View>
                );
            case "VENCIDA":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.grayDark }} text={"Vencida"} disabled />
                    </View>
                );
            case "CANCELADA":
                return (
                    <View style={styles.actionContainer}>
                        <Button styleButton={{ backgroundColor: Colors.danger }} text={"Cancelada"} disabled />
                    </View>
                );
            default:
                return null;
        }
    };

    const senderPhoto = hasData ? ((data as Cita).customerSource as any)?.customerProfiles?.[0]?.link : null;
    const receiverPhoto = hasData ? ((data as Cita).customerDestination as any)?.customerProfiles?.[0]?.link : null;
    const senderName = hasData ? (data as Cita).customerSource?.firstName?.split(" ")[0] || "Alguien" : "";
    const receiverName = hasData ? (data as Cita).customerDestination?.firstName?.split(" ")[0] || "Alguien" : "";

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
                            <Text style={[font.Bold, styles.headerTitle]}>Detalles de la Cita</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color={Colors.grayDark} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContent}
                            style={{ flex: 1, minHeight: 400 }}
                        >
                            {/* Avatars Section */}
                            <View style={styles.usersSection}>
                                <View style={styles.avatarsWrapper}>
                                    <View style={[styles.avatarContainer, { zIndex: 2 }]}>
                                        <CacheImage
                                            source={{ uri: senderPhoto }}
                                            styleImage={styles.avatar}
                                        />
                                        <View style={styles.avatarLabel}>
                                            <Text style={[font.Bold, styles.avatarLabelText]}>De</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.avatarContainer, { marginLeft: -15, zIndex: 1 }]}>
                                        <CacheImage
                                            source={{ uri: receiverPhoto }}
                                            styleImage={styles.avatar}
                                        />
                                        <View style={styles.avatarLabel}>
                                            <Text style={[font.Bold, styles.avatarLabelText]}>Para</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.messageBox}>
                                    <Text style={[font.Bold, styles.dedicationText]}>
                                        {tipo === "RECIBIDA" ? `${senderName} te dice:` : `Le dijiste a ${receiverName}:`}
                                    </Text>
                                    <Text style={[font.Regular, styles.messageText]}>
                                        "{(data as Cita).message || "Sin mensaje adicional"}"
                                    </Text>
                                </View>
                            </View>

                            {/* Store & Date Section */}
                            <View style={styles.infoSection}>
                                <View style={styles.sectionTitleRow}>
                                    <MaterialIcons name="location-on" size={18} color={Colors.primary} />
                                    <Text style={[font.Bold, styles.sectionTitle]}>Lugar y Fecha</Text>
                                </View>

                                <View style={styles.locationCard}>
                                    <TouchableOpacity
                                        style={styles.boxImageContainer}
                                        onPress={() => setImageViewerVisible(true)}
                                    >
                                        <CacheImage
                                            source={{ uri: (data as Cita).boxPackage.imagenUrl }}
                                            styleImage={styles.boxImage}
                                        />
                                        <View style={styles.zoomIcon}>
                                            <MaterialIcons name="zoom-out-map" size={16} color="white" />
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.boxDetails}>
                                        <Text style={[font.Bold, styles.storeName]} numberOfLines={1}>
                                            {(data as any).boxPackage?.storeBusiness?.name || (data as any).boxPackage?.business?.name}
                                        </Text>
                                        <Text style={[font.Regular, styles.packageName]} numberOfLines={1}>
                                            {(data as Cita).boxPackage.nombre}
                                        </Text>
                                        <View style={styles.dateBadge}>
                                            <MaterialIcons name="calendar-today" size={14} color={Colors.primary} />
                                            <Text style={[font.Bold, styles.dateText]}>
                                                {moment((data as Cita).dateTimeInvitation).format("DD/MM/YY hh:mm a")}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Actions Header */}
                            <View style={styles.footer}>
                                {renderActionButtons()}
                            </View>
                        </ScrollView>

                        {showAcceptModal && (
                            <DialogDateAccept
                                active={showAcceptModal}
                                setActive={setShowAcceptModal}
                                data={(tipo === "ENVIADA" ? (data as Cita).customerDestination : (data as Cita).customerSource) as any}
                            />
                        )}
                    </>
                ) : (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator color={Colors.primary} size="large" />
                    </View>
                )}
            </View>

            {hasData && (
                <CustomImageViewer
                    images={[{ uri: (data as Cita).boxPackage.imagenUrl }]}
                    imageIndex={0}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
            )}
        </Dialog>
    );
};

const NotifiChangeStatusCita = (
    Estatus: Estado,
    user: UserData | null,
    userDestination: UserData | CustomerDestination,
    cita: Cita,
    sesionToken: string,
    TokenAuthApi: string
) => {
    let titulo: string;
    let texto: string;

    switch (Estatus) {
        case "ENVIADA":
            titulo = `Cita Enviada`;
            texto = `${user?.firstName.split(" ")[0]} ha enviado una solicitud de cita.`;
            break;
        case "ACEPTADA":
            titulo = `Ha ${user?.firstName.split(" ")[0]} Aceptado tu Cita`;
            texto = `${user?.firstName.split(" ")[0]} ha aceptado la cita.`;
            break;
        case "FINALIZADA":
            titulo = `Ha ${user?.firstName.split(" ")[0]} Finalizado tu Cita`;
            texto = `${user?.firstName.split(" ")[0]} ha finalizado la cita.`;
            break;
        case "PENDIENTE_DE_PAGO":
            titulo = `Ha ${user?.firstName.split(" ")[0]} Aceptada tu Cita `;
            texto = `${user?.firstName.split(" ")[0]} tiene una cita pendiente de pago.`;
            break;
        case "VENCIDA":
            titulo = `Tu Cita con ${user?.firstName.split(" ")[0]} a Vencido`;
            texto = `${user?.firstName.split(" ")[0]} no asistió, la cita ha vencido.`;
            break;
        case "CANCELADA":
            titulo = `Tu Cita con ${user?.firstName.split(" ")[0]} se a Cancelado`;
            texto = `${user?.firstName.split(" ")[0]} ha cancelado la cita.`;
            break;
        case "EN_PROCESO":
            titulo = `Cita en Proceso`;
            texto = `${user?.firstName.split(" ")[0]} está en proceso con la cita.`;
            break;
        case "RECHAZADA":
            titulo = `Ha ${user?.firstName.split(" ")[0]} Rechazada tu Cita`;
            texto = `${user?.firstName.split(" ")[0]} rechazado la cita.`;
            break;
        default:
            titulo = `Estado Desconocido`;
            texto = `Estado de cita no reconocido.`;
    }

    sendNotification(
        titulo,
        texto,
        (userDestination as any).externalId,
        { sesionToken, TokenApi: TokenAuthApi },
        {
            code: "102",
            citaId: `${cita.id.toString()}`,
            name: user?.firstName.split(" ")[0],
            message: texto,
            urlImage: (user?.customerProfiles as any)?.[0]?.link,
        }
    );
};

const styles = StyleSheet.create({
    overlay: {
        borderRadius: 24,
        width: Math.min(width * 0.9, 450),
        maxHeight: height * 0.85,
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
    infoSection: {
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
    locationCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    boxImageContainer: {
        width: 90,
        height: 90,
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
    storeName: {
        fontSize: 16,
        color: Colors.primary,
        marginBottom: 2,
    },
    packageName: {
        fontSize: 14,
        color: Colors.grayDark,
        marginBottom: 8,
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E8FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    dateText: {
        fontSize: 12,
        color: Colors.primary,
        marginLeft: 6,
    },
    footer: {
        marginTop: 10,
    },
    actionContainer: {
        width: '100%',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    actionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    declineBtn: {
        backgroundColor: '#FF5864',
    },
    acceptBtn: {
        backgroundColor: Colors.green,
    },
    btnText: {
        color: 'white',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default DialogDateDetails;

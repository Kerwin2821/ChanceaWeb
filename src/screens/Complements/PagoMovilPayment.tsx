import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, ScrollView } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Image } from "expo-image";
import { GetHeader, ToastCall, width } from "../../utils/Helpers";
import { font } from "../../../styles";
import { Colors } from "../../utils";
import { AntDesign, FontAwesome, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useAuth, useRender } from "../../context";
import { useNavigation } from "@react-navigation/native";
import { HttpService } from "../../services";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import Button from "../../components/ButtonComponent/Button";
import DialogPaymentNumber from "../../components/Dialog/DialogPaymentNumber/DialogPaymentNumber";
import Share from 'react-native-share';
import * as Clipboard from "expo-clipboard";
import * as FileSystem from 'expo-file-system';
import DialogValidateIDPayment from "../../components/Dialog/DialogValidateIDPayment/DialogValidateIDPayment";
import { saveOrden } from "../../services/CacheStorage/Orden/OrdenStorage";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Purchases, { PurchasesOfferings, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";

// Bank data for PagoMóvil (Android)
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
};

const PagoMovilPayment = () => {
  const { user, TokenAuthApi, SesionToken, setUser } = useAuth();
  const { setLoader } = useRender();
  const navigation = useNavigation<NavigationScreenNavigationType>();

  // Estados para PagoMóvil (Android)
  const [Active, setActive] = useState(false);
  const [Amount, setAmount] = useState(0);
  const [Orden, setOrden] = useState(0);
  const [ActiveValidate, setActiveValidate] = useState(false);
  const [selectedBank, setSelectedBank] = useState<"miBanco" | "bdv">("miBanco");

  // Estados para IAP (iOS)
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [iapLoading, setIapLoading] = useState(Platform.OS === 'ios');

  const datosPagoMovil = bankData[selectedBank];

  // 🟢 ANDROID: Generar intención de pago
  const generatePMIntention = useCallback(async () => {
    if (!SesionToken) return;

    try {
      setLoader(true);
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer/generateOrdenPlan/1/${SesionToken}/false`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("get", host, url, {}, header, setLoader);

      if (response.codigoRespuesta === "60") {
        ToastCall("warning", "Tu plan sigue activo", "ES");
        navigation.goBack();
      } else if (response.codigoRespuesta === "00") {
        ToastCall("success", "Intención de pago creada correctamente", "ES");
        setAmount(response.orden.totalAmount);
        saveOrden(response.orden);
        setOrden(response.orden.id);
      } else {
        ToastCall("error", response.mensajeRespuesta || "Error al crear orden", "ES");
      }
    } catch (err: any) {
      console.error('❌ Error en generatePMIntention:', err);
      ToastCall("error", err?.status ? "Error de conexión con el servidor" : "Problemas de conexión", "ES");
    } finally {
      setLoader(false);
    }
  }, [SesionToken, TokenAuthApi, navigation, setLoader]);

  // 🍎 IOS: Configurar y cargar IAP
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const setupIAP = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        Purchases.configure({
          apiKey: process.env.REVENUECAT || "test_ROfEFaGHapYdYsESOUaxghqNvin"
        });

        const offerings = await Purchases.getOfferings();
        setOfferings(offerings);

        if (!offerings.current) {
          ToastCall("warning", "No hay planes disponibles", "ES");
        }
      } catch (error) {
        console.error('❌ Error en IAP Setup:', error);
        ToastCall("error", "Error al cargar planes de suscripción", "ES");
      } finally {
        setIapLoading(false);
      }
    };

    setupIAP();
  }, []);

  // 🍎 IOS: Manejar suscripción
  const handleSubscribe = async (pkg: PurchasesPackage) => {
    try {
      setLoader(true);
      const { customerInfo } = await Purchases.purchasePackage(pkg);

      //query(customerInfo.subscriptionsByProductIdentifier.monthly.storeTransactionId || "");
      query(customerInfo.subscriptionsByProductIdentifier.CHPLAN03.storeTransactionId || "");

    } catch (error: any) {
      console.error('❌ Error en compra IAP:', error);

      if (error.userCancelled) {
        ToastCall("warning", "Compra cancelada", "ES");
      } else {
        ToastCall("error", "Error al procesar la compra", "ES");
      }
    } finally {
      setLoader(false);
    }
  };
  async function query(appleConfirmationId: string) {
    try {
      setLoader(true);

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/customer/purchaseWithApple/${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response = await HttpService("post", host, url, {
        orderId: Orden,
        amount: Amount,
        appleConfirmationId
      }, header);
      console.log(response);
      if (response.codigoRespuesta == "56") {
        ToastCall("error", "Servicio no disponible.", "ES");
      }
      if (response.codigoRespuesta == "00") {
        setUser(response.customer);
        await AsyncStorage.setItem("Sesion", JSON.stringify(response.customer));
        ToastCall("success", "Transacción exitosa.", "ES");
        navigation.push("SubscriptionComplete");
      }
    } catch (err: any) {
      const errors = err as AxiosError;
      console.error(JSON.stringify(errors), "User");
      if (err && err?.status) {
        ToastCall("error", "error de conexión en con el Servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
    } finally {
      setLoader(false);
    }
  }

  // 📋 Copiar al portapapeles
  const copyToClipboard = async (text: string | number) => {
    await Clipboard.setStringAsync(text.toString());
    ToastCall("success", "Copiado al portapapeles", "ES");
  };

  // 📤 Compartir QR (Android)
  const downloadAndShareImage = async () => {
    try {
      const imageUrl = 'https://chancea.s3.us-east-1.amazonaws.com/ImagenQR.png';
      const fileUri = FileSystem.documentDirectory + 'ImagenQR.png';

      const response = await FileSystem.downloadAsync(imageUrl, fileUri);

      await Share.open({
        title: 'QR para Pago Chancea',
        url: response.uri,
        message: 'QR para Pago de Chancea',
      });
    } catch (error) {
      console.error('Error al compartir imagen:', error);
      ToastCall("error", "Error al compartir la imagen", "ES");
    }
  };

  // 🎬 Inicializar según plataforma
  useEffect(() => {
    generatePMIntention();
  }, [generatePMIntention]);

  // 🎨 UI: PagoMóvil para Android
  const renderPagoMovilUI = () => (
    <View style={styles.container}>
      {/* Selector de banco */}
      <View style={styles.bankSelectorContainer}>
        <View style={styles.bankSelector}>
          <TouchableOpacity
            style={[
              styles.bankOption,
              selectedBank === "miBanco" && styles.bankOptionActive
            ]}
            onPress={() => setSelectedBank("miBanco")}
            activeOpacity={0.7}
          >
            <Image
              style={styles.bankLogo}
              source={require("../../../assets/img/B-R4.png")}
            />
            <Text style={[
              styles.bankText,
              selectedBank === "miBanco" && styles.bankTextActive
            ]}>
              Mi Banco
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bankOption,
              selectedBank === "bdv" && styles.bankOptionActive
            ]}
            onPress={() => setSelectedBank("bdv")}
            activeOpacity={0.7}
          >
            <Image
              style={styles.bankLogo}
              source={require("../../../assets/img/B-BDV.png")}
            />
            <Text style={[
              styles.bankText,
              selectedBank === "bdv" && styles.bankTextActive
            ]}>
              BDV
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Imagen y advertencia */}
      <View style={styles.infoContainer}>
        <Image
          style={styles.paymentImage}
          source={require("../../../assets/items/paymentImg.svg")}
          transition={{ duration: 300 }}
        />
        <Text style={styles.warningTitle}>¡Importante!</Text>
        <Text style={styles.warningText}>
          El monto debe incluir los decimales sin redondear las cifras. El sistema solo procesará
          el pago por el MONTO EXACTO. El teléfono debe ser el mismo con el que realizaste el pago.
        </Text>
      </View>

      {/* Datos de pago */}
      <View style={styles.paymentDataContainer}>
        {/* Cédula */}
        <View style={styles.dataRow}>
          <Text style={styles.dataText}>{datosPagoMovil.cedula}</Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(datosPagoMovil.cedula)}
            style={styles.copyButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="clipboard" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Teléfono */}
        <View style={styles.dataRow}>
          <Text style={styles.dataText}>{datosPagoMovil.tel}</Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(datosPagoMovil.tel)}
            style={styles.copyButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="clipboard" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Monto */}
        <View style={styles.dataRow}>
          <Text style={styles.dataText}>{Amount.toFixed(2)} Bs</Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(Amount.toFixed(2))}
            style={styles.copyButton}
            activeOpacity={0.7}
          >
            <FontAwesome name="clipboard" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Banco */}
        <View style={styles.dataRow}>
          <Text style={[styles.dataText, styles.bankName]}>{datosPagoMovil.bank}</Text>
        </View>

        {/* Botón de acción */}
        {datosPagoMovil.name !== "Mi Banco" ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={downloadAndShareImage}
              style={styles.qrButton}
              activeOpacity={0.7}
            >
              <AntDesign name="qrcode" size={32} color={Colors.primary} />
              <Text style={styles.qrButtonText}>Ver QR</Text>
            </TouchableOpacity>
            <View style={styles.payButtonContainer}>
              <Button text="Ya pagué" onPress={() => setActive(true)} />
            </View>
          </View>
        ) : (
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={24} color={Colors.primary} />
            <Text style={styles.noteText}>
              Una vez realizado el pago móvil, el producto o servicio será provisionado de forma
              inmediata. Te notificaremos sobre el estado de tu transacción.
            </Text>
          </View>
        )}
      </View>

      {/* Diálogos */}
      <DialogPaymentNumber
        active={Active}
        setActive={setActive}
        navigation={navigation}
      />
      <DialogValidateIDPayment
        active={ActiveValidate}
        setActive={setActiveValidate}
      />
    </View>
  );

  // 🎨 UI: IAP para iOS
  const renderIAPUI = () => {
    if (iapLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando planes de suscripción...</Text>
        </View>
      );
    }

    if (!offerings?.current || offerings.current.availablePackages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No hay planes disponibles</Text>
          <Text style={styles.emptyText}>
            Por favor, intenta nuevamente más tarde
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.plansContainer}>
        <View style={styles.plansHeader}>
          <Text style={styles.plansTitle}>Elige tu plan</Text>
          <Text style={styles.plansSubtitle}>
            Desbloquea todas las funciones premium
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>


          {offerings.current.availablePackages.map((pkg) => (
            <SubscriptionPlan
              key={pkg.identifier}
              title={pkg.product.title}
              price={pkg.product.priceString}
              period={pkg.packageType.toLowerCase()}
              features={[
                "Desbloquea todas las funciones",
                "Soporte premium 24/7",
                "Actualizaciones exclusivas",
                "Video llamadas",
                "Chats ilimitados"
              ]}
              onPress={() => handleSubscribe(pkg)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backIconButton}
        >
          <FontAwesome6 name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {Platform.OS === 'ios' ? 'Suscripción' : 'Pago Móvil'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contenido según plataforma */}
      {Platform.OS === 'ios' ? renderIAPUI() : renderPagoMovilUI()}
    </SafeAreaView>
  );
};

// 📦 Componente para planes de suscripción (iOS)
const SubscriptionPlan = ({
  title,
  price,
  period,
  features,
  onPress,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={styles.planCard}
  >
    <View style={styles.planCardInner}>
      <Text style={styles.planTitle}>{title}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.period}>/{period}</Text>
      </View>

      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Button text="Suscribirse ahora" onPress={onPress} />

    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backIconButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: font.SemiBold.fontFamily,
    color: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Bank Selector
  bankSelectorContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  bankSelector: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 50,
    padding: 4,
  },
  bankOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    gap: 8,
  },
  bankOptionActive: {
    backgroundColor: Colors.primary,
  },
  bankLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  bankText: {
    fontFamily: font.Regular.fontFamily,
    fontSize: 14,
    color: "#6b7280",
  },
  bankTextActive: {
    color: "#fff",
  },

  // Info Section
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  paymentImage: {
    width: width * 0.25,
    height: width * 0.25,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontFamily: font.SemiBold.fontFamily,
    color: Colors.primary,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    fontFamily: font.SemiBold.fontFamily,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 18,
  },

  // Payment Data
  paymentDataContainer: {
    paddingHorizontal: 16,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  dataText: {
    fontSize: 15,
    fontFamily: font.SemiBold.fontFamily,
    color: "#000",
  },
  bankName: {
    fontSize: 14,
  },
  copyButton: {
    padding: 8,
  },

  // Action Section
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 12,
  },
  qrButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 16,
  },
  qrButtonText: {
    fontSize: 11,
    fontFamily: font.Regular.fontFamily,
    color: Colors.primary,
    marginTop: 4,
  },
  payButtonContainer: {
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: font.Regular.fontFamily,
    color: "#0369a1",
    lineHeight: 18,
  },

  // iOS IAP Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: font.SemiBold.fontFamily,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: font.SemiBold.fontFamily,
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: font.Regular.fontFamily,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: font.SemiBold.fontFamily,
    color: "#fff",
  },
  plansContainer: {
    flex: 1,
    padding: 20,
  },
  plansHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  plansTitle: {
    fontSize: 28,
    fontFamily: font.SemiBold.fontFamily,
    color: "#111827",
    marginBottom: 8,
  },
  plansSubtitle: {
    fontSize: 14,
    fontFamily: font.Regular.fontFamily,
    color: "#6b7280",
  },

  // Plan Card
  planCard: {
    marginBottom: 16,
  },
  planCardInner: {
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  planTitle: {
    fontSize: 22,
    fontFamily: font.SemiBold.fontFamily,
    color: "#111827",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontFamily: font.SemiBold.fontFamily,
    color: "#111827",
  },
  period: {
    fontSize: 16,
    fontFamily: font.Regular.fontFamily,
    color: "#6b7280",
    marginLeft: 4,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: font.Regular.fontFamily,
    color: "#374151",
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  subscribeButtonText: {
    fontSize: 16,
    fontFamily: font.SemiBold.fontFamily,
    color: "#fff",
  },
});

export default PagoMovilPayment;
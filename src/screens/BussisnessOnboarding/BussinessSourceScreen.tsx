"use client"

import { useEffect, useState } from "react"
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native"
import { Icon } from "@rn-vui/themed"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"
import { CommonActions, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"

// Local imports
import { font } from "../../../styles"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useAuth, useRender } from "../../context"
import { Colors } from "../../utils"
import ScreenContainer from "../../components/ScreenContainer"
import OnboardingValidate from "../../utils/OnboardingValidate"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness"

export interface CustomerSource {
  id: number
  name: string
  description: string
  enabled: boolean
  creationDate: string
}

const { width, height } = Dimensions.get("window")

const BussinessSourceScreen = () => {
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<CustomerSource[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { TokenAuthApi, user, setUser, SesionToken } = useAuth();
  const { setLoader } = useRender();
  const [token, setToken] = useState<string | null>(null);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  /* const [newRep, setNewRep] = useState(formRespresentanteInit); */
  const { RepCivil, setRepCivil, Stores } = useStoreBusiness();
  const { sesionBusiness, setSesionBusiness } = useSesionBusinessStore();


  async function fetchCustomerSources() {
    try {
      setLoading(true)
      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/busines-sources?sessionToken=${SesionToken}&page=0&size=20`
      const header = await GetHeader(TokenAuthApi, "application/json")
      const response: CustomerSource[] = await HttpService("get", host, url, {}, header)

      setSources(response)
    } catch (err: any) {
      console.error(JSON.stringify(err), "Customer Sources")
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerSources()
  }, [])

  function handleSelect(source: CustomerSource) {
    setSelectedId(source.id)
  }

  const handleSaveSource = async (selectedSource: CustomerSource) => {
   try {
      setLoader(true);

      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/businesses/update?sessionToken=${SesionToken}`;
      const header = await GetHeader(TokenAuthApi, "application/json");

      const response = await HttpService(
        "put",
        host,
        url,
        {
          ...sesionBusiness,
          customerSource: selectedSource,
          password: null,
          token: SesionToken,
        },
        header
      );

      console.log(response.business, "response");

      setSesionBusiness(response.business);
      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(response.business));

      const validate = await OnboardingValidateBusiness(response.business, navigation, setSesionBusiness, Stores);

      if (!validate) return;

      navigation.replace("HomeBusiness");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }],
        })
      );
    } catch (err: any) {
      console.error(JSON.stringify(err));
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES");
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES");
      }
      throw err;
    } finally {
      setLoader(false);
    }
  }

  const handleSave = async () => {
    if (selectedId) {
      const selectedSource = sources.find((source) => source.id === selectedId)
      if (selectedSource) {
        setSaving(true)
        try {
          await handleSaveSource(selectedSource)
        } catch (error) {
          console.error("Error al guardar:", error)
          ToastCall("error", "Error al guardar los cambios", "ES")
        } finally {
          setSaving(false)
        }
      }
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.headerContainer}>
         {/*  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" type="material" color={Colors.primary} size={24} />
          </TouchableOpacity> */}
          <Text style={[styles.headerTitle, font.Bold]}>¿Cómo nos conociste?</Text>
          {/* <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, font.Regular]}>Omitir</Text>
          </TouchableOpacity> */}
        </Animated.View>

        {/* Línea separadora */}
        <View style={styles.divider} />

        {/* Contenido principal */}
        <View style={styles.contentContainer}>
          {/* Texto introductorio */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.introContainer}>
            <Icon
              name="question-circle"
              color={Colors.primary}
              size={40}
            />
            <Text style={[styles.introText, font.Regular]}>
              Nos gustaría saber cómo nos encontraste. Esta información nos ayuda a mejorar nuestros servicios.
            </Text>
          </Animated.View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={Colors.primary} size={40} />
              <Text style={[styles.loadingText, font.Regular]}>Cargando opciones...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {sources.length > 0 ? (
                sources.map((source, index) => (
                  <Animated.View key={source.id} entering={FadeInDown.delay(200 + index * 100).springify()}>
                    <TouchableOpacity
                      onPress={() => handleSelect(source)}
                      style={[ styles.sourceItem, selectedId === source.id && styles.selectedItem]}
                      activeOpacity={0.7}
                      disabled={saving}
                    >
                      <View style={styles.sourceContent}>
                        <View style={styles.textContainer}>
                          <Text style={[ selectedId === source.id ? styles.sourceNameSelect : styles.sourceName , font.SemiBold]}>{source.name}</Text>
                          {source.description && source.description !== source.name && (
                            <Text style={[styles.sourceDescription, font.Regular]}>{source.description}</Text>
                          )}
                        </View>
                        {selectedId === source.id && (
                          <Icon name="check-circle" color={Colors.primary} size={20} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))
              ) : (
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyContainer}>
                  <Icon name="exclamation-circle"  color={Colors.primary} size={40} />
                  <Text style={[styles.emptyText, font.Regular]}>No hay fuentes disponibles</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchCustomerSources}>
                    <Text style={[styles.retryText, font.Regular]}>Reintentar</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Footer con botón de guardar */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.saveButton, (!selectedId || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!selectedId || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Icon name="check" color={Colors.white} size={18} />
                <Text style={[styles.saveButtonText, font.SemiBold]}>Guardar</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  )
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    color: Colors.primary,
    textAlign: "center",
    marginRight: 40, // Balance with back button
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 14,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  introContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  introText: {
    color: Colors.primary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sourceItem: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  sourceContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  sourceNameSelect: {
    fontSize: 16,
    color: Colors.primary || "#333",
    marginBottom: 4,
  },
  sourceName: {
    fontSize: 16,
    color: Colors.white || "#333",
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: Colors.gray || "#666",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 50,
  },
  loadingText: {
    color: Colors.primary,
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 14,
  },
  footerContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  saveButton: {
    backgroundColor: Colors.primary, // Verde más oscuro y elegante
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  saveButtonDisabled: {
    backgroundColor: "rgba(120, 120, 120, 0.6)", // Gris neutro que combina mejor
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
})

export default BussinessSourceScreen

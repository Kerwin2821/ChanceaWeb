"use client"

import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native"
import { useEffect, useState } from "react"
import { Dialog, Icon } from "@rn-vui/themed"
import { font } from "../../../../styles"
import { GetHeader, ToastCall } from "../../../utils/Helpers"
import { HttpService } from "../../../services"
import { useAuth, useRender } from "../../../context"
import { Colors } from "../../../utils"
import Animated, { FadeInDown } from "react-native-reanimated"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface CustomerSource {
  id: number
  name: string
  description: string
  enabled: boolean
  creationDate: string
}

type props = {
  active: boolean
  setActive: (e: boolean) => void
}

const { width } = Dimensions.get("window")

const DialogSelectSource = ({ active, setActive }: props) => {
  const [load, setLoad] = useState(false)
  const [sources, setSources] = useState<CustomerSource[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const { TokenAuthApi, user, setUser, logOut, SesionToken } = useAuth()
  const { setLoader } = useRender()

  const toggleDialog = () => {
    if (!saving) {
      setActive(!active)
      // Resetear la selección cuando se cierra el diálogo
      if (active) {
        setSelectedId(null)
      }
    }
  }

  async function fetchCustomerSources() {
    try {
      setLoad(true)
      const host = process.env.APP_BASE_API
      const url = `/api/customer-sources?page=0&size=20`
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
      setLoad(false)
    }
  }

  useEffect(() => {
    if (active) {
      fetchCustomerSources()
    }
  }, [active])

  if (!active) {
    return <></>
  }

  function handleSelect(source: CustomerSource) {
    setSelectedId(source.id)
  }
  const handleSaveSource = async (selectedSource: CustomerSource) => {
    try {
      setLoader(true)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/customers/${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService("put", host, url, { ...user, customerSource: selectedSource }, header)

      setUser(response)
      await AsyncStorage.setItem("Sesion", JSON.stringify(response))
      ToastCall("success", "Información actualizada correctamente", "ES")

      return response
    } catch (err: any) {
      console.error(JSON.stringify(err))
      if (err && err?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
      throw err // Re-lanzar el error para que el componente de diálogo lo maneje
    } finally {
      setLoader(false)
    }
  }

  const handleSave = async () => {
    if (selectedId) {
      const selectedSource = sources.find((source) => source.id === selectedId)
      if (selectedSource) {
        setSaving(true)
        try {
          await handleSaveSource(selectedSource)
          toggleDialog()
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
    <Dialog
      isVisible={active}
      onBackdropPress={toggleDialog}
      overlayStyle={styles.dialogContainer}
      backdropStyle={saving ? styles.disabledBackdrop : undefined}
    >
      {/* Header con icono */}
      <View style={styles.headerContainer}>
        <Icon
          name="question-circle"
          type="font-awesome"
          color={Colors.white}
          size={30}
          containerStyle={styles.iconContainer}
        />
        <Text style={[styles.headerTitle, font.Bold]}>¿Cómo nos conociste?</Text>
        <TouchableOpacity onPress={toggleDialog} style={styles.closeButton} disabled={saving}>
          <Icon name="close" type="material" color={saving ? "rgba(255,255,255,0.5)" : Colors.white} size={24} />
        </TouchableOpacity>
      </View>

      {/* Línea separadora */}
      <View style={styles.divider} />

      {load ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={Colors.white} size={40} />
          <Text style={[styles.loadingText, font.Regular]}>Cargando opciones...</Text>
        </View>
      ) : (
        <ScrollView style={[styles.scrollContainer, { paddingBottom: 70 }]} showsVerticalScrollIndicator={false}>
          {sources.length > 0 ? (
            sources.map((source, index) => (
              <Animated.View key={source.id} entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                  onPress={() => handleSelect(source)}
                  style={[styles.sourceItem, selectedId === source.id && styles.selectedItem]}
                  activeOpacity={0.7}
                  disabled={saving}
                >
                  <View style={styles.sourceContent}>
                    <View style={styles.textContainer}>
                      <Text style={[styles.sourceName, font.SemiBold]}>{source.name}</Text>
                      {source.description && source.description !== source.name && (
                        <Text style={[styles.sourceDescription, font.Regular]}>{source.description}</Text>
                      )}
                    </View>
                    {selectedId === source.id && (
                      <Icon name="check-circle" type="font-awesome" color={Colors.primary} size={20} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="exclamation-circle" type="font-awesome" color={Colors.white} size={40} />
              <Text style={[styles.emptyText, font.Regular]}>No hay fuentes disponibles</Text>
            </View>
          )}
        </ScrollView>
      )}
      {!load && (
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[styles.saveButton, (!selectedId || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!selectedId || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Icon name="check" type="font-awesome" color={Colors.white} size={18} />
                <Text style={[styles.saveButtonText, font.SemiBold]}>Guardar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Dialog>
  )
}

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: width * 0.9,
    maxWidth: 400,
    padding: 0,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  iconContainer: {
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    color: Colors.white,
    textAlign: "center",
  },
  closeButton: {
    padding: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 10,
  },
  scrollContainer: {
    maxHeight: 400,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  sourceItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 10,
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
  },
  sourceName: {
    fontSize: 16,
    color: Colors.secondary || "#333",
    marginBottom: 2,
  },
  sourceDescription: {
    fontSize: 14,
    color: Colors.gray || "#666",
  },
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: Colors.white,
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyText: {
    color: Colors.white,
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2E7D32", // Verde más oscuro y elegante
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 300,
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

export default DialogSelectSource

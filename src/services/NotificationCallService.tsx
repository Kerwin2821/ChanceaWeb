"use client"

import messaging from "@react-native-firebase/messaging"
import { Platform, Alert } from "react-native"
import type { NavigationContainerRef } from "@react-navigation/native"
import firestore from "@react-native-firebase/firestore"
import database from "@react-native-firebase/database"
import type { CallData } from "../context/CallContext/CallInterface"

class NotificationCallService {
  private navigationRef: NavigationContainerRef<any> | null = null
  private onIncomingCallCallback: ((callData: CallData) => void) | null = null
  private currentUserId: string | null = null
  private fcmToken: string | null = null
  private foregroundUnsubscribe: (() => void) | null = null
  private backgroundUnsubscribe: (() => void) | null = null
  private firestoreUnsubscribe: (() => void) | null = null
  private realtimeDbListener: any = null

  // Configurar la referencia de navegación
  setNavigationRef(navigationRef: NavigationContainerRef<any>) {
    this.navigationRef = navigationRef
  }

  // Configurar callback para llamadas entrantes
  setOnIncomingCallCallback(callback: (callData: CallData) => void) {
    this.onIncomingCallCallback = callback
  }

  // Configurar ID de usuario actual
  setCurrentUserId(userId: string) {
    this.currentUserId = userId
    console.log("NotificationCallService: Usuario configurado:", userId)
  }

  // Configurar listeners de Firebase para llamadas entrantes
  setupFirebaseListeners() {
    if (!this.currentUserId) {
      console.log("NotificationService: No hay usuario configurado para listeners de Firebase")
      return
    }

    console.log("NotificationService: Configurando listeners de Firebase para usuario:", this.currentUserId)

    // Listener para llamadas entrantes en Firestore
    this.firestoreUnsubscribe = firestore()
      .collection("calls")
      .where("to", "==", this.currentUserId)
      .where("status", "==", "calling")
      .onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const callData = {
                callId: change.doc.id,
                ...change.doc.data(),
              } as CallData

              console.log("NotificationService: Nueva llamada entrante detectada:", callData)
              this.handleIncomingCall(callData)
            }
          })
        },
        (error) => {
          console.error("NotificationService: Error en listener de Firestore:", error)
        },
      )

    // Listener para notificaciones en Realtime Database
    const notificationsRef = database().ref(`notifications/${this.currentUserId}/calls`)
    this.realtimeDbListener = notificationsRef.on("child_added", (snapshot) => {
      const notificationData = snapshot.val()
      if (notificationData && notificationData.type === "call") {
        console.log("NotificationService: Notificación de llamada en Realtime Database:", notificationData)

        // Buscar la llamada completa en Firestore
        firestore()
          .collection("calls")
          .doc(notificationData.callId)
          .get()
          .then((doc) => {
            if (doc.exists && doc.data()?.status === "calling") {
              const callData = {
                callId: doc.id,
                ...doc.data(),
              } as CallData

              this.handleIncomingCall(callData)
            }
          })
      }
    })

    console.log("NotificationService: Listeners de Firebase configurados")
  }

  // Manejar notificación de llamada entrante
  handleIncomingCall(callData: CallData) {
    console.log("NotificationService: Procesando llamada entrante:", callData)

    // Ejecutar callback si está configurado
    if (this.onIncomingCallCallback) {
      this.onIncomingCallCallback(callData)
    }

    // Navegar a pantalla de llamada entrante
    this.navigateToIncomingCall(callData)
  }

  // Navegar a la pantalla de llamada entrante
  navigateToIncomingCall(callData: CallData) {
    if (this.navigationRef?.isReady()) {
      console.log("NotificationService: Navegando a IncomingCallScreen")
      this.navigationRef.navigate("IncomingCallScreen")
    } else {
      console.log("NotificationService: NavigationRef no está listo para navegar")
    }
  }

  // Registrar token FCM en Firestore
  async registerFCMToken(fcmToken:string) {
    if (fcmToken || !this.currentUserId) {
      console.log("NotificationService: No hay token FCM o usuario para registrar")
      return
    }

    try {
      await firestore().collection("users").doc(this.currentUserId).update({
        fcmToken: this.fcmToken,
        lastSeen: firestore.FieldValue.serverTimestamp(),
      })
      console.log("NotificationService: Token FCM registrado para usuario:", this.currentUserId)
    } catch (error) {
      console.error("NotificationService: Error registrando token FCM:", error)
    }
  }

  // Limpiar recursos
  cleanup() {
    if (this.foregroundUnsubscribe) {
      this.foregroundUnsubscribe()
    }
    if (this.backgroundUnsubscribe) {
      this.backgroundUnsubscribe()
    }
    if (this.firestoreUnsubscribe) {
      this.firestoreUnsubscribe()
    }
    if (this.realtimeDbListener && this.currentUserId) {
      database().ref(`notifications/${this.currentUserId}/calls`).off("child_added", this.realtimeDbListener)
    }

    console.log("NotificationService: Recursos limpiados")
  }
}

// Exportar una instancia singleton
export default new NotificationCallService()

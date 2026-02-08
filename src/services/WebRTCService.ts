import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, mediaDevices } from "react-native-webrtc"
import firestore from "@react-native-firebase/firestore"
import database from "@react-native-firebase/database"
import messaging from "@react-native-firebase/messaging"
import AsyncStorage from "@react-native-async-storage/async-storage"
import InCallManager from "react-native-incall-manager"
import RNCallKeep from "react-native-callkeep"
import { Platform } from "react-native"

// Configuración para CallKeep (iOS)
const callKeepConfig = {
  ios: {
    appName: "Chancea",
    supportsVideo: true,
    maximumCallGroups: "1",
    maximumCallsPerCallGroup: "1",
  },
  android: {
    alertTitle: "Permisos requeridos",
    alertDescription: "Esta aplicación necesita acceder a tu cuenta de teléfono",
    cancelButton: "Cancelar",
    okButton: "Ok",
    imageName: "phone_account_icon",
    additionalPermissions: [],
    // Requerido para Android
    selfManaged: true,
  },
}

class WebRTCService {
  // Propiedades privadas
  private peerConnection: RTCPeerConnection | null = null
  private localStream: any = null
  private remoteStream: any = null
  private roomId: string | null = null
  private userId: string | null = null
  private callId: string | null = null
  private isInitiator = false
  private isCallActive = false
  private onRemoteStreamCallback: ((stream: any) => void) | null = null
  private onCallEndedCallback: (() => void) | null = null
  private onCallStartedCallback: (() => void) | null = null
  private onIncomingCallCallback: ((callData: any) => void) | null = null
  private firebaseCallsRef: any = null
  private firebaseRTCRef: any = null
  private callKeepSetup = false

  // Configuración de servidores ICE
  private configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      // Puedes añadir tus servidores TURN aquí para mejorar la conectividad
      // {
      //   urls: 'turn:your-turn-server.com:3478',
      //   username: 'username',
      //   credential: 'credential'
      // }
    ],
    iceCandidatePoolSize: 10,
  }

  constructor() {
    this.setupCallKeep()
    this.setupFirebaseListeners()
  }

  // Inicializar CallKeep para iOS
  private async setupCallKeep() {
    if (this.callKeepSetup) return

    try {
      if (Platform.OS === "ios") {
        RNCallKeep.setup(callKeepConfig)
        RNCallKeep.setAvailable(true)

        // Eventos de CallKeep
        RNCallKeep.addEventListener("answerCall", this.onAnswerCallAction)
        RNCallKeep.addEventListener("endCall", this.onEndCallAction)
        RNCallKeep.addEventListener("didPerformDTMFAction", this.onDTMFAction)
        RNCallKeep.addEventListener("didReceiveStartCallAction", this.onStartCallAction)
        RNCallKeep.addEventListener("didToggleHoldCallAction", this.onToggleHoldAction)
        RNCallKeep.addEventListener("didPerformSetMutedCallAction", this.onToggleMuteAction)
      }

      this.callKeepSetup = true
    } catch (err) {
      console.error("Error al configurar CallKeep:", err)
    }
  }

  // Configurar escuchas de Firebase para llamadas entrantes
  private setupFirebaseListeners() {
    // Obtener el ID de usuario actual (ajusta esto según tu sistema de autenticación)
    AsyncStorage.getItem("userId").then((userId) => {
      if (userId) {
        this.userId = userId

        // Escuchar llamadas entrantes en Firestore
        this.firebaseCallsRef = firestore()
          .collection("calls")
          .where("to", "==", userId)
          .where("status", "==", "calling")

        this.firebaseCallsRef.onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const callData = change.doc.data()
              this.handleIncomingCall(callData, change.doc.id)
            }
          })
        })

        // Registrar token de FCM para notificaciones de llamadas
        messaging()
          .getToken()
          .then((token) => {
            if (token) {
              firestore().collection("users").doc(userId).update({
                fcmToken: token,
                lastSeen: firestore.FieldValue.serverTimestamp(),
              })
            }
          })
      }
    })
  }

  // Manejar llamada entrante
  private handleIncomingCall(callData: any, callId: string) {
    this.callId = callId

    // Notificar a la UI sobre la llamada entrante
    if (this.onIncomingCallCallback) {
      this.onIncomingCallCallback(callData)
    }

    // Mostrar notificación de llamada entrante en iOS
    if (Platform.OS === "ios") {
      const { from, fromName, hasVideo } = callData

      RNCallKeep.displayIncomingCall(
        callId,
        fromName || "Usuario de Chancea",
        fromName || "Usuario de Chancea",
        "generic",
        hasVideo,
      )
    }

    // Reproducir sonido de llamada
    InCallManager.startRingtone("_DEFAULT_")
  }

  // Inicializar stream local
  public async initLocalStream(hasVideo = true) {
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: hasVideo
          ? {
              width: 640,
              height: 480,
              frameRate: 30,
              facingMode: "user",
            }
          : false,
      })

      this.localStream = stream
      return stream
    } catch (err) {
      console.error("Error al obtener stream local:", err)
      throw err
    }
  }

  // Inicializar conexión WebRTC
  private initializePeerConnection() {
    try {
      this.peerConnection = new RTCPeerConnection(this.configuration)

      // Agregar tracks locales a la conexión
      if (this.localStream) {
        this.localStream.getTracks().forEach((track: any) => {
          this.peerConnection?.addTrack(track, this.localStream)
        })
      }

      // Manejar stream remoto
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0]

          if (this.onRemoteStreamCallback) {
            this.onRemoteStreamCallback(event.streams[0])
          }
        }
      }

      // Manejar candidatos ICE
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.roomId) {
          const candidateData = {
            candidate: event.candidate.candidate,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            serverUrl: event.candidate.address,
            timestamp: firestore.FieldValue.serverTimestamp(),
          }

          // Guardar candidato en Firebase
          if (this.isInitiator) {
            firestore().collection("rooms").doc(this.roomId).collection("callerCandidates").add(candidateData)
          } else {
            firestore().collection("rooms").doc(this.roomId).collection("calleeCandidates").add(candidateData)
          }
        }
      }

      // Manejar cambios en el estado de la conexión
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE Connection State:", this.peerConnection?.iceConnectionState)

        if (
          this.peerConnection?.iceConnectionState === "disconnected" ||
          this.peerConnection?.iceConnectionState === "failed"
        ) {
          this.endCall()
        }
      }

      return this.peerConnection
    } catch (err) {
      console.error("Error al inicializar conexión peer:", err)
      throw err
    }
  }

  // Crear una llamada saliente
  public async startCall(recipientId: string, hasVideo = true, recipientName?: string) {
    try {
      // Inicializar stream local si no existe
      if (!this.localStream) {
        await this.initLocalStream(hasVideo)
      }

      // Configurar InCallManager
      InCallManager.start({ media: hasVideo ? "video" : "audio", auto: true, ringback: "_DEFAULT_" })

      // Crear sala en Firestore
      const roomRef = firestore().collection("rooms").doc()
      this.roomId = roomRef.id
      this.isInitiator = true

      // Inicializar conexión peer
      this.initializePeerConnection()

      // Crear oferta SDP
      const offer = await this.peerConnection?.createOffer()
      await this.peerConnection?.setLocalDescription(offer)

      // Guardar oferta en Firestore
      await roomRef.set({
        offer: {
          type: offer?.type,
          sdp: offer?.sdp,
        },
        created: firestore.FieldValue.serverTimestamp(),
        status: "waiting",
      })

      // Crear registro de llamada
      const callRef = firestore().collection("calls").doc()
      this.callId = callRef.id

      await callRef.set({
        from: this.userId,
        to: recipientId,
        roomId: this.roomId,
        status: "calling",
        hasVideo: hasVideo,
        timestamp: firestore.FieldValue.serverTimestamp(),
        fromName: (await AsyncStorage.getItem("userName")) || "Usuario",
        toName: recipientName || "Usuario",
      })

      // Enviar notificación push a través de FCM
      const userDoc = await firestore().collection("users").doc(recipientId).get()
      const fcmToken = userDoc.data()?.fcmToken

      if (fcmToken) {
        // Enviar notificación a través de Cloud Functions o tu servidor
        // Este es un ejemplo simplificado, normalmente usarías una Cloud Function
        const callData = {
          callId: this.callId,
          roomId: this.roomId,
          from: this.userId,
          fromName: (await AsyncStorage.getItem("userName")) || "Usuario",
          hasVideo: hasVideo,
          type: "call",
        }

        // Guardar en Realtime Database para que Cloud Functions lo procese
        await database().ref(`notifications/${recipientId}/calls/${this.callId}`).set(callData)
      }

      // Escuchar por respuesta
      this.listenForAnswer()

      // Escuchar por candidatos ICE remotos
      this.listenForRemoteCandidates()

      // Escuchar cambios en el estado de la llamada
      this.listenForCallStatusChanges()

      this.isCallActive = true

      if (this.onCallStartedCallback) {
        this.onCallStartedCallback()
      }

      return this.roomId
    } catch (err) {
      console.error("Error al iniciar llamada:", err)
      this.cleanUp()
      throw err
    }
  }

  // Responder a una llamada entrante
  public async answerCall(callId: string, hasVideo = true) {
    try {
      // Detener tono de llamada
      InCallManager.stopRingtone()

      // Configurar InCallManager
      InCallManager.start({ media: hasVideo ? "video" : "audio", auto: true })

      // Obtener datos de la llamada
      const callDoc = await firestore().collection("calls").doc(callId).get()
      const callData = callDoc.data()

      if (!callData) {
        throw new Error("Datos de llamada no encontrados")
      }

      this.callId = callId
      this.roomId = callData.roomId
      this.isInitiator = false

      // Inicializar stream local si no existe
      if (!this.localStream) {
        await this.initLocalStream(hasVideo)
      }

      // Inicializar conexión peer
      this.initializePeerConnection()

      // Obtener oferta de la sala
      const roomRef = firestore().collection("rooms").doc(this.roomId)
      const roomSnapshot = await roomRef.get()
      const roomData = roomSnapshot.data()

      if (!roomData || !roomData.offer) {
        throw new Error("Oferta no encontrada")
      }

      // Establecer descripción remota (oferta)
      const offerDescription = new RTCSessionDescription({
        type: roomData.offer.type,
        sdp: roomData.offer.sdp,
      })

      await this.peerConnection?.setRemoteDescription(offerDescription)

      // Crear respuesta
      const answer = await this.peerConnection?.createAnswer()
      await this.peerConnection?.setLocalDescription(answer)

      // Guardar respuesta en Firestore
      await roomRef.update({
        answer: {
          type: answer?.type,
          sdp: answer?.sdp,
        },
        status: "connected",
      })

      // Actualizar estado de la llamada
      await firestore().collection("calls").doc(callId).update({
        status: "connected",
        answeredAt: firestore.FieldValue.serverTimestamp(),
      })

      // Escuchar por candidatos ICE remotos
      this.listenForRemoteCandidates()

      // Escuchar cambios en el estado de la llamada
      this.listenForCallStatusChanges()

      this.isCallActive = true

      if (this.onCallStartedCallback) {
        this.onCallStartedCallback()
      }

      return this.roomId
    } catch (err) {
      console.error("Error al responder llamada:", err)
      this.cleanUp()
      throw err
    }
  }

  // Rechazar una llamada entrante
  public async rejectCall(callId: string) {
    try {
      // Detener tono de llamada
      InCallManager.stopRingtone()

      // Actualizar estado de la llamada
      await firestore().collection("calls").doc(callId).update({
        status: "rejected",
        endedAt: firestore.FieldValue.serverTimestamp(),
      })

      // Si hay una sala asociada, actualizar su estado
      const callDoc = await firestore().collection("calls").doc(callId).get()
      const roomId = callDoc.data()?.roomId

      if (roomId) {
        await firestore().collection("rooms").doc(roomId).update({
          status: "ended",
        })
      }

      if (Platform.OS === "ios" && RNCallKeep.isCallActive(callId)) {
        RNCallKeep.endCall(callId)
      }

      this.cleanUp()
    } catch (err) {
      console.error("Error al rechazar llamada:", err)
    }
  }

  // Finalizar una llamada activa
  public async endCall() {
    try {
      if (!this.isCallActive) return

      // Detener InCallManager
      InCallManager.stop()

      if (this.callId) {
        // Actualizar estado de la llamada
        await firestore().collection("calls").doc(this.callId).update({
          status: "ended",
          endedAt: firestore.FieldValue.serverTimestamp(),
        })

        if (Platform.OS === "ios" && RNCallKeep.isCallActive(this.callId)) {
          RNCallKeep.endCall(this.callId)
        }
      }

      if (this.roomId) {
        // Actualizar estado de la sala
        await firestore().collection("rooms").doc(this.roomId).update({
          status: "ended",
        })
      }

      if (this.onCallEndedCallback) {
        this.onCallEndedCallback()
      }

      this.cleanUp()
    } catch (err) {
      console.error("Error al finalizar llamada:", err)
      this.cleanUp()
    }
  }

  // Escuchar por respuesta a la oferta
  private listenForAnswer() {
    if (!this.roomId) return

    const roomRef = firestore().collection("rooms").doc(this.roomId)

    roomRef.onSnapshot(async (snapshot) => {
      const data = snapshot.data()

      if (data?.answer && this.peerConnection?.currentRemoteDescription === null) {
        const answerDescription = new RTCSessionDescription({
          type: data.answer.type,
          sdp: data.answer.sdp,
        })

        await this.peerConnection?.setRemoteDescription(answerDescription)
      }
    })
  }

  // Escuchar por candidatos ICE remotos
  private listenForRemoteCandidates() {
    if (!this.roomId || !this.peerConnection) return

    const roomRef = firestore().collection("rooms").doc(this.roomId)

    // Determinar qué colección escuchar basado en si somos iniciador o no
    const candidatesCollection = this.isInitiator ? "calleeCandidates" : "callerCandidates"

    roomRef.collection(candidatesCollection).onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data()

          if (data && data.candidate) {
            try {
              await this.peerConnection?.addIceCandidate(
                new RTCIceCandidate({
                  candidate: data.candidate,
                  sdpMid: data.sdpMid,
                  sdpMLineIndex: data.sdpMLineIndex,
                }),
              )
            } catch (err) {
              console.error("Error al añadir candidato ICE:", err)
            }
          }
        }
      })
    })
  }

  // Escuchar cambios en el estado de la llamada
  private listenForCallStatusChanges() {
    if (!this.callId) return

    const callRef = firestore().collection("calls").doc(this.callId)

    callRef.onSnapshot((snapshot) => {
      const data = snapshot.data()

      if (data?.status === "ended" || data?.status === "rejected") {
        if (this.onCallEndedCallback) {
          this.onCallEndedCallback()
        }

        this.cleanUp()
      }
    })
  }

  // Limpiar recursos
  private cleanUp() {
    // Detener InCallManager
    InCallManager.stop()

    // Cerrar conexión peer
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Detener streams
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => track.stop())
      this.localStream = null
    }

    this.remoteStream = null
    this.roomId = null
    this.callId = null
    this.isCallActive = false
    this.isInitiator = false
  }

  // Alternar micrófono
  public toggleMute() {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks()
      audioTracks.forEach((track: any) => {
        track.enabled = !track.enabled
      })

      return !audioTracks[0]?.enabled
    }
    return false
  }

  // Alternar cámara
  public toggleCamera() {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks()
      videoTracks.forEach((track: any) => {
        track.enabled = !track.enabled
      })

      return !videoTracks[0]?.enabled
    }
    return false
  }

  // Cambiar entre cámara frontal y trasera
  public switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack._switchCamera()
      }
    }
  }

  // Registrar callback para stream remoto
  public onRemoteStream(callback: (stream: any) => void) {
    this.onRemoteStreamCallback = callback
  }

  // Registrar callback para finalización de llamada
  public onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback
  }

  // Registrar callback para inicio de llamada
  public onCallStarted(callback: () => void) {
    this.onCallStartedCallback = callback
  }

  // Registrar callback para llamada entrante
  public onIncomingCall(callback: (callData: any) => void) {
    this.onIncomingCallCallback = callback
  }

  // Eventos de CallKeep
  private onAnswerCallAction = ({ callUUID }: { callUUID: string }) => {
    // Responder a la llamada desde CallKit
    if (this.callId === callUUID) {
      this.answerCall(callUUID)
    }
  }

  private onEndCallAction = ({ callUUID }: { callUUID: string }) => {
    // Finalizar llamada desde CallKit
    if (this.isCallActive && this.callId === callUUID) {
      this.endCall()
    } else {
      this.rejectCall(callUUID)
    }
  }

  private onDTMFAction = ({ callUUID, digits }: { callUUID: string; digits: string }) => {
    // No implementado para WebRTC básico
    console.log("DTMF:", digits)
  }

  private onStartCallAction = ({ callUUID, handle }: { callUUID: string; handle: string }) => {
    // Iniciar llamada desde CallKit (no implementado en este ejemplo)
    console.log("Iniciar llamada a:", handle)
  }

  private onToggleHoldAction = ({ callUUID, hold }: { callUUID: string; hold: boolean }) => {
    // No implementado para WebRTC básico
    console.log("Toggle hold:", hold)
  }

  private onToggleMuteAction = ({ callUUID, muted }: { callUUID: string; muted: boolean }) => {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks()
      audioTracks.forEach((track: any) => {
        track.enabled = !muted
      })
    }
  }
}

// Exportar instancia singleton
export default new WebRTCService()

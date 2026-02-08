import { db, auth } from "./firebase"
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from "react-native-webrtc"

class CallService {
  // Referencia a la conexión WebRTC
  peerConnection: RTCPeerConnection | null = null

  // Configuración de servidores STUN/TURN
  configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      // Agrega tus servidores TURN aquí si es necesario
    ],
  }

  // Referencia a la sala actual
  currentRoomId: string | null = null

  // Callbacks para eventos
  onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null
  onCallEndedCallback: (() => void) | null = null

  // Inicializar la conexión WebRTC
  initializePeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration)

    // Manejar candidatos ICE
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.currentRoomId) {
        this.addIceCandidate(this.currentRoomId, event.candidate.toJSON())
      }
    }

    // Manejar cambios en el estado de la conexión
    this.peerConnection.oniceconnectionstatechange = () => {
      if (
        this.peerConnection?.iceConnectionState === "disconnected" ||
        this.peerConnection?.iceConnectionState === "failed"
      ) {
        this.endCall()
      }
    }

    // Manejar streams remotos
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0] && this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(event.streams[0])
      }
    }

    return this.peerConnection
  }

  // Crear una nueva sala de llamada
  async createRoom(localStream: MediaStream): Promise<string> {
    if (!auth.currentUser) throw new Error("Usuario no autenticado")

    try {
      // Inicializar conexión WebRTC
      const pc = this.initializePeerConnection()

      // Agregar tracks locales
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      // Crear un nuevo documento para la sala
      const roomsRef = collection(db, "calls")
      const roomRef = doc(roomsRef)
      this.currentRoomId = roomRef.id

      // Guardar información inicial de la sala
      await setDoc(roomRef, {
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        participants: [auth.currentUser.uid],
        status: "waiting", // waiting, connected, ended
      })

      // Crear colecciones para ofertas, respuestas y candidatos ICE
      const offerCandidates = collection(roomRef, "offerCandidates")
      const answerCandidates = collection(roomRef, "answerCandidates")

      // Escuchar por respuestas
      this.listenForAnswers(roomRef.id)

      // Escuchar por candidatos ICE remotos
      this.listenForRemoteCandidates(roomRef.id)

      // Crear oferta SDP
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Guardar oferta en Firestore
      await setDoc(doc(roomRef, "offer"), {
        sdp: offer.sdp,
        type: offer.type,
        timestamp: serverTimestamp(),
      })

      // Escuchar cambios en el estado de la sala
      this.listenForRoomStatusChanges(roomRef.id)

      return roomRef.id
    } catch (error) {
      console.error("Error al crear sala:", error)
      throw error
    }
  }

  // Unirse a una sala existente
  async joinRoom(roomId: string, localStream: MediaStream) {
    if (!auth.currentUser) throw new Error("Usuario no autenticado")

    try {
      // Verificar si la sala existe
      const roomRef = doc(db, "calls", roomId)
      const roomSnapshot = await getDoc(roomRef)

      if (!roomSnapshot.exists()) {
        throw new Error("La sala no existe")
      }

      const roomData = roomSnapshot.data()

      // Verificar si la sala ya está conectada o finalizada
      if (roomData.status === "ended") {
        throw new Error("La llamada ya ha finalizado")
      }

      if (roomData.participants.length >= 2 && !roomData.participants.includes(auth.currentUser.uid)) {
        throw new Error("La sala está llena")
      }

      // Actualizar participantes
      if (!roomData.participants.includes(auth.currentUser.uid)) {
        await updateDoc(roomRef, {
          participants: [...roomData.participants, auth.currentUser.uid],
          status: "connected",
        })
      }

      this.currentRoomId = roomId

      // Inicializar conexión WebRTC
      const pc = this.initializePeerConnection()

      // Agregar tracks locales
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })

      // Obtener la oferta
      const offerDoc = await getDoc(doc(roomRef, "offer"))
      if (!offerDoc.exists()) {
        throw new Error("No se encontró la oferta")
      }

      const offerData = offerDoc.data()
      const offerDescription = new RTCSessionDescription({
        sdp: offerData.sdp,
        type: offerData.type,
      })

      // Establecer descripción remota
      await pc.setRemoteDescription(offerDescription)

      // Crear respuesta
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      // Guardar respuesta en Firestore
      await setDoc(doc(roomRef, "answer"), {
        sdp: answer.sdp,
        type: answer.type,
        timestamp: serverTimestamp(),
      })

      // Escuchar por candidatos ICE remotos
      this.listenForRemoteCandidates(roomId)

      // Escuchar cambios en el estado de la sala
      this.listenForRoomStatusChanges(roomId)

      return roomId
    } catch (error) {
      console.error("Error al unirse a la sala:", error)
      throw error
    }
  }

  // Escuchar por respuestas
  private listenForAnswers(roomId: string) {
    const roomRef = doc(db, "calls", roomId)

    return onSnapshot(doc(roomRef, "answer"), async (snapshot) => {
      if (snapshot.exists() && this.peerConnection && this.peerConnection.currentRemoteDescription === null) {
        const data = snapshot.data()
        const answerDescription = new RTCSessionDescription({
          sdp: data.sdp,
          type: data.type,
        })

        await this.peerConnection.setRemoteDescription(answerDescription)
      }
    })
  }

  // Agregar candidato ICE a Firestore
  private async addIceCandidate(roomId: string, candidate: RTCIceCandidateInit) {
    if (!auth.currentUser) return

    try {
      const roomRef = doc(db, "calls", roomId)
      const isOfferer = (await getDoc(roomRef)).data()?.createdBy === auth.currentUser.uid

      const collectionName = isOfferer ? "offerCandidates" : "answerCandidates"
      await setDoc(doc(collection(roomRef, collectionName)), candidate)
    } catch (error) {
      console.error("Error al agregar candidato ICE:", error)
    }
  }

  // Escuchar por candidatos ICE remotos
  private listenForRemoteCandidates(roomId: string) {
    if (!auth.currentUser || !this.peerConnection) return

    const roomRef = doc(db, "calls", roomId)

    // Determinar si somos el creador de la oferta o el que responde
    getDoc(roomRef).then((snapshot) => {
      if (snapshot.exists()) {
        const isOfferer = snapshot.data().createdBy === auth.currentUser?.uid
        const collectionName = isOfferer ? "answerCandidates" : "offerCandidates"

        // Escuchar por nuevos candidatos
        return onSnapshot(collection(roomRef, collectionName), (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              const data = change.doc.data()
              await this.peerConnection?.addIceCandidate(new RTCIceCandidate(data))
            }
          })
        })
      }
    })
  }

  // Escuchar cambios en el estado de la sala
  private listenForRoomStatusChanges(roomId: string) {
    const roomRef = doc(db, "calls", roomId)

    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()

        if (data.status === "ended" && this.onCallEndedCallback) {
          this.onCallEndedCallback()
          this.cleanUp()
        }
      }
    })
  }

  // Finalizar llamada
  async endCall() {
    if (!this.currentRoomId) return

    try {
      const roomRef = doc(db, "calls", this.currentRoomId)
      await updateDoc(roomRef, {
        status: "ended",
        endedAt: serverTimestamp(),
      })

      this.cleanUp()
    } catch (error) {
      console.error("Error al finalizar llamada:", error)
    }
  }

  // Limpiar recursos
  private cleanUp() {
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.currentRoomId = null
  }

  // Obtener salas activas
  async getActiveRooms() {
    if (!auth.currentUser) throw new Error("Usuario no autenticado")

    try {
      const roomsRef = collection(db, "calls")
      const q = query(roomsRef, where("status", "!=", "ended"))

      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error("Error al obtener salas activas:", error)
      throw error
    }
  }

  // Registrar callbacks
  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback
  }

  onCallEnded(callback: () => void) {
    this.onCallEndedCallback = callback
  }
}

export default new CallService()

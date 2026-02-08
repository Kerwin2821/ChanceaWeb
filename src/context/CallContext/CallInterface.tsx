// Tipos de datos para las llamadas

import { UserData } from "../AuthContext/AuthInterface"

export type CallStatus =
  | "ringing" // Llamada entrante
  | "calling" // Llamada saliente
  | "connected" // Llamada conectada
  | "rejected" // Llamada rechazada
  | "ended" // Llamada finalizada
  | "missed" // Llamada perdida

export interface CallData {
  callId: string
  roomId: string
  roomName: string
  fromId: string
  fromName: string
  fromAvatar?: string | null
  toId: string
  toName: string
  toAvatar?: string | null
  jitsiUrl: string
  status: CallStatus
  startTime: string
  endTime?: string
}

export interface CallContextType {
  isConnected: boolean
  currentCall: CallData | null
  incomingCall: CallData | null
  isCallActive: boolean
  callHistory: CallData[]
  remainingSeconds: number | null
  setRemainingSeconds: (seconds: number | null | ((prev: number | null) => number | null)) => void
  startCall: (
    recipientId: string,
    roomId: string,
    user2: UserData,
    hasVideo?: boolean,
    recipientName?: string,
    recipientAvatar?: string,
  ) => Promise<string>
  answerCall: (callId: string) => Promise<void>
  rejectCall: (callId: string) => Promise<boolean>
  endCall: () => Promise<boolean>
  cancelCall: (roomId: string) => Promise<void>
  onIncomingCall: (callback: (callData: CallData) => void) => void
  onCallStatusChange: (callback: (status: string, callData: CallData) => void) => void
  onCallEnded: (callback: () => void) => void
  generateRoomName: () => string
  requestPermissions: () => Promise<boolean>
  setupFirebaseListeners: any
  handleIncomingCall: any
  navigateToIncomingCall: (callData: CallData, navigate: Function) => void // Nueva función
}

import { UserData } from "../AuthContext/AuthInterface";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";

export interface ChatContextProps {
  Chats: Chats[];
  setChats: (e: Chats[]) => void;
  consultarMensajesChats: (idChat: string) => any,
  consultarChatsUsuario: () => any,
  getChatUsuario: (idChat: string) => any,
  sendMessage: (userData_2: UserData, idChat: string, mensaje: string, statusUser2: string, tipoMensaje?: string) => Promise<void>,
  crearChat: (userData_1: UserData | null, userData_2: UserData, idCombinado: string, message: string, tipoMensaje?: string) => Promise<any>,
  enviarChat: (idChat: string, mensaje: string, tipoMensaje?: string) => Promise<any>,
  actualizarChatUsuarios: (userData_2: UserData, idCombinado: string, mensaje: string, statusUser2: string) => Promise<void>,
  crearChatUsuarios: (userData_1: UserData | null, userData_2: UserData, idCombinado: string, mensaje: string) => Promise<[void, void]>,
  agregarMensajeDesdePerfil: (para: UserData, navigation: NavigationScreenNavigationType) => Promise<void>,
  agregarMensajeDesdeCita: (para: UserData, message: string, navigation: NavigationScreenNavigationType) => Promise<void>,
  chatVisto: (idChat: string) => void
  LastMessage: Mensaje2 | null
  setLastMessage: (e: Mensaje2 | null) => void
  ChatSee: string | undefined, setChatSee: (e: string | undefined) => void
}


export interface Mensaje {
  mensajeId?: string;
  mensaje: string;
  userId: string;
  nombre: string;
  tipoMensaje: string;
  visto: boolean;
  fecha: {
    nanoseconds: number
    seconds: number
  };
}
export interface Mensaje2 {
  mensajeId?: string;
  mensaje: string;
  userId: string;
  nombre: string;
  idChat: string;
  tipoMensaje: string;
  visto: boolean;
  fecha: number;
}

export interface Chats {
  fecha: number
  idChat: string
  infoUser: InfoUser
  ultimoMensaje: string
  picture: string
  visto: boolean
}
export interface ChatsStorage extends Chats {
  notificado: boolean
}

export interface InfoUser {
  displayName: string
  userId: string
}


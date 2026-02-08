import AsyncStorage from "@react-native-async-storage/async-storage";
import { Chats, ChatsStorage, Mensaje2 } from "../context/ChatContext/ChatInterface";
import { NotificationMessage } from "../utils/Helpers";
import { NavigationScreenNavigationType } from "../navigation/StackNavigator";
import { sendNotificationLocal } from "../utils/sendNotification";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { UserData } from "../context/AuthContext/AuthInterface";

const CHATS_STORAGE_KEY = "@chats_data";

// Crear o Añadir un Chat
export const addChat = async (chat: ChatsStorage) => {
  try {
    const chats = await getChats();
    const updatedChats = [...chats, chat];
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));
    console.log("Chat added:", chat);
  } catch (e) {
    console.error("Failed to add chat.", e);
  }
};

// Leer o Obtener Todos los Chats
export const getChats = async (): Promise<ChatsStorage[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHATS_STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch chats.", e);
    return [];
  }
};

// Actualizar un Chat
export const updateChat = async (updatedChat: ChatsStorage) => {
  try {
    const chats = await getChats();
    const chatIndex = chats.findIndex((chat) => chat.idChat === updatedChat.idChat);

    if (chatIndex !== -1) {
      chats[chatIndex] = updatedChat;
      await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(chats));
      console.log("Chat updated:", updatedChat);
    } else {
      console.warn("Chat not found.");
    }
  } catch (e) {
    console.error("Failed to update chat.", e);
  }
};

// Borrar un Chat
export const deleteChat = async (idChat: string) => {
  try {
    const chats = await getChats();
    const updatedChats = chats.filter((chat) => chat.idChat !== idChat);

    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));
    console.log("Chat deleted with id:", idChat);
  } catch (e) {
    console.error("Failed to delete chat.", e);
  }
};

// Borrar Todos los Chats
export const clearChats = async () => {
  try {
    await AsyncStorage.removeItem(CHATS_STORAGE_KEY);
    console.log("All chats cleared");
  } catch (e) {
    console.error("Failed to clear chats.", e);
  }
};

export const initializeChats = async (chats: ChatsStorage[]) => {
  const initializedChats = chats.map((chat, index) => {
    return {
      ...chat,
      notificado: chat.notificado !== undefined ? chat.notificado : false,
    };
  });

  await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(initializedChats));
  console.log("Chats initialized with notificado key.");
};

// Función para verificar y notificar chats no vistos y no notificados
export const checkAndNotifyChats = async (navigation: NavigationScreenNavigationType) => {
  try {
    const chats: ChatsStorage[] = await getChats();

    const updatedChats = chats.map((chat) => {
      // Verificar si el chat no ha sido notificado
      if (!chat.notificado) {
        // Ejecutar la función de notificación
        NotificationMessage(chat.ultimoMensaje, chat, navigation);

        // Marcar como notificado
        console.log(chat, "AUI");
        return { ...chat, notificado: true };
      }
      return chat;
    });

    console.log(updatedChats);

    // Guardar los chats actualizados en AsyncStorage
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));
    console.log("Notification sent and chats updated");
  } catch (e) {
    console.error("Failed to check and notify unseen messages.", e);
    return false;
  }
};

/**
 * Gestiona los chats nuevos y existentes
 */
export const manageChats = async (
  newChats: ChatsStorage[],
  navigation: NavigationScreenNavigationType,
  activeChatId?: string,
): Promise<void> => {
  try {
    const storedChats = await getChats()

    if (!storedChats.length) {
      // Si no hay chats almacenados, inicializamos y guardamos
      await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(newChats));
      return
    }
    console.log(storedChats)

    // Si hay chats existentes, validamos y notificamos
    await validateAndNotifyChats(newChats, storedChats, navigation, activeChatId)
  } catch (error) {
    console.error("Error en manageChats:", error)
  }
}

/**
 * Valida si hay chats nuevos o actualizados y envía notificaciones
 */
export const validateAndNotifyChats = async (
  newChats: ChatsStorage[],
  existingChats: ChatsStorage[],
  navigation: NavigationScreenNavigationType,
  activeChatId?: string,
): Promise<void> => {
  try {
    const updatedChatsList = [...existingChats]
    let hasChanges = false

    for (const newChat of newChats) {
      const existingChatIndex = existingChats.findIndex((chat) => chat.idChat === newChat.idChat)

      if (existingChatIndex === -1) {
        // Es un chat nuevo
        const chatWithNotification = { ...newChat, notificado: true }
        NotificationMessage(newChat.ultimoMensaje, newChat, navigation)
        updatedChatsList.push(chatWithNotification)
        hasChanges = true
      } else {
        const existingChat = existingChats[existingChatIndex]

        // Solo procesamos si no ha sido notificado
        if (existingChat.notificado) continue

        // Verificamos si el mensaje ha cambiado
        const hasNewMessage = newChat.ultimoMensaje !== existingChat.ultimoMensaje

        if (hasNewMessage) {
          // Determinamos si debemos notificar basado en el chat activo
          const shouldNotify = !activeChatId || activeChatId !== existingChat.idChat

          const updatedChat = {
            ...newChat,
            notificado: true,
          }

          if (shouldNotify) {
            NotificationMessage(newChat.ultimoMensaje, newChat, navigation)
          }

          updatedChatsList[existingChatIndex] = updatedChat
          hasChanges = true
        }
      }
    }

    // Solo guardamos si hubo cambios
    if (hasChanges) {
      await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChatsList));
    }
  } catch (error) {
    console.error("Error en validateAndNotifyChats:", error)
  }
}

export const manageChatsLocal = async (
  newChats: ChatsStorage[]
) => {
  const storedChats = await getChats();

  if (!storedChats || !storedChats.length) {
    // Si no hay chats almacenados, inicializamos y guardamos
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(newChats.map(e => ({ ...e, notificado: true }))));
  } else {
    validateAndNotifyChatsLocal(newChats);
  }
};
export const validateAndNotifyChatsLocal = async (
  newChats: ChatsStorage[],
): Promise<void> => {
  const previousChats: ChatsStorage[] = await getChats();
  const newCHATS: ChatsStorage[] = [...newChats];
  const addedChats: ChatsStorage[] = [];
  const updatedChats: ChatsStorage[] = [];
  const NewData = [...previousChats];

  // Validar si un chat fue agregado o actualizado
  newCHATS.forEach((newCHAT) => {
    const existingChat = previousChats.find((chat) => chat.idChat === newCHAT.idChat);
    
    if (!existingChat) {
      // Chat nuevo agregado
      sendNotificationLocal(newCHAT.infoUser.displayName, newCHAT.ultimoMensaje,{
        code: "101",
      });
      addedChats.push({ ...newCHAT, notificado: true });
      NewData.push({ ...newCHAT, notificado: true });
    } else {
      if(existingChat.notificado) return

      const isUpdated = newCHAT.ultimoMensaje !== existingChat.ultimoMensaje;
      if (isUpdated) {
        const indexChat = previousChats.findIndex((chat) => chat.idChat === newCHAT.idChat);
        sendNotificationLocal(newCHAT.infoUser.displayName, newCHAT.ultimoMensaje,{
          code: "101",
        });
        newCHAT.notificado = true; // Marcar para notificación
        updatedChats.push(newCHAT);
        NewData[indexChat] = newCHAT;
      }
    }
  });

  // Enviar notificaciones para chats agregados o actualizados
  if (addedChats.length || updatedChats.length) {
    await AsyncStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(NewData));
  }
};

export function consultarChatsUsuario(user:UserData) {
  return firestore()
    .collection("Clientes")
    .doc(user?.id.toString())
    .collection("userChats")
    .orderBy("fecha", "desc");
}

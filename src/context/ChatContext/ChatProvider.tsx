import { useState, useEffect, useContext, PropsWithChildren } from "react";
import ChatContext from "./ChatContext";
import { Chats, Mensaje, Mensaje2 } from "./ChatInterface";
import useAuth from "../AuthContext/AuthProvider";
import firestore, { firebase } from "@react-native-firebase/firestore";
import { UserData } from "../AuthContext/AuthInterface";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { sendNotification } from "../../utils/sendNotification";
import { Platform } from "react-native";
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const ChatProvider = ({ children }: PropsWithChildren) => {
  const [Chats, setChats] = useState<Chats[]>([]);
  const [LastMessage, setLastMessage] = useState<Mensaje2 | null>(null);
  const [ChatSee, setChatSee] = useState<string | undefined>();
  const { user, SesionToken, TokenAuthApi } = useAuth();
  const date: number = new Date().getTime();
  const [Ele, setEle] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setChatSee(undefined);
      setLastMessage(null);
    }
  }, [user]);

  /* const navigation = useNavigation<NavigationScreenNavigationType>(); */

  function consultarMensajesChats(idChat: string) {
    if (Platform.OS === "web") {
      const messagesRef = collection(db, "Chats", idChat, "Mensajes");
      return query(messagesRef, orderBy("fecha", "asc"), limitToLast(50));
    }
    return firestore().collection("Chats").doc(idChat).collection("Mensajes").orderBy("fecha", "asc").limitToLast(50);
  }

  function consultarChatsUsuario() {
    if (Platform.OS === "web") {
      const chatsRef = collection(db, "Clientes", user?.id.toString() || "temp", "userChats");
      return query(chatsRef, orderBy("fecha", "desc"));
    }
    return firestore().collection("Clientes").doc(user?.id.toString()).collection("userChats").orderBy("fecha", "desc");
  }
  function getChatUsuario(idChat: string) {
    if (Platform.OS === "web") {
      return doc(db, "Clientes", user?.id.toString() || "temp", "userChats", idChat);
    }
    return firestore().collection("Clientes").doc(user?.id.toString()).collection("userChats").doc(idChat);
  }
  function consultarChat(idCombinado: string) {
    if (Platform.OS === "web") {
      const chatRef = doc(db, "Chats", idCombinado);
      return getDoc(chatRef).then((res) => res.data());
    }
    const data = firestore().collection("Chats").doc(idCombinado).get();
    return data.then((res) => res.data());
  }
  function sendMessage(
    userData_2: UserData,
    idChat: string,
    mensaje: string,
    statusUser2: string,
    tipoMensaje: string = "text"
  ) {
    setEle(Ele + 1);
    return new Promise<void>((resolve) => {
      enviarChat(idChat, mensaje, tipoMensaje);
      actualizarChatUsuarios(userData_2, idChat, mensaje, statusUser2);
      sendNotification(
        `${user?.firstName.split(" ")[0]}`,
        mensaje,
        userData_2.externalId,
        { sesionToken: SesionToken, TokenApi: TokenAuthApi },
        {
          code: "101",
        }
      );
      resolve();
    });
  }
  function crearChat(userData_1: UserData | null, userData_2: UserData, idCombinado: string, message: string, tipoMensaje: string = "text") {
    if (Platform.OS === "web") {
      setDoc(doc(db, "Chats", idCombinado), {
        idChat: idCombinado,
        usuario_1: userData_1,
        usuario_2: userData_2,
      });

      return addDoc(collection(db, "Chats", idCombinado, "Mensajes"), {
        mensaje: message,
        userId: user?.id,
        nombre: user?.firstName,
        tipoMensaje: tipoMensaje,
        visto: false,
        fecha: serverTimestamp(),
      });
    }

    firestore().collection("Chats").doc(idCombinado).set({
      idChat: idCombinado,
      usuario_1: userData_1,
      usuario_2: userData_2,
    });

    return firestore()
      .collection("Chats")
      .doc(idCombinado)
      .collection("Mensajes")
      .add({
        mensaje: message,
        userId: user?.id,
        nombre: user?.firstName,
        tipoMensaje: tipoMensaje,
        visto: false,
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }
  function enviarChat(idChat: string, mensaje: string, tipoMensaje: string = "text") {
    if (Platform.OS === "web") {
      return addDoc(collection(db, "Chats", idChat, "Mensajes"), {
        mensaje,
        userId: user?.id,
        nombre: user?.firstName,
        tipoMensaje: tipoMensaje,
        visto: false,
        fecha: serverTimestamp(),
      });
    }
    return firestore()
      .collection("Chats")
      .doc(idChat)
      .collection("Mensajes")
      .add({
        mensaje,
        userId: user?.id,
        nombre: user?.firstName,
        tipoMensaje: tipoMensaje,
        visto: false,
        fecha: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }
  async function actualizarChatUsuarios(
    userData_2: UserData,
    idCombinado: string,
    mensaje: string,
    statusUser2: string
  ) {
    try {
      if (Platform.OS === "web") {
        updateDoc(doc(db, "Clientes", user?.id.toString() || "temp", "userChats", idCombinado), {
          fecha: new Date().getTime(),
          ultimoMensaje: mensaje,
          visto: true,
        });

        updateDoc(doc(db, "Clientes", userData_2.id.toString(), "userChats", idCombinado), {
          fecha: new Date().getTime(),
          ultimoMensaje: mensaje,
          visto: statusUser2 === "online" ? true : false,
        });
        return;
      }

      firestore().collection("Clientes").doc(user?.id.toString()).collection("userChats").doc(idCombinado).update({
        fecha: new Date().getTime(),
        ultimoMensaje: mensaje,
        visto: true,
      });

      firestore()
        .collection("Clientes")
        .doc(userData_2.id.toString())
        .collection("userChats")
        .doc(idCombinado)
        .update({
          fecha: new Date().getTime(),
          ultimoMensaje: mensaje,
          visto: statusUser2 === "online" ? true : false,
        });
    } catch (error) {
      console.log(error);
    }
  }
  async function crearChatUsuarios(
    userData_1: UserData | null,
    userData_2: UserData,
    idCombinado: string,
    mensaje: string
  ) {
    if (Platform.OS === "web") {
      const update1 = setDoc(doc(db, "Clientes", user?.id.toString() || "temp", "userChats", idCombinado), {
        idChat: idCombinado,
        infoUser: {
          userId: userData_2?.id.toString(),
          displayName: userData_2?.firstName,
        },
        fecha: new Date().getTime(),
        ultimoMensaje: mensaje,
        visto: true,
      });

      const update2 = setDoc(doc(db, "Clientes", userData_2?.id.toString(), "userChats", idCombinado), {
        idChat: idCombinado,
        infoUser: {
          userId: userData_1?.id.toString(),
          displayName: user?.firstName,
        },
        fecha: new Date().getTime(),
        ultimoMensaje: mensaje,
        visto: false,
      });

      const updatesCombine = await Promise.all([update1, update2]);
      sendNotification(
        `${userData_1?.firstName.split(" ")[0]} `,
        mensaje,
        userData_2.externalId,
        { sesionToken: SesionToken, TokenApi: TokenAuthApi },
        {
          code: "101",
        }
      );
      return updatesCombine;
    }

    const update1 = firestore()
      .collection("Clientes")
      .doc(user?.id.toString())
      .collection("userChats")
      .doc(idCombinado)
      .set({
        idChat: idCombinado,
        infoUser: {
          userId: userData_2?.id.toString(),
          displayName: userData_2?.firstName,
        },
        fecha: new Date().getTime(),
        ultimoMensaje: mensaje,
        visto: true,
      });

    const update2 = firestore()
      .collection("Clientes")
      .doc(userData_2?.id.toString())
      .collection("userChats")
      .doc(idCombinado)
      .set({
        idChat: idCombinado,
        infoUser: {
          userId: userData_1?.id.toString(),
          displayName: user?.firstName,
        },
        fecha: new Date().getTime(),
        ultimoMensaje: mensaje,
        visto: false,
      });

    const updatesCombine = await Promise.all([update1, update2]);
    sendNotification(
      `${userData_1?.firstName.split(" ")[0]} `,
      mensaje,
      userData_2.externalId,
      { sesionToken: SesionToken, TokenApi: TokenAuthApi },
      {
        code: "101",
      }
    );
    return updatesCombine;
  }
  async function agregarMensajeDesdePerfil(para: UserData, navigation: NavigationScreenNavigationType) {
    // TODO falta el UID del usuario
    try {
      if (!user) {
        return;
      }
      const idCombinado =
        user?.email > para?.email
          ? `${user?.id.toString()}${para?.id.toString()}`
          : para?.id.toString() + user?.id.toString();

      const validate = await consultarChat(idCombinado);
      if (!validate) {
        await crearChat(user, para, idCombinado, "Hi!");
        await crearChatUsuarios(user, para, idCombinado, "Hi!");
      }
      navigation.navigate("MessaginScreen", {
        idDestination: para?.id.toString(),
        idChat: idCombinado,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }
  async function agregarMensajeDesdeCita(para: UserData, message: string, navigation: NavigationScreenNavigationType) {
    // TODO falta el UID del usuario
    try {
      if (!user) {
        return;
      }
      const idCombinado =
        user?.email > para?.email
          ? `${user?.id.toString()}${para?.id.toString()}`
          : para?.id.toString() + user?.id.toString();

      const validate = await consultarChat(idCombinado);
      if (!validate) {
        await crearChat(user, para, idCombinado, message);
        await crearChatUsuarios(user, para, idCombinado, message);
      }
      navigation.navigate("MessaginScreen", {
        idDestination: para?.id.toString(),
        idChat: idCombinado,
      });
      return;
    } catch (error) {
      console.log(error);
    }
  }
  function chatVisto(idChat: string) {
    console.log(user?.id.toString());
    if (Platform.OS === "web") {
      updateDoc(doc(db, "Clientes", user?.id.toString() || "temp", "userChats", idChat), {
        visto: true,
      });
      return;
    }
    firestore().collection("Clientes").doc(user?.id.toString()).collection("userChats").doc(idChat).update({
      visto: true,
    });
  }

  return (
    <ChatContext.Provider
      value={{
        Chats,
        setChats,
        consultarMensajesChats,
        consultarChatsUsuario,
        getChatUsuario,
        sendMessage,
        crearChat,
        enviarChat,
        actualizarChatUsuarios,
        crearChatUsuarios,
        agregarMensajeDesdePerfil,
        agregarMensajeDesdeCita,
        chatVisto,
        LastMessage,
        setLastMessage,
        ChatSee,
        setChatSee,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
export default ChatProvider;

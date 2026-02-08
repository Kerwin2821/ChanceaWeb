import React, { useEffect, useState } from "react";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { consultarChatsUsuario, manageChatsLocal } from "../services/ChatsAsyncStorage";
import { ChatsStorage } from "../context/ChatContext/ChatInterface";
import { GetHeader } from "../utils/Helpers";
import { MatchResponse } from "../context/storeContext/StoreInterface";
import { getBlackListUsers, getCitasEnviadasS, getCitasRecibidasS, HttpService } from "../services";
import { getMatchs, manageMatchsLocal } from "../services/MatchsAsyncStorage";
import { UserData } from "../context/AuthContext/AuthInterface";
import { getSesionToken } from "../services/AsyncStorageMethods";
import { fetch } from "@react-native-community/netinfo";


const BACKGROUND_CHAT_TASK = "background-chat-task";
let hasSynced = false;

/* async function registerBackgroundFetchAsync() {

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_CHAT_TASK)
    if (!isRegistered) {
      return BackgroundFetch.registerTaskAsync(BACKGROUND_CHAT_TASK, {
        minimumInterval: 15, // Verificar cada 15 segundos
        stopOnTerminate: false, // Continuar la tarea si la app se cierra
        startOnBoot: true, // (solo Android) Iniciar la tarea al encender el dispositivo
      });
    } else {
      console.log("Task already registered")
    }
  } catch (err) {
    console.error("Could not register background fetch task:", err)
  }
  
} */

/* async function retryOperation(operation:any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Espera exponencial
    }
  }
} */

// TaskManager.defineTask(BACKGROUND_CHAT_TASK, async () => {
//   try {
//     console.log("Comienza la verificación...");
//     const { isConnected } = await fetch();

//     if(!isConnected){
//       throw new Error
//     }


//     if (isConnected && !hasSynced) {
//       const sesion = await AsyncStorage.getItem("Sesion");
//       const SesionToken = await getSesionToken();
//       /* const Match = await getMatchs();
//       const CitasEnviadas = await getCitasEnviadasS();
//       const CitasRecibidas = await getCitasRecibidasS();
//       const customerBlockList = await getBlackListUsers(); */

//       if (sesion && SesionToken) {
//        /*  const user: UserData = JSON.parse(sesion); */
//        /*  
//         const ChatsData = await retryOperation(async () => {
//           const result = await consultarChatsUsuario(user).get();
//           return result.docs.map((e) => e.data());
//         });

//         Filtrar datos relevantes
//         const dataF = ChatsData.filter((ele:any) => {
//           const userId = ele.infoUser.userId.toString();
//           const existsInMatch = Match.some((e) => e.id.toString() === userId);
//           const existsInCitasEnviadas = CitasEnviadas.some((e) => e.customerDestination.id.toString() === userId);
//           const existsInCitasRecibidas = CitasRecibidas.some((e) => e.customerSource.id.toString() === userId);
//           const existsInBlockList = customerBlockList.some((e) => e.customerDestination.id.toString() === userId);

//           return (existsInMatch || existsInCitasEnviadas || existsInCitasRecibidas) && !existsInBlockList;
//         }); */
//         const username = process.env.AUTH_API_USERNAME;
//         const password = process.env.AUTH_API_PASSWORD;
//         const hostAuth = process.env.APP_BASE_API;
//         const urlAuth = "/api/authenticate";
//         const reqAuth = { username, password };
        
//         const responseAuth = await HttpService("post", hostAuth, urlAuth, reqAuth)

//         if (responseAuth) {
//           const host = process.env.APP_BASE_API;

//           const url = `/api/get/firebase/message?sessionToken=${SesionToken}`;
//           const header = await GetHeader(responseAuth.id_token, "application/json");
          
//           const ChatsData = await HttpService("post", host, url,{}, header);

//           if (ChatsData.length) manageChatsLocal(ChatsData as ChatsStorage[]);
//         }


  
//         /* const responseAuth = await retryOperation(() => 
//           HttpService("post", hostAuth, urlAuth, reqAuth)
//         );

//         if (responseAuth) {
//           const host = process.env.APP_BASE_API;
//           const url = `/api/appchancea/customers/get-my-match/${SesionToken}?page=0&size=1000`;
//           const header = await GetHeader(responseAuth.id_token, "application/json");
          
//           const response: MatchResponse = await retryOperation(() => 
//             HttpService("get", host, url, {}, header)
//           );

//           manageMatchsLocal(response.customers);
//         } */

//         hasSynced = true;
//       }
//     }

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (err) {
//     console.error("Error en la tarea de fondo:", err);
//     hasSynced = false;
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });

export default function TareasProgramadasBackground() {

/*   useEffect(() => {
    ;(async () => {
      await registerBackgroundFetchAsync()
    })()
  }, []) */

  return null;
}
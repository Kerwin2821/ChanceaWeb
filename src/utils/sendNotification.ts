import axios from "axios";
import * as Notifications from "expo-notifications";
import { GetHeader } from "./Helpers";
import { HttpService } from "../services";

export const sendNotification = async (title: string, body: string, deviceId: string,auth:{ sesionToken:string, TokenApi:string}, data?: object) => {

  try {
    const host = process.env.APP_BASE_API;
    const url = `/api/appchancea/customers/sendNotificationPush`;
    const header = await GetHeader(auth.TokenApi, "application/json");
    const response = await HttpService("post", host, url, {
      "sessionToken": auth.sesionToken,
      "registrationToken": deviceId,
      "title": title,
      "body": body,
      "data":data
    }, header);
   
    
    console.log("Notificación enviada:", response);
  } catch (error: any) {
    console.error("Error al enviar la notificación:", error.response ? error.response.data : error.message);
  }
};
// export const sendNotification = async (title: string, body: string, deviceId: string,sesionToken: string, data?: object) => {

//   const fcmUrl = "https://fcm.googleapis.com/v1/projects/chanceaappp-23758/messages:send";
//   const tokenURL = "https://googletokengenerator-still-sunset-1463.fly.dev/get-token";
//   const notification = {
//     title,
//     body,
//   };

//   const req = {
//     message: {
//       token: deviceId,
//       notification: notification,
//       data: data,
//     },
//   };

//   console.log(JSON.stringify(req))
//   try {
//     const token = await axios.get(tokenURL);
//     const response = await axios.post(fcmUrl, req, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token.data.access_token.token}`,
//       },
//     });
//     console.log("Notificación enviada:", response.data);
//   } catch (error: any) {

//     console.error("Error al enviar la notificación:", error.response ? error.response.data : error.message);
//   }
// };
export const sendNotificationLocal = async (title: string, body: string, data?: object) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: data,
    },
    trigger: null, // Envía la notificación inmediatamente
  });
};

import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import messaging from "@react-native-firebase/messaging";
import { useAuth, useRender } from "../context";
import { useStore } from "../context/storeContext/StoreState";
import { useNavigation } from "@react-navigation/native";
import { NavigationScreenNavigationType } from "../navigation/StackNavigator";
import { NotificationCita, ToastCall } from "../utils/Helpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DialogFotoTrampa from "./Dialog/DialogFotoTrampa/DialogFotoTrampa";
import { CustomerProfile } from "../utils/Interface";
import DialogNoFotoTrampa from "./Dialog/DialogNoFotoTrampa/DialogNoFotoTrampa";
import { Cita, DateNotification } from "../utils/Date.interface";
import { BottomTabNavigationType } from "../navigation/BottomTab";
import { getUserLikeById, WholikemeGetUserById } from "../services";
import { getUsersLike } from "../services/CacheStorage/UserLike/UserLikeStorage";
import { CitaNotification, RegaloNotification } from "./PushNotification.interface";
import { clearOrden } from "../services/CacheStorage/Orden/OrdenStorage";
import { CallData } from "../context/CallContext/CallInterface";
import NotificationCallService from "../services/NotificationCallService";
import firestore from "@react-native-firebase/firestore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function PushNotification() {
  const { setUser, user } = useAuth();
  const { soundSave } = useRender();
  const { Match, setMatch } = useStore();
  const navigation = useNavigation<NavigationScreenNavigationType>();
  const navigationBottom = useNavigation<BottomTabNavigationType>();
  const [FotoTrampa, setFotoTrampa] = useState(false);
  const [NoFotoTrampa, setNoFotoTrampa] = useState(false);
  const [ImageUserDenegada, setImageUserDenegada] = useState<CustomerProfile[]>([]);

  useEffect(() => {
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log("Notification caused app to open from background state:", remoteMessage.data);

      if (remoteMessage?.data) {
        if (remoteMessage.data.code === "101") {
          navigation.navigate("Chat");
        }
        if (remoteMessage.data.code === "102") {
          navigation.navigate("DateScreen");
        }
        if (remoteMessage.data.code === "001") {
          navigationBottom.navigate("Megustas");
        }
        if (remoteMessage.data.code === "06") {
          const elRegalo = remoteMessage.data as RegaloNotification;
          navigation.navigate("PaymentRegalosSuccess", {
            data: { boxPackage: { ...elRegalo, id: elRegalo.elementId } },
            amount: elRegalo.amount,
          });
        }
        if (remoteMessage.data.code === "07") {
          const elRegalo = remoteMessage.data as CitaNotification;
          navigation.navigate("PaymentDateSuccess", {
            data: { boxPackage: { ...elRegalo, id: elRegalo.elementId } },
            amount: elRegalo.amount,
          });
        }
        if (remoteMessage.data.code === "08") {
          //Pago de Plan
          navigation.navigate("SubscriptionComplete");
        }

        if (remoteMessage.data?.code === "002") {
          const callId = remoteMessage.data.callId;
          console.log(remoteMessage.data, "call data")
          // Si no hay callId, usar los datos de la notificación directamente
          const data = JSON.parse(remoteMessage.data.newCall as string) as unknown as CallData;
          console.log(remoteMessage.data.newCall)
          navigation.navigate("IncomingCall", { data })
        }
        /* if (remoteMessage.data.code === '021') {
          const data = DataCupouns.find((e) => Number(e.id) === Number(remoteMessage?.data?.elementeId));
          if (data) {
            navigation.navigate('SuccessPayment', data);
          }
        }
        if (remoteMessage.data.code === '022') {
          navigation.navigate('SuccessPaymentPlanNotification', {
            elementeId: remoteMessage.data.elementeId,
            amountPlan: remoteMessage.data.elementeId
          });
        }
        if (remoteMessage.data.code === '06') {
          navigation.navigate('RecibirCuponNotification', {
            loteName: remoteMessage.data.loteName,
            lotedescription: remoteMessage.data.lotedescription,
            urlPromotion: remoteMessage.data.urlPromotion
          });
        }
        if (remoteMessage.data.code === '07') {
          console.log(remoteMessage);
        } */
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(async (remoteMessage) => {
        if (remoteMessage) {
          console.log("Initial Notification", remoteMessage);

          if (remoteMessage.data?.code === "002") {
            // Navegar a la pantalla de llamada entrante después de que la app se inicialice
            const data = JSON.parse(remoteMessage.data.newCall as string) as CallData;
            navigation.navigate("IncomingCall", { data })
          }
        }
      });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });

    const unsubs = messaging().onMessage(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
      if (remoteMessage?.data) {
        console.log("Message handled in the background!", remoteMessage.data.code);
        if (remoteMessage.data.code === "001") {
          let user;
          user = await getUserLikeById(JSON.parse(remoteMessage.data.CustomerId as string));
          if (!user) {
            user = await WholikemeGetUserById(JSON.parse(remoteMessage.data.CustomerId as string));
          }

          navigation.navigate("MatchModal", { Customer: user });
        }
        if (remoteMessage.data.code === "005") {
          const idUserOrigin = Number(remoteMessage.data.customerId as string);
          const filtar = Match.filter((e) => e.id !== idUserOrigin);
          setMatch(filtar);
        }
        if (remoteMessage.data.code === "98") {
          console.log(user);
          if (user) {
            setUser({ ...user, verified: true });
            await AsyncStorage.setItem("Sesion", JSON.stringify({ ...user, verified: true }));
            setNoFotoTrampa(true);
          }
          ToastCall("success", "Foto trampa verificado con exito, no eres foto trampa", "ES");
        }
        if (remoteMessage.data.code === "97") {
          setImageUserDenegada(JSON.parse(remoteMessage.data.customerImages as string) as CustomerProfile[]);
          setFotoTrampa(true);
          ToastCall("warning", "Foto trampa no verificado, eres foto trampa", "ES");
        }
        if (remoteMessage.data.code === "102") {
          const laCita = remoteMessage.data as DateNotification;
          console.log(remoteMessage.data);
          NotificationCita(`Cita con ${laCita.name} `, laCita.message as string, laCita);
        }
        if (remoteMessage.data.code === "06") {
          const elRegalo = remoteMessage.data as RegaloNotification;
          navigation.navigate("PaymentRegalosSuccess", {
            data: { boxPackage: { ...elRegalo, id: elRegalo.elementId } },
            amount: elRegalo.amount,
          });
        }
        if (remoteMessage.data.code === "07") {
          const elRegalo = remoteMessage.data as CitaNotification;
          navigation.navigate("PaymentDateSuccess", {
            data: { boxPackage: { ...elRegalo, id: elRegalo.elementId } },
            amount: elRegalo.amount,
          });
        }
        if (remoteMessage.data.code === "08") {
          //Pago de Plan
          navigation.navigate("SubscriptionComplete");
        }
        if (remoteMessage.data.code === "09") {
          //Notificacion de Cita Finalizada
          const data = remoteMessage.data;
          navigation.navigate("AppointmentRatingScreen", { ...data, type: "CITA" });
        }
        if (remoteMessage.data.code === "10") {
          //Notificacion de Regalo Finalizada
          const data = remoteMessage.data;
          navigation.navigate("AppointmentRatingScreen", { ...data, type: "REGALO" });
        }

        if (remoteMessage.data.code === "002") {
          // Navegar a la pantalla de llamada entrante después de que la app se inicialice
          console.log(remoteMessage.data)
          const data = JSON.parse(remoteMessage.data.newCall as string) as unknown as CallData;
          navigation.navigate("IncomingCall", { data })
        }
        /* if (remoteMessage.data.code === '021') {
          const data = DataCupouns.find((e) => e.id === Number(remoteMessage?.data?.elementeId));
          if (data) {
            navigation.navigate('SuccessPayment', data);
          }
        }
        if (remoteMessage.data.code === '022') {
          navigation.navigate('SuccessPaymentPlanNotification', {
            elementeId: remoteMessage.data.elementeId,
            amountPlan: remoteMessage.data.elementeId
          });
        }
        if (remoteMessage.data.code === '06') {
          navigation.navigate('RecibirCuponNotification', {
            loteName: remoteMessage.data.loteName,
            lotedescription: remoteMessage.data.lotedescription,
            urlPromotion: remoteMessage.data.urlPromotion
          });
        }
        if (remoteMessage.data.code === '07') {
          navigation.navigate('ConsumirCuponNotification', {
            loteName: remoteMessage.data.loteName,
            lotedescription: remoteMessage.data.lotedescription,
            urlPromotion: remoteMessage.data.urlPromotion,
            tokencupon: remoteMessage.data.tokencupon,
            operationId: remoteMessage.data.operationId
          });
        } */
      }
      return;
    });

    return unsubs;
  }, [user]);

  return (
    <>
      <DialogFotoTrampa active={FotoTrampa} setActive={setFotoTrampa} data={ImageUserDenegada} />
      <DialogNoFotoTrampa active={NoFotoTrampa} setActive={setNoFotoTrampa} />
    </>
  );
}
export default PushNotification;

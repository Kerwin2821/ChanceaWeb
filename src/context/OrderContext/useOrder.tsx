import { PropsWithChildren, useContext, useState } from "react";
import OrdenContext from "./OrderContext";
import { Platform } from "react-native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import { deleteSesionToken } from "../../services/AsyncStorageMethods";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GetHeader } from "../../utils/Helpers";
import { clearOrden, getOrden } from "../../services/CacheStorage/Orden/OrdenStorage";
import { OrdenValidationResponse } from "../../utils/Interface";
import { HttpService } from "../../services";
import { CitaNotification, RegaloNotification } from "../../components/PushNotification.interface";
import useAuth from "../AuthContext/AuthProvider";
import { useRender } from "../renderContext/RenderState";

// Create a context with proper typing that won't be null when used

export const OrdenProvider = (props: PropsWithChildren) => {
  const { TokenAuthApi, SesionToken } = useAuth();
  const { setLoader } = useRender();

  const HandlerOrden = async (navigation: NavigationScreenNavigationType) => {
    const orden = await getOrden();
    if (orden) {
      const host = process.env.APP_BASE_API;
      const url = `/api/appchancea/ordens?id.equals=${orden.id}&sessionToken=${SesionToken}&page=0&size=20`;
      const header = await GetHeader(TokenAuthApi, "application/json");
      const response: OrdenValidationResponse = await HttpService("get", host, url, {}, header, setLoader);

      console.log(response, "response ordenes");

      if (response.length && response[0].statusOrden === "PROCESADO") {
        const firstItem = orden.items[0];
        let boxPackage;
        let elRegalo;
        console.log(firstItem);

        switch (response[0].ordenType) {
          case "REGALO":
            boxPackage = firstItem?.boxPackage;

            elRegalo = {
              igtf: boxPackage?.igtf?.toString() ?? null,
              nombre: boxPackage?.nombre ?? "",
              iva: boxPackage?.iva?.toString() ?? null,
              typeBox: boxPackage?.typeBox ?? null,
              totalAmount: orden.totalAmount.toString(),
              code: "06", // Needs external logic to determine the code
              elementId: firstItem?.id?.toString() ?? "",
              id: orden.id.toString(),
              amount: boxPackage?.amount?.toString() ?? null,
              codigoOrden: orden.orderNumber,
              description: boxPackage?.description ?? "",
              imagenUrl: boxPackage?.imagenUrl ?? "",
              totalAmountDolar: "", // Needs external logic for currency conversion
            } as RegaloNotification;

            navigation.navigate("PaymentRegalosSuccess", {
              data: {
                boxPackage: { ...elRegalo, id: elRegalo.elementId },
                customerDestination: { firstName: orden.customer.firstName },
              },
              amount: elRegalo.amount,
            });

            break;

          case "COMPRA_PRODUCTO":
            boxPackage = firstItem?.boxPackage;

            elRegalo = {
              igtf: boxPackage?.igtf ?? 0,
              nombre: boxPackage?.nombre,
              iva: boxPackage?.iva ?? 0,
              typeBox: boxPackage?.typeBox ?? 0,
              totalAmount: firstItem.totalAmount,
              code: "07", // Needs external logic to determine the code
              elementId: firstItem?.id,
              id: orden.id,
              amount: boxPackage?.amount ?? 0,
              codigoOrden: orden.orderNumber,
              customerDestination: `${orden.customer.firstName} ${orden.customer.lastName}`,
              description: boxPackage?.description ?? "",
              imagenUrl: boxPackage?.imagenUrl ?? "",
              totalAmountDolar: boxPackage?.amount, // Needs external logic for currency conversion
              positionX: orden.customer.postionX.toString(),
              positionY: orden.customer.postionY.toString(),
              storeName: "", // Needs external logic to determine the store name
            } as CitaNotification;

            navigation.navigate("PaymentDateSuccess", {
              data: {
                boxPackage: { ...elRegalo, id: elRegalo.elementId },
                customerDestination: { firstName: orden.customer.firstName },
              },
              amount: elRegalo.amount,
            });

            break;
          case "COMPRA_PLAN":
            navigation.navigate("SubscriptionComplete");
            break;

          default:
            break;
        }

        await clearOrden();
      }
    }
  };

  return <OrdenContext.Provider value={{ HandlerOrden }}>{props.children}</OrdenContext.Provider>;
};

export function useOrdenStore() {
  return useContext(OrdenContext);
}

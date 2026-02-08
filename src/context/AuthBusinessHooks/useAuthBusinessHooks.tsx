import { PropsWithChildren, useContext, useState } from "react";
import SesionBusinessContext from "./AuthBusinessHooksContext";
import { SesionBusiness } from "./AuthBusinessHooksInterface";
import { Platform } from "react-native";
import { NavigationScreenNavigationType } from "../../navigation/StackNavigator";
import { useNavigation } from "@react-navigation/native";
import { deleteSesionToken } from "../../services/AsyncStorageMethods";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create a context with proper typing that won't be null when used

export const SessionBusinessProvider = (props: PropsWithChildren) => {
  const [sesionBusiness, setSesionBusiness] = useState<SesionBusiness | null>(null);


  const resetSesion = async () => {
    setSesionBusiness(null);
    await deleteSesionToken()
    await AsyncStorage.setItem("SesionBusiness", "");
  };

  return (
    <SesionBusinessContext.Provider value={{sesionBusiness, setSesionBusiness, resetSesion}}>
      {props.children}
    </SesionBusinessContext.Provider>
  );
};

export function useSesionBusinessStore() {
  return useContext(SesionBusinessContext);
}

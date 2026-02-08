import "./global.css"
import { StatusBar, Text, View } from "react-native";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "./src/utils";
import AppMultiContext from "./src/utils/AppMultiContext";
import RenderState from "./src/context/renderContext/RenderState";
import RegisterState from "./src/context/registerContext/RegisterState";
import StoreState from "./src/context/storeContext/StoreState";
import { AuthProvider } from "./src/context/AuthContext/AuthProvider";
import ChatProvider from "./src/context/ChatContext/ChatProvider";
import { CallProvider } from "./src/context/CallContext/CallProvider";
import { SessionBusinessProvider } from "./src/context/AuthBusinessHooks/useAuthBusinessHooks";
import { CopilotProvider } from "react-native-copilot";
import { OrdenProvider } from "./src/context/OrderContext/useOrder";
import { Tooltip } from "./src/components/CopilotStep/Tooltip";
import { StepNumber } from "./src/components/CopilotStep/StepNumber";
import AppLoader from "./src/components/accesories/loader";
import CheckConnection from "./src/components/CheckConnection";
import DialogNoConnection from "./src/components/Dialog/DialogNoConnection/DialogNoConnection";
import { NavigationContainer } from "@react-navigation/native";
import PushNotification from "./src/components/PushNotification";
import StackNavigator from "./src/navigation/StackNavigator";
import ToastNotification from "./src/components/ToastNotification";
import { useReducedMotion } from 'react-native-reanimated';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { theme } from "./src/utils/Theme";
import { ThemeProvider } from "@rn-vui/themed"

const ContextProviders = [
  <ThemeProvider theme={theme} />,
  <RenderState />,
  <RegisterState />,
  <StoreState />,
  <AuthProvider />,
  <ChatProvider />,
  <CallProvider />,
  <SessionBusinessProvider />,
  <CopilotProvider tooltipStyle={{ borderRadius: 8 }} tooltipComponent={Tooltip} stepNumberComponent={StepNumber} />,
  <OrdenProvider />,
];

export default function App() {
  const [key, setKey] = useState(0)
  const [first, setfirst] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const [fontsLoaded, errorFonts] = useFonts({
    Regular: require("./assets/fonts/Mulish-Regular.ttf"),
    Light: require("./assets/fonts/Mulish-Light.ttf"),
    ExtraLight: require("./assets/fonts/Mulish-ExtraLight.ttf"),
    Medium: require("./assets/fonts/Mulish-Medium.ttf"),
    SemiBold: require("./assets/fonts/Mulish-SemiBold.ttf"),
    Bold: require("./assets/fonts/Mulish-Bold.ttf"),
    ExtraBold: require("./assets/fonts/Mulish-ExtraBold.ttf"),
  });
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || errorFonts) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, errorFonts]);


  console.log(prefersReducedMotion, "Animation Reduced Motion");



  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView} key={key}>
        <StatusBar hidden={false} animated backgroundColor={Colors.primary} />
        <AppMultiContext providers={ContextProviders}>
          <AppLoader />
          <NavigationContainer>
            <PushNotification />
            <StackNavigator />
            <ToastNotification />
          </NavigationContainer>
        </AppMultiContext>

      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
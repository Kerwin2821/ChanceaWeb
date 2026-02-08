import React, { useState, PropsWithChildren, useEffect, createContext, useContext } from "react";
import { RenderContextProps } from "./RenderInterface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { Keyboard, LayoutAnimation } from "react-native";
import { Advertisements } from "../../screens/BottomBar/Promotions";
const RenderContext = createContext({} as RenderContextProps);

const RenderState = ({ children }: PropsWithChildren) => {
  const [loader, setLoader] = useState<boolean>(false);
  const [firstTime, setFirstTime] = useState<boolean>(false);
  const [language, setLanguage] = useState<"ES" | "EN">("ES");
  const [PrecioDolar, setPrecioDolar] = useState<number>(0);
  const [LocationPermisson, setLocationPermisson] = useState(false);
  const [soundQ, setSound] = useState<any>();
  const [soundVideo, setSoundVideo] = useState<boolean>(true);
  const [playVideo, setPlayVideo] = useState<boolean>(true);
  const [KeyboardStatus, setKeyboardStatus] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [UpdateShow, setUpdateShow] = useState(false);
  const [DataAds, setDataAds] = useState<Advertisements[]>([]);

  const resetTimer = () => {
    setSeconds(0);
    setRunning(true);
  };

  const soundSave = async () => {
    const { sound } = await Audio.Sound.createAsync(require("../../../assets/sound/matchSound.wav"));

    setSound(sound);

    try {
      await sound.playAsync();
    } catch (error) {
    } finally {
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          const tiempoActual = status.positionMillis;
          const duracionTotal = status.durationMillis;
          if (duracionTotal !== undefined && tiempoActual >= 2000) {
            await sound.unloadAsync();
            await sound.stopAsync();
          }
        }
      });
    }
  };
  useEffect(() => {
    return soundQ
      ? () => {
        console.log("Unloading Sound");
        soundQ.unloadAsync();
      }
      : undefined;
  }, [soundQ]);

  const validatePermisson = async () => {
    const data = await AsyncStorage.getItem("LocationPermissonData");
    if (data) {
      setLocationPermisson(!!Number(data));
    }
  };
  useEffect(() => {
    validatePermisson();
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", (event) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardStatus(true); // or some other action
      setKeyboardHeight(event.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardStatus(false); // or some other action
      setKeyboardHeight(0);
    });
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          // Esta línea obliga al audio a sonar aunque el iPhone esté en silencio
          playsInSilentModeIOS: true,

          // Opcional: Esto permite que el audio siga si la app pasa a segundo plano
          staysActiveInBackground: false,

          // Opcional: Configuración recomendada para Android
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio configurado para ignorar modo silencio');
      } catch (error) {
        console.error(error);
      }
    };

    configureAudio();
  }, []);


  /* useEffect(() => {
    console.log(KeyboardStatus, "KeyboardStatus");
  }, [KeyboardStatus]) */

  return (
    <RenderContext.Provider
      value={{
        loader,
        language,
        firstTime,
        PrecioDolar,
        setLoader,
        setFirstTime,
        setLanguage,
        setPrecioDolar,
        LocationPermisson,
        setLocationPermisson,
        soundQ,
        setSound,
        soundSave,
        KeyboardStatus,
        keyboardHeight,
        setKeyboardHeight,
        seconds,
        setSeconds,
        running,
        setRunning,
        resetTimer,
        UpdateShow,
        setUpdateShow,
        DataAds,
        setDataAds,
        soundVideo,
        setSoundVideo,
        playVideo,
        setPlayVideo
      }}
    >
      {children}
    </RenderContext.Provider>
  );
};
export const useRender = () => useContext(RenderContext);

export default RenderState;

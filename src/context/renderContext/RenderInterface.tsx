import { Advertisements } from "../../screens/BottomBar/Promotions";

export interface RenderContextProps {
  loader: boolean;
  firstTime: boolean;
  language: "ES" | "EN";
  setLoader: (e: boolean) => void;
  setFirstTime: (e: boolean) => void;
  setLanguage: (e: "ES" | "EN") => void;
  PrecioDolar: number;
  setPrecioDolar: (e: number) => void;
  LocationPermisson: boolean;
  KeyboardStatus: boolean;
  setLocationPermisson: (e: boolean) => void;
  soundQ: any;
  setSound: (e: any) => void;
  soundSave: () => void;
  keyboardHeight: number;
  setKeyboardHeight: (e: number) => void;
  seconds: number;
  setSeconds: React.Dispatch<React.SetStateAction<number>>;
  running: boolean;
  setRunning: (e: boolean) => void;
  UpdateShow: boolean;
  setUpdateShow: (e: boolean) => void;
  resetTimer: () => void;
  DataAds: Advertisements[];
  setDataAds: (e: Advertisements[]) => void;
  soundVideo: boolean,
  setSoundVideo: (e: boolean) => void
  playVideo: boolean,
  setPlayVideo: (e: boolean) => void
}

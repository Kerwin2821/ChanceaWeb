import { useCallback } from 'react';
import { Dimensions, Platform } from 'react-native';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { CustomersHome } from './Interface';
import { UserData } from '../context/AuthContext/AuthInterface';
import { Chats, InfoUser } from '../context/ChatContext/ChatInterface';
import { NavigationScreenNavigationType } from '../navigation/StackNavigator';
import crypto from 'crypto-js';
import { Cita, DateNotification } from './Date.interface';

const ALERTS = {
  warning: 'Alerta  ⚠️',
  success: 'Listo  ✅',
  error: 'Upss.. Algo ocurrio❗'
};

type TypeToast = 'warning' | 'error' | 'success' | "tomatoToast";

type Token = string | null;

type ContentType =
  | 'application/json'
  | 'multipart/form-data'
  | 'application/x-www-form-urlencoded';

export const GetHeader = (token: Token, contentType: ContentType, gzip?: boolean): Headers => {
  let obj: any = {
    Authorization: `Bearer ${token}`,
    accept: '*/*',
    'Content-Type': contentType
  };

  // Explicitly exclude Content-Disposition and Content-Encoding on web
  if (Platform.OS !== 'web') {
    if (contentType === 'multipart/form-data') {
      obj['Content-Disposition'] = 'form-data';
    }

    if (gzip) {
      obj['Content-Encoding'] = 'gzip';
    }
  } else {
    // Failsafe for web: never allow these headers
    delete obj['Content-Encoding'];
    delete obj['Content-Disposition'];
  }

  return obj;
};

export const ToastCall = (
  type: TypeToast,
  message: string,
  language: 'ES' | 'EN'
): void => {
  Toast.show({
    type: type,
    text1: type !== "tomatoToast" ? ALERTS[type] : undefined,
    text2: message,
    props: { uuid: 'bba1a7d0-6ab2-4a0a-a76e-ebbe05ae6d70' },
    visibilityTime: 4000
  });
};

export const NotificationMessage = (
  message: string,
  user: Chats
): void => {
  console.log(user, "ENVIADO")
  Toast.show({
    type: "Message",
    text1: user.infoUser.displayName,
    text2: message,
    props: { ...user },
    visibilityTime: 4000
  });
};
export const NotificationCita = (
  title: string,
  message: string,
  cita: DateNotification
): void => {
  Toast.show({
    type: "Cita",
    text1: title,
    text2: message,
    props: { ...cita },
    visibilityTime: 4000
  });
};


export const { width, height } = Dimensions.get('window');

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


/**
 * esta función devuelve un nuevo array que contiene los objetos de arrayA cuyos id no coinciden con ningún id en arrayB. 
 *
 * @returns Este retorna array nuevo filtrado.
 */

export function filtrarObjetosIguales(arrayA: any[], arrayB: any[]) {
  return arrayA.filter(objetoA => {
    return arrayB.some(objetoB => objetoA.id === objetoB.id);
  });
}
export function removeDuplicates<T>(array1: T[], array2: T[], key: keyof T): T[] {
  const combinedArray = [...array1, ...array2];
  const uniqueKeys = new Set();

  return combinedArray.filter(obj => {
    const keyValue = obj[key];
    if (!uniqueKeys.has(keyValue)) {
      uniqueKeys.add(keyValue);
      return true;
    }
    return false;
  });
}

export function calcularEdad(fechaNacimiento: string) {
  const fechaNacimientoObj = new Date(fechaNacimiento);
  const fechaActual = new Date();

  let edad = fechaActual.getFullYear() - fechaNacimientoObj.getFullYear();
  const mesActual = fechaActual.getMonth();
  const mesNacimiento = fechaNacimientoObj.getMonth();

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && fechaActual.getDate() < fechaNacimientoObj.getDate())) {
    edad--;
  }

  return edad;
}

/**
 * calcularDistancia toma las coordenadas de dos puntos (x1, y1) y (x2, y2) y devuelve la distancia euclidiana entre ellos.
 *
 * @returns Este retorna la distancia en Metros.
 */
export function calcularDistancia(x1: number, y1: number, x2: number, y2: number) {
  const radioTierra = 6371000; // Radio de la Tierra en metros
  const dLat = toRadians(y2 - y1);
  const dLon = toRadians(x2 - x1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(y1)) * Math.cos(toRadians(y2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = radioTierra * c;
  return Math.round(Math.round(distancia) / 1000);
}

function toRadians(grados: number): number {
  return grados * Math.PI / 180;
}


export const encrypt = (strToEncrypt: string, secret: string) => {
  // Crear clave secreta como bytes UTF-8
  const key = crypto.enc.Utf8.parse(secret);

  // Cifrar la cadena
  const encrypted = crypto.AES.encrypt(crypto.enc.Utf8.parse(strToEncrypt), key, {
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7,
  }).toString();

  return encrypted;
};
export const decrypt = (encryptedData: string, secret: string) => {
  // Crear clave secreta como bytes UTF-8
  const key = crypto.enc.Utf8.parse(secret);

  // Desencriptar
  const decrypted = crypto.AES.decrypt(encryptedData, key, {
    mode: crypto.mode.ECB,
    padding: crypto.pad.Pkcs7,
  });

  // Convertir los bytes desencriptados a cadena UTF-8
  const decryptedStr = decrypted.toString(crypto.enc.Utf8);

  return decryptedStr;
};

export const fixAccents = (str: string) => {
  return str
    // Minúsculas mal codificadas
    .replace(/Ã©/g, 'é')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã­/g, 'í')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã²/g, 'ò')
    .replace(/Ã¼/g, 'ü')
    // Mayúsculas mal codificadas
    .replace(/Ã‰/g, 'É')
    .replace(/Ã�/g, 'Á')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã�/g, 'Í')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã‹/g, 'Ë')
    .replace(/Ã‹/g, 'Ü')
    .replace(/Ã€/g, 'À')
    .replace(/ÃŒ/g, 'Ì')
    .replace(/Ã�/g, 'È');
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageData {
  url: string;
  base64: string;
  expirationDate: number; // Timestamp en milisegundos
}

export interface AdsStorage {
  [key: string]: ImageData;
}

const STORAGE_KEY = 'adsStorage';

// Función para guardar o actualizar todo el almacenamiento de anuncios (Crear/Actualizar)
export const saveAdsStorage = async (adsStorage: AdsStorage): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(adsStorage));
  } catch (error) {
    console.error('Error al guardar el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para añadir o actualizar un anuncio (Crear/Actualizar)
export const addOrUpdateAdStorage = async (key: string, imageData: ImageData): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: AdsStorage = existingData ? JSON.parse(existingData) : {};

    parsedData[key] = imageData;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error al añadir o actualizar el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para obtener todos los anuncios (Leer)
export const getAdsStorage = async (): Promise<AdsStorage> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : {};
  } catch (error) {
    console.error('Error al obtener el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para comprobar si existe un anuncio (Leer)
export const isAdStorageExist = async (key: string): Promise<boolean> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: AdsStorage = JSON.parse(existingData);
      return key in parsedData;
    }
    return false;
  } catch (error) {
    console.error('Error al comprobar el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para eliminar un anuncio (Eliminar)
export const deleteAdStorage = async (key: string): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: AdsStorage = JSON.parse(existingData);
      if (key in parsedData) {
        delete parsedData[key];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      }
    }
  } catch (error) {
    console.error('Error al eliminar el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para borrar todos los anuncios (Eliminar Todo)
export const clearAdsStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al borrar el almacenamiento de anuncios:', error);
    throw error;
  }
};

// Función para obtener un anuncio por clave (Leer)
export const getAdStorageByKey = async (key: string): Promise<ImageData | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: AdsStorage = JSON.parse(existingData);
      return parsedData[key] || null;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener el almacenamiento de anuncios por clave:', error);
    throw error;
  }
};

// Función para actualizar la fecha de expiración de un anuncio
export const updateAdExpirationDate = async (key: string, newExpirationDate: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: AdsStorage = JSON.parse(existingData);
      if (key in parsedData) {
        parsedData[key].expirationDate = newExpirationDate;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      }
    }
  } catch (error) {
    console.error('Error al actualizar la fecha de expiración del anuncio:', error);
    throw error;
  }
};

// Función para eliminar anuncios expirados
export const removeExpiredAds = async (): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: AdsStorage = JSON.parse(existingData);
      const currentTime = Date.now();
      
      for (const key in parsedData) {
        if (parsedData[key].expirationDate < currentTime) {
          delete parsedData[key];
        }
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    }
  } catch (error) {
    console.error('Error al eliminar anuncios expirados:', error);
    throw error;
  }
};

// Ejemplo de uso
/* async function testAdsStorage() {
  // Añadir algunos anuncios de ejemplo
  await addOrUpdateAdStorage('ad1', {
    url: 'https://example.com/ad1.jpg',
    base64: 'base64_encoded_string_1',
    expirationDate: Date.now() + 86400000 // 24 horas desde ahora
  });

  await addOrUpdateAdStorage('ad2', {
    url: 'https://example.com/ad2.jpg',
    base64: 'base64_encoded_string_2',
    expirationDate: Date.now() + 172800000 // 48 horas desde ahora
  });

  // Obtener todos los anuncios
  const allAds = await getAdsStorage();
  console.log("Todos los anuncios:", allAds);

  // Comprobar si existe un anuncio
  const adExists = await isAdStorageExist('ad1');
  console.log("¿Existe el anuncio 'ad1'?:", adExists);

  // Obtener un anuncio por clave
  const ad1 = await getAdStorageByKey('ad1');
  console.log("Anuncio 'ad1':", ad1);

  // Actualizar la fecha de expiración de un anuncio
  await updateAdExpirationDate('ad1', Date.now() + 259200000); // 72 horas desde ahora

  // Obtener el anuncio actualizado
  const updatedAd1 = await getAdStorageByKey('ad1');
  console.log("Anuncio 'ad1' actualizado:", updatedAd1);

  // Eliminar un anuncio
  await deleteAdStorage('ad2');

  // Obtener todos los anuncios después de la eliminación
  const remainingAds = await getAdsStorage();
  console.log("Anuncios restantes:", remainingAds);

  // Simular el paso del tiempo y eliminar anuncios expirados
  await removeExpiredAds();

  // Verificar los anuncios después de eliminar los expirados
  const currentAds = await getAdsStorage();
  console.log("Anuncios actuales después de eliminar expirados:", currentAds);

  // Borrar todos los anuncios
  await clearAdsStorage();

  // Verificar que todos los anuncios se han borrado
  const clearedAds = await getAdsStorage();
  console.log("Anuncios después de borrar todo:", clearedAds);
} */

/* testAdsStorage() */;
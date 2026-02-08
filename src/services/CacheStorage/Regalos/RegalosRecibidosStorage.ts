import { Regalo } from '../../../utils/Date.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';


const STORAGE_KEY = 'RegalosRecibidasS';


// Función para agregar o actualizar una Regalo (Create/Update)
export const setRegalosRecibidasS = async (Regalos: Regalo[]): Promise<void> => {
    try {
  
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Regalos));
    } catch (error) {
      console.error('Error guardando la Regalo:', error);
    }
  };

// Función para agregar o actualizar una Regalo (Create/Update)
export const saveRegalosRecibidasS = async (Regalo: Regalo): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: Regalo[] = existingData ? JSON.parse(existingData) : [];

    // Verifica si la Regalo ya existe en la lista
    const index = parsedData.findIndex(item => item.id === Regalo.id);
    
    if (index > -1) {
      // Actualiza la Regalo si ya existe
      parsedData[index] = Regalo;
    } else {
      // Agrega una nueva Regalo si no existe
      parsedData.push(Regalo);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error guardando la Regalo:', error);
  }
};

// Función para obtener todas las Regalos (Read)
export const getRegalosRecibidasS = async (): Promise<Regalo[]> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : [];
  } catch (error) {
    console.error('Error al obtener las Regalos:', error);
    return [];
  }
};

// Función para obtener una Regalo específica por su ID (Read)
export const getRegalosRecibidasSById = async (id: number): Promise<Regalo | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: Regalo[] = JSON.parse(existingData);
      return parsedData.find(Regalo => Regalo.id === id) || null;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener la Regalo:', error);
    return null;
  }
};

// Función para eliminar una Regalo por su ID (Delete)
export const deleteRegalosRecibidasS = async (id: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: Regalo[] = JSON.parse(existingData);
      const updatedData = parsedData.filter(Regalo => Regalo.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Error al eliminar la Regalo:', error);
  }
};

// Función para limpiar todas las Regalos (Delete All)
export const clearRegalosRecibidasS = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar las Regalos:', error);
  }
};

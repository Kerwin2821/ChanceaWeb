import { Cita } from './../../../utils/Date.interface';
import AsyncStorage from '@react-native-async-storage/async-storage';


const STORAGE_KEY = 'CitasEnviadasS';


// Función para agregar o actualizar una cita (Create/Update)
export const setCitasEnviadasS = async (citas: Cita[]): Promise<void> => {
    try {
  
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
    } catch (error) {
      console.error('Error guardando la cita:', error);
    }
  };

// Función para agregar o actualizar una cita (Create/Update)
export const saveCitasEnviadasS = async (cita: Cita): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: Cita[] = existingData ? JSON.parse(existingData) : [];

    // Verifica si la cita ya existe en la lista
    const index = parsedData.findIndex(item => item.id === cita.id);
    
    if (index > -1) {
      // Actualiza la cita si ya existe
      parsedData[index] = cita;
    } else {
      // Agrega una nueva cita si no existe
      parsedData.push(cita);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error guardando la cita:', error);
  }
};

// Función para obtener todas las citas (Read)
export const getCitasEnviadasS = async (): Promise<Cita[]> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : [];
  } catch (error) {
    console.error('Error al obtener las citas:', error);
    return [];
  }
};

// Función para obtener una cita específica por su ID (Read)
export const getCitasEnviadasSById = async (id: number): Promise<Cita | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: Cita[] = JSON.parse(existingData);
      return parsedData.find(cita => cita.id === id) || null;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener la cita:', error);
    return null;
  }
};

// Función para eliminar una cita por su ID (Delete)
export const deleteCitasEnviadasS = async (id: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: Cita[] = JSON.parse(existingData);
      const updatedData = parsedData.filter(cita => cita.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
  }
};

// Función para limpiar todas las citas (Delete All)
export const clearCitasEnviadasS = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar las citas:', error);
  }
};

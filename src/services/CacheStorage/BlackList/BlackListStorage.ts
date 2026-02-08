import { CustomerBlackList } from './../../../context/AuthContext/AuthInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';


const STORAGE_KEY = 'customerBlackList';

// Función para agregar o actualizar un usuario en la lista negra (Create/Update)
export const saveBlackListUsers = async (blackListUsers: CustomerBlackList[]): Promise<void> => {
    try {

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blackListUsers));
    } catch (error) {
      console.error('Error guardando en la lista negra:', error);
    }
  };

// Función para agregar o actualizar un usuario en la lista negra (Create/Update)
export const saveBlackListUser = async (blackListUser: CustomerBlackList): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: CustomerBlackList[] = existingData ? JSON.parse(existingData) : [];

    // Verifica si el usuario ya existe en la lista
    const index = parsedData.findIndex(item => item.id === blackListUser.id);
    
    if (index > -1) {
      // Actualiza el usuario si ya existe
      parsedData[index] = blackListUser;
    } else {
      // Agrega el nuevo usuario si no existe
      parsedData.push(blackListUser);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error guardando en la lista negra:', error);
  }
};

// Función para obtener todos los usuarios de la lista negra (Read)
export const getBlackListUsers = async (): Promise<CustomerBlackList[]> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : [];
  } catch (error) {
    console.error('Error al obtener los usuarios de la lista negra:', error);
    return [];
  }
};

// Función para obtener un usuario específico de la lista negra por su ID (Read)
export const getBlackListUserById = async (id: number): Promise<CustomerBlackList | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: CustomerBlackList[] = JSON.parse(existingData);
      return parsedData.find(user => user.id === id) || null;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener el usuario de la lista negra:', error);
    return null;
  }
};

// Función para eliminar un usuario de la lista negra por su ID (Delete)
export const deleteBlackListUser = async (id: number): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: CustomerBlackList[] = JSON.parse(existingData);
      const updatedData = parsedData.filter(user => user.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    }
  } catch (error) {
    console.error('Error al eliminar el usuario de la lista negra:', error);
  }
};

// Función para limpiar toda la lista negra (Delete All)
export const clearBlackList = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar la lista negra:', error);
  }
};

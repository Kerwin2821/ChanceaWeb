import { UserData } from './../../../context/AuthContext/AuthInterface';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wholikemeUsers';

export const WholikemeSaveUsers = async (userData: UserData[]): Promise<void> => {
    try {

      const updatedData = userData;
  
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
      console.log('Usuarios guardado exitosamente en Wholikeme');
    } catch (error) {
      console.error('Error guardando usuario en Wholikeme:', error);
    }
  };

// Función para agregar o actualizar un usuario (Create/Update)
export const WholikemeSaveUser = async (userData: UserData): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: UserData[] = existingData ? JSON.parse(existingData) : [];

    // Si existe un usuario con el mismo ID, se actualiza, si no, se agrega uno nuevo
    const updatedData = parsedData.some((user: UserData) => user.id === userData.id)
      ? parsedData.map((user: UserData) => (user.id === userData.id ? userData : user))
      : [...parsedData, userData];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    console.log('Usuario guardado/actualizado exitosamente en Wholikeme');
  } catch (error) {
    console.error('Error guardando/actualizando usuario en Wholikeme:', error);
  }
};

// Función para obtener todos los usuarios (Read)
export const WholikemeGetUsers = async (): Promise<UserData[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error obteniendo usuarios de Wholikeme:', error);
    return [];
  }
};

// Función para obtener un usuario específico por su ID (Read)
export const WholikemeGetUserById = async (id: number): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedData: UserData[] = JSON.parse(data);
      return parsedData.find((user: UserData) => user.id === id) || null;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario por ID de Wholikeme:', error);
    return null;
  }
};

// Función para eliminar un usuario por su ID (Delete)
export const WholikemeDeleteUser = async (id: number): Promise<void> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsedData: UserData[] = JSON.parse(data);
      const filteredData = parsedData.filter((user: UserData) => user.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
      console.log('Usuario eliminado exitosamente de Wholikeme');
    }
  } catch (error) {
    console.error('Error eliminando usuario de Wholikeme:', error);
  }
};

// Función para eliminar todos los usuarios (opcional)
export const WholikemeClearAllUsers = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Todos los usuarios fueron eliminados de Wholikeme');
  } catch (error) {
    console.error('Error eliminando todos los usuarios de Wholikeme:', error);
  }
};

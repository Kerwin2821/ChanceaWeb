import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FirstTimeLoginValida {
  firstTimeLogin: boolean;
  id: string;
}

export const saveUserData = async (data: FirstTimeLoginValida) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem("firstTimeLogin", jsonValue);
  } catch (e) {
    console.error("Failed to save user data.", e);
  }
};

export const getUserData = async (): Promise<FirstTimeLoginValida | undefined> => {
  try {
    const jsonValue = await AsyncStorage.getItem("firstTimeLogin");
    return jsonValue ? JSON.parse(jsonValue) : undefined;
  } catch (e) {
    console.error("Failed to fetch user data.", e);
  }
};


const SESION_TOKEN_KEY = 'SesionToken';

// Create or Update
export const saveSesionToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(SESION_TOKEN_KEY, token);
    console.log(`Token guardado: ${token}`);
  } catch (error) {
    console.error('Error al guardar el token:', error);
    throw new Error('No se pudo guardar el token.');
  }
};

// Read
export const getSesionToken = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(SESION_TOKEN_KEY);
    if (storedToken !== null) {
      console.log(`Token cargado: ${storedToken}`);
      return storedToken;
    } else {
      console.log('No se encontró ningún token guardado.');
      return null;
    }
  } catch (error) {
    console.error('Error al cargar el token:', error);
    throw new Error('No se pudo cargar el token.');
  }
};

// Delete
export const deleteSesionToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SESION_TOKEN_KEY);
    console.log('Token eliminado');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
    throw new Error('No se pudo eliminar el token.');
  }
};

const SEEN_USERS_KEY = 'SeenUserIds';

export const getSeenUsers = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SEEN_USERS_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch seen users.", e);
    return [];
  }
};

export const saveSeenUser = async (userId: string) => {
  try {
    const currentSeen = await getSeenUsers();
    if (!currentSeen.includes(userId)) {
      const newSeen = [...currentSeen, userId];
      await AsyncStorage.setItem(SEEN_USERS_KEY, JSON.stringify(newSeen));
    }
  } catch (e) {
    console.error("Failed to save seen user.", e);
  }
};

export const clearSeenUsers = async () => {
  try {
    await AsyncStorage.removeItem(SEEN_USERS_KEY);
  } catch (e) {
    console.error("Failed to clear seen users.", e);
  }
};
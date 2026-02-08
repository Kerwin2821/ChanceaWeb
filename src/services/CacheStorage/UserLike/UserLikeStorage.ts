import { CustomersHome } from '../../../utils/Interface';

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_LIKE_STORAGE_KEY = '@users_like_data';

// Guardar o actualizar un usuario
export const saveUserLike = async (user: CustomersHome): Promise<void> => {
  try {
    const storedUsers = await getUsersLike();
    const updatedUsers = storedUsers ? [...storedUsers.filter(u => u.id !== user.id), user] : [user];
    await AsyncStorage.setItem(USERS_LIKE_STORAGE_KEY, JSON.stringify(updatedUsers));
    console.log('Usuario guardado o actualizado correctamente.');
  } catch (e) {
    console.error('Error al guardar el usuario.', e);
  }
};

// Obtener la lista de todos los usuarios
export const getUsersLike = async (): Promise<CustomersHome[] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(USERS_LIKE_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error al obtener los usuarios.', e);
    return null;
  }
};

// Obtener un usuario por ID
export const getUserLikeById = async (id: number): Promise<CustomersHome | null> => {
  try {
    const storedUsers = await getUsersLike();
    return storedUsers ? storedUsers.find(user => user.id === id) || null : null;
  } catch (e) {
    console.error('Error al obtener el usuario.', e);
    return null;
  }
};

// Eliminar un usuario por ID
export const deleteUserLikeById = async (id: number): Promise<void> => {
  try {
    const storedUsers = await getUsersLike();
    if (storedUsers) {
      const updatedUsers = storedUsers.filter(user => user.id !== id);
      await AsyncStorage.setItem(USERS_LIKE_STORAGE_KEY, JSON.stringify(updatedUsers));
      console.log('Usuario eliminado correctamente.');
    }
  } catch (e) {
    console.error('Error al eliminar el usuario.', e);
  }
};

// Eliminar todos los usuarios almacenados
export const deleteAllUsersLike = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USERS_LIKE_STORAGE_KEY);
    console.log('Todos los usuarios han sido eliminados correctamente.');
  } catch (e) {
    console.error('Error al eliminar todos los usuarios.', e);
  }
};

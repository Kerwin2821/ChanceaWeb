import AsyncStorage from '@react-native-async-storage/async-storage';
import { PreferenceFind } from '../context/AuthContext/AuthInterface';

const PREFERENCE_STORAGE_KEY = '@preference_data';

// Guardar o actualizar una preferencia
export const savePreference = async (preference: PreferenceFind): Promise<void> => {
  try {
    await AsyncStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(preference));
    console.log('Preferencia guardada o actualizada correctamente.');
  } catch (e) {
    console.error('Error al guardar la preferencia.', e);
  }
};

// Obtener la preferencia almacenada
export const getPreference = async (): Promise<PreferenceFind | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(PREFERENCE_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error al obtener la preferencia.', e);
    return null;
  }
};

// Eliminar la preferencia almacenada
export const deletePreference = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PREFERENCE_STORAGE_KEY);
    console.log('Preferencia eliminada correctamente.');
  } catch (e) {
    console.error('Error al eliminar la preferencia.', e);
  }
};

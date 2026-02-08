import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ID_ORDEN_STORAGE';

// Guardar el ID de orden
export const saveOrden = async (id: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(id));
  } catch (error) {
    console.error('Error guardando el ID de orden:', error);
    throw error;
  }
};

// Obtener el ID de orden
export const getOrden = async (): Promise<any> => {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : '';
  } catch (error) {
    console.error('Error obteniendo el ID de orden:', error);
    return '';
  }
};

// Actualizar el ID de orden
export const updateOrden = async (newId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newId));
  } catch (error) {
    console.error('Error actualizando el ID de orden:', error);
    throw error;
  }
};

// Verificar si existe un ID de orden guardado
export const checkOrdenExists = async (): Promise<boolean> => {
  try {
    const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
    return !!storedValue && storedValue !== '""'; // Comprueba si no es string vacío
  } catch (error) {
    console.error('Error verificando ID de orden:', error);
    return false;
  }
};

// Eliminar el ID de orden
export const clearOrden = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error eliminando el ID de orden:', error);
    throw error;
  }
};
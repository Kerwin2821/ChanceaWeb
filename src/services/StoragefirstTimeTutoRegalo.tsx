import AsyncStorage from '@react-native-async-storage/async-storage';

const FIRST_TIME_TUTO_REGALO_KEY = 'firstTimeTutoRegalo';

// Create or Update
export const setFirstTimeTutoRegalo = async (value: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(FIRST_TIME_TUTO_REGALO_KEY, JSON.stringify(value));
    console.log(`Valor guardado: ${value}`);
  } catch (error) {
    console.error('Error al guardar el valor:', error);
    throw new Error('No se pudo guardar el valor.');
  }
};

// Read
export const getFirstTimeTutoRegalo = async (): Promise<boolean | null> => {
  try {
    const storedValue = await AsyncStorage.getItem(FIRST_TIME_TUTO_REGALO_KEY);
    if (storedValue !== null) {
      console.log(`Valor cargado: ${storedValue}`);
      return JSON.parse(storedValue);
    } else {
      console.log('No se encontró ningún valor guardado.');
      return null;
    }
  } catch (error) {
    console.error('Error al cargar el valor:', error);
    throw new Error('No se pudo cargar el valor.');
  }
};

// Delete
export const deleteFirstTimeTutoRegalo = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FIRST_TIME_TUTO_REGALO_KEY);
    console.log('Valor eliminado');
  } catch (error) {
    console.error('Error al eliminar el valor:', error);
    throw new Error('No se pudo eliminar el valor.');
  }
};

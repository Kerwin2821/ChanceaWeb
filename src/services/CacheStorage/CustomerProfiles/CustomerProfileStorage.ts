import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerProfilesStorage, ImageData } from './types';

const STORAGE_KEY = 'customerProfilesStorage';

// Function to save or update the entire customer profile list (Create/Update)
export const saveCustomerProfilesStorage = async (customerProfilesStorage: CustomerProfilesStorage): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customerProfilesStorage));
  } catch (error) {
    console.error('Error saving customer profiles storage:', error);
    throw error;
  }
};

// Function to add a customer profile (Create)
export const addCustomerProfileStorage = async (key: string, imageData: ImageData): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: CustomerProfilesStorage = existingData ? JSON.parse(existingData) : {};

    if (!parsedData[key]) {
      parsedData[key] = [];
    }

    if (!parsedData[key].some(item => item.url === imageData.url)) {
      parsedData[key].push(imageData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
    }
  } catch (error) {
    console.error('Error adding customer profile storage:', error);
    throw error;
  }
};

// Function to get all customer profiles (Read)
export const getCustomerProfilesStorage = async (): Promise<CustomerProfilesStorage> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    return existingData ? JSON.parse(existingData) : {};
  } catch (error) {
    console.error('Error getting customer profiles storage:', error);
    throw error;
  }
};

// Function to check if a customer profile exists (Read)
export const isCustomerProfileStorageExist = async (key: string, url: string): Promise<boolean> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: CustomerProfilesStorage = JSON.parse(existingData);
      return parsedData[key]?.some(item => item.url === url) || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking customer profile storage:', error);
    throw error;
  }
};

// Function to remove a customer profile (Delete)
export const deleteCustomerProfileStorage = async (key: string, url: string): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: CustomerProfilesStorage = JSON.parse(existingData);
      if (parsedData[key]) {
        parsedData[key] = parsedData[key].filter(item => item.url !== url);
        if (parsedData[key].length === 0) {
          delete parsedData[key];
        }
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      }
    }
  } catch (error) {
    console.error('Error removing customer profile storage:', error);
    throw error;
  }
};

// Function to clear all customer profiles (Delete All)
export const clearCustomerProfilesStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing customer profiles storage:', error);
    throw error;
  }
};

// Function to get customer profile by key (Read)
export const getCustomerProfileStorageByKey = async (key: string): Promise<ImageData[] | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const parsedData: CustomerProfilesStorage = JSON.parse(existingData);
      return parsedData[key] || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting customer profile storage by key:', error);
    throw error;
  }
};

// Function to update a specific customer profile (Update)
export const updateCustomerProfileStorage = async (key: string, newValues: ImageData[]): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedData: CustomerProfilesStorage = existingData ? JSON.parse(existingData) : {};
    
    parsedData[key] = newValues;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error updating customer profile storage:', error);
    throw error;
  }
};

// New method to update a specific key
export const updateCustomerProfileStorageByKey = async (key: string, updatedImageData: ImageData[]): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    let parsedData: CustomerProfilesStorage = existingData ? JSON.parse(existingData) : {};

    // Update the specific key with the new ImageData array
    parsedData[key] = updatedImageData;

    // Save the updated data back to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error updating customer profile storage by key:', error);
    throw error;
  }
};




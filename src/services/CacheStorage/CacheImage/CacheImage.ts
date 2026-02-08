import AsyncStorage from "@react-native-async-storage/async-storage"
import type { CacheImageStorage, ImageData } from "./types"

const STORAGE_KEY = "CacheImageStorage"

// Function to save or update the entire cache image storage (Create/Update)
export const saveCacheImageStorage = async (cacheImageStorage: CacheImageStorage): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cacheImageStorage))
  } catch (error) {
    console.error("Error saving cache image storage:", error)
    throw error
  }
}

// Function to add an image to the cache (Create)
export const addCacheImage = async (imageData: ImageData): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    const parsedData: CacheImageStorage = existingData ? JSON.parse(existingData) : []

    if (!parsedData.some((item) => item.url === imageData.url)) {
      parsedData.push(imageData)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData))
    }
  } catch (error) {
    console.error("Error adding cache image:", error)
    throw error
  }
}

// Function to get all cached images (Read)
export const getCacheImageStorage = async (): Promise<CacheImageStorage> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    return existingData ? JSON.parse(existingData) : []
  } catch (error) {
    console.error("Error getting cache image storage:", error)
    throw error
  }
}

// Function to check if an image exists in the cache (Read)
export const isCacheImageExist = async (url: string): Promise<boolean> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    if (existingData) {
      const parsedData: CacheImageStorage = JSON.parse(existingData)
      return parsedData.some((item) => item.url === url)
    }
    return false
  } catch (error) {
    console.error("Error checking cache image:", error)
    throw error
  }
}

// Function to remove an image from the cache (Delete)
export const deleteCacheImage = async (url: string): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    if (existingData) {
      const parsedData: CacheImageStorage = JSON.parse(existingData)
      const updatedData = parsedData.filter((item) => item.url !== url)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    }
  } catch (error) {
    console.error("Error removing cache image:", error)
    throw error
  }
}

// Function to clear all cached images (Delete All)
export const clearCacheImageStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing cache image storage:", error)
    throw error
  }
}

// Function to get a specific image from the cache (Read)
export const getCacheImageByUrl = async (url: string): Promise<ImageData | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    if (existingData) {
      const parsedData: CacheImageStorage = JSON.parse(existingData)
      return parsedData.find((item) => item.url === url) || null
    }
    return null
  } catch (error) {
    console.error("Error getting cache image by URL:", error)
    throw error
  }
}

// Function to update a specific image in the cache (Update)
export const updateCacheImage = async (updatedImageData: ImageData): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY)
    if (existingData) {
      const parsedData: CacheImageStorage = JSON.parse(existingData)
      const updatedData = parsedData.map((item) => (item.url === updatedImageData.url ? updatedImageData : item))
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    }
  } catch (error) {
    console.error("Error updating cache image:", error)
    throw error
  }
}


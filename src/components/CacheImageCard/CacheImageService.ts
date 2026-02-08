import axios from 'axios';
import { Platform } from 'react-native';
import { Buffer } from 'buffer';
import { addCustomerProfileStorage, getCustomerProfilesStorage, getCustomerProfileStorageByKey } from '../../services/CacheStorage/CustomerProfiles/CustomerProfileStorage';
import { CustomerProfilesStorage, ImageData } from '../../services/CacheStorage/CustomerProfiles/types';
import { useImageCacheStore } from '../../context/ImageCacheHook/imageCacheStore';
import * as FileSystem from 'expo-file-system';
import { AdsStorage } from '../../services/CacheStorage/Ads/types';

const EXPIRATION_DAYS = 30; // Las imágenes caducarán después de 30 días

// Función auxiliar para obtener la fecha de caducidad
const getExpirationDate = () => {
  return Date.now() + EXPIRATION_DAYS * 24 * 60 * 60 * 1000;
};

export async function prefetchImage(
  userId: string,
  imageUrl: string,
  imageCache: CustomerProfilesStorage,
  setImageCache: (e: CustomerProfilesStorage) => void
): Promise<ImageData | undefined> {
  try {
    if (Platform.OS === 'web') return undefined;
    // Check if the image is already in Zustand store
    const cachedImage = imageCache[userId]?.find(e => e.url === imageUrl);

    if (cachedImage) {
      return cachedImage;
    }

    // If not in cache, download the image
    const filename = imageUrl.split('/').pop();
    const fileExtension = filename?.split('.').pop();
    const localUri = `${FileSystem.documentDirectory}${userId}_${Date.now()}.${fileExtension}`;

    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: ${downloadResult.status}`);
    }

    const newImageData: ImageData = {
      url: imageUrl,
      base64: localUri,
      expirationDate: getExpirationDate()
    };

    // Update the cache
    const updatedCache = {
      ...imageCache,
      [userId]: [...(imageCache[userId] || []), newImageData]
    };
    setImageCache(updatedCache);

    return newImageData;
  } catch (error) {
    console.error('Error prefetching image:', error);
    return undefined;
  }
}
export async function prefetchImage2(
  userId: string,
  imageUrl: string,
  imageCache: AdsStorage,
): Promise<ImageData | undefined> {
  try {
    if (Platform.OS === 'web') return undefined;
    // Check if the image is already in Zustand store
    const cachedImage = imageCache[userId];

    if (cachedImage) {
      return cachedImage;
    }

    console.log(imageUrl)

    // If not in cache, download the image
    const filename = imageUrl.split('/').pop();
    const fileExtension = filename?.split('.').pop();
    const localUri = `${FileSystem.documentDirectory}${filename}_${Date.now()}.${fileExtension}`;

    console.log(localUri)

    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: ${downloadResult.status}`);
    }

    const newImageData: ImageData = {
      url: imageUrl,
      base64: localUri,
      expirationDate: getExpirationDate()
    };

    return newImageData;
  } catch (error) {
    console.error('Error prefetching image:', error);
    return undefined;
  }
}

export function getCachedImage(userId: string, imageUrl: string): string | undefined {
  const { imageCache, setImageCache } = useImageCacheStore();
  return imageCache[userId].find(e => e.url === imageUrl)?.url;
}

export async function getCustomerProfileKeys(): Promise<string[]> {
  try {
    const storage = await getCustomerProfilesStorage();
    return Object.keys(storage);
  } catch (error) {
    console.error('Error getting customer profile keys:', error);
    return [];
  }
}

export async function getCustomerProfileUrls(userId: string): Promise<string[]> {
  try {
    const userImages = await getCustomerProfileStorageByKey(userId);
    return userImages ? userImages.map(img => img.url) : [];
  } catch (error) {
    console.error('Error getting customer profile URLs:', error);
    return [];
  }
}


// Helper function to clean up old images
export async function cleanupOldImages(imageCache: CustomerProfilesStorage): Promise<void> {
  const now = new Date();
  for (const userId in imageCache) {
    const userImages = imageCache[userId];
    for (const image of userImages) {
      if (image.expirationDate < now.getTime()) {
        try {
          await FileSystem.deleteAsync(image.base64);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }
  }
}


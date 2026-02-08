import { Platform } from 'react-native';
import { useImageCacheStore } from '../../context/ImageCacheHook/imageCacheStore';
import { Advertisements } from '../../screens/BottomBar/Promotions';
import { AdsStorage } from '../../services/CacheStorage/Ads/types';
import { saveCustomerProfilesStorage, updateCustomerProfileStorageByKey } from '../../services/CacheStorage/CustomerProfiles/CustomerProfileStorage';
import { CustomerProfilesStorage, ImageData } from '../../services/CacheStorage/CustomerProfiles/types';
import { CustomersHome } from '../../utils/Interface';
import { prefetchImage, prefetchImage2 } from './CacheImageService';

const BATCH_SIZE = 7;
const DELAY_BETWEEN_BATCHES = 3000;

async function useGradualFetch(
  customers: CustomersHome[],
  imageCache: CustomerProfilesStorage,
  setImageCache: (e: CustomerProfilesStorage) => void,
  onProgressUpdate?: (progress: number) => void
) {
  try {
    if (Platform.OS === "web") return imageCache;
    let totalImages = 0;
    let loadedImages = 0;

    const cacheData = imageCache

    for (const customer of customers) {
      const userId = customer.id.toString();
      const urls = customer.customerProfiles.map(profile => profile.link);
      totalImages += urls.length;

      if (cacheData[userId] && cacheData[userId].length > 0) {
        continue
      }

      cacheData[userId] = [];

      // Process all URLs in batches
      for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        const batch = urls.slice(i, i + BATCH_SIZE);

        // Execute batch in parallel
        const promises = batch.map(url => prefetchImage(userId, url, imageCache, setImageCache));
        const results = await Promise.all(promises);

        for (const base64 of results) {
          if (base64) {
            cacheData[userId].push(base64);
          }
          loadedImages++;
        }

        if (onProgressUpdate) {
          onProgressUpdate(Math.round((loadedImages / totalImages) * 100));
        }
      }

      // Small delay between users to not freeze UI completely
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return cacheData

  } catch (error) {
    console.log(error, "useGradualFetch")
    return {}
  }

}

export default useGradualFetch


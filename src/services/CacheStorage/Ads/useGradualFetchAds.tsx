import { prefetchImage2 } from "../../../components/CacheImageCard/CacheImageService";
import { Advertisements } from "../../../screens/BottomBar/Promotions";
import { AdsStorage } from "./types";

async function useGradualFetchAds(
    customers: Advertisements[],
    imageCache:AdsStorage,
    onProgressUpdate?: (progress: number) => void
  ) {
    try {
      let totalImages = 0;
    let loadedImages = 0;
  
    const cacheData = imageCache
  
    for (const customer of customers) {
      const userId = customer.advertisementUrl;
      const url = customer.advertisementUrl;
      console.log(url,"url")
  
  
      if(cacheData[userId] || !userId || !customer.name.includes("#")){
        continue
      }
  
      const base64 = await prefetchImage2(userId, url, imageCache);
      if (base64) {
        cacheData[userId] = (base64);
      }
  
      loadedImages++;
  
      if (onProgressUpdate) {
        onProgressUpdate(Math.round((loadedImages / totalImages) * 100));
      }
  
      // Optional: Add a small delay between individual image processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    return cacheData
      
    } catch (error) {
      console.log(error,"useGradualFetch")
      return {}
    }
    
  }

  export default useGradualFetchAds
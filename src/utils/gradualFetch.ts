import type { CustomersHome } from "./Interface"

export const gradualFetch = async (
  response: CustomersHome[],
  cacheImage: any,
  setImageCache: (cache: any) => void,
): Promise<any> => {
  // Implementation for gradual fetching
  // This should contain the logic that was previously in useGradualFetch
  // but as a regular async function instead of a hook

  try {
    // Process the response and cache images gradually
    const processedData = response.map((customer) => {
      // Process each customer's images
      return {
        ...customer,
        // Add any image processing logic here
      }
    })

    // Update the cache
    const updatedCache = {
      ...cacheImage,
      // Add processed data to cache
    }

    setImageCache(updatedCache)
    return updatedCache
  } catch (error) {
    console.error("Error in gradual fetch:", error)
    return cacheImage
  }
}


import { create } from 'zustand';
import { CacheImageStorage, CustomerProfilesStorage, ImageData } from '../../services/CacheStorage/CustomerProfiles/types';

interface ImageCacheState {
  imageCacheData: CacheImageStorage;
  setImageCacheData: (imageCache:CacheImageStorage ) => void
  imageCache: CustomerProfilesStorage;
  setImageCache: (imageCache:CustomerProfilesStorage ) => void
}

export const useImageCacheStore = create<ImageCacheState>((set, get) => ({
  imageCacheData: [],
  setImageCacheData: (imageCacheData) => set((state) => ({...state, imageCacheData})),
  imageCache: {},
  setImageCache: (imageCache) => set((state) => ({...state, imageCache})),
}));


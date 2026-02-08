export interface ImageData {
  url: string;
  base64: string;
  expirationDate: number; // Timestamp en milisegundos
}


export type CacheImageStorage = ImageData[]

export interface CustomerProfilesStorage {
  [key: string]: ImageData[];
}
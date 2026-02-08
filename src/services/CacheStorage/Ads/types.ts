export interface ImageData {
  url: string;
  base64: string;
  expirationDate: number; // Timestamp en milisegundos
}

export interface AdsStorage {
  [key: string]: ImageData;
}
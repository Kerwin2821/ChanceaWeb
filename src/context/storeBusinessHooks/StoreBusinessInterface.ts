import { GiftData } from "../../screens/Regalos/interface.regalos";
import { SesionBusiness } from "../AuthBusinessHooks/AuthBusinessHooksInterface";
import { DashboardBusinessResponse } from "./BusinessResponses.interface";

export type EstadoReservation = "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA";
export interface StoreBusinessState {
  RepCivil: BankData;
  setRepCivil: (repCivil: BankData) => void;
  DashboardData: DashboardBusinessResponse | undefined;
  setDashboardData: (repCivil: DashboardBusinessResponse | undefined) => void;
  Stores: Stores[];
  setStores: (stores: Stores[]) => void;
  Reservation: ReservationSingleListResponse[] | undefined;
  setReservation: (paquetes: ReservationSingleListResponse[] | undefined) => void;
  Productos: Productos[] | undefined;
  setProductos: (paquetes: Productos[] | undefined) => void;
  Paquetes: Paquetes[] | undefined;
  setPaquetes: (paquetes: Paquetes[] | undefined) => void;
  Regalos: GiftData[] | undefined;
  setRegalos: (paquetes: GiftData[] | undefined) => void;
  FormCreateTienda: StoresCreate;
  setFormCreateTienda: (form: StoresCreate) => void;
  Cupones: LoteBusiness[];
  setCupones: (cupones: LoteBusiness[]) => void;
  FormCreateLote: CreateLote;
  setFormCreateLote: (form: CreateLote) => void;
  FormCreateProd: ProductRequest;
  setFormCreateProd: (form: ProductRequest) => void;
  FormCreateBoxPackage: BoxPackageRequest;
  setFormCreateBoxPackage: (form: BoxPackageRequest) => void;
}

export interface Business {
  name: string;
  comercialDenomination: string;
  identificationNumber: string;
  conditionType: string;
  phoneNumber: string;
  email: string;
  password: string;
  logintude: string;
  latitude: string;
  token: string;
  fileRifUrl: string;
  fileLogo: string;
}

export interface Stores {
  id?: number;
  name: string;
  description: string;
  creationDate: string;
  updateDate: string;
  endingDate: any;
  statusBusiness: string;
  phoneNumber: string;
  email: string;
  positionX: number;
  positionY: number;
  business: Business;
  direccion: any;
  password?: string;
}

export interface StoresCreate {
  id?: number;
  name: string;
  description: string;
  creationDate: string;
  updateDate: string;
  endingDate: any;
  statusBusiness: string;
  phoneNumber: string;
  email: string;
  positionX: number;
  positionY: number;
  business: SesionBusiness;
  password: string;
  direccion: any;
}
export interface LoteBusiness {
  id: number;
  description: string;
  loteNumber: string;
  quantity: number;
  statusLote: string;
  auctionDate: string;
  points: number;
  type: string;
  isFree: boolean;
  amount?: number;
  endAuctionDate: string;
  expirationDate: string;
  loteName: string;
  cost?: number;
  previousCost?: number;
  retentionAgent: boolean;
  loteType: LoteType;
  category: Category;
  availableQuantity: number;
  nearestBStore: any;
  distanceBStore: any;
  collections: any;
  business: Business;
  promotion: Promotion;
  bstores: Bstore[];
  bStores: BStore[];
}

export interface LoteType {
  id: number;
  description: string;
  enabled: boolean;
}

export interface Category {
  id: number;
  name: string;
  imagen: any;
  imagenContentType: string;
  urlImagen: string;
  price: number;
}

export interface Promotion {
  id: number;
  description: string;
  name: string;
  quantity: number;
  startDate: string;
  endDate: string;
  typePromotion: string;
  isPercentage: boolean;
  value: number;
  statusPromotion: string;
  restrictions: string;
  urlImagen: string;
  expirationDate: string;
  bstores: any;
}

export interface Bstore {
  id: number;
  name: string;
  beginningdate: string;
  endindDate?: string;
  statusStore: string;
  phoneNumber: string;
  email: string;
  addressId?: number;
  openHour?: string;
  closeHour?: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  password: string;
  failedAttempts?: number;
  cuponsReceiver: any;
  amountReceiver: any;
  business: Business;
  lotes: any;
  promotions: any;
}

export interface BStore {
  id: number;
  name: string;
  beginningdate: string;
  endindDate?: string;
  statusStore: string;
  phoneNumber: string;
  email: string;
  addressId?: number;
  openHour?: string;
  closeHour?: string;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
  password: string;
  failedAttempts?: number;
  cuponsReceiver: any;
  amountReceiver: any;
}

interface ImagenCupons {
  imagen: string[] | number[];
  imagenContentType: string;
}

export interface CreateLote {
  description: string;
  auctionTime: string;
  endAuctionTime: string;
  expirationDate: string;
  status_lote: string;
  point: number;
  type: string;
  loteTypeId: number;
  imagenCupons: ImagenCupons[];
  categoryId: number;
  quantiTy: number;
  bStoreIds: number[];
  businessId: number;
  isFree: boolean;
  amount: number;
  promotionId: number | null;
  previousCost: number;
  isRetentionAgent: boolean;
  representativeId: number;
  totalPayment: number;
  token: string;
  paymentId: string;
  name: string;
  typePromotion: string;
  isPercentage: boolean;
  restrictions: string;
  retentionAgent: boolean;
  free: boolean;
}

export interface BankData {
  phoneNumber: string;
  abaBank: string;
  conditionType: string;
  identificationNumber: string;
  transferenceNumber: string;
}

export const initialFormBankData: BankData = {
  phoneNumber: "",
  abaBank: "0105",
  conditionType: "J",
  identificationNumber: "",
  transferenceNumber: "",
};

export const initialFormCreateTienda: StoresCreate = {
  name: "",
  description: "",
  creationDate: "",
  updateDate: "",
  endingDate: "",
  statusBusiness: "ACTIVO",
  phoneNumber: "",
  email: "",
  positionX: 0,
  positionY: 0,
  direccion: {
    id: 0,
    streetAddress: "",
    postalCode: "",
  },
  password: "",
  business: {
    id: 0,
    name: "",
    beginningdate: "",
    updateDate: null,
    endindDate: null,
    statusBusiness: "",
    code: "",
    comercialDenomination: "",
    identificationNumber: "",
    phoneNumber: "",
    email: "",
    conditionType: "",
    postionX: 0,
    postionY: 0,
    urlLogo: "",
    imagenLogo: null,
    imagenLogoContentType: null,
    urlRif: "",
    imagenRif: null,
    imagenRifContentType: null,
    collections: [],
    address: null,
  },
};
export const InitCreateLote: CreateLote = {
  description: "",
  auctionTime: "2024-08-13T17:45:48.210Z",
  endAuctionTime: "2024-08-13T17:45:48.210Z",
  expirationDate: "2024-08-13T17:45:48.210Z",
  point: 0,
  type: "PRODUCTO",
  loteTypeId: 1,
  typePromotion: "OFERTA",
  imagenCupons: [
    {
      imagen: [""],
      imagenContentType: "",
    },
  ],
  categoryId: 0,
  quantiTy: 0,
  bStoreIds: [],
  businessId: 0,
  isFree: true,
  amount: 0,
  promotionId: null,
  previousCost: 0,
  isRetentionAgent: true,
  representativeId: 0,
  totalPayment: 0,
  token: "",
  paymentId: "",
  name: "",
  isPercentage: true,
  restrictions: "",
  retentionAgent: true,
  free: true,
  status_lote: "ACTIVE",
};

export interface DashboardVisitorChancea {
  name: string;
  photoUrl: string;
  spending: string;
}

export interface DashboardPackageResponse {
  imageUrl: string;
  description: string;
  price: string;
}

export interface PaquetesResponse {
  boxPackageSingles: Paquetes[];
  codigoRespuesta: string;
  mensajeRespuesta: string;
}

export interface Paquetes {
  amount: number;
  businesId: number;
  comission: number;
  creationDate: string;
  description: string;
  id: number;
  igtf: number;
  imagenBox: any;
  imagenBoxContentType: string;
  imagenUrl: string;
  iva: number;
  nombre: string;
  products: Productos[];
  quantity: number;
  sessionToken: any;
  storeBusinesId: number;
  tax: number;
  typeBox: string;
  updateDate: string;
  status: boolean;
}
export interface Productos {
  aditional1: string;
  aditional2: string;
  amount: number;
  creationDate: string;
  description: string;
  id: number;
  igtf: number;
  imagenProduct: null | string;
  imagenProductContentType: string;
  imagenUrl: string;
  iva: number;
  name: string;
  statusProduct: string;
  updateDate: string;
}

export interface ResponseReservation {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  reservationSingleListResponse: ReservationSingleListResponse[];
}

export interface ReservationSingleListResponse {
  customerSourceName: string;
  customerDestinationName: string;
  customerURLSource: string;
  customerURLDestination: string;
  urlBoxpackge: string;
  statusReservation: EstadoReservation;
  packageName: string;
  packageDescription: string;
  citaDate: string;
  citaId: string;
  storeId: string;
  boxPackageId: string;
  amountBs: string;
  amountDolar: string;
  total_basePrice: string;
  total_ivaPrice: string;
  total_IGTF: string;
  total_comission: string;
  total_total: string;
}

export interface ProductRequest {
  id?: number;
  name: string;
  description: string;
  imagenUrl: string;
  imagenProduct: string;
  imagenProductContentType: string;
  amount: number;
  iva: number;
  igtf: number;
  aditional1: string;
  aditional2: string;
  creationDate: string;
  updateDate: string;
  statusProduct: string;
  sessionToken: string;
}
export interface ProductResponse {
  codigoRespuesta: string;
  customer: Productos;
  mensajeRespuesta: string;
}
export const initialProduct: ProductRequest = {
  name: "",
  description: "",
  imagenUrl: "",
  imagenProduct: "",
  imagenProductContentType: "",
  amount: 0,
  iva: 0,
  igtf: 0,
  aditional1: "",
  aditional2: "NORMAL",
  creationDate: new Date().toISOString(),
  updateDate: new Date().toISOString(),
  statusProduct: "ACTIVO", // Default status
  sessionToken: "",
};
export interface BoxPackageRequest {
  nombre: string;
  sessionToken: string;
  description: string;
  quantity: number; // Assuming Integer translates to number in JavaScript
  imagenUrl: string;
  imagenBoxContentType: string;
  amount: number; // Assuming Float translates to nusmber in JavaScript
  comission: number; // Assuming Float translates to number in JavaScript
  iva: number; // Assuming Float translates to number in JavaScript
  igtf: number; // Assuming Float translates to number in JavaScript
  tax: number; // Assuming Float translates to number in JavaScript
  typeBox: string;
  creationDate: string;
  updateDate: string;
  storeBusinesId: number; // Assuming Long translates to number in JavaScript
  businesId: number; // Assuming Long translates to number in JavaScript
  productIds: number[]; // Assuming List<Long> translates to number[] in JavaScript
  storedIds: number[]; // Assuming List<Long> translates to number[] in JavaScript
  gitCategory: string;
  status: boolean;
}
export const initialBoxPackage: BoxPackageRequest = {
  nombre: "",
  sessionToken: "",
  description: "",
  quantity: 0,
  imagenUrl: "",
  imagenBoxContentType: "",
  amount: 0,
  comission: 0,
  iva: 0,
  igtf: 0,
  tax: 0,
  typeBox: "REGALO",
  creationDate: new Date().toISOString(),
  updateDate: new Date().toISOString(),
  storeBusinesId: 0,
  businesId: 0,
  productIds: [],
  storedIds: [],
  gitCategory: "",
  status: true,
};
export interface GetCategoryGifResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  boxPackageSingles?: CategoryResponse[]; // Optional, as it can be null or empty
}
export interface CategoryResponse {
  id: number;
  description: string;
  statusCategory: string;
}

export interface UpdateReservationResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  invitations: Invitation;
}

export interface Invitation {
  id: number;
  creationDate: string; // ISO 8601 date string
  sendDate: string; // ISO 8601 date string
  receiveDate: string; // ISO 8601 date string
  message: string;
  statusGif: "POR_PAGAR"; // Literal type to enforce specific value
}

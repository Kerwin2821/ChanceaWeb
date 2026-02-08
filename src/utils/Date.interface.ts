export type Estado = 'ENVIADA' | 'ACEPTADA' | 'FINALIZADA' | 'PENDIENTE_DE_PAGO' | 'VENCIDA' | 'CANCELADA' | 'EN_PROCESO' | 'RECHAZADA';
export type TipoDeCita = 'ENVIADA' | 'RECIBIDA';

export type DateNotification = {
  citaId:string,
  name:string,
  message:string
  urlImage:string
}

export interface Cita {
  id: number
  message: string
  creationDate: string
  acceptanceDate?: string
  dateTimeInvitation: string
  timePeriod: number
  statusInvitation: Estado
  boxPackage: BoxPackage
  customerSource: CustomerSource
  customerDestination: CustomerDestination
}

export interface CitaFirebase extends Cita {
  idFire: number
}

export interface ProductData {
  id: number
  quantity: number
  boxPackage: BoxPackage
  product: Product
}

export interface Product {
  id: number
  name: string
  description: string
  imagenUrl: string
  imagenProduct: any
  imagenProductContentType: string
  amount: number
  iva: number
  igtf: number
  aditional1?: string
  aditional2?: string
  creationDate: string
  updateDate: string
  statusProduct: string
}


export interface BoxPackageV2 {
  amount: number;
  business: BusinessV2;
  comission: number;
  creationDate: string;
  customer: CustomerV2;
  description: string;
  gifCategory: GifCategoryV2;
  id: number;
  igtf: number;
  imagenBox: null;
  imagenBoxContentType: string;
  imagenUrl: string;
  iva: number;
  nombre: string;
  quantity: number;
  status: boolean;
  storeIds: null;
  stores: StoreV2[];
  imagenes: ItemData[];
  tax: number;
  typeBox: string;
  updateDate: string;
}
interface ItemData {
  imageUrl: string;
  positionIndex: number;
  id: number;
}
export interface GifCategoryV2 {
  description: string;
  id: number;
  statusCategory: string;
}

export interface StoreV2 {
  business: any[]; // Puedes definir una interfaz más específica si conoces la estructura de los elementos dentro de business
  creationDate: string;
  description: string | null;
  direccion: string | null;
  email: string;
  endingDate: string;
  id: number;
  name: string;
  password: string;
  phoneNumber: string;
  positionX: number;
  positionY: number;
  boxPackageId: number;
  statusBusiness: string;
  updateDate: string;
}

export interface BusinessV2 {
  beginningdate: string;
  businessCondition: string;
  code: null;
  comercialDenomination: string;
  conditionType: string;
  email: string;
  endindDate: string;
  id: number;
  identificationNumber: string;
  imagenLogo: null;
  imagenLogoContentType: string;
  imagenRif: null;
  imagenRifContentType: string;
  name: string;
  phoneNumber: string;
  postionX: null;
  postionY: null;
  statusBusiness: string;
  updateDate: string;
  urlLogo: string;
  urlRif: string;
}

export interface CustomerV2 {
  aboutme: string;
  age: number;
  birthDate: string;
  creationDate: string;
  customerStatus: null;
  dateVerified: null;
  email: string;
  externalId: null;
  externalprofile: string;
  facebook: null;
  firstName: string;
  gender: string;
  id: number;
  identifcatorPayment: string;
  instagram: null;
  isLogged: boolean;
  lastEnterEventDate: string;
  lastName: string;
  lastViewCustomerId: number;
  messageReceiver: null;
  myReferCode: string;
  password: string;
  paymentStripeId: null;
  phone: string;
  postionX: number;
  postionY: null;
  quantityLike: null;
  referedCode: string;
  sameSex: boolean;
  shareLocation: boolean;
  stripeId: null;
  tikTok: null;
  twitter: null;
  verified: boolean;
}
export interface BoxPackage {
  id: number
  nombre: string
  description?: string
  quantity: number
  imagenUrl: string
  imagenBoxContentType: string
  amount: number
  comission: number
  iva: number
  igtf: number
  tax: number
  total: number,
  typeBox: string
  creationDate: string
  updateDate: string
  /* storeBusiness: StoreBusiness */
  customer: CustomerSource
  business: Business
}

export interface Business {
  id: number
  name: string
  beginningdate: string
  updateDate: any
  endindDate: string
  statusBusiness: string
  code: string
  comercialDenomination: string
  identificationNumber: string
  phoneNumber: string
  email: string
  conditionType: string
  postionX: number
  postionY: any
  urlLogo: string
  imagenLogo: any
  imagenLogoContentType: string
  urlRif: string
  imagenRif: any
  imagenRifContentType: string
}


export interface StoreBusiness {
  id: number
  name: string
  description: string
  creationDate: string
  updateDate: string
  endingDate: string
  statusBusiness: string
  phoneNumber: string
  email: string
  positionX: number
  positionY: number
}

export interface CustomerSource {
  id: number
  firstName: string
  lastName: string
  email: string
  externalId: string
  externalprofile: string
  identifcatorPayment: string
  instagram: any
  facebook: any
  twitter: any
  tikTok: any
  phone: string
  aboutme: string
  birthDate: string
  age: number
  postionX: number
  postionY: number
  password: string
  gender: string
  myReferCode: string
  referedCode: string
  customerStatus: string
  lastEnterEventDate: string
  lastViewCustomerId: number
  isLogged: boolean
  stripeId: any
  paymentStripeId: any
  creationDate: string
  verified: boolean
  dateVerified: any
  shareLocation?: boolean
  messageReceiver?: boolean
  quantityLike: any
  customerProfiles?: CustomerProfile[]
}

export interface CustomerProfile {
  id: number
  name: string
  beginningDate: string
  imgSrc: string
  imgBlogSrc: any
  imgBlogSrcContentType: any
  position: number
  link: string
  verified: any
  dateVerified: any
  externalprofile: Externalprofile
}

export interface Externalprofile {
  id: number
  firstName: string
  lastName: string
  email: string
  externalId: string
  externalprofile: string
  identifcatorPayment: string
  instagram: any
  facebook: any
  twitter: any
  tikTok: any
  phone: string
  aboutme: string
  birthDate: string
  age: number
  postionX: number
  postionY: number
  password: string
  gender: string
  myReferCode: string
  referedCode: string
  customerStatus: string
  lastEnterEventDate: string
  lastViewCustomerId: number
  isLogged: boolean
  stripeId: any
  paymentStripeId: any
  creationDate: string
  verified: boolean
  dateVerified: any
  shareLocation?: boolean
  messageReceiver?: boolean
  quantityLike: any
}

export interface CustomerDestination {
  id: number
  firstName: string
  lastName: string
  email: string
  externalId: string
  externalprofile: string
  identifcatorPayment: string
  instagram: any
  facebook: any
  twitter: any
  tikTok: any
  phone: string
  aboutme: string
  birthDate: string
  age: number
  postionX: number
  postionY: number
  password: string
  gender: string
  myReferCode: string
  referedCode: string
  customerStatus: string
  lastEnterEventDate: string
  lastViewCustomerId: number
  isLogged: boolean
  stripeId: any
  paymentStripeId: any
  creationDate: string
  verified: boolean
  dateVerified: any
  shareLocation?: boolean
  messageReceiver?: boolean
  quantityLike: any
  customerProfiles?: CustomerProfile2[]
}

export interface CustomerProfile2 {
  id: number
  name: string
  beginningDate: string
  imgSrc: string
  imgBlogSrc: any
  imgBlogSrcContentType: any
  position: number
  link: string
  verified: any
  dateVerified: any
  externalprofile: Externalprofile2
}

export interface Externalprofile2 {
  id: number
  firstName: string
  lastName: string
  email: string
  externalId: string
  externalprofile: string
  identifcatorPayment: string
  instagram: any
  facebook: any
  twitter: any
  tikTok: any
  phone: string
  aboutme: string
  birthDate: string
  age: number
  postionX: number
  postionY: number
  password: string
  gender: string
  myReferCode: string
  referedCode: string
  customerStatus: string
  lastEnterEventDate: string
  lastViewCustomerId: number
  isLogged: boolean
  stripeId: any
  paymentStripeId: any
  creationDate: string
  verified: boolean
  dateVerified: any
  shareLocation?: boolean
  messageReceiver?: boolean
  quantityLike: any
}

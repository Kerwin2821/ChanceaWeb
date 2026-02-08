import { CustomerProfile } from "../../context/registerContext/RegisterInterfaces"

export interface GifResponse {
  box: Box
  gif: Gif
}

export interface Box {
  amount: number
  business: Business
  comission: number
  creationDate: string
  customer: Customer
  description: string
  gifCategory: GifCategory
  id: number
  igtf: number
  imagenBoxContentType: string
  imagenUrl: string
  iva: number
  nombre: string
  quantity: number
  storeBusiness: StoreBusiness
  tax: number
  typeBox: string
}

export interface Business {
  beginningdate: string
  code: string
  comercialDenomination: string
  conditionType: string
  email: string
  endindDate: any
  id: number
  identificationNumber: string
  imagenLogo: any
  imagenLogoContentType: any
  imagenRif: any
  imagenRifContentType: any
  name: string
  phoneNumber: string
  postionX: number
  postionY: number
  statusBusiness: string
  updateDate: any
  urlLogo: string
  urlRif: string
}

export interface Customer {
  aboutme: string
  age: number
  birthDate: string
  creationDate: string
  customerStatus: any
  dateVerified: any
  email: string
  externalId: string
  externalprofile: string
  facebook: any
  firstName: string
  gender: string
  id: number
  identifcatorPayment: string
  instagram: any
  isLogged: boolean
  lastEnterEventDate: string
  lastName: string
  lastViewCustomerId: number
  messageReceiver: any
  myReferCode: string
  password: string
  paymentStripeId: any
  phone: string
  postionX: number
  postionY: any
  quantityLike: any
  referedCode: string
  shareLocation: boolean
  stripeId: any
  tikTok: any
  twitter: any
  verified: boolean
}

export interface GifCategory {
  description: string
  id: number
  statusCategory: string
}

export interface StoreBusiness {
  creationDate: string
  description: string
  email: string
  endingDate: any
  id: number
  name: string
  phoneNumber: string
  positionX: number
  positionY: number
  statusBusiness: string
  updateDate: any
}

export interface Gif {
  customerDestinationId: number
  message: string
}
export type EstadoRegalos = 'POR_PAGAR' | 'PAGADO' | 'CANCELADO' | 'EN_PROCESO' | 'ENVIADO' | 'ENTREGADO';
export type TipoDeRegalo = 'RECIBIDA' | 'ENVIADA';
export interface GiftData {
  id: number
  creationDate: string
  sendDate: any
  receiveDate: any
  message: string
  statusGif: EstadoRegalos
  boxPackage: BoxPackage
  customerSource: CustomerSource
  customerDestination: CustomerDestination
  storeBusiness: StoreBusiness
}

export interface BoxPackage {
  id: number
  nombre: string
  description: string
  quantity: number
  imagenUrl: string
  imagenBoxContentType: string
  amount: number
  comission: number
  iva: number
  igtf: number
  tax: number
  typeBox: string
  creationDate: string,
  customerFirstName?: string
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
  shareLocation: any
  messageReceiver: any
  quantityLike: any
  customerProfiles: CustomerProfile[]
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
  customerProfiles: CustomerProfile[]
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
  shareLocation: boolean
  messageReceiver: any
  quantityLike: any
}

export interface StoreBusiness {
  id: number
  name: string
  description: string
  creationDate: string
  updateDate: any
  endingDate: any
  statusBusiness: string
  phoneNumber: string
  email: string
  positionX: number
  positionY: number
}


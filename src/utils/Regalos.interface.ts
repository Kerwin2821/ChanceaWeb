export type Estado = 'POR_PAGAR' | 'PAGADO' | 'CANCELADO' | 'EN_PROCESO' | 'ENVIADO' | 'ENTREGADO';
export type TipoDeRegalo = 'ENVIADA' | 'RECIBIDA';

export type RegaloNotification = {
  citaId:string,
  name:string,
  message:string
  urlImage:string
}

export interface Regalo {
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

export interface RegaloFirebase extends Regalo {
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
  storeBusiness: StoreBusiness
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

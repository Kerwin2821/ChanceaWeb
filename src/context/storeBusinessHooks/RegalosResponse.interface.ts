import { CustomerProfile } from "../AuthContext/AuthInterface"

export type RegalosResponse = RegalosSends[]

export interface RegalosSends {
  boxPackage: BoxPackage
  creationDate: string
  customerDestination: CustomerDestination
  customerSource: CustomerSource
  id: number
  message: string
  receiveDate: any
  sendDate: any
  statusGif: string
  storeBusiness: StoreBusiness
}

export interface BoxPackage {
  amount: number
  comission: number
  creationDate: string
  description: string
  gifCategory: any[]
  id: number
  igtf: number
  imagenBoxContentType: string
  imagenUrl: string
  iva: number
  nombre: string
  quantity: number
  storeBusiness: any[]
  tax: number
  typeBox: string
  updateDate?: string
}

export interface CustomerDestination {
  aboutme: string
  age: number
  birthDate: string
  creationDate: string
  customerProfiles: CustomerProfile[]
  customerStatus: string
  dateVerified?: string
  email: string
  externalId?: string
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
  messageReceiver?: boolean
  myReferCode: string
  password: string
  paymentStripeId: any
  phone: string
  postionX: number
  postionY: number
  quantityLike: any
  referedCode: string
  shareLocation?: boolean
  stripeId: any
  tikTok: any
  twitter: any
  verified: boolean
}

export interface CustomerSource {
  aboutme: string
  age: number
  birthDate: string
  creationDate: string
  customerProfiles: CustomerProfile[]
  customerStatus: string
  dateVerified: any
  email: string
  externalId?: string
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
  postionY: number
  quantityLike: any
  referedCode: string
  shareLocation: boolean
  stripeId: any
  tikTok: any
  twitter: any
  verified: boolean
}

export interface StoreBusiness {
  creationDate: string
  description: string
  email: string
  endingDate?: string
  id: number
  name: string
  phoneNumber: string
  positionX: number
  positionY: number
  statusBusiness: string
  updateDate?: string
}

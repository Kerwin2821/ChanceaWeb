import { UserData } from "../context/AuthContext/AuthInterface";

export interface Items {
  value: string | number;
  label: string;
}

export type load = "true" | "false" | "loading";

export interface CustomersData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram: any;
  facebook: any;
  twitter: any;
  tikTok: any;
  phone: string;
  aboutme: string;
  birthDate: string;
  age: number;
  postionX: number;
  postionY: number;
  password: string;
  gender: string;
  myReferCode: string;
  referedCode: string;
  customerStatus: string;
  lastEnterEventDate: string;
  lastViewCustomerId: number;
  plan: Plan;
  symbol: any;
  verified: boolean;
  dateVerified: string;
  nickname: Nickname;
  customerDevices: any;
  customerProfiles: any;
  customerLanguages: any;
  customerGoals: any;
  customerInterestings: any;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: any;
  imgBlogContentType: any;
}

export interface Card {
  id: number;
  given_name: string;
  family_name: string;
  email: string;
  picture: string;
  locale: string;
  name: string;
  verified_email: boolean;
}

export interface CustomersHome {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tikTok?: string;
  phone: string;
  aboutme: string;
  birthDate: string;
  age: number;
  postionX: number;
  postionY: number;
  password: string;
  gender: string;
  myReferCode: string;
  referedCode: string;
  customerStatus: string;
  lastEnterEventDate: string;
  lastViewCustomerId: number;
  isLogged: any;
  verified: boolean;
  dateVerified: string;
  quantityLike: number;
  shareLocation: boolean;
  nickname: Nickname;
  plan: Plan;
  srcVideo: string;
  symbol?: Symbol;
  customerDevices: CustomerDevice[];
  customerProfiles: CustomerProfile[];
  customerLanguages: CustomerLanguage[];
  customerGoals: CustomerGoal[];
  customerInterestings: CustomerInteresting[];
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: any;
  imgBlogContentType: any;
}

export interface Symbol {
  id: number;
  name: string;
  description: string;
  simbolSrc: string;
  imgBlogSimbol: any;
  imgBlogSimbolContentType: any;
}

export interface CustomerDevice {
  id: number;
  name: string;
  beginningDate: string;
  value: string;
  lastEnterEventDate: string;
}

export interface CustomerProfile {
  id: number;
  name: string;
  beginningDate: string;
  imgSrc: string;
  imgBlogSrc: any;
  imgBlogSrcContentType?: string;
  position?: number;
  link: string;
  verified: boolean;
}

export interface CustomerLanguage {
  id: number;
  name: string;
  description: string;
  iconsrc: string;
  imgBlogIcon: any;
  imgBlogIconContentType: any;
}

export interface CustomerGoal {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  iconsrc: string;
  imgBlogSrc: any;
  imgBlogSrcContentType: any;
  imgBlogSimbol: any;
  imgBlogSimbolContentType: any;
}

export interface CustomerInteresting {
  id: number;
  name: string;
  description: string;
  iconsrc: string;
}

export interface Priropo2 {
  id: number;
  creationDate: string;
  personalizedPiropo?: string;
  customerSource: CustomerSource;
  customerDestination: CustomerDestination;
  piropo?: Piropo;
}

export interface Piropo3 {
  idPiropo: string;
  infoUser: CustomersHome;
  fecha: string;
  ultimoMensaje: string;
  visto: boolean;
}

export interface CustomerSource {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram: any;
  facebook: any;
  twitter: any;
  tikTok: any;
  phone: string;
  aboutme: string;
  birthDate: string;
  age: number;
  postionX: number;
  postionY: number;
  password: string;
  gender: string;
  myReferCode: string;
  referedCode: string;
  customerStatus: string;
  lastEnterEventDate: string;
  lastViewCustomerId: number;
  isLogged: boolean;
  stripeId: any;
  paymentStripeId: any;
  creationDate: string;
  plan: Plan;
  symbol: Symbol;
  verified: boolean;
  dateVerified: string;
  nickname: Nickname;
  customerDevices: any;
  customerProfiles: CustomerProfile[];
  customerLanguages: any;
  customerGoals: any;
  customerInterestings: any;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: any;
  imgBlogContentType: any;
  statusPlan: string;
  amount: any;
  annual: any;
  amountBs: any;
  annualBs: any;
  customerPlan: any;
}

export interface Symbol {
  id: number;
  name: string;
  description: string;
  simbolSrc: string;
  imgBlogSimbol: any;
  imgBlogSimbolContentType: any;
}

export interface CustomerDestination {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram: any;
  facebook: any;
  twitter: any;
  tikTok: any;
  phone: string;
  aboutme: string;
  birthDate: string;
  age: number;
  postionX: number;
  postionY: number;
  password: string;
  gender: string;
  myReferCode: string;
  referedCode: string;
  customerStatus: string;
  lastEnterEventDate: string;
  lastViewCustomerId: number;
  isLogged: boolean;
  stripeId: any;
  paymentStripeId: any;
  creationDate: string;
  plan: Plan2;
  symbol: Symbol2;
  verified: boolean;
  customerDevices: any;
  customerProfiles: CustomerProfile2[];
  customerLanguages: any;
  customerGoals: any;
  customerInterestings: any;
}

export interface Plan2 {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: any;
  imgBlogContentType: any;
  statusPlan: string;
  amount: any;
  annual: any;
  amountBs: any;
  annualBs: any;
  customerPlan: any;
}

export interface Symbol2 {
  id: number;
  name: string;
  description: string;
  simbolSrc: string;
  imgBlogSimbol: any;
  imgBlogSimbolContentType: any;
}

export interface CustomerProfile2 {
  id: number;
  name: string;
  beginningDate: string;
  imgSrc: string;
  imgBlogSrc: any;
  imgBlogSrcContentType: any;
  position: number;
  link: string;
}

export interface Piropo {
  id: number;
  name: string;
  description: string;
  creationDate: string;
  status: string;
  gender: string;
}

export interface Parameter {
  id: number;
  payment: boolean;
  quantityFree: number;
}

export interface Bank {
  id: number;
  name: string;
  description: string;
  simbol: string;
  aba: string;
  urlImagen: string;
  imagen: any;
  imagenContentType: string;
}

export interface Nickname {
  id: number;
  name: string;
  description: string;
  imagen: string[];
  imagenContentType: string;
  url: string;
  gender: string;
}

export interface ResponseCreateValidateResource {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  resourceValidate: ResourceValidate;
}

export interface ResourceValidate {
  creationDate: string;
  customer: CustomerValidateResource;
  id: number;
  imagen: any;
  imagenContentType: any;
  urlResource: string;
}

export interface CustomerValidateResource {
  aboutme: string;
  age: number;
  birthDate: string;
  creationDate: string;
  customerStatus: string;
  dateVerified: any;
  email: string;
  externalId: string;
  externalprofile: string;
  facebook: any;
  firstName: string;
  gender: string;
  id: number;
  identifcatorPayment: string;
  instagram: any;
  isLogged: boolean;
  lastEnterEventDate: string;
  lastName: string;
  lastViewCustomerId: number;
  myReferCode: string;
  password: string;
  paymentStripeId: any;
  phone: string;
  postionX: number;
  postionY: number;
  referedCode: string;
  stripeId: any;
  tikTok: any;
  twitter: any;
  verified: any;
}

export interface ResponseLogin {
  customer: UserData;
  codigoRespuesta: string;
  stringSessionToken: string;
  mensajeRespuesta: string;
  emailOpcional: string;
}

export interface OrdenGenerateCitaResponse {
  codigoRespuesta: string
  mensajeRespuesta: string
  orden: Orden
}

export interface Orden {
  id: number
  orderNumber: string
  ordenDate: string
  statusOrden: string
  totalAmount: number
  observations: any
  ordenType: string
  isAnnual: any
  paymentInfo: any
  paymentType: PaymentType
  items: Item[]
  customer: CustomerOrdenGenerate
}

export interface PaymentType {
  id: number
  name: string
}

export interface Item {
  id: number
  quantity: number
  unitPrice: any
  unitPrice2: number
  amount: any
  amount2: number
  boxPackage: BoxPackageOrdenGenerate
  invitations: InvitationsOrdenGenerate
  gif: any
}

export interface BoxPackageOrdenGenerate {
  id: number
  nombre: string
  description: string
  quantity: number
  imagenUrl: string
  imagenBox: any
  imagenBoxContentType: string
  amount: number
  comission: number
  iva: number
  igtf: number
  tax: number
  typeBox: string
  creationDate: string
  updateDate: string
  status: boolean
  storeIds: any
}

export interface InvitationsOrdenGenerate {
  id: number
  message: string
  creationDate: string
  acceptanceDate: any
  dateTimeInvitation: string
  timePeriod: number
  statusInvitation: string
}

export interface CustomerOrdenGenerate {
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
  shareLocation: boolean
  messageReceiver: any
  quantityLike: any
  sameSex: boolean
}

interface CustomerValidation {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  [key: string]: any; // Allows for potential additional properties
}

interface PaymentTypeValidation {
  id: number;
  name: string;
}

interface OrdenResponse {
  id: number;
  customer: CustomerValidation;
  isAnnual: boolean | null;
  items: any | null; // You might want to define a more specific type for items
  observations: string | null;
  ordenDate: string;
  ordenType: "REGALO" | string; // Assuming "REGALO" is one of the possible values
  orderNumber: string;
  paymentInfo: any | null; // You might want to define a more specific type for paymentInfo
  paymentType: PaymentTypeValidation | null;
  statusOrden: string;
  totalAmount: number;
}

export interface OrdenValidationResponse extends Array<OrdenResponse> {}
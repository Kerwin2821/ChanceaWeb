import { User } from "@react-native-google-signin/google-signin";

export interface AuthContextProps {
  user: UserData | null;
  setUser: (e: UserData) => void;
  customerBlockList: CustomerBlackList[];
  setCustomerBlockList: (e: CustomerBlackList[]) => void;
  singInWithGoogle: () => Promise<User | undefined>;
  logOut: () => void;
  TokenAuthApi: string;
  setTokenAuthApi: (e: string) => void;
  SesionToken: string;
  setSesionToken: (e: string) => void;
  PreferenceFindUser: PreferenceFind | null;
  setPreferenceFindUser: (e: PreferenceFind | null) => void;
  deviceId: string;
  setDeviceId: (e: string) => void;
  DataCoordenadas: Coodernadas;
  setDataCoordenadas: (e: Coodernadas) => void;
  IsConnected: boolean;
  setIsConnected: (e: boolean) => void;
  IsUpdate: boolean;
  setIsUpdate: (e: boolean) => void;
}

export interface statusConection {
  status: string;
  timestamp: number;
}

export interface Coodernadas {
  coords: Coords;
}

export interface Coords {
  longitude: number;
  latitude: number;
}

export interface UserData {
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
  creationDate: string;
  referedCode: string;
  sameSex: boolean;
  customerStatus: string;
  lastEnterEventDate: string;
  srcVideo: string;
  lastViewCustomerId: number;
  shareLocation: boolean | null;
  nickname?: Nickname;
  isLogged: any;
  verified: boolean;
  dateVerified: string;
  plan: Plan | null;
  symbol?: Symbol;
  customerDevices: CustomerDevice[];
  customerProfiles: CustomerProfile[];
  customerLanguages: CustomerLanguage[];
  customerGoals: CustomerGoal[];
  customerInterestings: CustomerInteresting[];
  customerSource: CustomerSource;
}

export interface CustomerSource {
  id: number
  name: string
  description: string
  enabled: boolean
  creationDate: string
}


export interface Nickname {
  id: number;
  name: string;
  description: string;
  imagen: any;
  imagenContentType: string;
  url: string;
  gender: string;
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
export interface PreferenceFind {
  id: number;
  name: string;
  description: string;
  ageRangeMin: number;
  ageRangeMax: number;
  distance: number;
  beginningDate: string;
  endingDate: any;
  preferenceGender: string;
  customer: any;
}

export interface CustomerBlackList {
  id: number;
  creationDate: string;
  customerSource: CustomerSourceBlock;
  customerDestination: CustomerDestinationBlock;
}

export interface CustomerSourceBlock {
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
  verified: boolean;
  dateVerified: string;
}

export interface CustomerDestinationBlock {
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
  verified: boolean;
  dateVerified: any;
}

export interface Plan {
  id: number;
  beginningDate: string;
  endingDate: string;
  planStatus: string;
  isAnnual: boolean;
  customerIdValue: CustomerIdValue;
  planIdValue: PlanIdValue;
}

export interface CustomerIdValue {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  externalId: string;
  externalprofile: string;
  identifcatorPayment: string;
  instagram: string;
  facebook: string;
  twitter: string;
  tikTok: string;
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
  stripeId: string;
  paymentStripeId: string;
  creationDate: string;
  verified: boolean;
  dateVerified: string;
  shareLocation: boolean;
  quantityLike: number;
  nickname: Nickname;
}
export interface PlanIdValue {
  id: number;
  name: string;
  description: string;
  imgSrc: string;
  imgBlog: string[];
  imgBlogContentType: string;
  statusPlan: string;
  amount: number;
  annual: number;
  isFree: boolean;
  currency: Currency;
}

export interface Currency {
  id: number;
  name: string;
  description: string;
  simbol: string;
  imgSrc: string;
  imgBlog: string[];
  imgBlogContentType: string;
}

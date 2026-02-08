export interface RegisterContextProps {
  registerReq: RegisterRequestNew;
  nacionality: string | number;
  initialStateRegister: RegisterRequestNew;
  initialStateRegisterGoogle: RegisterGoogleRequest;
  setRegisterReq: React.Dispatch<React.SetStateAction<RegisterRequestNew>>;
  setNacionality: (e: string | number) => void;
  partPhoto: FileReq | null;
  setpartPhoto: (e: FileReq | null) => void;
  registerGoogleReq: RegisterGoogleRequest;
  setRegisterGoogleReq: React.Dispatch<React.SetStateAction<RegisterGoogleRequest>>;
  IsGoogleRegister: boolean;
  setIsGoogleRegister: (e: boolean) => void;
}

export interface RegisterRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  referenceCode: string;
  logintude: string;
  latitude: string;
  deviceId: string;
  password: string;
  identificationNumber: string;
  conditionType: string;
  gender: string;
  imagen: string[];
  imagenContentType: string;
}
export interface FileReq {
  uri: string | undefined;
  type: any;
  name: string | undefined;
}

export interface RegisterGoogleRequest {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  referenceCode: string;
  logintude: string;
  latitude: string;
  deviceId: string;
  identificationNumber: string;
  conditionType: string;
  gender: string;
}

export interface RegisterNegociosRequest {
  name: string;
  comercialDenomination: string;
  identificationNumber: string;
  conditionType: string;
  phoneNumber: string;
  email: string;
  password: string;
  logintude: string;
  latitude: string;
  imagenBusinesses: ImagenBusiness[];
}

export interface ImagenBusiness {
  imagen: string;
  imagenContentType: string;
  collectionTypeId: number;
}

export interface RegisterRequestNew {
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
  postionX: any
  postionY: any
  password: any
  gender: any
  myReferCode: string
  referedCode: string
  customerStatus: string
  lastEnterEventDate: string
  lastViewCustomerId: number
  plan: Plan | null
  symbol: Symbol | undefined
  customerDevices: CustomerDevice[]
  customerProfiles: CustomerProfile[]
  customerLanguages: CustomerLanguage[]
  customerGoals: CustomerGoal[]
  customerInterestings: CustomerInteresting[]
}

export interface Plan {
  id: number
  name: string
  description: string
  imgSrc: string
  imgBlog: any
  imgBlogContentType: any
}

export interface Symbol {
  id: number
  name: string
  description: string
  simbolSrc: string
  imgBlogSimbol: any
  imgBlogSimbolContentType: any
}

export interface CustomerDevice {
  id: number
  name: string
  beginningDate: string
  value: string
  lastEnterEventDate: string
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
}

export interface CustomerLanguage {
  id: number
  name: string
  description: string
  iconsrc: string
  imgBlogIcon: any
  imgBlogIconContentType: any
}

export interface CustomerGoal {
  id: number
  name: string
  description: string
  imgSrc: string
  iconsrc: string
  imgBlogSrc: any
  imgBlogSrcContentType: any
  imgBlogSimbol: any
  imgBlogSimbolContentType: any
}

export interface CustomerInteresting {
  id: number
  name: string
  description: string
  iconsrc: string
}

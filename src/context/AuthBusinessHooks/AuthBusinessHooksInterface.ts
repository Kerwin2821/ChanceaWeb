import { CustomerSource } from "../AuthContext/AuthInterface";

export interface SesionBusinessContextProps {
  sesionBusiness: SesionBusiness | null;
  setSesionBusiness: (sesionBusiness: SesionBusiness | null) => void;
  resetSesion: () => void;
}

export interface LoginBusinessResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  business: SesionBusiness;
  token: string;
  countOfUsed: number;
  sumQuantity: number;
  countInAuction: number;
  existRegistroMercantil: boolean;
}

export interface ResponseSesionBusiness {
  codigoRespuesta: string
  mensajeRespuesta: string
  business: SesionBusiness
  token: string
  countOfUsed: any
  sumQuantity: any
  countInAuction: any
  existRegistroMercantil: boolean
}

export interface SesionBusiness {
  id: number
  name: string
  beginningdate: string
  businessCondition: 'VALIDATED' | 'PENDING' | 'IN_PROCESS' | 'CREATED' ; 
  updateDate: any
  endindDate: any
  statusBusiness: string
  code: string
  comercialDenomination: string
  identificationNumber: string
  phoneNumber: string
  email: string
  conditionType: string
  postionX: number
  postionY: number
  urlLogo: string
  imagenLogo: any
  imagenLogoContentType: any
  urlRif: string
  bankInformation: string | null
  imagenRif: any
  imagenRifContentType: any
  collections: Collection[]
  address: any
  customerSource: CustomerSource;
}

export interface Collection {
  id: number
  description: string
  beginningdate: string
  imagen: any
  imagenContentType: string
  url: string
}

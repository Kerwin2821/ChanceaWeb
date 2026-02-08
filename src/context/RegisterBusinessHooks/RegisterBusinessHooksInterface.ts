import { SesionBusiness } from "../AuthBusinessHooks/AuthBusinessHooksInterface"

export const initialStateRegisterNegocios: BusinessRequest = {
  name: '',
  comercialDenomination: '',
  identificationNumber: '',
  conditionType: 'J',
  phoneNumber: '',
  email: '',
  password: '',
  logintude: '',
  latitude: '',
  token: '',
  fileRifUrl: '',
  fileLogo: '',
}

export interface BusinessState {
  initialStateRegisterNegocios:BusinessRequest;
  registerNegociosReq: BusinessRequest;
  setRegisterNegociosReq: (request: Partial<BusinessRequest>) => void;
  resetRegisterNegociosReq: () => void;
}

export interface RegisterBusinessResponse {
  codigoRespuesta: string;
  mensajeRespuesta: string;
  business: SesionBusiness;
}

export interface BusinessRequest {
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

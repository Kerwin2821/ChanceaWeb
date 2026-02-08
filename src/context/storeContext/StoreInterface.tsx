import { GiftData } from "../../screens/Regalos/interface.regalos";
import { BoxPackage, BoxPackageV2, Cita } from "../../utils/Date.interface";
import { CustomersHome, Piropo3 } from "../../utils/Interface";
import { Regalo } from "../../utils/Regalos.interface";
import { Plan, UserData } from "../AuthContext/AuthInterface";

export interface StoreContextProps {
  Customers: CustomersHome[], setCustomers: (e: CustomersHome[]) => void
  Customers2: CustomersHome[], setCustomers2: (e: CustomersHome[]) => void
  Match: UserData[] | undefined, setMatch: (e: UserData[] | undefined) => void
  WhoLikeMeList: UserData[], setWhoLikeMeList: (e: UserData[]) => void
  WhoLikeMePage: number, setWhoLikeMePage: (e: number) => void
  LastViewID: number | undefined, setLastViewID: (e: number | undefined) => void
  Piropos: Piropo3[], setPiropos: (e: Piropo3[]) => void
  Citas: Cita[], setCitas: (e: Cita[]) => void
  CitasRecibidas: Cita[], setCitasRecibidas: (e: Cita[]) => void
  CitasEnviadas: Cita[], setCitasEnviadas: (e: Cita[]) => void
  Regalos: GiftData[], setRegalos: (e: GiftData[]) => void
  RegalosRecibidas: GiftData[], setRegalosRecibidas: (e: GiftData[]) => void
  RegalosEnviadas: GiftData[], setRegalosEnviadas: (e: GiftData[]) => void
  Plans: Plan[], setPlans: (e: Plan[]) => void
  BoxPackage: BoxPackageV2 | undefined, setBoxPackage: (e: BoxPackageV2 | undefined) => void
  PhotoIndexes: Record<string, number>, setPhotoIndex: (userId: string, index: number) => void
  SwiperIndex: number, setSwiperIndex: (index: number) => void
}


export interface MatchResponse {
  codigoRespuesta: string
  mensajeRespuesta: string
  customers: UserData[]
  hasPlanValid: boolean
  infoPlan: any
}

export interface MatchStorage extends UserData {
  notificado: boolean
}

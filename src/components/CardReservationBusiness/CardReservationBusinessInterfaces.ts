import {ImageSourcePropType} from "react-native"
import { Cita, TipoDeCita } from "../../utils/Date.interface";
import { ReservationSingleListResponse } from "../../context/storeBusinessHooks/StoreBusinessInterface";
export interface Props {
    onPress?: () => void;
    tipoCita?:string;
    data: ReservationSingleListResponse,
  }

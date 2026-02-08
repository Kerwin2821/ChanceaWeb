import {ImageSourcePropType} from "react-native"
import { Cita, TipoDeCita } from "../../utils/Date.interface";
export interface Props {
    onPress?: () => void;
    data: Cita,
    tipoCita:TipoDeCita
  }
  
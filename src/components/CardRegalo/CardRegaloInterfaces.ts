import {ImageSourcePropType} from "react-native"
import { Regalo, TipoDeRegalo } from "../../utils/Regalos.interface";
import { GiftData } from "../../screens/Regalos/interface.regalos";
export interface Props {
    onPress?: () => void;
    data: GiftData,
    tipoRegalo:TipoDeRegalo
  }
  
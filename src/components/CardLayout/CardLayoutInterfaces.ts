import {ImageSourcePropType} from "react-native"
export interface Props {
    idUser:string | number
    showNextButtom?: boolean;
    ImageCircle?: boolean;
    photo?: ImageSourcePropType | string;
    svgComponent?: JSX.Element;
    children?: any;
    onPress?: () => void;
    onLongPress?: () => void;
    disable?: boolean
  }
  
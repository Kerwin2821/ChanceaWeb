import { ViewStyle, TextStyle, ImageStyle, ImageSourcePropType } from 'react-native';

export interface Props {
  typeButton?: typeButton;
  disabled?: boolean;
  styleButton?: ViewStyle | ViewStyle[];
  showIcon?: boolean;
  icon?: React.ReactNode;
  styleIcon?: ImageStyle;
  styleText?: TextStyle | TextStyle[];
  text?: string;
  className?: string;
  onPress?: () => void;
  IconDirection?:"left"| "right"
}

type typeButton = 'normal' | 'white' | 'link';

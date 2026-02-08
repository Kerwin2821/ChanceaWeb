import { ViewStyle, ImageStyle, KeyboardTypeOptions, TextStyle } from 'react-native';

export interface Props {
  styleContainer?: ViewStyle | ViewStyle[];
  secureTextEntry?: boolean;
  styleInput?: TextStyle | TextStyle[];
  placeholder?: string;
  placeholderColor?: string;
  styleIcons?: ImageStyle;
  onChangeText?: (e: string) => void;
  value?: string;
  maxLength?: number;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  displaySymbol?: string;
  multiline?: boolean;
  numberOfLines?: number;
  labelText?: string;
  styleLabel?: TextStyle | TextStyle[];
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

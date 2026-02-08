import { ViewStyle, ImageStyle, KeyboardTypeOptions } from 'react-native';

export interface Props {
  styleContainer?: ViewStyle | ViewStyle[];
  styleInput?: ViewStyle | ViewStyle[];
  onChangeText?: (e: string) => void;
  value?: string;
  maxLength?: number;
  keyboardType: KeyboardTypeOptions;
  labelText?: string;
}

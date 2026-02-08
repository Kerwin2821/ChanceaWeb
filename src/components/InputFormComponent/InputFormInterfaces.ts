import { Control, FieldValues, RegisterOptions } from 'react-hook-form';
import { ViewStyle, ImageStyle, KeyboardTypeOptions } from 'react-native';

export interface Props {
  control:Control<FieldValues, any>
  name:string
  rules?: Omit<RegisterOptions<FieldValues, string>, "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"> | undefined
  styleContainer?: ViewStyle | ViewStyle[];
  secureTextEntry?: boolean;
  styleInput?: ViewStyle | ViewStyle[];
  placeholder?: string;
  placeholderColor?: string;
  styleIcons?: ImageStyle;
  onChangeText?: (e: string) => void;
  maxLength?: number;
  disabled?: boolean;
  keyboardType: KeyboardTypeOptions;
  displaySymbol?: string;
  multiline?: boolean;
  numberOfLines?: number;
  labelText?: string;
}

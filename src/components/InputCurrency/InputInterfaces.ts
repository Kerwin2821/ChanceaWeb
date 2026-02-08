import { ViewStyle, ImageStyle, KeyboardTypeOptions, TextInputFocusEventData, NativeSyntheticEvent } from 'react-native';

export interface Props {
  value: string | number;
  onChangeText: (value: string) => void;
  labelText?: string;
  placeholder?: string;
  placeholderColor?: string;
  styleContainer?: object;
  styleInput?: object;
  disabled?: boolean;
  currencySymbol?: string;
  maxLength?: number;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  decimalSeparator?: string;
  thousandSeparator?: string;
}
import React from "react";
import {
  View,
  Text,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type TextProps,
} from "react-native";

import { styles } from "./style";
import { font } from "../../../styles";

type Props = {
  wrapperStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
} & Omit<TextProps, "style">;

export const Button = ({ wrapperStyle, style, ...rest }: Props) => (
  <View style={[ wrapperStyle]}>
    <Text style={[styles.buttonText, style, font.Bold]} {...rest} />
  </View>
);
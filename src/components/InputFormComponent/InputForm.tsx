import React, { useState, useContext } from "react";
import {
  TextInput,
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Platform,
} from "react-native";
import { Colors } from "../../utils";
import { Props } from "./InputFormInterfaces";
import { styles } from "./InputFormResources";
import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";

const InputForm = (props: Props) => {
  const [security, setSecurity] = useState(true);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View>
      {props.labelText && <Text style={styles.label}>{props.labelText}</Text>}
      <Controller
        control={props.control}
        name={props.name}
        rules={props.rules ? props.rules : {}}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => (
          <View>
            <View
              style={[
                styles.container,
                props?.styleContainer,
                { borderRadius: props?.multiline ? 10 : 50 },
                isFocus ? { borderColor: Colors.secondary } : {},
                error ? { borderColor: "red" } : {},
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  styles?.center,
                  {
                    paddingRight:
                      props?.secureTextEntry || props?.displaySymbol ? 46 : 8,
                    height: props?.multiline ? 80 : 40,
                    textAlignVertical: props?.multiline ? "top" : "center",
                    ...((Platform.OS === 'web') ? { outlineStyle: 'none' } : {}) as any,
                  },
                  props?.styleInput,
                ]}
                {...props}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  if (props.onChangeText) {
                    props.onChangeText(text);
                  }
                }}
                placeholder={props?.placeholder || "Example"}
                placeholderTextColor={props?.placeholderColor || "rgba(0,0,0,.4)"}
                secureTextEntry={props?.secureTextEntry && security}
                onFocus={(e) => setIsFocus(true)}
                onBlur={(e) => {
                  onBlur();
                  setIsFocus(false);
                }}
              />

              {props?.secureTextEntry && (
                <TouchableOpacity
                  style={styles.containerIcon}
                  onPress={() => setSecurity(!security)}
                >
                  {security ? (
                    <Ionicons name="eye-off" size={24} color="gray" />
                  ) : (
                    <Ionicons name="eye" size={24} color="gray" />
                  )}
                </TouchableOpacity>
              )}

              {props?.displaySymbol && (
                <View
                  style={[
                    styles.containerIcon,
                    styles.center,
                    styles.icon,
                    { alignItems: "flex-end" },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Dosis",
                      color: Colors.black,
                    }}
                  >
                    {props?.displaySymbol}
                  </Text>
                </View>
              )}
            </View>
            {error?.message && <Text style={[styles.label, { color: "red" }]}>{error?.message || "Error"}</Text>}
          </View>
        )}
      />
    </View>
  );
};

export default InputForm;

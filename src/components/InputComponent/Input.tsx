import React, { useState, useContext } from 'react';
import { TextInput, Text, View, TouchableOpacity, NativeSyntheticEvent, TextInputFocusEventData, Platform } from 'react-native';
import { Colors } from '../../utils';
import { Props } from './InputInterfaces';
import { styles } from './InputResources';
import { Ionicons } from '@expo/vector-icons';

const Input = (props: Props) => {
  const [security, setSecurity] = useState(true);
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View>
      {props.labelText && <Text style={[{ ...styles.label, color: props.disabled ? "gray" : "black" }, props.styleLabel]}>{props.labelText}</Text>}
      <View style={[
        styles.container,
        { borderRadius: props?.multiline ? 25 : 50 },
        props?.styleContainer,
        isFocus ? { borderColor: Colors.secondary } : {}
      ]}>
        <TextInput
          style={[
            styles.input,
            styles?.center,
            {
              paddingRight: props?.secureTextEntry || props?.displaySymbol ? 46 : 8,
              height: props?.multiline ? 80 : 40,
              textAlignVertical: props?.multiline ? 'top' : 'center',
              outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
              borderWidth: 0
            } as any,
            props?.styleInput
          ]}
          {...props}
          autoCapitalize={props.autoCapitalize}
          onChangeText={(e: string) => {
            props?.onChangeText && props?.onChangeText(e);
          }}
          maxLength={props.maxLength ? props.maxLength : 150}
          placeholder={props?.placeholder || 'Example'}
          placeholderTextColor={props?.placeholderColor || 'rgba(0,0,0,.4)'}
          secureTextEntry={props?.secureTextEntry && security}
          onFocus={(e) => setIsFocus(true)}
          onBlur={(e) => setIsFocus(false)}
          editable={!props.disabled}
        />

        {props?.secureTextEntry && (
          <TouchableOpacity style={styles.containerIcon} onPress={() => setSecurity(!security)}>
            {security ? (
              <Ionicons name="eye-off" size={24} color="gray" />
            ) : (
              <Ionicons name="eye" size={24} color="gray" />
            )}
          </TouchableOpacity>
        )}

        {props?.displaySymbol && (
          <View style={[styles.containerIcon, styles.center, styles.icon, { alignItems: 'flex-end' }]}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'Dosis',
                color: Colors.black
              }}
            >
              {props?.displaySymbol}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Input;

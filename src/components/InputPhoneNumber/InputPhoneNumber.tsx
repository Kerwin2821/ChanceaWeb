"use client"

import { useRef, useEffect } from "react"
import { Text, View, Platform } from "react-native"
import type { Props } from "./InputPhoneNumberInterfaces"
import { styles } from "./InputPhoneNumberResources"
import PhoneInput from "react-native-phone-input"

const InputPhoneNumber = (props: Props) => {
  const phoneRef = useRef<any>(null)

  useEffect(() => {
    phoneRef.current.focus()

    return () => { }
  }, [])

  // Add this effect to update the phone input when value changes
  useEffect(() => {
    if (phoneRef.current && props.value !== undefined) {
      // Format the value to ensure it has the correct format
      const formattedValue = "58" + (props.value?.replace("+58", "") || "")

      // Update the phone input value
      phoneRef.current.setValue(formattedValue)
    }
  }, [props.value])

  return (
    <View>
      {props.labelText && <Text style={styles.label}>{props.labelText}</Text>}
      <View style={[styles.container, props?.styleContainer]}>
        <PhoneInput
          style={[styles.input, styles?.center, props?.styleInput]}
          {...props}
          ref={phoneRef}
          initialCountry={"ve"}
          initialValue={"58" + (props.value?.replace("+58", "") || "")}
          textProps={{
            maxLength: 13,
            style: {
              ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
              flex: 1,
              height: "100%",
              fontSize: 16,
              fontFamily: "Regular",
              color: "#333",
            } as any,
          }}
          onChangePhoneNumber={(e: string) => {
            props?.onChangeText && props?.onChangeText(e)
          }}
        />
      </View>
    </View>
  )
}

export default InputPhoneNumber


"use client"

import React, { useState, useCallback, useMemo } from "react"
import { TextInput, Text, View, type NativeSyntheticEvent, type TextInputFocusEventData } from "react-native"
import { Colors } from "../../utils"
import { styles } from "./InputResources"
import type { Props } from "./InputInterfaces"

const InputCurrency = (props: Props) => {
  const [isFocus, setIsFocus] = useState(false)

  // Format number as currency with 2 decimal places
  const formatDisplay = useCallback((value: string): string => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "")

    // Convert to a number in cents (divide by 100 to get dollars)
    const cents = Number.parseInt(numericValue) || 0
    const dollars = cents / 100

    // Format with 2 decimal places
    return dollars.toFixed(2)
  }, [])

  // Handle text input changes - right to left input
  const handleChangeText = useCallback(
    (text: string) => {
      // If the user is trying to clear the input
      if (!text || text === "0.00") {
        props.onChangeText("0")
        return
      }

      // Remove all non-numeric characters
      const cleanValue = text.replace(/\D/g, "")

      // Convert to numeric value (in cents)
      const numericValue = Number.parseInt(cleanValue) || 0

      // Pass the numeric value as string to parent
      props.onChangeText((numericValue / 100).toString())
    },
    [props.onChangeText],
  )

  // Process input for right-to-left entry
  const processInput = useCallback((input: string): string => {
    // Remove all non-numeric characters
    const numericOnly = input.replace(/\D/g, "")

    // Pad with zeros on the left if needed
    const paddedValue = numericOnly.padStart(3, "0")

    // Insert decimal point
    const decimalValue = paddedValue.slice(0, -2) + "." + paddedValue.slice(-2)

    return decimalValue
  }, [])

  // Current display value
  const displayValue = useMemo(() => {
    // Get numeric value from props
    const numValue = typeof props.value === "string" ? Number.parseFloat(props.value) : Number(props.value)

    // Convert to cents (integer)
    const cents = Math.round((isNaN(numValue) ? 0 : numValue) * 100)

    // Format as dollars with 2 decimal places
    return (cents / 100).toFixed(2)
  }, [props.value])

  // Handle focus event
  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocus(true)
      props.onFocus && props.onFocus(e)
    },
    [props.onFocus],
  )

  // Handle blur event
  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocus(false)
      props.onBlur && props.onBlur(e)
    },
    [props.onBlur],
  )

  // Handle key press for right-to-left input
  const handleKeyPress = useCallback(
    (key: string) => {
      // Get current value without formatting
      const currentValue = displayValue.replace(/\D/g, "")

      if (key === "Backspace" || key === "Delete") {
        // Remove the rightmost digit
        const newValue = currentValue.slice(0, -1) || "0"
        const cents = Number.parseInt(newValue) || 0
        props.onChangeText((cents / 100).toString())
      } else if (/\d/.test(key)) {
        // Add new digit to the right, shifting others left
        // Limit to maximum allowed length
        const maxDigits = props.maxLength ? props.maxLength - 3 : 12 // Accounting for "0." and decimal places
        const newValue = (currentValue + key).slice(-maxDigits)
        const cents = Number.parseInt(newValue) || 0
        props.onChangeText((cents / 100).toString())
      }
    },
    [displayValue, props.onChangeText, props.maxLength],
  )

  return (
    <View>
      {props.labelText && (
        <Text style={{ ...styles.label, color: props.disabled ? "gray" : "black" }}>{props.labelText}</Text>
      )}
      <View
        style={[
          styles.container,
          props?.styleContainer,
          { borderRadius: 50 },
          isFocus ? { borderColor: Colors.secondary } : {},
        ]}
      >
        <TextInput
          style={[
            styles.input,
            styles?.center,
            {
              paddingRight: props?.currencySymbol ? 46 : 8,
              height: 40,
              textAlignVertical: "center",
            },
            props?.styleInput,
          ]}
          value={displayValue}
          onChangeText={handleChangeText}
          maxLength={props.maxLength ? props.maxLength : 15}
          placeholder={props?.placeholder || "0.00"}
          placeholderTextColor={props?.placeholderColor || "rgba(0,0,0,.4)"}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!props.disabled}
          keyboardType="numeric"
        />

        {props?.currencySymbol && (
          <View style={[styles.containerIcon, styles.center, styles.icon, { alignItems: "flex-end" }]}>
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Dosis",
                color: Colors.black,
              }}
            >
              {props.currencySymbol}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default React.memo(InputCurrency)

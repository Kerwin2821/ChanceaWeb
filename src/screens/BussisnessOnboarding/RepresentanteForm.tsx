"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons"
import { CommonActions, useNavigation } from "@react-navigation/native"
import type { NavigationScreenNavigationType } from "../../navigation/StackNavigator"

// Local imports
import { useAuth, useRender } from "../../context"
import { useStoreBusiness } from "../../context/storeBusinessHooks/useStoreBusiness"
import { GetHeader, ToastCall } from "../../utils/Helpers"
import { HttpService } from "../../services"
import { useSesionBusinessStore } from "../../context/AuthBusinessHooks/useAuthBusinessHooks"
import ScreenContainerForm from "../../components/ScreenContainerForm"
import Select from "../../components/Select/SelectComponent"
import { font } from "../../../styles"
import Input from "../../components/InputComponent/Input"
import InputPhoneNumber from "../../components/InputPhoneNumber/InputPhoneNumber"
import Button from "../../components/ButtonComponent/Button"
import OnboardingValidateBusiness from "../../utils/OnboardingValidateBusiness"
import DialogSelectBank from "../../components/Dialog/DialogSelectBank/DialogSelectBank"
import dataBancos from "../../utils/dataBancos.json"
import { Colors } from "../../utils"

// Regex patterns for validation
const phoneRegex = /^(412|414|416|424|413|415|426|428|422)\d{7}$/
const accountNumberRegex = /^\d{20}$/

// Document type options
const documents = [
  { value: "J", label: "J" },
  { value: "V", label: "V" },
  { value: "E", label: "E" },
  { value: "P", label: "P" },
  { value: "G", label: "G" },
]

const RepresentanteForm = () => {
  // Context and navigation hooks
  const { RepCivil, setRepCivil, Stores } = useStoreBusiness()
  const { TokenAuthApi, SesionToken } = useAuth()
  const { setLoader } = useRender()
  const navigation = useNavigation<NavigationScreenNavigationType>()
  const { sesionBusiness, setSesionBusiness } = useSesionBusinessStore()

  // Local state
  const [isNumberPhoneValid, setIsNumberPhoneValid] = useState<boolean | null>(null)
  const [isAccountNumberValid, setIsAccountNumberValid] = useState<boolean | null>(null)
  const [showBankSelector, setShowBankSelector] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    phone?: string
    accountNumber?: string
    identification?: string
    bank?: string
  }>({})

  // Get selected bank name
  const selectedBankName = useMemo(() => {
    const bank = dataBancos.find((bank) => bank.value === RepCivil.abaBank)
    return bank ? bank.label : "Seleccionar banco"
  }, [RepCivil.abaBank])

  // Get bank logo
  /* const bankLogo = useMemo(() => {
    const bank = dataBancos.find((bank) => bank.value === RepCivil.abaBank)
    return bank?.logo || null
  }, [RepCivil.abaBank]) */

  // Form field change handler
  const handleFieldChange = useCallback(
    (value: string | number, key: string) => {
      setRepCivil({
        ...RepCivil,
        [key]: value,
      })

      // Clear specific error when field is updated
      if (errors[key as keyof typeof errors]) {
        setErrors({
          ...errors,
          [key]: undefined,
        })
      }
    },
    [RepCivil, errors],
  )

  // Validate phone number
  useEffect(() => {
    if (RepCivil.phoneNumber && RepCivil.phoneNumber.length >= 13) {
      const phoneWithoutPrefix = RepCivil.phoneNumber.replace("+58", "")
      const isValid = phoneRegex.test(phoneWithoutPrefix)
      setIsNumberPhoneValid(isValid)

      if (!isValid) {
        setErrors((prev) => ({
          ...prev,
          phone: "Número de teléfono inválido",
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          phone: undefined,
        }))
      }
    } else {
      setIsNumberPhoneValid(null)
    }
  }, [RepCivil.phoneNumber])

  // Validate account number
  useEffect(() => {
    if (RepCivil.transferenceNumber) {
      const isValid = RepCivil.transferenceNumber.length >= 10
      setIsAccountNumberValid(isValid)

      if (!isValid) {
        setErrors((prev) => ({
          ...prev,
          accountNumber: "El número de cuenta debe tener al menos 10 dígitos",
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          accountNumber: undefined,
        }))
      }
    } else {
      setIsAccountNumberValid(null)
    }
  }, [RepCivil.transferenceNumber])

  // Submit form handler
  const handleSubmit = async () => {
    // Validate all fields
    const newErrors: typeof errors = {}

    if (!RepCivil.conditionType || !RepCivil.identificationNumber) {
      newErrors.identification = "La cédula es requerida"
    }

    if (!RepCivil.phoneNumber || !isNumberPhoneValid) {
      newErrors.phone = "Número de teléfono inválido"
    }

    if (!RepCivil.abaBank) {
      newErrors.bank = "Debe seleccionar un banco"
    }

    if (!RepCivil.transferenceNumber || !isAccountNumberValid) {
      newErrors.accountNumber = "Número de cuenta inválido"
    }

    // If there are errors, show them and don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      ToastCall("warning", "Por favor, corrija los errores en el formulario", "ES")
      return
    }

    // Confirm submission
    Alert.alert("Confirmar información", "¿Está seguro que desea guardar esta información bancaria?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Guardar",
        onPress: () => sendCreate(),
      },
    ])
  }

  // API call to update business information
  const sendCreate = async () => {
    if (!sesionBusiness) return

    try {
      setIsSubmitting(true)
      setLoader(true)

      const host = process.env.APP_BASE_API
      const url = `/api/appchancea/businesses/update?sessionToken=${SesionToken}`
      const header = await GetHeader(TokenAuthApi, "application/json")

      const response = await HttpService(
        "put",
        host,
        url,
        {
          ...sesionBusiness,
          bankInformation: `${RepCivil.phoneNumber.replace("+58", "")}-${RepCivil.abaBank}-${RepCivil.conditionType}-${RepCivil.identificationNumber}-${RepCivil.transferenceNumber}`,
          password: null,
          token: SesionToken,
        },
        header,
      )

      console.log(response.business, "response")

      setSesionBusiness(response.business)
      await AsyncStorage.setItem("SesionBusiness", JSON.stringify(response.business))

      const validate = await OnboardingValidateBusiness(response.business, navigation, setSesionBusiness, Stores)

      if (!validate) return

      ToastCall("success", "Información bancaria guardada correctamente", "ES")

      navigation.replace("HomeBusiness")
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "HomeBusiness" }],
        }),
      )
    } catch (error: any) {
      console.error(JSON.stringify(error))
      if (error && error?.status) {
        ToastCall("error", "Error de conexión con el servidor", "ES")
      } else {
        ToastCall("error", "Tienes problemas de conexión", "ES")
      }
    } finally {
      setLoader(false)
      setIsSubmitting(false)
    }
  }

  return (
    <ScreenContainerForm>

     {/*  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}> */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>

            {/* Title and description */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, font.Bold]}>Datos Bancarios</Text>
              <Text style={[styles.subtitle, font.Regular]}>
                Esta información será utilizada para los reintegros de las ventas de su negocio
              </Text>
            </View>

            {/* Form fields */}
            <View style={styles.formContainer}>
              {/* Document type and number */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, font.SemiBold]}>Documento de Identidad</Text>
                <View style={styles.documentContainer}>
                  <View style={styles.documentTypeContainer}>
                    <Select
                      items={documents}
                      onChange={(value: string | number) => handleFieldChange(value, "conditionType")}
                      lengthText={12}
                      styleText={{ paddingHorizontal: 0 }}
                      value={RepCivil.conditionType}
                    />
                  </View>
                  <View style={styles.documentNumberContainer}>
                    <Input
                      placeholder={"Ejemplo: 12110977"}
                      onChangeText={(text: string) =>
                        handleFieldChange(text.replace(/[^0-9a-zA-Z]/g, ""), "identificationNumber")
                      }
                      value={RepCivil.identificationNumber}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                  </View>
                </View>
                {errors.identification && <Text style={[styles.errorText, font.Regular]}>{errors.identification}</Text>}
              </View>

              {/* Phone number */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, font.SemiBold]}>Número de Teléfono</Text>
                <View style={styles.phoneContainer}>
                  <InputPhoneNumber
                    labelText=""
                    keyboardType="default"
                    value={RepCivil.phoneNumber}
                    onChangeText={(text: string) => {
                      if (text.length < 15) handleFieldChange(text, "phoneNumber")
                    }}
                  />
                  {isNumberPhoneValid !== null && (
                    <View style={styles.validationIcon}>
                      {isNumberPhoneValid ? (
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                      ) : (
                        <MaterialIcons name="error" size={24} color="#F44336" />
                      )}
                    </View>
                  )}
                </View>
                {errors.phone && <Text style={[styles.errorText, font.Regular]}>{errors.phone}</Text>}
                <Text style={[styles.helperText, font.Regular]}>
                  Debe ser el mismo número registrado para Pago Móvil
                </Text>
              </View>

              {/* Bank selection */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, font.SemiBold]}>Banco</Text>
                <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankSelector(true)}>
                  {/* {bankLogo ? (
                    <Image source={{ uri: bankLogo }} style={styles.bankLogo} />
                  ) : (
                    <FontAwesome5 name="university" size={20} color={Colors.secondary} />
                  )} */}
                  <Text style={[styles.bankText, font.Regular]}>{selectedBankName}</Text>
                  <FontAwesome5 name="chevron-down" size={16} color={Colors.secondary} />
                </TouchableOpacity>
                {errors.bank && <Text style={[styles.errorText, font.Regular]}>{errors.bank}</Text>}
                <Text style={[styles.helperText, font.Regular]}>Banco donde tiene registrado su Pago Móvil</Text>
              </View>

              {/* Account number */}
              <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, font.SemiBold]}>Número de Cuenta</Text>
                <View style={styles.accountContainer}>
                  <Input
                    placeholder="Ejemplo: 01020304050607080910"
                    keyboardType="number-pad"
                    value={RepCivil.transferenceNumber}
                    maxLength={20}
                    onChangeText={(text: string) =>
                      handleFieldChange(text.replace(/[^0-9]/g, ""), "transferenceNumber")
                    }
                  />
                  {isAccountNumberValid !== null && (
                    <View style={styles.validationIcon}>
                      {isAccountNumberValid ? (
                        <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                      ) : (
                        <MaterialIcons name="error" size={24} color="#F44336" />
                      )}
                    </View>
                  )}
                </View>
                {errors.accountNumber && <Text style={[styles.errorText, font.Regular]}>{errors.accountNumber}</Text>}
              </View>
            </View>

            {/* Submit button */}
            <View style={styles.buttonContainer}>
              <Button
                text={isSubmitting ? "Guardando..." : "Guardar y Continuar"}
                disabled={
                  !RepCivil.abaBank ||
                  !RepCivil.identificationNumber ||
                  !RepCivil.phoneNumber ||
                  !RepCivil.transferenceNumber ||
                  isSubmitting
                }
                onPress={handleSubmit}
                icon={isSubmitting ? null : "check"}
              />
              {isSubmitting && <ActivityIndicator size="small" color={Colors.primary} style={styles.buttonLoader} />}
            </View>

            
          </View>
        </ScrollView>
      {/* </KeyboardAvoidingView> */}

      {/* Bank selection dialog */}
      <DialogSelectBank
        active={showBankSelector}
        setActive={setShowBankSelector}
        onChange={(value) => {
          handleFieldChange(value, "abaBank")
        }}
        type="business"
      />
    </ScreenContainerForm>
  )
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: Colors.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 8,
  },
  documentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentTypeContainer: {
    width: "30%",
    marginRight: "5%",
  },
  documentNumberContainer: {
    width: "65%",
  },
  phoneContainer: {
    position: "relative",
  },
  validationIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  errorText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  bankSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  bankText: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
  },
  accountContainer: {
    position: "relative",
  },
  buttonContainer: {
    position: "relative",
    marginBottom: 24,
  },
  buttonLoader: {
    position: "absolute",
    right: 24,
    top: 16,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
})

export default RepresentanteForm

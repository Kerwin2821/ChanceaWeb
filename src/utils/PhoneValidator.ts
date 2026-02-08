
/**
 * Valida que un mensaje no contenga números de teléfono venezolanos
 * @param message Texto del mensaje a validar
 * @param userPhone Número de teléfono del usuario (opcional, para verificación adicional)
 * @param countryCode Código de país (por defecto "+58")
 * @returns Objeto con resultado de validación y mensaje de error si aplica
 */
export function validateMessageNoPhone(
  message: string,
  userPhone?: string,
  countryCode = "+58"
): {
  isValid: boolean;
  errorMessage?: string;
  foundPhones?: string[];
} {
  if (!message) {
    return { isValid: true };
  }

  // Normalizar el mensaje (eliminar espacios, guiones, etc.)
  const normalizedMessage = normalizePhone(message);
  
  // Buscar todos los números venezolanos en el mensaje
  const venezuelanPhones = findVenezuelanPhones(normalizedMessage, countryCode);
  
  // Si se encontraron números venezolanos
  if (venezuelanPhones.length > 0) {
    return {
      isValid: false,
      errorMessage: "El mensaje contiene números de teléfono venezolanos",
      foundPhones: venezuelanPhones
    };
  }

  // Verificación adicional contra el teléfono del usuario
  if (userPhone) {
    const containsUserPhone = messageContainsPhone(message, userPhone, countryCode);
    if (containsUserPhone) {
      return {
        isValid: false,
        errorMessage: "No puedes enviar tu número de teléfono por seguridad",
        foundPhones: [userPhone]
      };
    }
  }

  return { isValid: true };
}

/**
 * Encuentra todos los números venezolanos en un texto
 */
function findVenezuelanPhones(text: string, countryCode: string): string[] {
  const normalized = normalizePhone(text);
  const nationalFormat = extractNationalFormat(normalized, countryCode);
  
  const matches = nationalFormat.match(/(412|414|416|424|413|415|426|428|422)\d{7}/g);
  return matches ? matches : [];
}

// Funciones auxiliares existentes (las mismas que en tu código original)
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function extractNationalFormat(phone: string, countryCode = "+58"): string {
  if (phone.startsWith(countryCode)) {
    return phone.slice(countryCode.length);
  }
  if (phone.startsWith(`00${countryCode.slice(1)}`)) {
    return phone.slice(countryCode.length + 1);
  }
  if (phone.startsWith('0')) {
    return phone.slice(1);
  }
  return phone;
}

export function messageContainsPhone(message: string, userPhone: string, countryCode = "+58"): boolean {
  if (!userPhone || !message) return false;

  const normalizedUserPhone = normalizePhone(userPhone);
  const normalizedMessage = normalizePhone(message);

  const coreUserPhone = extractNationalFormat(normalizedUserPhone, countryCode);
  const coreMessagePhone = extractNationalFormat(normalizedMessage, countryCode);

  return coreUserPhone === coreMessagePhone;
}
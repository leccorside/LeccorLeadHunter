/**
 * Utilitário para normalização, validação e formatação de números de telefone (com foco no Brasil / E.164)
 */

export interface NormalizedPhoneResult {
  raw: string;
  digits: string;
  e164: string;
  formatted: string;
  isMobile: boolean;
  isValid: boolean;
}

export function normalizePhone(rawPhone?: string | null, defaultCountryCode = '55'): NormalizedPhoneResult {
  if (!rawPhone) {
    return {
      raw: '',
      digits: '',
      e164: '',
      formatted: '',
      isMobile: false,
      isValid: false,
    };
  }

  // Remove tudo que não for dígito
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits) {
    return {
      raw: rawPhone,
      digits: '',
      e164: '',
      formatted: '',
      isMobile: false,
      isValid: false,
    };
  }

  // Tratamento para números do Brasil (DDI 55)
  // Casos comuns:
  // 1. 11 dígitos: DDD + 9 dígitos (ex: 64999999999) -> Celular
  // 2. 10 dígitos: DDD + 8 dígitos (ex: 6434530000) -> Fixo
  // 3. 13 dígitos: 55 + DDD + 9 dígitos (ex: 5564999999999)
  // 4. 12 dígitos: 55 + DDD + 8 dígitos (ex: 556434530000)
  // 5. 9 ou 8 dígitos sem DDD (incompleto)

  let ddd = '';
  let number = '';
  let isMobile = false;

  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }

  let formatted = '';
  let e164 = '';
  let isValid = false;

  if (digits.length === 11) {
    // DDD + 9 dígitos (celular)
    ddd = digits.substring(0, 2);
    number = digits.substring(2);
    isMobile = number.startsWith('9');
    formatted = `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
    e164 = `${defaultCountryCode}${digits}`;
    isValid = true;
  } else if (digits.length === 10) {
    // DDD + 8 dígitos (fixo ou celular antigo)
    ddd = digits.substring(0, 2);
    number = digits.substring(2);
    isMobile = false;
    formatted = `(${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`;
    e164 = `${defaultCountryCode}${digits}`;
    isValid = true;
  } else if (digits.length > 11) {
    // Número internacional ou com ramal
    e164 = digits;
    formatted = `+${digits}`;
    isValid = true;
    isMobile = true;
  } else {
    // Incompleto
    formatted = digits;
    e164 = digits;
    isValid = false;
    isMobile = false;
  }

  return {
    raw: rawPhone,
    digits,
    e164,
    formatted,
    isMobile,
    isValid,
  };
}

export function buildWhatsAppLink(phone: string, message?: string): string {
  const normalized = normalizePhone(phone);
  if (!normalized.isValid) return '';

  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://web.whatsapp.com/send?phone=${normalized.e164}${encodedMessage ? `&text=${encodedMessage}` : ''}`;
}

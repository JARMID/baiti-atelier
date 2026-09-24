/**
 * Algerian National and International Phone Validator
 * Supports Mobilis (06), Djezzy (07), Ooredoo (05), Landlines (02/03/04),
 * and standard international +213 formats.
 */

export interface PhoneValidationResult {
  valid: boolean;
  formatted?: string;
  country?: 'DZ' | 'FR' | 'INTL';
  operator?: string;
  reason?: string;
}

export const validatePhoneNumber = (rawPhone: string): PhoneValidationResult => {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, reason: 'Numéro de téléphone requis' };
  }

  const cleanPhone = rawPhone.trim().replace(/[\s().-]/g, '');

  if (cleanPhone.length < 8 || cleanPhone.length > 16) {
    return {
      valid: false,
      reason: 'Le numéro doit comporter entre 8 et 15 chiffres',
    };
  }

  // Reject dummy sequences
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digitsOnly) || digitsOnly === '1234567890' || digitsOnly === '0123456789') {
    return {
      valid: false,
      reason: 'Veuillez saisir un numéro de téléphone réel',
    };
  }

  // Algerian phone format: +213(5|6|7|2|3|4|9)XXXXXXXX or 0(5|6|7|2|3|4|9)XXXXXXXX
  const dzIntlRegex = /^(?:\+213|00213|213)([5672349]\d{8})$/;
  const dzLocalRegex = /^0([5672349]\d{8})$/;

  const dzMatch = cleanPhone.match(dzIntlRegex) || cleanPhone.match(dzLocalRegex);
  if (dzMatch) {
    const nationalNumber = dzMatch[1];
    const firstDigit = nationalNumber[0];
    let operator = 'Réseau Fixe Algérie Télécom';
    if (firstDigit === '5') operator = 'Ooredoo Algérie';
    else if (firstDigit === '6') operator = 'Mobilis (ATM)';
    else if (firstDigit === '7') operator = 'Djezzy (OTA)';

    return {
      valid: true,
      formatted: `+213 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 5)} ${nationalNumber.slice(5, 7)} ${nationalNumber.slice(7)}`,
      country: 'DZ',
      operator,
    };
  }

  // French format (+33)
  const frRegex = /^(?:\+33|0033|0)([1-9]\d{8})$/;
  const frMatch = cleanPhone.match(frRegex);
  if (frMatch) {
    return {
      valid: true,
      formatted: `+33 ${frMatch[1].slice(0, 1)} ${frMatch[1].slice(1, 3)} ${frMatch[1].slice(3, 5)} ${frMatch[1].slice(5, 7)} ${frMatch[1].slice(7)}`,
      country: 'FR',
      operator: 'Opérateur Français',
    };
  }

  // General E.164
  if (/^\+[1-9]\d{6,14}$/.test(cleanPhone)) {
    return {
      valid: true,
      formatted: cleanPhone,
      country: 'INTL',
      operator: 'International',
    };
  }

  return {
    valid: false,
    reason: 'Format invalide. Exemple Algérie : 0797780838 ou +213 797 78 08 38',
  };
};

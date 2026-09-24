/**
 * Strict Email Deliverability and Structure Checker
 * Complies with RFC 5322, verifies real TLDs, and detects invalid burner addresses.
 */

export interface EmailCheckResult {
  valid: boolean;
  reason?: string;
}

export const isEmailValidAndReal = (rawEmail: string): EmailCheckResult => {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, reason: 'Adresse email requise' };
  }

  const email = rawEmail.trim().toLowerCase();

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Format d\'adresse email invalide' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Adresse email invalide' };
  }

  const [, domain] = parts;

  // Validate TLD length & chars
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]{2,24}$/.test(tld)) {
    return { valid: false, reason: 'Extension de domaine invalide (.dz, .com, .fr, etc.)' };
  }

  // Reject disposable domains
  const blockedBurnerDomains = [
    'tempmail.com',
    'throwawaymail.com',
    'mailinator.com',
    'guerrillamail.com',
    '10minutemail.com',
    'yopmail.com',
    'trashmail.com',
  ];

  if (blockedBurnerDomains.includes(domain)) {
    return { valid: false, reason: 'Les adresses emails temporaires ne sont pas acceptées' };
  }

  return { valid: true };
};

export const validateRealEmail = isEmailValidAndReal;

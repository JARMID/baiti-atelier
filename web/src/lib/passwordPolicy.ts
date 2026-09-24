/**
 * TrustDesk-Grade Password Policy Evaluator
 * Enforces enterprise criteria for artisan security:
 * 1. Minimum 8 characters (recommended 12+)
 * 2. Uppercase character
 * 3. Lowercase character
 * 4. Digit
 * 5. Special character
 */

export interface PasswordPolicyResult {
  valid: boolean;
  score: number; // 0 to 100
  isLengthValid: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isNotTrivial: boolean;
  reason?: string;
}

export const evaluatePasswordPolicy = (password: string): PasswordPolicyResult => {
  if (!password) {
    return {
      valid: false,
      score: 0,
      isLengthValid: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
      isNotTrivial: false,
      reason: 'Le mot de passe est obligatoire',
    };
  }

  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);

  const trivialPatterns = [
    '12345678',
    'password',
    'motdepasse',
    'admin123',
    'baiti2026',
    'qwertyui',
    'azertyui',
  ];

  const lower = password.toLowerCase();
  const isNotTrivial = !trivialPatterns.some((p) => lower.includes(p)) && !/^(\w)\1{4,}$/.test(password);

  let criteriaCount = 0;
  if (isLengthValid) criteriaCount++;
  if (hasUpperCase) criteriaCount++;
  if (hasLowerCase) criteriaCount++;
  if (hasNumber) criteriaCount++;
  if (hasSpecialChar) criteriaCount++;

  let score = criteriaCount * 18;
  if (password.length >= 12) score += 10;
  if (isNotTrivial) score = Math.min(100, score);

  const valid = isLengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isNotTrivial;

  return {
    valid,
    score,
    isLengthValid,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
    isNotTrivial,
    reason: valid ? undefined : 'Le mot de passe doit respecter tous les critères de sécurité requis',
  };
};

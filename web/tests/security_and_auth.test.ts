import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validatePhoneNumber } from '../src/lib/phoneValidator.ts';
import { evaluatePasswordPolicy } from '../src/lib/passwordPolicy.ts';
import {
  generateTotpSecret,
  getTotpUri,
  generateTotpToken,
  verifyTotpToken,
  generateBackupCodes,
} from '../src/utils/totp.ts';

describe('Algerian Phone Number Validator', () => {
  it('validates Mobilis mobile numbers in local and international formats', () => {
    const localRes = validatePhoneNumber('0661234567');
    assert.equal(localRes.valid, true);
    assert.equal(localRes.country, 'DZ');
    assert.equal(localRes.operator, 'Mobilis (ATM)');
    assert.equal(localRes.formatted, '+213 661 23 45 67');

    const intlRes = validatePhoneNumber('+213661234567');
    assert.equal(intlRes.valid, true);
    assert.equal(intlRes.country, 'DZ');
    assert.equal(intlRes.operator, 'Mobilis (ATM)');
    assert.equal(intlRes.formatted, '+213 661 23 45 67');
  });

  it('validates Djezzy mobile numbers in local and international formats', () => {
    const localRes = validatePhoneNumber('0770123456');
    assert.equal(localRes.valid, true);
    assert.equal(localRes.country, 'DZ');
    assert.equal(localRes.operator, 'Djezzy (OTA)');
    assert.equal(localRes.formatted, '+213 770 12 34 56');

    const intlRes = validatePhoneNumber('+213 770 12 34 56');
    assert.equal(intlRes.valid, true);
    assert.equal(intlRes.country, 'DZ');
    assert.equal(intlRes.operator, 'Djezzy (OTA)');
  });

  it('validates Ooredoo mobile numbers in local and international formats', () => {
    const localRes = validatePhoneNumber('0550123456');
    assert.equal(localRes.valid, true);
    assert.equal(localRes.country, 'DZ');
    assert.equal(localRes.operator, 'Ooredoo Algérie');
    assert.equal(localRes.formatted, '+213 550 12 34 56');
  });

  it('validates Algérie Télécom landline numbers', () => {
    const fixedRes = validatePhoneNumber('021745678');
    assert.equal(fixedRes.valid, true);
    assert.equal(fixedRes.country, 'DZ');
    assert.equal(fixedRes.operator, 'Réseau Fixe Algérie Télécom');
  });

  it('rejects trivial repetitive and sequential numbers', () => {
    assert.equal(validatePhoneNumber('0000000000').valid, false);
    assert.equal(validatePhoneNumber('1111111111').valid, false);
    assert.equal(validatePhoneNumber('1234567890').valid, false);
  });

  it('rejects numbers with invalid length', () => {
    assert.equal(validatePhoneNumber('0661').valid, false);
    assert.equal(validatePhoneNumber('0661234567890123456').valid, false);
  });
});

describe('Artisan Security Password Policy Evaluator', () => {
  it('rejects empty or missing password', () => {
    const res = evaluatePasswordPolicy('');
    assert.equal(res.valid, false);
    assert.equal(res.score, 0);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const res = evaluatePasswordPolicy('Aa1!bcd');
    assert.equal(res.valid, false);
    assert.equal(res.isLengthValid, false);
  });

  it('rejects trivial passwords even if they contain mixed characters', () => {
    const res = evaluatePasswordPolicy('baiti2026!');
    assert.equal(res.isNotTrivial, false);
    assert.equal(res.valid, false);
  });

  it('requires all four character classes (upper, lower, digit, special)', () => {
    const noUpper = evaluatePasswordPolicy('atelier2026#');
    assert.equal(noUpper.hasUpperCase, false);
    assert.equal(noUpper.valid, false);

    const noSpecial = evaluatePasswordPolicy('Atelier2026Dz');
    assert.equal(noSpecial.hasSpecialChar, false);
    assert.equal(noSpecial.valid, false);
  });

  it('approves compliant strong passwords with high scores', () => {
    const res = evaluatePasswordPolicy('Atelier#Kouba2026!');
    assert.equal(res.valid, true);
    assert.equal(res.isLengthValid, true);
    assert.equal(res.hasUpperCase, true);
    assert.equal(res.hasLowerCase, true);
    assert.equal(res.hasNumber, true);
    assert.equal(res.hasSpecialChar, true);
    assert.equal(res.isNotTrivial, true);
    assert.ok(res.score >= 90);
  });
});

describe('RFC 6238 TOTP Two-Factor Engine', () => {
  it('generates a 32-character RFC 4648 Base32 secret', () => {
    const secret = generateTotpSecret();
    assert.equal(secret.length, 32);
    assert.match(secret, /^[A-Z2-7]{32}$/);
  });

  it('constructs a compliant otpauth URI for authenticator applications', () => {
    const secret = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
    const uri = getTotpUri('artisan@baiti.dz', secret, 'Baiti Atelier');
    assert.ok(uri.startsWith('otpauth://totp/'));
    assert.ok(uri.includes('Baiti%20Atelier:artisan%40baiti.dz'));
    assert.ok(uri.includes(`secret=${secret}`));
    assert.ok(uri.includes('algorithm=SHA1'));
    assert.ok(uri.includes('digits=6'));
    assert.ok(uri.includes('period=30'));
  });

  it('generates a 6-digit numeric token', async () => {
    const secret = generateTotpSecret();
    const token = await generateTotpToken(secret, 1774435200000);
    assert.equal(token.length, 6);
    assert.match(token, /^\d{6}$/);
  });

  it('verifies a generated token successfully at exact timestamp and with window drift', async () => {
    const secret = generateTotpSecret();
    const fixedTime = 1774435200000;
    const token = await generateTotpToken(secret, fixedTime);

    // Exact time
    const exactMatch = await verifyTotpToken(token, secret, fixedTime);
    assert.equal(exactMatch, true);

    // Within +20s drift (same window or adjacent)
    const driftAhead = await verifyTotpToken(token, secret, fixedTime + 20000);
    assert.equal(driftAhead, true);

    // Within -20s drift
    const driftBehind = await verifyTotpToken(token, secret, fixedTime - 20000);
    assert.equal(driftBehind, true);

    // Far in the future (+95 seconds, outside +/- 1 window)
    const tooFarAhead = await verifyTotpToken(token, secret, fixedTime + 95000);
    assert.equal(tooFarAhead, false);

    // Invalid code length
    const invalidLength = await verifyTotpToken('123', secret, fixedTime);
    assert.equal(invalidLength, false);
  });

  it('generates 8 recovery backup codes formatted in standard quad blocks', () => {
    const codes = generateBackupCodes(8);
    assert.equal(codes.length, 8);
    for (const code of codes) {
      assert.match(code, /^\d{4}-\d{4}$/);
    }
  });
});

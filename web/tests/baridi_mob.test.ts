import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAlgerianCcpKey,
  validateAlgerianRip,
  convertAmountToFrenchWordsDzd,
  convertAmountToArabicWordsDzd,
  formatBaridiMobPaymentInstructionsWhatsApp,
  formatBaridiMobReceiptWhatsApp,
  DEFAULT_WORKSHOP_BARIDIMOB,
} from '../src/utils/baridiMobManager.ts';
import type { BaridiMobTransactionRecord } from '../src/utils/baridiMobManager.ts';

test('BaridiMob & Algérie Poste Payment Manager', async (t) => {
  await t.test('calculates Algerian CCP key according to official formula', () => {
    // Official algorithm: (account * 100) % 97, then key = 97 - remainder (or 0 if 97)
    assert.equal(calculateAlgerianCcpKey('0021458974'), '38');
    assert.equal(calculateAlgerianCcpKey('21458974'), '38', 'Leading zeros do not affect mathematical modulus');
    assert.equal(calculateAlgerianCcpKey('0021-458-974'), '38', 'Strips dashes and non-numeric characters cleanly');
    assert.equal(calculateAlgerianCcpKey(''), '00', 'Empty input safely returns default 00');
  });

  await t.test('validates 20-digit Algerian postal RIP format', () => {
    // Standard Algérie Poste RIP: 007 (Algérie Poste) + 99999 (Guichet National) + 10 digits CCP + 2 digits Key
    const validRip = '00799999002145897442';
    const validation = validateAlgerianRip(validRip);
    assert.equal(validation.isValid, true);
    assert.ok(validation.messageFr.includes('Algérie Poste conforme'));

    // Too short (16 digits)
    const invalidShort = validateAlgerianRip('0079999900214589');
    assert.equal(invalidShort.isValid, false);
    assert.ok(invalidShort.messageFr.includes('20 chiffres'));

    // Too long (22 digits)
    const invalidLong = validateAlgerianRip('0079999900214589744200');
    assert.equal(invalidLong.isValid, false);
    assert.ok(invalidLong.messageFr.includes('20 chiffres'));
  });

  await t.test('converts amounts into legal French words in DZD', () => {
    assert.equal(convertAmountToFrenchWordsDzd(0), 'zéro dinar algérien');
    assert.equal(convertAmountToFrenchWordsDzd(-500), 'montant négatif');

    const words35k = convertAmountToFrenchWordsDzd(35000);
    assert.ok(words35k.toLowerCase().includes('trente-cinq mille'));
    assert.ok(words35k.toLowerCase().includes('dinars algériens'));

    const words120k = convertAmountToFrenchWordsDzd(120000);
    assert.ok(words120k.toLowerCase().includes('cent vingt mille'));
  });

  await t.test('converts amounts into legal Arabic words in DZD', () => {
    const arWords = convertAmountToArabicWordsDzd(35000);
    assert.ok(arWords.includes('دينار جزائري'));
    assert.ok(arWords.includes('خمسة وثلاثون'));
  });

  await t.test('generates complete WhatsApp payment request text for clients', () => {
    const text = formatBaridiMobPaymentInstructionsWhatsApp(
      DEFAULT_WORKSHOP_BARIDIMOB,
      'Karim Benali',
      35000,
      'Devis #DEV-2026-08'
    );

    assert.ok(text.contains ? text.contains('Karim Benali') : text.includes('Karim Benali'));
    assert.ok(text.includes('0021458974'));
    assert.ok(text.includes('007 99999 0021458974 42'));
    assert.ok(text.includes('BaridiMob'));
    assert.ok(text.includes('Vers un compte RIP'));
  });

  await t.test('generates formal WhatsApp receipt text with balances', () => {
    const tx: BaridiMobTransactionRecord = {
      id: 'tx_test_01',
      jobId: 'job_42',
      jobTitle: 'Villa Draria R+1',
      clientName: 'Mourad Cherif',
      amountDzd: 75000,
      amountInWordsFr: 'Soixante-quinze mille dinars algériens',
      transactionRef: 'BM-20260925-987654',
      senderRipLast4: '5512',
      date: '2026-09-25T14:30:00.000Z',
      paymentMethod: 'baridimob',
      status: 'valide',
    };

    const receipt = formatBaridiMobReceiptWhatsApp(tx, 150000, 75000);
    const normalizedReceipt = receipt.replace(/[\s\u00A0\u202F]+/g, ' ');
    assert.ok(normalizedReceipt.includes('Mourad Cherif'));
    assert.ok(normalizedReceipt.includes('Villa Draria R+1'));
    assert.ok(normalizedReceipt.includes('BM-20260925-987654'));
    assert.ok(normalizedReceipt.includes('75 000 DZD'));
    assert.ok(normalizedReceipt.includes('Solde restant dû : *75 000 DZD*'));
  });
});

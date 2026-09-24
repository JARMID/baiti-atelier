/**
 * Algerian Financial & Taxation Utilities for Baiti Atelier
 * Handles:
 * - Algérie Poste CCP Key calculation & BaridiMob RIP verification
 * - Algerian VAT (TVA 19% normal, 9% reduced artisanal)
 * - Timbre fiscal (Droit de timbre algérien)
 * - Amount in Dinars Algériens (DZD) formatting & word conversion
 */

export interface AlgerianInvoiceTaxes {
  subtotalHt: number;
  tvaRate: number; // 0.19 or 0.09
  tvaAmount: number;
  timbreFiscal: number;
  totalTtc: number;
}

/**
 * Calculates CCP Key according to Algérie Poste standard algorithm
 */
export function calculateCcpKey(accountNumber: string | number): string {
  const clean = String(accountNumber).replace(/\D/g, '');
  if (!clean) return '00';
  const num = BigInt(clean);
  const remainder = Number((num * 100n) % 97n);
  const key = (97 - remainder) % 97;
  return key < 10 ? `0${key}` : `${key}`;
}

/**
 * Generates official 20-digit Algérie Poste RIP for BaridiMob
 * Bank code: 007 (Algérie Poste), Agency code: 99999
 */
export function generateBaridiMobRip(accountNumber: string | number): string {
  const clean = String(accountNumber).replace(/\D/g, '').padStart(10, '0');
  const key = calculateCcpKey(clean);
  return `00799999${clean}${key}`;
}

/**
 * Formats a 20-digit Algerian BaridiMob RIP with postal grouping
 * Example: 007 99999 0021458974 42
 */
export function formatBaridiMobRip(rip: string): string {
  const clean = rip.replace(/\D/g, '');
  if (clean.length !== 20) return rip;
  return `${clean.slice(0, 3)} ${clean.slice(3, 8)} ${clean.slice(8, 18)} ${clean.slice(18, 20)}`;
}

/**
 * Calculates Algerian invoice taxes including Timbre Fiscal
 */
export function calculateAlgerianTaxes(
  subtotalHt: number,
  isArtisanalReduced: boolean = false,
  isCashPayment: boolean = false
): AlgerianInvoiceTaxes {
  const tvaRate = isArtisanalReduced ? 0.09 : 0.19;
  const tvaAmount = Math.round(subtotalHt * tvaRate * 100) / 100;
  
  // Timbre fiscal is 1% capped or standard 300 DZD for cash payments above threshold
  let timbreFiscal = 0;
  if (isCashPayment && subtotalHt > 0) {
    timbreFiscal = Math.min(2500, Math.max(50, Math.round(subtotalHt * 0.01)));
  }

  const totalTtc = subtotalHt + tvaAmount + timbreFiscal;

  return {
    subtotalHt,
    tvaRate,
    tvaAmount,
    timbreFiscal,
    totalTtc,
  };
}

/**
 * Converts Algerian Dinars amount into French legal text
 */
export function amountInDzdWords(amount: number): string {
  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  function convertGroup(n: number): string {
    let res = '';
    const h = Math.floor(n / 100);
    const rest = n % 100;

    if (h > 0) {
      res += (h > 1 ? units[h] + ' ' : '') + 'cent ';
    }

    if (rest >= 10 && rest < 20) {
      res += teens[rest - 10] + ' ';
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      if (t > 0) res += tens[t] + ' ';
      if (u > 0) res += units[u] + ' ';
    }

    return res.trim();
  }

  if (integerPart === 0) return 'zéro Dinar Algérien';

  let words = '';
  const millions = Math.floor(integerPart / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const rem = integerPart % 1000;

  if (millions > 0) {
    words += (millions > 1 ? convertGroup(millions) + ' millions ' : 'un million ');
  }
  if (thousands > 0) {
    words += (thousands > 1 ? convertGroup(thousands) + ' mille ' : 'mille ');
  }
  if (rem > 0) {
    words += convertGroup(rem) + ' ';
  }

  words = words.trim() + ' Dinars Algériens';

  if (cents > 0) {
    words += ` et ${convertGroup(cents)} centimes`;
  }

  return words;
}

/**
 * Converts Algerian Dinars amount into standard Arabic legal text
 * Example: فقط مليون ومائتان وخمسون ألف دينار جزائري لا غير
 */
export function amountInDzdWordsAr(amount: number): string {
  const integerPart = Math.floor(amount);
  if (integerPart === 0) return 'صفر دينار جزائري';

  const unitsAr = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teensAr = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tensAr = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundredsAr = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroupAr(n: number): string {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const rest = n % 100;

    if (h > 0) {
      parts.push(hundredsAr[h]);
    }

    if (rest > 0) {
      if (rest >= 10 && rest < 20) {
        parts.push(teensAr[rest - 10]);
      } else {
        const t = Math.floor(rest / 10);
        const u = rest % 10;
        if (u > 0 && t > 0) {
          parts.push(`${unitsAr[u]} و${tensAr[t]}`);
        } else if (u > 0) {
          parts.push(unitsAr[u]);
        } else if (t > 0) {
          parts.push(tensAr[t]);
        }
      }
    }

    return parts.join(' و');
  }

  const millions = Math.floor(integerPart / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  const rem = integerPart % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('مليون');
    } else if (millions === 2) {
      parts.push('مليونان');
    } else {
      parts.push(`${convertGroupAr(millions)} مليون`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else {
      parts.push(`${convertGroupAr(thousands)} ألف`);
    }
  }

  if (rem > 0) {
    parts.push(convertGroupAr(rem));
  }

  const result = parts.join(' و');
  return `فقط ${result} دينار جزائري لا غير`;
}

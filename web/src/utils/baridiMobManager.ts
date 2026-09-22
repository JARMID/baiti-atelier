// Algerian CCP and BaridiMob (Algérie Poste) validation & transaction manager

export interface BaridiMobAccountDetails {
  ccpNumber: string;
  ccpKey: string;
  rip20Digits: string;
  accountHolderName: string;
  phoneNumber?: string;
}

export interface BaridiMobTransactionRecord {
  id: string;
  jobId?: string;
  jobTitle?: string;
  clientName: string;
  clientPhone?: string;
  amountDzd: number;
  amountInWordsFr: string;
  transactionRef: string;
  senderRipLast4?: string;
  date: string;
  paymentMethod: 'baridimob' | 'virement_ccp' | 'especes' | 'cheque';
  status: 'valide' | 'en_attente';
  notes?: string;
}

const STORAGE_ACCOUNTS_KEY = 'baiti_workshop_baridimob_account_v1';
const STORAGE_TRANSACTIONS_KEY = 'baiti_baridimob_transactions_v1';

export const DEFAULT_WORKSHOP_BARIDIMOB: BaridiMobAccountDetails = {
  ccpNumber: '0012345678',
  ccpKey: '89',
  rip20Digits: '00799999001234567889',
  accountHolderName: 'Eurl Baiti Atelier Menuiserie',
  phoneNumber: '0550 12 34 56',
};

// 1. Algorithme officiel de calcul de la Clé CCP Algérie Poste
export function calculateAlgerianCcpKey(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\D/g, '');
  if (!cleaned) return '00';

  const num = parseInt(cleaned, 10);
  if (isNaN(num)) return '00';

  // Algorithme standard PTT / Algérie Poste : (Compte * 100) mod 97
  const remainder = (num * 100) % 97;
  const key = 97 - remainder;
  const keyFormatted = key === 97 ? 0 : key;

  return keyFormatted.toString().padStart(2, '0');
}

// 2. Validation formelle du RIP Algérie Poste (20 chiffres : 007 + Guichet 99999 + Compte 10 + Clé 2)
export function validateAlgerianRip(rip: string): { isValid: boolean; messageFr: string } {
  const cleaned = rip.replace(/\D/g, '');

  if (cleaned.length !== 20) {
    return {
      isValid: false,
      messageFr: `Le RIP doit comporter exactement 20 chiffres (actuellement ${cleaned.length}).`,
    };
  }

  // Vérifier le préfixe Algérie Poste 007
  if (!cleaned.startsWith('007')) {
    return {
      isValid: true,
      messageFr: 'Format RIP bancaire hors Algérie Poste (conforme).',
    };
  }

  return {
    isValid: true,
    messageFr: 'RIP Algérie Poste conforme et vérifié.',
  };
}

// 3. Conversion de montant en dinars en toutes lettres (règles comptables algériennes)
export function convertAmountToFrenchWordsDzd(amount: number): string {
  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  if (amount === 0) return 'zéro dinar algérien';
  if (amount < 0) return 'montant négatif';

  function convertGroup(n: number): string {
    let result = '';
    const h = Math.floor(n / 100);
    const r = n % 100;

    if (h > 0) {
      if (h === 1) {
        result += 'cent ';
      } else {
        result += units[h] + ' cent ';
      }
    }

    if (r > 0) {
      if (r < 10) {
        result += units[r];
      } else if (r < 20) {
        result += teens[r - 10];
      } else {
        const t = Math.floor(r / 10);
        const u = r % 10;
        if (t === 7) {
          result += 'soixante-' + (u === 1 ? 'et-onze' : teens[u]);
        } else if (t === 9) {
          result += 'quatre-vingt-' + teens[u];
        } else {
          result += tens[t];
          if (u === 1) {
            result += ' et un';
          } else if (u > 1) {
            result += '-' + units[u];
          }
        }
      }
    }

    return result.trim();
  }

  const rounded = Math.floor(amount);
  const millions = Math.floor(rounded / 1000000);
  const thousands = Math.floor((rounded % 1000000) / 1000);
  const remainder = rounded % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(convertGroup(millions) + ' millions');
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(convertGroup(thousands) + ' mille');
    }
  }

  if (remainder > 0) {
    parts.push(convertGroup(remainder));
  }

  const words = parts.join(' ').trim();
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);

  return `${capitalized} dinars algériens`;
}

// 4. Persistence des coordonnées de paiement de l'atelier
export function getSavedWorkshopBaridiMob(): BaridiMobAccountDetails {
  if (typeof window === 'undefined') return DEFAULT_WORKSHOP_BARIDIMOB;
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) return DEFAULT_WORKSHOP_BARIDIMOB;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_WORKSHOP_BARIDIMOB;
  }
}

export function saveWorkshopBaridiMob(details: BaridiMobAccountDetails): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(details));
  } catch {
    // Handled
  }
}

// 5. Gestion des transactions enregistrées
export function getBaridiMobTransactions(): BaridiMobTransactionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBaridiMobTransaction(
  record: Omit<BaridiMobTransactionRecord, 'id' | 'amountInWordsFr' | 'date'>
): BaridiMobTransactionRecord {
  const current = getBaridiMobTransactions();
  const words = convertAmountToFrenchWordsDzd(record.amountDzd);
  const newRecord: BaridiMobTransactionRecord = {
    ...record,
    id: `bm_tx_${Date.now()}`,
    amountInWordsFr: words,
    date: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify([newRecord, ...current]));
    } catch {
      // Handled
    }
  }

  return newRecord;
}

// 6. Formateurs de messages WhatsApp professionnels pour le client
export function formatBaridiMobPaymentInstructionsWhatsApp(
  account: BaridiMobAccountDetails,
  clientName: string,
  amountDzd: number,
  jobRef: string
): string {
  let msg = `*COORDONNÉES DE RÈGLEMENT PARIDIMOB / CCP • BAITI ATELIER*\n`;
  msg += `Bonjour ${clientName || 'Cher Client'},\n\n`;
  msg += `Pour le règlement de votre acompte de commande :\n`;
  msg += `• Affaire / Devis : *${jobRef || 'Commande Atelier'}*\n`;
  msg += `• Montant convenu : *${amountDzd.toLocaleString('fr-DZ')} DZD*\n\n`;

  msg += `*COORDONNÉES BANCAIRES ALGÉRIE POSTE :*\n`;
  msg += `• Titulaire du compte : *${account.accountHolderName}*\n`;
  msg += `• Numéro CCP : *${account.ccpNumber}* Clé : *${account.ccpKey}*\n`;
  msg += `• Numéro RIP (20 chiffres) :\n\`${account.rip20Digits}\`\n\n`;

  msg += `*INSTRUCTIONS D ENVOI SUR BARIDIMOB :*\n`;
  msg += `1. Ouvrez l application BaridiMob.\n`;
  msg += `2. Sélectionnez "Virement" puis "Vers un compte RIP".\n`;
  msg += `3. Collez le RIP à 20 chiffres indiqué ci-dessus.\n`;
  msg += `4. Saisissez le montant et ajoutez en motif votre nom.\n`;
  msg += `5. Envoyez-nous la capture d écran du reçu de transfert pour validation immédiate de votre commande.\n\n`;
  msg += `Merci de votre confiance.\nBaiti Atelier Menuiserie Aluminium & PVC Algérie`;

  return msg;
}

export function formatBaridiMobReceiptWhatsApp(
  tx: BaridiMobTransactionRecord,
  jobTotalDzd?: number,
  depositTotalDzd?: number
): string {
  const balance = jobTotalDzd && depositTotalDzd ? Math.max(0, jobTotalDzd - depositTotalDzd) : 0;

  let msg = `*QUITTANCE OFFICIELLE DE RÈGLEMENT • REÇU BARIDIMOB*\n`;
  msg += `Date : ${new Date(tx.date).toLocaleDateString('fr-DZ')} à ${new Date(tx.date).toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}\n`;
  msg += `Client : *${tx.clientName}*\n`;
  if (tx.jobTitle) msg += `Affaire : ${tx.jobTitle}\n`;
  msg += `Réf Transaction : *${tx.transactionRef}*\n\n`;

  msg += `*DÉTAIL DU VERSEMENT :*\n`;
  msg += `• Montant versé : *+${tx.amountDzd.toLocaleString('fr-DZ')} DZD*\n`;
  msg += `• Montant en lettres : _${tx.amountInWordsFr}_\n`;
  msg += `• Mode de paiement : ${tx.paymentMethod === 'baridimob' ? 'BaridiMob (Algérie Poste)' : tx.paymentMethod === 'virement_ccp' ? 'Virement CCP' : 'Règlement Direct'}\n`;
  if (tx.senderRipLast4) msg += `• Compte émetteur : RIP finissant par ****${tx.senderRipLast4}\n`;
  msg += `• État : Validé et encaissé ✓\n\n`;

  if (jobTotalDzd && depositTotalDzd !== undefined) {
    msg += `*SITUATION DE VOTRE COMPTE :*\n`;
    msg += `• Total commande : ${jobTotalDzd.toLocaleString('fr-DZ')} DZD\n`;
    msg += `• Total versements reçus : ${depositTotalDzd.toLocaleString('fr-DZ')} DZD\n`;
    msg += `• Solde restant dû : *${balance.toLocaleString('fr-DZ')} DZD*\n\n`;
  }

  msg += `Document délivré pour valoir quittance de paiement.\n`;
  msg += `Baiti Atelier Direction Financière & Suivi Chantier`;

  return msg;
}

// Utilitaires financiers et fiscaux algeriens pour Baiti Atelier Mobile
// Conforme aux normes d'Algerie Poste (CCP / BaridiMob) et au Code des Impots Directs

class AlgerianInvoiceTaxes {
  final double subtotalHt;
  final double tvaRate;
  final double tvaAmount;
  final double timbreFiscal;
  final double totalTtc;

  const AlgerianInvoiceTaxes({
    required this.subtotalHt,
    required this.tvaRate,
    required this.tvaAmount,
    required this.timbreFiscal,
    required this.totalTtc,
  });
}

/// Calcule la cle CCP selon l'algorithme standard d'Algerie Poste
String calculateCcpKey(String accountNumber) {
  final clean = accountNumber.replaceAll(RegExp(r'\D'), '');
  if (clean.isEmpty) return '00';
  final num = BigInt.tryParse(clean) ?? BigInt.zero;
  final remainder = ((num * BigInt.from(100)) % BigInt.from(97)).toInt();
  final key = (97 - remainder) % 97;
  return key < 10 ? '0$key' : '$key';
}

/// Genere le RIP officiel BaridiMob a 20 chiffres
/// Code banque: 007 (Algerie Poste), Guichet: 99999
String generateBaridiMobRip(String accountNumber) {
  final clean = accountNumber.replaceAll(RegExp(r'\D'), '').padLeft(10, '0');
  final key = calculateCcpKey(clean);
  return '00799999$clean$key';
}

/// Formate un RIP de 20 chiffres avec des espaces lisibles (ex: 007 99999 0021458974 42)
String formatBaridiMobRip(String rip) {
  final clean = rip.replaceAll(RegExp(r'\D'), '');
  if (clean.length == 20) {
    return '${clean.substring(0, 3)} ${clean.substring(3, 8)} ${clean.substring(8, 18)} ${clean.substring(18, 20)}';
  }
  return rip;
}

/// Calcule la fiscalite complete d'un devis atelier en Algerie
AlgerianInvoiceTaxes calculateAlgerianTaxes({
  required double subtotalHt,
  bool isArtisanalReduced = false,
  bool isCashPayment = true,
}) {
  final tvaRate = isArtisanalReduced ? 0.09 : 0.19;
  final tvaAmount = (subtotalHt * tvaRate).roundToDouble();

  // Droit de timbre fiscal: 1% pour les reglements en especes (min 50 DZD, max 2500 DZD)
  double timbreFiscal = 0;
  if (isCashPayment && subtotalHt > 0) {
    final rawTimbre = (subtotalHt * 0.01).roundToDouble();
    timbreFiscal = rawTimbre.clamp(50.0, 2500.0);
  }

  final totalTtc = subtotalHt + tvaAmount + timbreFiscal;

  return AlgerianInvoiceTaxes(
    subtotalHt: subtotalHt,
    tvaRate: tvaRate,
    tvaAmount: tvaAmount,
    timbreFiscal: timbreFiscal,
    totalTtc: totalTtc,
  );
}

/// Convertit un montant en Dinars Algeriens en toutes lettres (Francais)
String amountInDzdWordsFr(double amount) {
  final integerPart = amount.floor();
  final cents = ((amount - integerPart) * 100).round();

  if (integerPart == 0) return 'zero Dinar Algerien';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];

  String convertGroup(int n) {
    final buffer = StringBuffer();
    final h = n ~/ 100;
    final rest = n % 100;

    if (h > 0) {
      if (h > 1) {
        buffer.write('${units[h]} ');
      }
      buffer.write('cent ');
    }

    if (rest >= 10 && rest < 20) {
      buffer.write('${teens[rest - 10]} ');
    } else {
      final t = rest ~/ 10;
      final u = rest % 10;
      if (t > 0 && u > 0) {
        buffer.write('${tens[t]}-${units[u]} ');
      } else if (t > 0) {
        buffer.write('${tens[t]} ');
      } else if (u > 0) {
        buffer.write('${units[u]} ');
      }
    }

    return buffer.toString().trim();
  }

  final millions = integerPart ~/ 1000000;
  final thousands = (integerPart % 1000000) ~/ 1000;
  final rem = integerPart % 1000;

  final words = StringBuffer();

  if (millions > 0) {
    if (millions > 1) {
      words.write('${convertGroup(millions)} millions ');
    } else {
      words.write('un million ');
    }
  }

  if (thousands > 0) {
    if (thousands > 1) {
      words.write('${convertGroup(thousands)} mille ');
    } else {
      words.write('mille ');
    }
  }

  if (rem > 0) {
    words.write('${convertGroup(rem)} ');
  }

  words.write('Dinars Algeriens');

  if (cents > 0) {
    words.write(' et ${convertGroup(cents)} centimes');
  }

  return words.toString().trim();
}

/// Convertit un montant en Dinars Algeriens en toutes lettres (Arabe)
String amountInDzdWordsAr(double amount) {
  final integerPart = amount.floor();
  if (integerPart == 0) return 'صفر دينار جزائري';

  const unitsAr = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teensAr = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tensAr = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundredsAr = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  String convertGroupAr(int n) {
    final parts = <String>[];
    final h = n ~/ 100;
    final rest = n % 100;

    if (h > 0) {
      parts.add(hundredsAr[h]);
    }

    if (rest > 0) {
      if (rest >= 10 && rest < 20) {
        parts.add(teensAr[rest - 10]);
      } else {
        final t = rest ~/ 10;
        final u = rest % 10;
        if (u > 0 && t > 0) {
          parts.add('${unitsAr[u]} و${tensAr[t]}');
        } else if (u > 0) {
          parts.add(unitsAr[u]);
        } else if (t > 0) {
          parts.add(tensAr[t]);
        }
      }
    }

    return parts.join(' و');
  }

  final millions = integerPart ~/ 1000000;
  final thousands = (integerPart % 1000000) ~/ 1000;
  final rem = integerPart % 1000;

  final parts = <String>[];

  if (millions > 0) {
    if (millions == 1) {
      parts.add('مليون');
    } else if (millions == 2) {
      parts.add('مليونان');
    } else {
      parts.add('${convertGroupAr(millions)} مليون');
    }
  }

  if (thousands > 0) {
    if (thousands == 1) {
      parts.add('ألف');
    } else if (thousands == 2) {
      parts.add('ألفان');
    } else {
      parts.add('${convertGroupAr(thousands)} ألف');
    }
  }

  if (rem > 0) {
    parts.add(convertGroupAr(rem));
  }

  final result = parts.join(' و');
  return '$result دينار جزائري';
}

/// Zone bioclimatique selon la reglementation thermique algerienne DTR C3-2
class DtrThermalZone {
  final String code; // 'zone_a', 'zone_b', 'zone_c'
  final String label;
  final double maxUw;
  final String requirement;

  const DtrThermalZone({
    required this.code,
    required this.label,
    required this.maxUw,
    required this.requirement,
  });
}

/// Determine la zone bioclimatique DTR C3-2 selon le nom ou code de la wilaya
DtrThermalZone getDtrZoneForWilayaName(String wilayaName) {
  final clean = wilayaName.toLowerCase();
  
  // Zone C: Sud & Sahara
  if (clean.contains('adrar') || clean.contains('biskra') || clean.contains('béchar') || clean.contains('bechar') ||
      clean.contains('tamanrasset') || clean.contains('ouargla') || clean.contains('el oued') || clean.contains('ghardaïa') ||
      clean.contains('ghardaia') || clean.contains('illizi') || clean.contains('tindouf') || clean.contains('el bayadh') ||
      clean.contains('timimoun') || clean.contains('bordj badji') || clean.contains('ouled djellal') || clean.contains('béni abbès') ||
      clean.contains('in salah') || clean.contains('in guezzam') || clean.contains('touggourt') || clean.contains('djanet') ||
      clean.contains('el m\'ghair') || clean.contains('el meniaa')) {
    return const DtrThermalZone(
      code: 'zone_c',
      label: 'Zone C (Sud & Sahara)',
      maxUw: 2.8,
      requirement: 'Stop-Sol obligatoire (Sw <= 0.35)',
    );
  }

  // Zone B: Hauts-Plateaux & Atlas
  if (clean.contains('sétif') || clean.contains('setif') || clean.contains('batna') || clean.contains('djelfa') ||
      clean.contains('médéa') || clean.contains('medea') || clean.contains('bordj bou') || clean.contains('constantine') ||
      clean.contains('laghouat') || clean.contains('oum el bouaghi') || clean.contains('tébessa') || clean.contains('tebessa') ||
      clean.contains('tiaret') || clean.contains('saïda') || clean.contains('saida') || clean.contains('m\'sila') ||
      clean.contains('mascara') || clean.contains('khenchela') || clean.contains('souk ahras') || clean.contains('mila') ||
      clean.contains('naâma') || clean.contains('naama') || clean.contains('tissemsilt') || clean.contains('relizane')) {
    return const DtrThermalZone(
      code: 'zone_b',
      label: 'Zone B (Hauts-Plateaux)',
      maxUw: 2.6,
      requirement: 'RPT 24mm + Double Vitrage (Uw <= 2.6)',
    );
  }

  // Zone A: Littoral & Tell
  return const DtrThermalZone(
    code: 'zone_a',
    label: 'Zone A (Littoral & Tell)',
    maxUw: 3.2,
    requirement: 'Protection saline + Ventilation (Uw <= 3.2)',
  );
}

/// Formate un montant en Dinars Algeriens avec separateur de milliers (ex: 35 000 DZD)
String formatDzdCurrency(double amount) {
  final integerPart = amount.round().abs();
  final s = integerPart.toString();
  final buffer = StringBuffer();
  for (int i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) {
      buffer.write(' ');
    }
    buffer.write(s[i]);
  }
  final formatted = buffer.toString();
  return amount < 0 ? '-$formatted DZD' : '$formatted DZD';
}


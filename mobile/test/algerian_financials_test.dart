import 'package:flutter_test/flutter_test.dart';
import 'package:monyun_mobile/utils/algerian_financials.dart';

void main() {
  group('Algerian Financials Tests', () {
    test('Calculates CCP Key correctly according to standard formula', () {
      final key = calculateCcpKey('0021458974');
      expect(key, '38');
    });

    test('Generates full 20-digit BaridiMob RIP correctly', () {
      final rip = generateBaridiMobRip('0021458974');
      expect(rip, '00799999002145897438');
      expect(rip.length, 20);
    });

    test('Formats BaridiMob RIP with readable spacing', () {
      final formatted = formatBaridiMobRip('00799999002145897442');
      expect(formatted, '007 99999 0021458974 42');
    });

    test('Calculates Algerian taxes with 19% VAT and cash Timbre Fiscal', () {
      final taxes = calculateAlgerianTaxes(subtotalHt: 100000, isCashPayment: true);
      expect(taxes.subtotalHt, 100000.0);
      expect(taxes.tvaAmount, 19000.0);
      expect(taxes.timbreFiscal, 1000.0); // 1% of 100,000 DZD
      expect(taxes.totalTtc, 120000.0);
    });

    test('Timbre Fiscal adheres to min 50 DZD and max 2500 DZD limits', () {
      final small = calculateAlgerianTaxes(subtotalHt: 2000, isCashPayment: true);
      expect(small.timbreFiscal, 50.0); // 1% would be 20, clamped to 50

      final large = calculateAlgerianTaxes(subtotalHt: 500000, isCashPayment: true);
      expect(large.timbreFiscal, 2500.0); // 1% would be 5000, capped at 2500
    });

    test('Converts DZD amounts into French legal text correctly', () {
      final words = amountInDzdWordsFr(125000);
      expect(words.toLowerCase(), contains('cent vingt-cinq mille dinars algeriens'));
    });

    test('Converts DZD amounts into Arabic legal text correctly', () {
      final wordsAr = amountInDzdWordsAr(125000);
      expect(wordsAr, contains('دينار جزائري'));
      expect(wordsAr, contains('ألف'));
    });

    test('Resolves DTR C3-2 bioclimatic zones correctly for wilayas', () {
      final alger = getDtrZoneForWilayaName('16 - Alger');
      expect(alger.code, 'zone_a');
      expect(alger.maxUw, 3.2);

      final setif = getDtrZoneForWilayaName('19 - Sétif');
      expect(setif.code, 'zone_b');
      expect(setif.maxUw, 2.6);

      final ouargla = getDtrZoneForWilayaName('30 - Ouargla');
      expect(ouargla.code, 'zone_c');
      expect(ouargla.maxUw, 2.8);
    });
  });
}

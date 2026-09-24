import 'package:flutter_test/flutter_test.dart';
import 'package:monyun_mobile/models/material_market.dart';
import 'package:monyun_mobile/utils/algerian_financials.dart';

void main() {
  group('Algerian Material Market & Calibration Tests', () {
    test('Material spot data contains authentic Algerian suppliers and positive prices', () {
      expect(kAlgerianMaterialSpotData, isNotEmpty);
      expect(kAlgerianMaterialSpotData.length, greaterThanOrEqualTo(8));

      for (final item in kAlgerianMaterialSpotData) {
        expect(item.id, isNotEmpty);
        expect(item.nameFr, isNotEmpty);
        expect(item.nameAr, isNotEmpty);
        expect(item.supplier, isNotEmpty);
        expect(item.unit, isNotEmpty);
        expect(item.currentPriceDzd, greaterThan(0));
        expect(item.previousPriceDzd, greaterThan(0));
      }

      // Check specific flagship suppliers
      final suppliers = kAlgerianMaterialSpotData.map((e) => e.supplier).join(' ');
      expect(suppliers.contains('TPR Algérie'), isTrue);
      expect(suppliers.contains('Profilor'), isTrue);
      expect(suppliers.contains('Cevital'), isTrue);
      expect(suppliers.contains('El Hadjar'), isTrue);
    });

    test('WorkshopMarginCalibration copyWith and default values behave as expected', () {
      final defaultCalib = kDefaultWorkshopCalibration;
      expect(defaultCalib.aluminumPriceMultiplier, equals(1.0));
      expect(defaultCalib.glassPriceMultiplier, equals(1.0));
      expect(defaultCalib.workshopTargetMarginPercent, equals(22.0));
      expect(defaultCalib.artisanHourlyRateDzd, equals(1800.0));

      final updated = defaultCalib.copyWith(
        aluminumPriceMultiplier: 0.94,
        workshopTargetMarginPercent: 20.0,
      );

      expect(updated.aluminumPriceMultiplier, equals(0.94));
      expect(updated.glassPriceMultiplier, equals(1.0));
      expect(updated.workshopTargetMarginPercent, equals(20.0));
      expect(updated.artisanHourlyRateDzd, equals(1800.0));
    });

    test('formatDzdCurrency formats thousands with clean spacing', () {
      expect(formatDzdCurrency(35000), equals('35 000 DZD'));
      expect(formatDzdCurrency(10500), equals('10 500 DZD'));
      expect(formatDzdCurrency(6800), equals('6 800 DZD'));
      expect(formatDzdCurrency(500), equals('500 DZD'));
      expect(formatDzdCurrency(1250000), equals('1 250 000 DZD'));
    });
  });
}

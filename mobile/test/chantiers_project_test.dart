import 'package:flutter_test/flutter_test.dart';
import 'package:monyun_mobile/models/opening_spec.dart';

void main() {
  group('Chantiers & Multi-Opening Collective Aggregation Tests', () {
    final projectOpenings = [
      const OpeningSpec(
        id: 'spec_bv1',
        title: 'Baie Vitrée Salon',
        projectName: 'Villa Hydra R+2',
        openingReference: 'BV1',
        status: 'quote',
        tradeType: 'aluminum',
        openingType: 'Coulissant 2 Vantaux',
        widthMm: 2400.0,
        heightMm: 2200.0,
        quantity: 2,
        profileSystem: 'Alugraf 40',
        glassType: 'Double Vitrage 4/16/4',
      ),
      const OpeningSpec(
        id: 'spec_f1',
        title: 'Fenêtre Chambre 1',
        projectName: 'Villa Hydra R+2',
        openingReference: 'F1',
        status: 'cutting',
        tradeType: 'aluminum',
        openingType: 'Ouvrant Français 2 Vtx',
        widthMm: 1200.0,
        heightMm: 1200.0,
        quantity: 3,
        profileSystem: 'TPR 40 RPT',
        glassType: 'Double Vitrage 4/16/4',
      ),
      const OpeningSpec(
        id: 'spec_dr1',
        title: 'Dressing Suite Parentale',
        projectName: 'Villa Hydra R+2',
        openingReference: 'DR1',
        status: 'assembly',
        tradeType: 'woodworking',
        openingType: 'Dressing Coulissant 3 Portes',
        widthMm: 2800.0,
        heightMm: 2400.0,
        quantity: 1,
        profileSystem: 'MDF Mélaminé 18mm',
      ),
      const OpeningSpec(
        id: 'spec_grille',
        title: 'Grille Sécurité Fenêtres',
        projectName: 'Villa Hydra R+2',
        openingReference: 'G1',
        status: 'installed',
        tradeType: 'metalwork',
        openingType: 'Grille de Défense Forgée',
        widthMm: 1200.0,
        heightMm: 1200.0,
        quantity: 3,
        profileSystem: 'Fer Forgé Plein 16mm',
      ),
    ];

    test('Groups multi-trade openings by project name cleanly', () {
      final grouped = <String, List<OpeningSpec>>{};
      for (final spec in projectOpenings) {
        grouped.putIfAbsent(spec.projectName, () => []).add(spec);
      }

      expect(grouped.containsKey('Villa Hydra R+2'), isTrue);
      expect(grouped['Villa Hydra R+2']!.length, equals(4));

      // Verify trades present in project
      final trades = grouped['Villa Hydra R+2']!.map((s) => s.tradeType).toSet();
      expect(trades.contains('aluminum'), isTrue);
      expect(trades.contains('woodworking'), isTrue);
      expect(trades.contains('metalwork'), isTrue);
    });

    test('Cycles opening fabrication status along standard workshop pipeline', () {
      const statuses = ['quote', 'cutting', 'assembly', 'installed'];
      OpeningSpec spec = projectOpenings.first; // starts at 'quote'

      // Step 1: quote -> cutting
      int idx = statuses.indexOf(spec.status);
      spec = spec.copyWith(status: statuses[(idx + 1) % statuses.length]);
      expect(spec.status, equals('cutting'));

      // Step 2: cutting -> assembly
      idx = statuses.indexOf(spec.status);
      spec = spec.copyWith(status: statuses[(idx + 1) % statuses.length]);
      expect(spec.status, equals('assembly'));

      // Step 3: assembly -> installed
      idx = statuses.indexOf(spec.status);
      spec = spec.copyWith(status: statuses[(idx + 1) % statuses.length]);
      expect(spec.status, equals('installed'));

      // Step 4: installed -> quote (loops back)
      idx = statuses.indexOf(spec.status);
      spec = spec.copyWith(status: statuses[(idx + 1) % statuses.length]);
      expect(spec.status, equals('quote'));
    });

    test('Calculates project collective financial totals with standard 40% acompte and 60% solde', () {
      double totalProjectGrand = 0.0;
      for (final spec in projectOpenings) {
        final costs = spec.calculateCost();
        final unitCost = costs['grandTotal'] ?? costs['total'] ?? 0.0;
        totalProjectGrand += unitCost * spec.quantity;
      }

      expect(totalProjectGrand, greaterThan(100000.0));

      final acompte40 = (totalProjectGrand * 0.40).roundToDouble();
      final solde60 = (totalProjectGrand * 0.60).roundToDouble();

      expect(acompte40 + solde60, closeTo(totalProjectGrand, 1.0));
      expect(acompte40, greaterThan(0.0));
      expect(solde60, greaterThan(acompte40));
    });

    test('Aggregates collective saw cut lists across all project aluminum openings', () {
      final aluminumSpecs = projectOpenings.where((s) => s.tradeType == 'aluminum').toList();
      final allCutPieces = <Map<String, dynamic>>[];

      for (final spec in aluminumSpecs) {
        final cutList = spec.computeCutList();
        expect(cutList, isNotEmpty);
        for (final item in cutList) {
          allCutPieces.add({
            'reference': spec.openingReference,
            'piece': item.label,
            'lengthMm': item.lengthMm,
            'angles': item.cutAngles,
            'quantity': item.quantity,
          });
        }
      }

      expect(allCutPieces.length, greaterThanOrEqualTo(8));
      for (final cut in allCutPieces) {
        expect(cut['lengthMm'], greaterThan(0.0));
        expect(cut['reference'], isNotEmpty);
      }
    });

    test('Filtering chantiers by search query matches reference, title, or trade', () {
      final searchBv1 = projectOpenings.where((s) =>
          s.openingReference.toLowerCase().contains('bv1') ||
          s.title.toLowerCase().contains('bv1')).toList();
      expect(searchBv1.length, equals(1));
      expect(searchBv1.first.id, equals('spec_bv1'));

      final searchWood = projectOpenings.where((s) => s.tradeType == 'woodworking').toList();
      expect(searchWood.length, equals(1));
      expect(searchWood.first.title, contains('Dressing'));
    });
  });
}

import 'package:flutter_test/flutter_test.dart';
import 'package:monyun_mobile/models/opening_spec.dart';

void main() {
  group('OpeningSpec Unit & Engineering Calculation Tests', () {
    test('Default OpeningSpec instantiates with standard Algerian defaults', () {
      const spec = OpeningSpec();
      expect(spec.title, 'Fenêtre Principale');
      expect(spec.tradeType, 'aluminum');
      expect(spec.openingType, 'Coulissant 2 Vantaux');
      expect(spec.widthMm, 1200.0);
      expect(spec.heightMm, 1200.0);
      expect(spec.profileSystem, 'Alugraf 40');
      expect(spec.clientWilaya, 'Alger (16)');
      expect(spec.quantity, 1);
    });

    test('copyWith updates properties immutably', () {
      const initial = OpeningSpec();
      final updated = initial.copyWith(
        title: 'Baie Vitrée Salon',
        widthMm: 2400.0,
        heightMm: 2150.0,
        profileSystem: 'Coulissant 67',
        quantity: 2,
      );

      expect(updated.title, 'Baie Vitrée Salon');
      expect(updated.widthMm, 2400.0);
      expect(updated.heightMm, 2150.0);
      expect(updated.profileSystem, 'Coulissant 67');
      expect(updated.quantity, 2);
      expect(initial.widthMm, 1200.0); // original unchanged
    });

    test('toJson and fromJson bidirectional serialization preserves data', () {
      final spec = const OpeningSpec().copyWith(
        id: 'spec_dz_001',
        title: 'Fenêtre Oscillo-Battant',
        projectName: 'Villa Dely Ibrahim',
        openingReference: 'OB-01',
        tradeType: 'aluminum',
        openingType: 'Oscillo-battant 1 Vantail',
        widthMm: 900.0,
        heightMm: 1400.0,
        profileSystem: 'RPT 52',
        finishColor: 'Gris Anthracite 7016',
        glassType: 'Double Vitrage 4/16/4',
        shutterType: 'Électrique motorisé',
        clientWilaya: 'Oran (31)',
        quantity: 3,
      );

      final json = spec.toJson();
      final deserialized = OpeningSpec.fromJson(json);

      expect(deserialized.id, spec.id);
      expect(deserialized.title, spec.title);
      expect(deserialized.projectName, spec.projectName);
      expect(deserialized.openingReference, spec.openingReference);
      expect(deserialized.tradeType, spec.tradeType);
      expect(deserialized.openingType, spec.openingType);
      expect(deserialized.widthMm, spec.widthMm);
      expect(deserialized.heightMm, spec.heightMm);
      expect(deserialized.profileSystem, spec.profileSystem);
      expect(deserialized.finishColor, spec.finishColor);
      expect(deserialized.glassType, spec.glassType);
      expect(deserialized.shutterType, spec.shutterType);
      expect(deserialized.clientWilaya, spec.clientWilaya);
      expect(deserialized.quantity, spec.quantity);
    });

    test('calculateCost computes positive costs and breakdowns for Aluminum fenestration', () {
      const spec = OpeningSpec(
        widthMm: 1400.0,
        heightMm: 1200.0,
        quantity: 2,
        profileSystem: 'RPT 52',
        glassType: 'Double Vitrage 4/12/4',
        shutterType: 'Manuel à sangle',
      );

      final cost = spec.calculateCost();
      expect(cost['primaryMaterial']!, greaterThan(0));
      expect(cost['secondaryMaterial']!, greaterThan(0));
      expect(cost['hardware']!, greaterThan(0));
      expect(cost['finishing']!, greaterThan(0));
      expect(cost['labor']!, greaterThan(0));
      expect(cost['unitTotal']!, greaterThan(0));
      expect(cost['grandTotal']!, equals(cost['unitTotal']! * 2));
      expect(cost['areaM2']!, closeTo(1.4 * 1.2 * 2, 0.01));
    });

    test('calculateCost computes cabinetry costs for Woodworking trade', () {
      const spec = OpeningSpec(
        tradeType: 'woodworking',
        widthMm: 1000.0,
        heightMm: 2000.0,
        depthMm: 600.0,
        quantity: 1,
      );

      final cost = spec.calculateCost();
      expect(cost['primaryMaterial']!, greaterThan(0));
      expect(cost['secondaryMaterial']!, greaterThan(0));
      expect(cost['hardware']!, equals(6500.0));
      expect(cost['labor']!, greaterThan(6000.0));
      expect(cost['grandTotal']!, equals(cost['unitTotal']!));
    });

    test('calculateCost computes metalworking wrought iron costs', () {
      const spec = OpeningSpec(
        tradeType: 'metalwork',
        widthMm: 1200.0,
        heightMm: 1400.0,
        quantity: 1,
      );

      final cost = spec.calculateCost();
      expect(cost['primaryMaterial']!, greaterThan(0));
      expect(cost['secondaryMaterial']!, equals(3500.0));
      expect(cost['hardware']!, equals(2500.0));
      expect(cost['finishing']!, greaterThan(0));
      expect(cost['labor']!, greaterThan(4500.0));
      expect(cost['grandTotal']!, equals(cost['unitTotal']!));
    });

    test('calculateCost computes drapery costs for Tapestry trade', () {
      const spec = OpeningSpec(
        tradeType: 'tapestry',
        widthMm: 2000.0,
        heightMm: 2600.0,
        quantity: 1,
      );

      final cost = spec.calculateCost();
      expect(cost['primaryMaterial']!, equals(2.0 * 2.0 * 1950.0)); // 4m * 1950 DZD
      expect(cost['secondaryMaterial']!, equals(4.0 * 280.0));
      expect(cost['labor']!, equals(2500.0 + 4.0 * 450.0));
      expect(cost['grandTotal']!, equals(cost['unitTotal']!));
    });

    test('computeCutList generates millimetric cuts for Aluminum Coulissant 2 Vantaux', () {
      const spec = OpeningSpec(
        widthMm: 1600.0,
        heightMm: 1200.0,
        quantity: 1,
        openingType: 'Coulissant 2 Vantaux',
        shutterType: 'Sans Volet',
      );

      final cuts = spec.computeCutList();
      expect(cuts.isNotEmpty, isTrue);

      // Dormant horizontal Haut/Bas: 1600 mm at 45°/45° (qty 2)
      final dHoriz = cuts.firstWhere((c) => c.label.contains('Dormant Horizontal'));
      expect(dHoriz.lengthMm, 1600.0);
      expect(dHoriz.cutAngles, '45°/45°');
      expect(dHoriz.quantity, 2);

      // Dormant vertical: 1200 mm at 45°/45° (qty 2)
      final dVert = cuts.firstWhere((c) => c.label.contains('Dormant Vertical'));
      expect(dVert.lengthMm, 1200.0);
      expect(dVert.cutAngles, '45°/45°');
      expect(dVert.quantity, 2);

      // Montant Vantail Coulissant: H - 65 = 1135 mm (qty 4)
      final mVantail = cuts.firstWhere((c) => c.label.contains('Montant Vantail'));
      expect(mVantail.lengthMm, 1135.0);
      expect(mVantail.quantity, 4);

      // Traverse Vantail Coulissant: (W / 2) - 15 = 785 mm (qty 4)
      final tVantail = cuts.firstWhere((c) => c.label.contains('Traverse Vantail'));
      expect(tVantail.lengthMm, 785.0);
      expect(tVantail.quantity, 4);

      // Chicane Centrale: H - 65 = 1135 mm (qty 2)
      final chicane = cuts.firstWhere((c) => c.label.contains('Chicane Centrale'));
      expect(chicane.lengthMm, 1135.0);
      expect(chicane.quantity, 2);

      // Vitrage Isolé Coulissant: (W / 2) - 80 = 720 mm (qty 2)
      final vitrage = cuts.firstWhere((c) => c.label.contains('Vitrage Isolé'));
      expect(vitrage.lengthMm, 720.0);
      expect(vitrage.quantity, 2);
    });

    test('computeCutList generates millimetric cuts for Fixed frame window', () {
      const spec = OpeningSpec(
        widthMm: 1000.0,
        heightMm: 800.0,
        quantity: 1,
        openingType: 'Châssis Fixe Panoramique',
        shutterType: 'Sans Volet',
      );

      final cuts = spec.computeCutList();
      final parcloseH = cuts.firstWhere((c) => c.label == 'Parclose Horizontale');
      expect(parcloseH.lengthMm, 1000.0 - 110.0); // 890 mm

      final parcloseV = cuts.firstWhere((c) => c.label == 'Parclose Verticale');
      expect(parcloseV.lengthMm, 800.0 - 110.0); // 690 mm

      final vitrage = cuts.firstWhere((c) => c.label == 'Vitrage Net Fixe');
      expect(vitrage.lengthMm, 890.0);
      expect(vitrage.quantity, 1);
    });

    test('computeCutList includes roller shutter box, guide rails, and slats when equipped', () {
      const spec = OpeningSpec(
        widthMm: 1400.0,
        heightMm: 1600.0,
        quantity: 1,
        openingType: 'Coulissant 2 Vantaux',
        shutterType: 'Électrique motorisé',
      );

      final cuts = spec.computeCutList();
      final coffre = cuts.firstWhere((c) => c.label.contains('Coffre Volet'));
      expect(coffre.lengthMm, 1400.0);

      final coulisses = cuts.firstWhere((c) => c.label.contains('Coulisses Guides'));
      expect(coulisses.lengthMm, 1600.0 - 180.0);

      final lames = cuts.firstWhere((c) => c.label.contains('Lames Tablier'));
      expect(lames.lengthMm, 1400.0 - 55.0);
      expect(lames.quantity, greaterThan(20));
    });

    test('computeCutList generates woodworking cutting list for cabinetry', () {
      const spec = OpeningSpec(
        tradeType: 'woodworking',
        widthMm: 800.0,
        heightMm: 900.0,
        depthMm: 550.0,
        quantity: 1,
      );

      final cuts = spec.computeCutList();
      expect(cuts.any((c) => c.label.contains('Joues latérales')), isTrue);
      expect(cuts.any((c) => c.label.contains('Dessus et socle bas')), isTrue);
      expect(cuts.any((c) => c.label.contains('Fond arrière')), isTrue);
      expect(cuts.any((c) => c.label.contains('Portes battantes')), isTrue);
    });

    test('computeCutList generates metalworking cut list for security grilles', () {
      const spec = OpeningSpec(
        tradeType: 'metalwork',
        widthMm: 1200.0,
        heightMm: 1400.0,
        quantity: 1,
      );

      final cuts = spec.computeCutList();
      expect(cuts.any((c) => c.label.contains('Montants cadre tube 40x40')), isTrue);
      expect(cuts.any((c) => c.label.contains('Traverses cadre tube 40x40')), isTrue);
      expect(cuts.any((c) => c.label.contains('Barreaux carrés forgés 14mm')), isTrue);
      expect(cuts.any((c) => c.label.contains('Pointes de lance soudées')), isTrue);
    });

    test('computeCutList generates drapery cut list for tapestry trade', () {
      const spec = OpeningSpec(
        tradeType: 'tapestry',
        widthMm: 1800.0,
        heightMm: 2400.0,
        quantity: 1,
      );

      final cuts = spec.computeCutList();
      expect(cuts.any((c) => c.label.contains('Tringle aluminium renforcée')), isTrue);
      expect(cuts.any((c) => c.label.contains('Largeur tissu utile développée')), isTrue);
      expect(cuts.any((c) => c.label.contains('Ruflette ruban fronceur')), isTrue);
      expect(cuts.any((c) => c.label.contains('Plomb de lestage')), isTrue);
    });
  });
}

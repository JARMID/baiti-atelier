import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:monyun_mobile/main.dart';
import 'package:monyun_mobile/models/opening_spec.dart';
import 'package:monyun_mobile/screens/measure_take_screen.dart';
import 'package:monyun_mobile/screens/workshops_screen.dart';
import 'package:monyun_mobile/screens/chantiers_screen.dart';
import 'package:monyun_mobile/widgets/laser_measure_dialog.dart';
import 'package:monyun_mobile/widgets/devis_preview_sheet.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  testWidgets('BaitiMobileApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BaitiMobileApp());
    await tester.pumpAndSettle();
    expect(find.text('BAITI ATELIER'), findsWidgets);
  });

  testWidgets('MeasureTakeScreen renders with zero overflow on narrow screen (320x568)', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      MaterialApp(
        home: MeasureTakeScreen(onSpecSaved: (_) {}),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('BAITI ATELIER'), findsOneWidget);
    expect(tester.takeException(), isNull);

    // Switch to Débit Scie tab on narrow screen
    await tester.tap(find.text('Débit Scie'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    // Switch to Quincaillerie tab on narrow screen
    await tester.tap(find.text('Quincaillerie'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
  });

  testWidgets('MeasureTakeScreen renders with 1.3x font scaling on 360x640 without overflow', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      MediaQuery(
        data: const MediaQueryData(
          size: Size(360, 640),
          textScaler: TextScaler.linear(1.3),
        ),
        child: MaterialApp(
          home: MeasureTakeScreen(onSpecSaved: (_) {}),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('BAITI ATELIER'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('WorkshopsScreen renders on 360x640 with zero overflow', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      const MaterialApp(
        home: WorkshopsScreen(),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('RÉPERTOIRE DES ATELIERS'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('ChantiersScreen renders projects and financial cards with zero overflow on 360x640', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    final testSpecs = [
      const OpeningSpec(
        id: '101',
        title: 'Baie Vitrée Séjour',
        projectName: 'Villa Hydra R+2',
        openingReference: 'F1',
        clientWilaya: 'Alger (16)',
        widthMm: 2400,
        heightMm: 2150,
        profileSystem: 'Alugraf 40 (Standard)',
        openingType: 'Coulissant 2 Vantaux',
        glassType: 'Double Vitrage 4/12/4',
        finishColor: 'Gris 7016',
        quantity: 2,
        status: 'cutting',
      ),
      const OpeningSpec(
        id: '102',
        title: 'Fenêtre Chambre Parentale',
        projectName: 'Villa Hydra R+2',
        openingReference: 'F2',
        clientWilaya: 'Alger (16)',
        widthMm: 1200,
        heightMm: 1400,
        profileSystem: 'RPT 52 (Rupture Thermique)',
        openingType: 'Oscillo-Battant',
        glassType: 'Double Vitrage 4/12/4',
        finishColor: 'Blanc 9010',
        quantity: 3,
        status: 'assembly',
      ),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: ChantiersScreen(
          savedSpecs: testSpecs,
          onRemove: (_) {},
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('BAITI ATELIER'), findsOneWidget);
    expect(find.text('Villa Hydra R+2'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('LaserMeasureDialog renders with zero overflow on 360x640', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: LaserMeasureDialog(
            initialWidthMm: 1200,
            initialHeightMm: 1400,
            onApplyDimensions: (w, h) {},
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('VISEUR LASER CHANTIER'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('DevisPreviewSheet renders both tabs with zero overflow on 360x640', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() {
      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    final testSpecs = [
      const OpeningSpec(
        id: '101',
        title: 'Baie Vitrée Séjour',
        projectName: 'Villa Hydra R+2',
        openingReference: 'F1',
        clientWilaya: 'Alger (16)',
        widthMm: 2400,
        heightMm: 2150,
        profileSystem: 'Alugraf 40 (Standard)',
        openingType: 'Coulissant 2 Vantaux',
        glassType: 'Double Vitrage 4/12/4',
        finishColor: 'Gris 7016',
        quantity: 2,
      ),
    ];

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DevisPreviewSheet(
            projectName: 'Villa Hydra R+2',
            specs: testSpecs,
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Devis Proforma'), findsOneWidget);
    expect(tester.takeException(), isNull);

    // Switch to Cut Sheet tab
    await tester.tap(find.text('Débit Scie & Verre'));
    await tester.pumpAndSettle();

    expect(find.text('RÉSUMÉ DÉBITS CHANTIER'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

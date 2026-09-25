import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:monyun_mobile/models/artisan_profile.dart';
import 'package:monyun_mobile/models/opening_spec.dart';
import 'package:monyun_mobile/services/storage_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ArtisanProfile Model Tests', () {
    test('Default profile has valid Algerian identity and banking details', () {
      final profile = ArtisanProfile.defaultProfile();
      expect(profile.id, isNotEmpty);
      expect(profile.name, isNotEmpty);
      expect(profile.workshopName, isNotEmpty);
      expect(profile.wilaya, equals('16 - Alger'));
      expect(profile.ccp, equals('0021458974'));
      expect(profile.ccpKey, equals('42'));
      expect(profile.rip, equals('00799999002145897442'));
      expect(profile.isSubscribed, isTrue);
      expect(profile.twoFactorEnabled, isTrue);
    });

    test('ArtisanProfile copyWith updates properties immutably', () {
      final original = ArtisanProfile.defaultProfile();
      final modified = original.copyWith(
        workshopName: 'Atelier Métal & Alu Oran',
        wilaya: '31 - Oran',
        twoFactorEnabled: false,
        avatarIndex: 2,
      );

      expect(modified.workshopName, equals('Atelier Métal & Alu Oran'));
      expect(modified.wilaya, equals('31 - Oran'));
      expect(modified.twoFactorEnabled, isFalse);
      expect(modified.avatarIndex, equals(2));
      expect(original.workshopName, isNot(equals(modified.workshopName)));
      expect(original.twoFactorEnabled, isTrue);
    });

    test('ArtisanProfile toJson and fromJson round-trip preserves state', () {
      final original = ArtisanProfile.defaultProfile().copyWith(
        name: 'Mustapha Belkacem',
        workshopName: 'Menuiserie Moderne Blida',
        phone: '+213 555 12 34 56',
        wilaya: '09 - Blida',
        nif: '000123456789012',
        rc: '16/00-1234567B16',
        twoFactorEnabled: true,
      );

      final jsonMap = original.toJson();
      final restored = ArtisanProfile.fromJson(jsonMap);

      expect(restored.id, equals(original.id));
      expect(restored.name, equals('Mustapha Belkacem'));
      expect(restored.workshopName, equals('Menuiserie Moderne Blida'));
      expect(restored.phone, equals('+213 555 12 34 56'));
      expect(restored.wilaya, equals('09 - Blida'));
      expect(restored.nif, equals('000123456789012'));
      expect(restored.rc, equals('16/00-1234567B16'));
      expect(restored.twoFactorEnabled, isTrue);
    });
  });

  group('StorageService Persistence & CRUD Tests', () {
    setUp(() {
      SharedPreferences.setMockInitialValues({});
    });

    test('loadOpenings returns seed openings on empty storage', () async {
      final openings = await StorageService.loadOpenings();
      expect(openings, isNotEmpty);
      expect(openings.length, greaterThanOrEqualTo(2));
      expect(openings.first.openingReference, equals('BV1'));
    });

    test('saveOpenings and loadOpenings persist and retrieve custom openings', () async {
      final customSpecs = <OpeningSpec>[
        const OpeningSpec(
          id: 'test_open_01',
          title: 'Fenêtre Chambre Nord',
          projectName: 'Villa Hydra R+1',
          openingReference: 'F-Test',
          widthMm: 1600.0,
          heightMm: 1400.0,
          tradeType: 'aluminum',
          openingType: 'Coulissant 2 Vantaux',
          profileSystem: 'Gamme 52 RPT',
          finishColor: 'Gris Anthracite 7016',
          glassType: 'Double Vitrage 4/16/4 Low-E',
          shutterType: 'Électrique alu',
        ),
      ];

      final saved = await StorageService.saveOpenings(customSpecs);
      expect(saved, isTrue);

      final loaded = await StorageService.loadOpenings();
      expect(loaded.length, equals(1));
      expect(loaded.first.id, equals('test_open_01'));
      expect(loaded.first.title, equals('Fenêtre Chambre Nord'));
      expect(loaded.first.openingReference, equals('F-Test'));
    });

    test('addOpening inserts opening at the head of the list', () async {
      final initial = await StorageService.loadOpenings();
      final initialCount = initial.length;

      const newSpec = OpeningSpec(
        id: 'new_added_01',
        title: 'Porte Fenêtre Salon',
        projectName: 'Projet Test',
        openingReference: 'PF1',
        widthMm: 2400.0,
        heightMm: 2200.0,
      );

      final updated = await StorageService.addOpening(newSpec);
      expect(updated.length, equals(initialCount + 1));
      expect(updated.first.id, equals('new_added_01'));
      expect(updated.first.title, equals('Porte Fenêtre Salon'));
      expect(updated.first.openingReference, equals('PF1'));
    });

    test('updateOpening modifies target opening in place', () async {
      final initial = await StorageService.loadOpenings();
      final target = initial.first.copyWith(title: 'F1 Renamed Salon', widthMm: 1800.0);

      final updated = await StorageService.updateOpening(0, target);
      expect(updated.first.title, equals('F1 Renamed Salon'));
      expect(updated.first.widthMm, equals(1800.0));
    });

    test('removeOpening deletes target opening by index', () async {
      final initial = await StorageService.loadOpenings();
      final initialCount = initial.length;

      final updated = await StorageService.removeOpening(0);
      expect(updated.length, equals(initialCount - 1));
    });

    test('loadArtisanProfile returns default profile when storage is empty', () async {
      final profile = await StorageService.loadArtisanProfile();
      expect(profile.name, equals(ArtisanProfile.defaultProfile().name));
      expect(profile.ccp, equals('0021458974'));
    });

    test('saveArtisanProfile and loadArtisanProfile persist artisan modifications', () async {
      final customProfile = ArtisanProfile.defaultProfile().copyWith(
        name: 'Karim Zenati',
        workshopName: 'Zenati Menuiserie Constantine',
        wilaya: '25 - Constantine',
        phone: '+213 661 98 76 54',
      );

      final saved = await StorageService.saveArtisanProfile(customProfile);
      expect(saved, isTrue);

      final loaded = await StorageService.loadArtisanProfile();
      expect(loaded.name, equals('Karim Zenati'));
      expect(loaded.workshopName, equals('Zenati Menuiserie Constantine'));
      expect(loaded.wilaya, equals('25 - Constantine'));
    });
  });
}

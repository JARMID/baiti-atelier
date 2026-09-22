import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/opening_spec.dart';

class StorageService {
  static const String _openingsKey = 'baiti_offline_openings_v1';
  static const String _legacyKey = 'monyun_offline_openings_v1';

  /// Loads all saved openings from local device disk
  static Future<List<OpeningSpec>> loadOpenings() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonList = prefs.getStringList(_openingsKey) ?? prefs.getStringList(_legacyKey);

      if (jsonList == null || jsonList.isEmpty) {
        return _getSeedOpenings();
      }

      return jsonList
          .map((item) => OpeningSpec.fromJson(jsonDecode(item) as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return _getSeedOpenings();
    }
  }

  /// Persists the full list of openings to local storage
  static Future<bool> saveOpenings(List<OpeningSpec> specs) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stringList = specs.map((s) => jsonEncode(s.toJson())).toList();
      return await prefs.setStringList(_openingsKey, stringList);
    } catch (e) {
      return false;
    }
  }

  /// Appends a new opening and saves
  static Future<List<OpeningSpec>> addOpening(OpeningSpec spec) async {
    final current = await loadOpenings();
    current.insert(0, spec);
    await saveOpenings(current);
    return current;
  }

  /// Updates an existing opening by index
  static Future<List<OpeningSpec>> updateOpening(int index, OpeningSpec updated) async {
    final current = await loadOpenings();
    if (index >= 0 && index < current.length) {
      current[index] = updated;
      await saveOpenings(current);
    }
    return current;
  }

  /// Removes an opening by index
  static Future<List<OpeningSpec>> removeOpening(int index) async {
    final current = await loadOpenings();
    if (index >= 0 && index < current.length) {
      current.removeAt(index);
      await saveOpenings(current);
    }
    return current;
  }

  /// Initial seed openings for first-time artisan exploration
  static List<OpeningSpec> _getSeedOpenings() {
    return [
      const OpeningSpec(
        id: 'seed-1',
        title: 'Baie Vitrée Salon Rez-de-Chaussée',
        projectName: 'Chantier Villa Draria (Alger)',
        openingReference: 'BV1',
        status: 'quote',
        tradeType: 'aluminum',
        openingType: 'Coulissant 2 Vantaux',
        widthMm: 2400.0,
        heightMm: 2200.0,
        quantity: 2,
        profileSystem: 'Alugraf 40',
        finishColor: 'RAL 7016 Gris Anthracite',
        glassType: 'Double Vitrage 4/16/4',
        shutterType: 'Volet Roulant Électrique Somfy',
        clientWilaya: 'Alger (16)',
      ),
      const OpeningSpec(
        id: 'seed-2',
        title: 'Fenêtre Chambre Parents R+1',
        projectName: 'Chantier Villa Draria (Alger)',
        openingReference: 'F1',
        status: 'cutting',
        tradeType: 'aluminum',
        openingType: 'Ouvrant Français 2 Vtx',
        widthMm: 1400.0,
        heightMm: 1200.0,
        quantity: 3,
        profileSystem: 'TPR 40 RPT',
        finishColor: 'RAL 9016 Blanc',
        glassType: 'Double Vitrage 4/16/4',
        shutterType: 'Volet Roulant Manuel Sangle',
        clientWilaya: 'Alger (16)',
      ),
      const OpeningSpec(
        id: 'seed-3',
        title: 'Dressing Master Bedroom',
        projectName: 'Résidence Kouba 58W',
        openingReference: 'DR1',
        status: 'assembly',
        tradeType: 'woodworking',
        openingType: 'Dressing Coulissant 3 Portes',
        widthMm: 2800.0,
        heightMm: 2400.0,
        depthMm: 600.0,
        quantity: 1,
        profileSystem: 'MDF Mélaminé 18mm',
        finishColor: 'Chêne Blanchi Cannelé',
        glassType: 'Miroir Bronze',
        shutterType: 'Sans volet',
        clientWilaya: 'Alger (16)',
      ),
    ];
  }
}

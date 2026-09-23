import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import '../models/opening_spec.dart';
import '../widgets/quote_summary_card.dart';
import '../widgets/laser_measure_dialog.dart';

class MeasureTakeScreen extends StatefulWidget {
  final Function(OpeningSpec) onSpecSaved;

  const MeasureTakeScreen({super.key, required this.onSpecSaved});

  @override
  State<MeasureTakeScreen> createState() => _MeasureTakeScreenState();
}

class _MeasureTakeScreenState extends State<MeasureTakeScreen> {
  OpeningSpec _spec = const OpeningSpec();
  final double _allegeMm = 900.0;
  final double _wallThicknessMm = 250.0;
  int _blueprintViewMode = 0; // 0: Plan CAD 2D, 1: Débit Scie, 2: Quincaillerie
  int _dimensionCalloutMode = 0; // 0: Hors-Tout (Fab), 1: Tableau (Maçonnerie), 2: Clair de Jour

  final List<String> _wilayas = [
    'Alger (16)',
    'Oran (31)',
    'Constantine (25)',
    'Sétif (19)',
    'Batna (05)',
    'Blida (09)',
    'Tizi Ouzou (15)',
    'Annaba (23)',
    'Béjaïa (06)',
    'Tlemcen (13)',
  ];

  // Options by trade
  final Map<String, List<String>> _tradeSystems = {
    'aluminum': [
      'Alugraf 40 (Standard)',
      'Coulissant 67 (Renforcé)',
      'RPT 52 (Rupture Thermique)',
      'PVC Profil 60 (Isolation)',
    ],
    'woodworking': [
      'MDF Stratifié 18mm',
      'Mélaminé Hydrofuge 18mm',
      'Bois Rouge Massif',
      'Chêne Massif Premier Choix',
    ],
    'metalwork': [
      'Acier Forgé Artisanal',
      'Tube Carré 40x40 Profilé',
      'Fer Plat & Rond Torsadé',
      'Tôle Découpée Laser CNC',
    ],
    'tapestry': [
      'Velours Royal Anti-Tache',
      'Toile de Lin Lavé Naturel',
      'Voilage Jacquard Organza',
      'Tissu Chenille Haute Densité',
    ],
  };

  final Map<String, List<String>> _tradeSecondaries = {
    'aluminum': [
      'Double Vitrage 4/12/4',
      'Simple Clair 4mm',
      'Bronze Teinté 6mm',
      'Stopsol Réfléchissant 6mm',
    ],
    'woodworking': [
      'Chant PVC 0.8mm Finition',
      'Chant PVC 2.0mm Résistant',
      'Chant Bois Massif Replaqué',
      'Sans chant rapporté',
    ],
    'metalwork': [
      'Barreaux Carrés 14x14mm',
      'Barreaux Carrés 16x16mm',
      'Volutes Forgées Traditionnelles',
      'Pointes de Lance Décoratives',
    ],
    'tapestry': [
      'Oeillets Inox 40mm',
      'Ruflette Ruban Plissé 2.0x',
      'Tête Flamande 2 Plis',
      'Fourreau Tringle Passe-Tringle',
    ],
  };

  final Map<String, List<String>> _tradeFinishes = {
    'aluminum': [
      'RAL 9016 Blanc',
      'RAL 7016 Gris Anthracite',
      'Faux Bois Chêne Doré',
      'Noir Mat 9005',
      'Bronze Anodisé',
    ],
    'woodworking': [
      'Blanc Brillant & Chêne',
      'Noyer Foncé Satiné',
      'Gris Cachemire Mat',
      'Chêne Naturel Vernis',
    ],
    'metalwork': [
      'Noir Mat Sablé',
      'Gris Anthracite Givré',
      'Fer Forgé Patiné Cuivre',
      'Blanc Brillant Laqué',
    ],
    'tapestry': [
      'Gris Perle & Doré',
      'Bleu Canard & Laiton',
      'Beige Sable Chaud',
      'Vert Forêt & Bronze',
    ],
  };

  final Map<String, List<String>> _tradeAccessories = {
    'aluminum': [
      'Sans volet',
      'Manuel à sangle',
      'Électrique filaire',
      'Électrique radio',
    ],
    'woodworking': [
      'Blum Soft-Close Amorti',
      'DTC Double Paroi',
      'Coulisses Télescopiques 45kg',
      'Push-to-Open sans poignée',
    ],
    'metalwork': [
      'Serrure de Sécurité 3 Points',
      'Verrou Baïonnette Soudé',
      'Gâche Électrique Interphone',
      'Pivots sur Roulement Bille',
    ],
    'tapestry': [
      'Tringle Ronde 28mm Inox',
      'Rail Plafonnier Coulissant',
      'Doublure Thermique Opaque',
      'Embrasses Assorties Tressées',
    ],
  };

  void _onSelectTrade(String newTrade) {
    if (newTrade == _spec.tradeType) return;
    setState(() {
      if (newTrade == 'woodworking') {
        _spec = _spec.copyWith(
          tradeType: 'woodworking',
          title: 'Caisson Bas Cuisine',
          openingType: '2 Portes + 1 Tiroir',
          widthMm: 900.0,
          heightMm: 850.0,
          depthMm: 600.0,
          profileSystem: _tradeSystems['woodworking']!.first,
          finishColor: _tradeFinishes['woodworking']!.first,
          glassType: _tradeSecondaries['woodworking']!.first,
          shutterType: _tradeAccessories['woodworking']!.first,
        );
      } else if (newTrade == 'metalwork') {
        _spec = _spec.copyWith(
          tradeType: 'metalwork',
          title: 'Grille Protection Fenêtre',
          openingType: 'Barreaudage Carré 14mm',
          widthMm: 1200.0,
          heightMm: 1200.0,
          depthMm: 120.0,
          profileSystem: _tradeSystems['metalwork']!.first,
          finishColor: _tradeFinishes['metalwork']!.first,
          glassType: _tradeSecondaries['metalwork']!.first,
          shutterType: _tradeAccessories['metalwork']!.first,
        );
      } else if (newTrade == 'tapestry') {
        _spec = _spec.copyWith(
          tradeType: 'tapestry',
          title: 'Rideau Double Salon',
          openingType: 'Oeillets Inox Plissé 2.0x',
          widthMm: 2400.0,
          heightMm: 2600.0,
          depthMm: 150.0,
          profileSystem: _tradeSystems['tapestry']!.first,
          finishColor: _tradeFinishes['tapestry']!.first,
          glassType: _tradeSecondaries['tapestry']!.first,
          shutterType: _tradeAccessories['tapestry']!.first,
        );
      } else {
        _spec = _spec.copyWith(
          tradeType: 'aluminum',
          title: 'Fenêtre Principale',
          openingType: 'Coulissant 2 Vantaux',
          widthMm: 1200.0,
          heightMm: 1200.0,
          depthMm: 80.0,
          profileSystem: _tradeSystems['aluminum']!.first,
          finishColor: _tradeFinishes['aluminum']!.first,
          glassType: _tradeSecondaries['aluminum']!.first,
          shutterType: _tradeAccessories['aluminum']!.first,
        );
      }
    });
  }

  void _applyPreset(String name, double w, double h, double d, String type) {
    setState(() {
      _spec = _spec.copyWith(
        title: name,
        widthMm: w,
        heightMm: h,
        depthMm: d,
        openingType: type,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final tradeColor = _getTradeColor(_spec.tradeType);

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F17),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F17),
        elevation: 0,
        titleSpacing: 12,
        title: FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'BAITI ATELIER',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFD4AF37),
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'بيتي',
                    textDirection: TextDirection.rtl,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFD4AF37),
                    ),
                  ),
                ],
              ),
              Text(
                'Prise de Cotes & Chiffrage',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey.shade400,
                ),
              ),
            ],
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(20),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _spec.clientWilaya,
                dropdownColor: const Color(0xFF1E293B),
                style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.bold),
                icon: const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFD4AF37)),
                items: _wilayas.map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _spec = _spec.copyWith(clientWilaya: val));
                },
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          // 0. Project & Opening Reference Assignment Card
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF121826),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Row(
              children: [
                const Icon(Icons.folder_open_rounded, size: 18, color: Color(0xFFD4AF37)),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    initialValue: _spec.projectName,
                    style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      isDense: true,
                      border: InputBorder.none,
                      hintText: 'Nom du Chantier (ex: Villa Kouba R+2)',
                      hintStyle: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      labelText: 'Chantier Assigné',
                      labelStyle: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                    ),
                    onChanged: (val) {
                      _spec = _spec.copyWith(
                        projectName: val.trim().isEmpty ? 'Chantier Villa Principale' : val.trim(),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  width: 70,
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: TextFormField(
                    initialValue: _spec.openingReference,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF38BDF8),
                    ),
                    decoration: const InputDecoration(
                      isDense: true,
                      border: InputBorder.none,
                      hintText: 'F1',
                      labelText: 'Repère',
                      labelStyle: TextStyle(fontSize: 9, color: Color(0xFF64748B)),
                    ),
                    onChanged: (val) {
                      _spec = _spec.copyWith(
                        openingReference: val.trim().isEmpty ? 'F1' : val.trim().toUpperCase(),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // 1. Top Trade Segmented Selector
          _buildTradeSelector(),

          // 2. Multi-View Workshop CAD & Cut Sheet Section
          _buildBlueprintSection(tradeColor),

          const SizedBox(height: 16),

          // 3. Trade Quick Presets Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'PRESETS STANDARDS ATELIER (${_getTradeName(_spec.tradeType).toUpperCase()})',
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF64748B),
                    letterSpacing: 1.0,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  '${_spec.widthMm.toInt()} × ${_spec.heightMm.toInt()} mm',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: tradeColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _buildTradePresetChips(tradeColor),
            ),
          ),

          const SizedBox(height: 16),

          // 4. Dimension Sliders Card
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF121826),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E293B)),
            ),
            child: Column(
              children: [
                // Width Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: Text('Largeur Totale (L)', style: TextStyle(fontSize: 12, color: Colors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${_spec.widthMm.toInt()} mm',
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                Slider(
                  value: _spec.widthMm,
                  min: 400,
                  max: 4000,
                  divisions: 72,
                  activeColor: tradeColor,
                  inactiveColor: const Color(0xFF1E293B),
                  onChanged: (val) => setState(() => _spec = _spec.copyWith(widthMm: val)),
                ),

                // Height Slider
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: Text('Hauteur Totale (H)', style: TextStyle(fontSize: 12, color: Colors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${_spec.heightMm.toInt()} mm',
                      style: const TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
                Slider(
                  value: _spec.heightMm,
                  min: 400,
                  max: 3200,
                  divisions: 56,
                  activeColor: tradeColor,
                  inactiveColor: const Color(0xFF1E293B),
                  onChanged: (val) => setState(() => _spec = _spec.copyWith(heightMm: val)),
                ),

                // Depth Slider (Woodworking & Cabinetry)
                if (_spec.tradeType == 'woodworking') ...[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Expanded(
                        child: Text('Profondeur Caisson (P)', style: TextStyle(fontSize: 12, color: Colors.white70), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${_spec.depthMm.toInt()} mm',
                        style: const TextStyle(fontFamily: 'monospace', fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  Slider(
                    value: _spec.depthMm,
                    min: 250,
                    max: 900,
                    divisions: 26,
                    activeColor: tradeColor,
                    inactiveColor: const Color(0xFF1E293B),
                    onChanged: (val) => setState(() => _spec = _spec.copyWith(depthMm: val)),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 14),

          // 5. Dynamic Trade Technical Options (Row 1)
          Row(
            children: [
              Expanded(
                child: _buildSelectCard(
                  title: _getPrimaryOptionLabel(_spec.tradeType),
                  value: _spec.profileSystem,
                  items: _tradeSystems[_spec.tradeType] ?? _tradeSystems['aluminum']!,
                  onChanged: (v) => setState(() => _spec = _spec.copyWith(profileSystem: v)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSelectCard(
                  title: _getSecondaryOptionLabel(_spec.tradeType),
                  value: _spec.glassType,
                  items: _tradeSecondaries[_spec.tradeType] ?? _tradeSecondaries['aluminum']!,
                  onChanged: (v) => setState(() => _spec = _spec.copyWith(glassType: v)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // 6. Dynamic Trade Technical Options (Row 2)
          Row(
            children: [
              Expanded(
                child: _buildSelectCard(
                  title: _getFinishOptionLabel(_spec.tradeType),
                  value: _spec.finishColor,
                  items: _tradeFinishes[_spec.tradeType] ?? _tradeFinishes['aluminum']!,
                  onChanged: (v) => setState(() => _spec = _spec.copyWith(finishColor: v)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildSelectCard(
                  title: _getAccessoryOptionLabel(_spec.tradeType),
                  value: _spec.shutterType,
                  items: _tradeAccessories[_spec.tradeType] ?? _tradeAccessories['aluminum']!,
                  onChanged: (v) => setState(() => _spec = _spec.copyWith(shutterType: v)),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // 7. Real-time Detailed Quotation Card
          QuoteSummaryCard(
            spec: _spec,
            onSaveLocally: () {
              final newSpec = _spec.copyWith(
                id: DateTime.now().millisecondsSinceEpoch.toString(),
              );
              widget.onSpecSaved(newSpec);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Ouverture ${newSpec.openingReference} (${newSpec.widthMm.toInt()}×${newSpec.heightMm.toInt()} mm) ajoutée à "${newSpec.projectName}"',
                  ),
                  backgroundColor: const Color(0xFF059669),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  // --- TOP TRADE SEGMENT BAR ---
  Widget _buildTradeSelector() {
    final trades = [
      {
        'id': 'aluminum',
        'label': 'Alu & PVC',
        'icon': Icons.window_outlined,
        'color': const Color(0xFF38BDF8),
      },
      {
        'id': 'woodworking',
        'label': 'Ébénisterie',
        'icon': Icons.kitchen_outlined,
        'color': const Color(0xFFF59E0B),
      },
      {
        'id': 'metalwork',
        'label': 'Ferronnerie',
        'icon': Icons.fence_outlined,
        'color': const Color(0xFFEF4444),
      },
      {
        'id': 'tapestry',
        'label': 'Tapisserie',
        'icon': Icons.curtains_outlined,
        'color': const Color(0xFFA855F7),
      },
    ];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        children: trades.map((t) {
          final isSelected = _spec.tradeType == t['id'];
          final color = t['color'] as Color;
          return Expanded(
            child: GestureDetector(
              onTap: () => _onSelectTrade(t['id'] as String),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? color.withValues(alpha: 0.15) : Colors.transparent,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected ? color : Colors.transparent,
                    width: 1.5,
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      t['icon'] as IconData,
                      size: 18,
                      color: isSelected ? color : const Color(0xFF64748B),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      t['label'] as String,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // --- MULTI-VIEW WORKSHOP BLUEPRINT & CUT ENGINE ---
  Widget _buildBlueprintSection(Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildViewModeTabs(color),
        const SizedBox(height: 8),
        if (_blueprintViewMode == 0)
          _buildCadPlanView(color)
        else if (_blueprintViewMode == 1)
          _buildCutSheetView(color)
        else
          _buildHardwareGlazingView(color),
      ],
    );
  }

  Widget _buildViewModeTabs(Color color) {
    final tabs = [
      {'id': 0, 'label': 'Plan CAD', 'icon': Icons.architecture_rounded},
      {'id': 1, 'label': 'Débit Scie', 'icon': Icons.content_cut_rounded},
      {'id': 2, 'label': 'Quincaillerie', 'icon': Icons.tune_rounded},
    ];

    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        children: tabs.map((tab) {
          final isSelected = _blueprintViewMode == tab['id'];
          return Expanded(
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                setState(() => _blueprintViewMode = tab['id'] as int);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                padding: const EdgeInsets.symmetric(vertical: 7),
                decoration: BoxDecoration(
                  color: isSelected ? color.withValues(alpha: 0.18) : Colors.transparent,
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(
                    color: isSelected ? color : Colors.transparent,
                    width: 1.2,
                  ),
                ),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          tab['icon'] as IconData,
                          size: 14,
                          color: isSelected ? color : const Color(0xFF64748B),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          tab['label'] as String,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getWidthDimensionDisplay() {
    if (_dimensionCalloutMode == 1) {
      return 'Tab L: ${(_spec.widthMm + 10).toInt()} mm';
    } else if (_dimensionCalloutMode == 2) {
      final clairW = math.max(100.0, _spec.widthMm - 180.0).toInt();
      return 'Clair L: $clairW mm';
    }
    return 'L: ${_spec.widthMm.toInt()} mm';
  }

  String _getHeightDimensionDisplay() {
    if (_dimensionCalloutMode == 1) {
      return 'Tab H: ${(_spec.heightMm + 10).toInt()} mm';
    } else if (_dimensionCalloutMode == 2) {
      final clairH = math.max(100.0, _spec.heightMm - 190.0).toInt();
      return 'Clair H: $clairH mm';
    }
    return 'H: ${_spec.heightMm.toInt()} mm';
  }

  Widget _buildCadPlanView(Color color) {
    return Container(
      height: 240,
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Stack(
        children: [
          // Background CAD Grid
          CustomPaint(
            size: Size.infinite,
            painter: _BlueprintGridPainter(),
          ),

          // Central Parametric CAD Drawing with Pinch-to-Zoom and Pan
          Center(
            child: InteractiveViewer(
              minScale: 0.7,
              maxScale: 3.5,
              clipBehavior: Clip.hardEdge,
              child: Center(
                child: CustomPaint(
                  size: const Size(200, 170),
                  painter: _getTradePainter(color),
                ),
              ),
            ),
          ),

          // Dimension Mode Selector Chip (Top Left)
          Positioned(
            top: 8,
            left: 10,
            child: GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                setState(() {
                  _dimensionCalloutMode = (_dimensionCalloutMode + 1) % 3;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _dimensionCalloutMode == 0
                        ? color.withValues(alpha: 0.5)
                        : _dimensionCalloutMode == 1
                            ? const Color(0xFF10B981).withValues(alpha: 0.5)
                            : const Color(0xFF38BDF8).withValues(alpha: 0.5),
                    width: 1.1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.straighten_rounded,
                      size: 11,
                      color: _dimensionCalloutMode == 0
                          ? color
                          : _dimensionCalloutMode == 1
                              ? const Color(0xFF10B981)
                              : const Color(0xFF38BDF8),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _dimensionCalloutMode == 0
                          ? 'Hors-Tout'
                          : _dimensionCalloutMode == 1
                              ? 'Tableau (+10)'
                              : 'Clair de Jour',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: _dimensionCalloutMode == 0
                            ? color
                            : _dimensionCalloutMode == 1
                                ? const Color(0xFF10B981)
                                : const Color(0xFF38BDF8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Fullscreen CAD Dialog Button (Top Right)
          Positioned(
            top: 8,
            right: 10,
            child: GestureDetector(
              onTap: () => _showFullScreenCadViewer(color),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3.5),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: color.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.fullscreen_rounded, size: 13, color: color),
                    const SizedBox(width: 3),
                    Text(
                      'Plein Écran',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: color,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Width dimension label (Top Center)
          Positioned(
            top: 10,
            left: 100,
            right: 100,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: color.withValues(alpha: 0.4)),
                ),
                child: Text(
                  _getWidthDimensionDisplay(),
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ),
            ),
          ),

          // Height dimension label (Right)
          Positioned(
            top: 0,
            bottom: 0,
            right: 10,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: color.withValues(alpha: 0.4)),
                ),
                child: Text(
                  _getHeightDimensionDisplay(),
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 10.5,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ),
            ),
          ),

          // Bottom Detail Note (Left)
          Positioned(
            bottom: 10,
            left: 12,
            child: Text(
              _getBottomDimensionText(),
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 10,
                color: Color(0xFF64748B),
              ),
            ),
          ),

          // Laser AR Trigger Button (Bottom Right)
          Positioned(
            bottom: 8,
            right: 10,
            child: GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (ctx) => LaserMeasureDialog(
                    initialWidthMm: _spec.widthMm,
                    initialHeightMm: _spec.heightMm,
                    onApplyDimensions: (w, h) {
                      setState(() {
                        _spec = _spec.copyWith(widthMm: w, heightMm: h);
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Cotes chantier appliquées: ${w.toInt()} x ${h.toInt()} mm'),
                          backgroundColor: const Color(0xFF059669),
                        ),
                      );
                    },
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFEF4444), width: 1.1),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.crop_free, size: 12, color: Color(0xFFEF4444)),
                    SizedBox(width: 4),
                    Text(
                      'Laser AR',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 9.5,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFEF4444),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showFullScreenCadViewer(Color color) {
    HapticFeedback.mediumImpact();
    showDialog(
      context: context,
      builder: (ctx) {
        final clairW = math.max(100.0, _spec.widthMm - 180.0);
        final clairH = math.max(100.0, _spec.heightMm - 190.0);
        final glassSurface = ((clairW * clairH * 2) / 1000000.0).toStringAsFixed(2);

        return Dialog.fullscreen(
          backgroundColor: const Color(0xFF0B0F17),
          child: SafeArea(
            child: Column(
              children: [
                // Top Header Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: const BoxDecoration(
                    color: Color(0xFF121826),
                    border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: color.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(Icons.architecture_rounded, color: color, size: 18),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Plan d\'Élévation Atelier [${_spec.openingReference}]',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                            Text(
                              '${_spec.projectName} • ${_spec.title}',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF94A3B8)),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                ),

                // Interactive Zoom & Pan Canvas
                Expanded(
                  child: Stack(
                    children: [
                      CustomPaint(
                        size: Size.infinite,
                        painter: _BlueprintGridPainter(),
                      ),
                      Center(
                        child: InteractiveViewer(
                          minScale: 0.5,
                          maxScale: 5.0,
                          boundaryMargin: const EdgeInsets.all(60),
                          child: CustomPaint(
                            size: const Size(280, 240),
                            painter: _getTradePainter(color),
                          ),
                        ),
                      ),
                      // Top Width Annotation
                      Positioned(
                        top: 20,
                        left: 0,
                        right: 0,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: color),
                            ),
                            child: Text(
                              'LARGEUR FABRICATION (HORS-TOUT) : ${_spec.widthMm.toInt()} mm',
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Height Annotation
                      Positioned(
                        right: 20,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: color),
                            ),
                            child: Text(
                              'HAUTEUR\n${_spec.heightMm.toInt()} mm',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: color,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Bottom Technical Specs Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFF121826),
                    border: Border(top: BorderSide(color: Color(0xFF1E293B))),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(child: _buildCadMetricItem('Cote Tableau', '${(_spec.widthMm + 10).toInt()} × ${(_spec.heightMm + 10).toInt()} mm', const Color(0xFF10B981))),
                          const SizedBox(width: 6),
                          Expanded(child: _buildCadMetricItem('Clair de Jour', '${clairW.toInt()} × ${clairH.toInt()} mm', const Color(0xFF38BDF8))),
                          const SizedBox(width: 6),
                          Expanded(child: _buildCadMetricItem('Vitrage Net', '$glassSurface m²', const Color(0xFFD4AF37))),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Système: ${_spec.profileSystem} • Finition: ${_spec.finishColor}',
                                style: const TextStyle(fontSize: 11, color: Colors.white70),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: color,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: () {
                              final text = 'Plan Atelier ${_spec.openingReference} (${_spec.title}) : ${_spec.widthMm.toInt()} x ${_spec.heightMm.toInt()} mm | Système: ${_spec.profileSystem} | Teinte: ${_spec.finishColor}';
                              Clipboard.setData(ClipboardData(text: text));
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Cotes d\'élévation copiées dans le presse-papier'),
                                  backgroundColor: Color(0xFF059669),
                                ),
                              );
                            },
                            icon: const Icon(Icons.copy_rounded, size: 14, color: Colors.black),
                            label: const Text('Copier Cotes', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCadMetricItem(String label, String val, Color valColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF94A3B8)),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 2),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(val, style: TextStyle(fontFamily: 'monospace', fontSize: 11.5, fontWeight: FontWeight.bold, color: valColor)),
        ),
      ],
    );
  }

  Widget _buildCutSheetView(Color color) {
    final cuts = _computeWorkshopCutList();
    final totalBars = (cuts.fold<double>(0.0, (acc, c) => acc + (c.lengthMm * c.quantity)) / 6000.0).ceil();

    return Container(
      height: 250,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(Icons.content_cut_rounded, size: 15, color: color),
                  const SizedBox(width: 6),
                  Text(
                    'DÉBIT ATELIER [${_spec.openingReference}]',
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: _copyWorkshopCutList,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: color.withValues(alpha: 0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.copy_rounded, size: 12, color: color),
                      const SizedBox(width: 4),
                      Text(
                        'Copier Fiche',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Table Column Headers
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Row(
              children: [
                Expanded(flex: 4, child: Text('DÉSIGNATION PIÈCE', style: TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold))),
                Expanded(flex: 3, child: Text('COTE (mm)', textAlign: TextAlign.right, style: TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold))),
                Expanded(flex: 2, child: Text('ANGLES', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold))),
                Expanded(flex: 1, child: Text('QTÉ', textAlign: TextAlign.right, style: TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold))),
              ],
            ),
          ),
          const SizedBox(height: 4),

          // Scrollable List of Pieces
          Expanded(
            child: ListView.separated(
              itemCount: cuts.length,
              separatorBuilder: (context, index) => Divider(height: 1, color: const Color(0xFF1E293B).withValues(alpha: 0.7)),
              itemBuilder: (ctx, idx) {
                final item = cuts[idx];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  child: Row(
                    children: [
                      Expanded(
                        flex: 4,
                        child: Text(
                          item.label,
                          style: const TextStyle(fontSize: 11, color: Colors.white70),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          '${item.lengthMm.toInt()} mm',
                          textAlign: TextAlign.right,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: color,
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          item.cutAngles,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 9.5,
                            color: Color(0xFF38BDF8),
                          ),
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: Text(
                          '${item.quantity}x',
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 6),
          // Footer Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Profil: ${_spec.profileSystem}',
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 9.5, color: Color(0xFF64748B)),
                ),
                Text(
                  'Estim. Barres 6.00m: $totalBars',
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHardwareGlazingView(Color color) {
    final isAlu = _spec.tradeType == 'aluminum';
    final isWood = _spec.tradeType == 'woodworking';
    final isMetal = _spec.tradeType == 'metalwork';

    final glassW = isAlu ? (_spec.widthMm - 180) / 2 : (_spec.widthMm - 100);
    final glassH = isAlu ? (_spec.heightMm - 190) : (_spec.heightMm - 100);
    final glassM2 = ((glassW * glassH) / 1000000.0) * (isAlu ? 2 : 1);

    return Container(
      height: 240,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Icon(Icons.tune_rounded, size: 15, color: color),
              const SizedBox(width: 6),
              const Text(
                'VITRAGE & ACCESSOIRES ATELIER',
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Glass Card (if applicable)
          if (isAlu || _spec.tradeType == 'woodworking')
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B).withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.crop_square_rounded, size: 20, color: Color(0xFF38BDF8)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Vitrage: ${_spec.glassType}',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Cote débit: ${glassW.toInt()} x ${glassH.toInt()} mm (Surf: ${glassM2.toStringAsFixed(2)} m²)',
                          style: const TextStyle(fontFamily: 'monospace', fontSize: 10, color: Color(0xFF38BDF8)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Hardware List
          Expanded(
            child: ListView(
              children: [
                if (isAlu) ...[
                  _buildHardwareRow('Paumelles à clamer aluminium', '4 pièces'),
                  _buildHardwareRow('Crémone multipoints de sécurité', '1 ensemble'),
                  _buildHardwareRow('Équerres d\'alignement à pion', '8 pièces'),
                  _buildHardwareRow('Joint d\'étanchéité EPDM central', '${((_spec.widthMm + _spec.heightMm) * 2 / 1000).toStringAsFixed(1)} m'),
                  _buildHardwareRow('Gâche et pièces de verrouillage', '2 pièces'),
                ] else if (isWood) ...[
                  _buildHardwareRow('Charnières invisibles clip 110° amorties', '4 pièces'),
                  _buildHardwareRow('Coulisses télescopiques sortie totale 450mm', '1 paire'),
                  _buildHardwareRow('Taquets étagères 5mm nickelés', '8 pièces'),
                  _buildHardwareRow('Poignées aluminium profilées encastrées', '2 pièces'),
                  _buildHardwareRow('Vis d\'assemblage Confirmat 7x50', '24 pièces'),
                ] else if (isMetal) ...[
                  _buildHardwareRow('Crapaudines à souder avec billes', '2 pièces'),
                  _buildHardwareRow('Serrure à pêne dormant réversible', '1 pièce'),
                  _buildHardwareRow('Platine de fixation chevillée 6mm', '4 pièces'),
                  _buildHardwareRow('Gâche renforcée anti-dégondage', '1 pièce'),
                  _buildHardwareRow('Bouchons de finition plastique 40x40', '4 pièces'),
                ] else ...[
                  _buildHardwareRow('Supports muraux réglables tringle', '3 pièces'),
                  _buildHardwareRow('Embouts décoratifs finition métal', '2 pièces'),
                  _buildHardwareRow('Anneaux glisseurs silencieux', '${((_spec.widthMm / 100) * 2).round()} pièces'),
                  _buildHardwareRow('Ruban de plomb de lestage ourlet', '${((_spec.widthMm * 2.2) / 1000).toStringAsFixed(1)} m'),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHardwareRow(String title, String qty) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              '• $title',
              style: const TextStyle(fontSize: 10.5, color: Colors.white70),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            qty,
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Color(0xFFC5A880),
            ),
          ),
        ],
      ),
    );
  }

  CustomPainter _getTradePainter(Color color) {
    if (_spec.tradeType == 'woodworking') {
      return _WoodCadPainter(
        widthMm: _spec.widthMm,
        heightMm: _spec.heightMm,
        depthMm: _spec.depthMm,
        primaryColor: color,
      );
    } else if (_spec.tradeType == 'metalwork') {
      return _MetalCadPainter(
        widthMm: _spec.widthMm,
        heightMm: _spec.heightMm,
        primaryColor: color,
      );
    } else if (_spec.tradeType == 'tapestry') {
      return _TapestryCadPainter(
        widthMm: _spec.widthMm,
        heightMm: _spec.heightMm,
        primaryColor: color,
      );
    }
    return _AluCadPainter(
      widthMm: _spec.widthMm,
      heightMm: _spec.heightMm,
      openingType: _spec.openingType,
      shutterType: _spec.shutterType,
      primaryColor: color,
    );
  }

  List<WorkshopCutItem> _computeWorkshopCutList() {
    return _spec.computeCutList();
  }

  void _copyWorkshopCutList() {
    final cuts = _computeWorkshopCutList();
    final buffer = StringBuffer();
    buffer.writeln('BAITI ATELIER | بيتي - FICHE DE DÉBIT CHANTIER');
    buffer.writeln('Projet: ${_spec.projectName} • Repère: ${_spec.openingReference}');
    buffer.writeln('Corps d\'état: ${_spec.tradeType.toUpperCase()} • Type: ${_spec.openingType}');
    buffer.writeln('Dimensions Hors-Tout: ${_spec.widthMm.toInt()} x ${_spec.heightMm.toInt()} mm');
    buffer.writeln('Système: ${_spec.profileSystem} • Finition: ${_spec.finishColor}');
    buffer.writeln('Wilaya: ${_spec.clientWilaya}');
    buffer.writeln('----------------------------------------');
    buffer.writeln('LISTE DES DÉBITS DE SCIAGE:');
    for (int i = 0; i < cuts.length; i++) {
      final item = cuts[i];
      buffer.writeln('${i + 1}. ${item.label}: ${item.lengthMm.toInt()} mm (${item.cutAngles}) x ${item.quantity}');
    }
    buffer.writeln('----------------------------------------');
    buffer.writeln('Généré par Baiti Atelier • Plateforme Menuiserie Algérie');

    Clipboard.setData(ClipboardData(text: buffer.toString()));
    HapticFeedback.mediumImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fiche de débit Baiti copiée dans le presse-papier'),
        backgroundColor: Color(0xFF059669),
        duration: Duration(seconds: 2),
      ),
    );
  }

  // --- DYNAMIC PRESETS GENERATOR ---
  List<Widget> _buildTradePresetChips(Color color) {
    if (_spec.tradeType == 'woodworking') {
      return [
        _buildPresetChip('900×850 Bas Cuisine', 900, 850, 600, '2 Portes + 1 Tiroir', color),
        _buildPresetChip('800×720 Haut Cuisine', 800, 720, 350, '2 Portes Vitrées', color),
        _buildPresetChip('1800×2200 Dressing 3P', 1800, 2200, 600, '3 Portes Coulissantes', color),
        _buildPresetChip('900×2150 Porte Intérieure', 900, 2150, 40, 'Porte Battante Isoplane', color),
      ];
    } else if (_spec.tradeType == 'metalwork') {
      return [
        _buildPresetChip('1200×1200 Grille Fenêtre', 1200, 1200, 120, 'Barreaudage Carré 14mm', color),
        _buildPresetChip('1000×1400 Grille Ouvrante', 1000, 1400, 120, 'Ouvrant 1 Vantail', color),
        _buildPresetChip('3000×2000 Portail Coulissant', 3000, 2000, 80, 'Portail Tôlé Plein', color),
        _buildPresetChip('2000×1000 Garde-Corps', 2000, 1000, 60, 'Balcon avec Volutes', color),
      ];
    } else if (_spec.tradeType == 'tapestry') {
      return [
        _buildPresetChip('2400×2600 Rideau Double', 2400, 2600, 150, 'Oeillets Inox Plissé 2.0x', color),
        _buildPresetChip('1800×2500 Voilage Chambre', 1800, 2500, 100, 'Ruflette Ruban Plissé', color),
        _buildPresetChip('2000×800 Seddari Marocain', 2000, 800, 700, 'Assise Mousse D30 Haute', color),
        _buildPresetChip('1400×1600 Store Bateau', 1400, 1600, 50, 'Store Bateau Lin Naturel', color),
      ];
    }

    return [
      _buildPresetChip('1200 × 1200', 1200, 1200, 80, 'Coulissant 2 Vantaux', color),
      _buildPresetChip('1000 × 1400', 1000, 1400, 80, 'Ouvrant 2 Vantaux', color),
      _buildPresetChip('800 × 600 SDB', 800, 600, 80, 'Oscillo-Battant', color),
      _buildPresetChip('1400 × 2100 Porte', 1400, 2100, 80, 'Porte-Fenêtre 2V', color),
      _buildPresetChip('2400 × 2100 Baie', 2400, 2100, 80, 'Coulissant 2 Vantaux', color),
    ];
  }

  Widget _buildPresetChip(String label, double w, double h, double d, String type, Color activeColor) {
    final isSelected = _spec.widthMm == w && _spec.heightMm == h;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(label),
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
        ),
        backgroundColor: isSelected ? activeColor : const Color(0xFF121826),
        side: BorderSide(
          color: isSelected ? activeColor : const Color(0xFF1E293B),
        ),
        onPressed: () => _applyPreset(label, w, h, d, type),
      ),
    );
  }

  Widget _buildSelectCard({
    required String title,
    required String value,
    required List<String> items,
    required Function(String) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF121826),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: Color(0xFF64748B), fontWeight: FontWeight.bold),
          ),
          DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: items.contains(value) ? value : items.first,
              dropdownColor: const Color(0xFF1E293B),
              style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
              icon: const Icon(Icons.arrow_drop_down, size: 18, color: Color(0xFF94A3B8)),
              items: items.map((item) => DropdownMenuItem(value: item, child: Text(item, overflow: TextOverflow.ellipsis))).toList(),
              onChanged: (val) {
                if (val != null) onChanged(val);
              },
            ),
          ),
        ],
      ),
    );
  }

  Color _getTradeColor(String trade) {
    switch (trade) {
      case 'woodworking':
        return const Color(0xFFF59E0B);
      case 'metalwork':
        return const Color(0xFFEF4444);
      case 'tapestry':
        return const Color(0xFFA855F7);
      default:
        return const Color(0xFF38BDF8);
    }
  }

  String _getTradeName(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Bois & Meubles';
      case 'metalwork':
        return 'Ferronnerie';
      case 'tapestry':
        return 'Tapisserie';
      default:
        return 'Aluminium & PVC';
    }
  }

  String _getBottomDimensionText() {
    if (_spec.tradeType == 'woodworking') {
      return 'Prof: ${_spec.depthMm.toInt()} mm • Chants: ${_spec.glassType}';
    } else if (_spec.tradeType == 'metalwork') {
      return 'Finition: ${_spec.finishColor} • Section: ${_spec.glassType}';
    } else if (_spec.tradeType == 'tapestry') {
      return 'Tringle: ${_spec.shutterType} • Tissu: ${_spec.profileSystem}';
    }
    return 'Allège: ${_allegeMm.toInt()} mm • Mur: ${_wallThicknessMm.toInt()} mm';
  }

  String _getPrimaryOptionLabel(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Type Panneau';
      case 'metalwork':
        return 'Gamme Profilé';
      case 'tapestry':
        return 'Matière Tissu';
      default:
        return 'Gamme Profilé';
    }
  }

  String _getSecondaryOptionLabel(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Finition Chants';
      case 'metalwork':
        return 'Motif & Barreaux';
      case 'tapestry':
        return 'Tête Confection';
      default:
        return 'Vitrage Isolé';
    }
  }

  String _getFinishOptionLabel(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Teinte & Placage';
      case 'metalwork':
        return 'Finition Peinture';
      case 'tapestry':
        return 'Teinte Textile';
      default:
        return 'Couleur RAL';
    }
  }

  String _getAccessoryOptionLabel(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Quincaillerie & Rails';
      case 'metalwork':
        return 'Serrurerie & Sécurité';
      case 'tapestry':
        return 'Support & Tringle';
      default:
        return 'Volet Roulant';
    }
  }
}

class _BlueprintGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.3)
      ..strokeWidth = 0.8;

    const step = 20.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ----------------------------------------------------
// 1. ALUMINUM CAD BLUEPRINT PAINTER
// ----------------------------------------------------
class _AluCadPainter extends CustomPainter {
  final double widthMm;
  final double heightMm;
  final String openingType;
  final String shutterType;
  final Color primaryColor;

  _AluCadPainter({
    required this.widthMm,
    required this.heightMm,
    required this.openingType,
    required this.shutterType,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final framePaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final frameFill = Paint()
      ..color = primaryColor.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;

    final glassPaint = Paint()
      ..color = const Color(0xFF38BDF8).withValues(alpha: 0.12)
      ..style = PaintingStyle.fill;

    final glassStroke = Paint()
      ..color = const Color(0xFF38BDF8).withValues(alpha: 0.45)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final miterPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.7)
      ..strokeWidth = 1.0;

    final dashPaint = Paint()
      ..color = Colors.white60
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    final hasShutter = shutterType != 'Sans Volet' && !shutterType.contains('Aucun');
    final shutterBoxH = hasShutter ? 24.0 : 0.0;

    final availW = size.width - 24;
    final availH = size.height - 24 - shutterBoxH;
    final scale = math.min(availW / widthMm, availH / heightMm);

    final drawW = (widthMm * scale).clamp(70.0, availW);
    final drawH = (heightMm * scale).clamp(50.0, availH);

    final left = (size.width - drawW) / 2;
    final top = (size.height - drawH - shutterBoxH) / 2 + shutterBoxH;

    // Shutter Box
    if (hasShutter) {
      final sRect = Rect.fromLTWH(left, top - shutterBoxH, drawW, shutterBoxH);
      canvas.drawRect(sRect, Paint()..color = const Color(0xFF1E293B));
      canvas.drawRect(sRect, framePaint);
      final slatPaint = Paint()..color = Colors.white24..strokeWidth = 1.0;
      for (double y = top - shutterBoxH + 5; y < top; y += 5) {
        canvas.drawLine(Offset(left + 3, y), Offset(left + drawW - 3, y), slatPaint);
      }
    }

    // Outer Dormant Frame
    final outerRect = Rect.fromLTWH(left, top, drawW, drawH);
    canvas.drawRect(outerRect, frameFill);
    canvas.drawRect(outerRect, framePaint);

    final frameThick = (8.0 * (drawW / 120.0)).clamp(5.0, 11.0);
    final innerRect = Rect.fromLTWH(
      left + frameThick,
      top + frameThick,
      drawW - 2 * frameThick,
      drawH - 2 * frameThick,
    );
    canvas.drawRect(innerRect, framePaint);

    // 45-degree miter corner cuts
    canvas.drawLine(Offset(left, top), Offset(left + frameThick, top + frameThick), miterPaint);
    canvas.drawLine(Offset(left + drawW, top), Offset(left + drawW - frameThick, top + frameThick), miterPaint);
    canvas.drawLine(Offset(left, top + drawH), Offset(left + frameThick, top + drawH - frameThick), miterPaint);
    canvas.drawLine(Offset(left + drawW, top + drawH), Offset(left + drawW - frameThick, top + drawH - frameThick), miterPaint);

    final isCoulissant = openingType.toLowerCase().contains('couliss');
    final isFixe = openingType.toLowerCase().contains('fixe');
    final is2V = openingType.contains('2') || isCoulissant;

    if (isFixe) {
      canvas.drawRect(innerRect, glassPaint);
      canvas.drawRect(innerRect, glassStroke);
      // Reflection line
      canvas.drawLine(
        Offset(innerRect.left + innerRect.width * 0.25, innerRect.top + innerRect.height * 0.25),
        Offset(innerRect.left + innerRect.width * 0.45, innerRect.top + innerRect.height * 0.45),
        Paint()..color = Colors.white24..strokeWidth = 1.5,
      );
    } else if (isCoulissant) {
      final sashW = innerRect.width * 0.54;
      final s1 = Rect.fromLTWH(innerRect.left, innerRect.top, sashW, innerRect.height);
      final s2 = Rect.fromLTWH(innerRect.right - sashW, innerRect.top, sashW, innerRect.height);

      canvas.drawRect(s1, glassPaint);
      canvas.drawRect(s1, framePaint);
      canvas.drawRect(s2, glassPaint);
      canvas.drawRect(s2, framePaint);

      // Slide arrow 1
      final aPaint = Paint()..color = primaryColor..strokeWidth = 1.6..style = PaintingStyle.stroke;
      final y1 = s1.center.dy;
      canvas.drawLine(Offset(s1.left + 12, y1), Offset(s1.right - 12, y1), aPaint);
      canvas.drawLine(Offset(s1.right - 18, y1 - 3.5), Offset(s1.right - 12, y1), aPaint);
      canvas.drawLine(Offset(s1.right - 18, y1 + 3.5), Offset(s1.right - 12, y1), aPaint);

      // Slide arrow 2
      final y2 = s2.center.dy;
      canvas.drawLine(Offset(s2.right - 12, y2), Offset(s2.left + 12, y2), aPaint);
      canvas.drawLine(Offset(s2.left + 18, y2 - 3.5), Offset(s2.left + 12, y2), aPaint);
      canvas.drawLine(Offset(s2.left + 18, y2 + 3.5), Offset(s2.left + 12, y2), aPaint);
    } else if (is2V) {
      final sashW = (innerRect.width - 3) / 2;
      final s1 = Rect.fromLTWH(innerRect.left, innerRect.top, sashW, innerRect.height);
      final s2 = Rect.fromLTWH(innerRect.left + sashW + 3, innerRect.top, sashW, innerRect.height);

      canvas.drawRect(s1, glassPaint);
      canvas.drawRect(s1, framePaint);
      canvas.drawRect(s2, glassPaint);
      canvas.drawRect(s2, framePaint);

      // Central meeting stile
      canvas.drawRect(
        Rect.fromLTWH(innerRect.left + sashW, innerRect.top, 3, innerRect.height),
        Paint()..color = primaryColor,
      );

      // ISO dashed swing triangles
      _drawDashedTriangle(canvas, s1.topLeft, s1.bottomLeft, Offset(s1.right, s1.center.dy), dashPaint);
      _drawDashedTriangle(canvas, s2.topRight, s2.bottomRight, Offset(s2.left, s2.center.dy), dashPaint);

      // Handle dots
      canvas.drawCircle(Offset(s1.right - 3, s1.center.dy), 2.2, Paint()..color = Colors.white);
      canvas.drawCircle(Offset(s2.left + 3, s2.center.dy), 2.2, Paint()..color = Colors.white);
    } else {
      // 1 Vantail
      canvas.drawRect(innerRect, glassPaint);
      canvas.drawRect(innerRect, framePaint);
      _drawDashedTriangle(canvas, innerRect.topLeft, innerRect.bottomLeft, Offset(innerRect.right, innerRect.center.dy), dashPaint);
      canvas.drawCircle(Offset(innerRect.right - 4, innerRect.center.dy), 2.5, Paint()..color = Colors.white);
    }
  }

  void _drawDashedTriangle(Canvas canvas, Offset p1, Offset p2, Offset target, Paint paint) {
    _drawDashedLine(canvas, p1, target, paint);
    _drawDashedLine(canvas, p2, target, paint);
  }

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2, Paint paint) {
    const dashW = 4.0;
    const dashSpace = 3.0;
    final dx = p2.dx - p1.dx;
    final dy = p2.dy - p1.dy;
    final dist = math.sqrt(dx * dx + dy * dy);
    if (dist <= 0) return;
    final nx = dx / dist;
    final ny = dy / dist;
    double cur = 0;
    while (cur < dist) {
      final start = Offset(p1.dx + nx * cur, p1.dy + ny * cur);
      cur += dashW;
      final end = Offset(p1.dx + nx * math.min(cur, dist), p1.dy + ny * math.min(cur, dist));
      canvas.drawLine(start, end, paint);
      cur += dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant _AluCadPainter oldDelegate) =>
      oldDelegate.widthMm != widthMm ||
      oldDelegate.heightMm != heightMm ||
      oldDelegate.openingType != openingType ||
      oldDelegate.shutterType != shutterType ||
      oldDelegate.primaryColor != primaryColor;
}

// ----------------------------------------------------
// 2. WOODWORKING CAD BLUEPRINT PAINTER
// ----------------------------------------------------
class _WoodCadPainter extends CustomPainter {
  final double widthMm;
  final double heightMm;
  final double depthMm;
  final Color primaryColor;

  _WoodCadPainter({
    required this.widthMm,
    required this.heightMm,
    required this.depthMm,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final availW = size.width - 24;
    final availH = size.height - 24;
    final scale = math.min(availW / widthMm, availH / heightMm);

    final drawW = (widthMm * scale).clamp(70.0, availW);
    final drawH = (heightMm * scale).clamp(50.0, availH);

    final left = (size.width - drawW) / 2;
    final top = (size.height - drawH) / 2;

    final carcassPaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final carcassFill = Paint()
      ..color = primaryColor.withValues(alpha: 0.08)
      ..style = PaintingStyle.fill;

    // Outer Carcass Box
    final cRect = Rect.fromLTWH(left, top, drawW, drawH);
    canvas.drawRect(cRect, carcassFill);
    canvas.drawRect(cRect, carcassPaint);

    // Left and Right 18mm Upright Panels
    final panelThick = (6.0 * (drawW / 120.0)).clamp(4.0, 8.0);
    final leftUpright = Rect.fromLTWH(left, top, panelThick, drawH);
    final rightUpright = Rect.fromLTWH(left + drawW - panelThick, top, panelThick, drawH);
    canvas.drawRect(leftUpright, carcassPaint);
    canvas.drawRect(rightUpright, carcassPaint);

    // Top Drawer Compartment
    final drawerH = drawH * 0.28;
    final dRect = Rect.fromLTWH(left + panelThick, top, drawW - 2 * panelThick, drawerH);
    canvas.drawRect(dRect, Paint()..color = primaryColor.withValues(alpha: 0.12));
    canvas.drawRect(dRect, carcassPaint);

    // Drawer Handle
    final handlePaint = Paint()..color = Colors.white70..strokeWidth = 2.0;
    canvas.drawLine(
      Offset(dRect.center.dx - 14, dRect.center.dy),
      Offset(dRect.center.dx + 14, dRect.center.dy),
      handlePaint,
    );

    // Middle Shelf with peg holes
    final shelfY = top + drawerH + (drawH - drawerH) * 0.45;
    final shelfPaint = Paint()..color = primaryColor..strokeWidth = 1.5;
    canvas.drawLine(Offset(left + panelThick, shelfY), Offset(left + drawW - panelThick, shelfY), shelfPaint);

    // Peg hole dots
    final dotPaint = Paint()..color = Colors.white38..style = PaintingStyle.fill;
    for (double yOffset = -8; yOffset <= 8; yOffset += 8) {
      canvas.drawCircle(Offset(left + panelThick + 3, shelfY + yOffset), 1.0, dotPaint);
      canvas.drawCircle(Offset(left + drawW - panelThick - 3, shelfY + yOffset), 1.0, dotPaint);
    }

    // Lower Doors Split
    final doorTop = top + drawerH;
    final doorH = drawH - drawerH;
    final doorW = (drawW - 2 * panelThick - 2) / 2;

    final door1 = Rect.fromLTWH(left + panelThick, doorTop, doorW, doorH);
    final door2 = Rect.fromLTWH(left + panelThick + doorW + 2, doorTop, doorW, doorH);

    canvas.drawRect(door1, carcassPaint);
    canvas.drawRect(door2, carcassPaint);

    // ISO swing triangles
    final dashPaint = Paint()..color = Colors.white38..style = PaintingStyle.stroke..strokeWidth = 1.0;
    _drawDashedTriangle(canvas, door1.topLeft, door1.bottomLeft, Offset(door1.right, door1.center.dy), dashPaint);
    _drawDashedTriangle(canvas, door2.topRight, door2.bottomRight, Offset(door2.left, door2.center.dy), dashPaint);

    // Door handles
    canvas.drawCircle(Offset(door1.right - 4, door1.center.dy), 2.0, Paint()..color = Colors.white);
    canvas.drawCircle(Offset(door2.left + 4, door2.center.dy), 2.0, Paint()..color = Colors.white);
  }

  void _drawDashedTriangle(Canvas canvas, Offset p1, Offset p2, Offset target, Paint paint) {
    _drawDashedLine(canvas, p1, target, paint);
    _drawDashedLine(canvas, p2, target, paint);
  }

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2, Paint paint) {
    const dashW = 3.5;
    const dashSpace = 2.5;
    final dx = p2.dx - p1.dx;
    final dy = p2.dy - p1.dy;
    final dist = math.sqrt(dx * dx + dy * dy);
    if (dist <= 0) return;
    final nx = dx / dist;
    final ny = dy / dist;
    double cur = 0;
    while (cur < dist) {
      final start = Offset(p1.dx + nx * cur, p1.dy + ny * cur);
      cur += dashW;
      final end = Offset(p1.dx + nx * math.min(cur, dist), p1.dy + ny * math.min(cur, dist));
      canvas.drawLine(start, end, paint);
      cur += dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant _WoodCadPainter oldDelegate) =>
      oldDelegate.widthMm != widthMm ||
      oldDelegate.heightMm != heightMm ||
      oldDelegate.depthMm != depthMm ||
      oldDelegate.primaryColor != primaryColor;
}

// ----------------------------------------------------
// 3. METALWORK CAD BLUEPRINT PAINTER
// ----------------------------------------------------
class _MetalCadPainter extends CustomPainter {
  final double widthMm;
  final double heightMm;
  final Color primaryColor;

  _MetalCadPainter({
    required this.widthMm,
    required this.heightMm,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final availW = size.width - 24;
    final availH = size.height - 24;
    final scale = math.min(availW / widthMm, availH / heightMm);

    final drawW = (widthMm * scale).clamp(70.0, availW);
    final drawH = (heightMm * scale).clamp(50.0, availH);

    final left = (size.width - drawW) / 2;
    final top = (size.height - drawH) / 2;

    final framePaint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    // Perimeter Frame
    final fRect = Rect.fromLTWH(left, top, drawW, drawH);
    canvas.drawRect(fRect, Paint()..color = primaryColor.withValues(alpha: 0.05));
    canvas.drawRect(fRect, framePaint);

    // Intermediate horizontal rail
    final midY = top + drawH * 0.55;
    canvas.drawLine(Offset(left, midY), Offset(left + drawW, midY), framePaint);

    // Calculated vertical bars (<110mm safety code)
    final barCount = ((widthMm - 80) / 110).clamp(4, 16).round();
    final step = drawW / (barCount + 1);

    final barPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.85)
      ..strokeWidth = 2.0;

    final spearPaint = Paint()
      ..color = const Color(0xFFC5A880)
      ..style = PaintingStyle.fill;

    for (int i = 1; i <= barCount; i++) {
      final x = left + i * step;
      canvas.drawLine(Offset(x, top + 6), Offset(x, top + drawH - 4), barPaint);

      // Spearhead Triangle
      final path = Path()
        ..moveTo(x, top - 2)
        ..lineTo(x - 3.5, top + 6)
        ..lineTo(x + 3.5, top + 6)
        ..close();
      canvas.drawPath(path, spearPaint);
    }

    // Lock Box plate on right side
    final lockRect = Rect.fromLTWH(left + drawW - 14, midY - 14, 12, 28);
    canvas.drawRect(lockRect, Paint()..color = const Color(0xFF1E293B));
    canvas.drawRect(lockRect, Paint()..color = Colors.white54..style = PaintingStyle.stroke);
    canvas.drawCircle(Offset(lockRect.center.dx, lockRect.center.dy - 2), 1.8, Paint()..color = Colors.white);
  }

  @override
  bool shouldRepaint(covariant _MetalCadPainter oldDelegate) =>
      oldDelegate.widthMm != widthMm ||
      oldDelegate.heightMm != heightMm ||
      oldDelegate.primaryColor != primaryColor;
}

// ----------------------------------------------------
// 4. TAPESTRY CAD BLUEPRINT PAINTER
// ----------------------------------------------------
class _TapestryCadPainter extends CustomPainter {
  final double widthMm;
  final double heightMm;
  final Color primaryColor;

  _TapestryCadPainter({
    required this.widthMm,
    required this.heightMm,
    required this.primaryColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final availW = size.width - 24;
    final availH = size.height - 24;
    final scale = math.min(availW / widthMm, availH / heightMm);

    final drawW = (widthMm * scale).clamp(70.0, availW);
    final drawH = (heightMm * scale).clamp(50.0, availH);

    final left = (size.width - drawW) / 2;
    final top = (size.height - drawH) / 2;

    // Top Rod / Tringle
    final rodY = top + 8;
    final rodPaint = Paint()
      ..color = const Color(0xFFC5A880)
      ..strokeWidth = 3.5
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(left - 8, rodY), Offset(left + drawW + 8, rodY), rodPaint);

    // Finials (Decorative ends)
    final finialPaint = Paint()..color = const Color(0xFFD4AF37)..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(left - 8, rodY), 4.5, finialPaint);
    canvas.drawCircle(Offset(left + drawW + 8, rodY), 4.5, finialPaint);

    // Wall Brackets
    final bracketPaint = Paint()..color = Colors.white38..strokeWidth = 2.0;
    canvas.drawLine(Offset(left + 8, rodY - 6), Offset(left + 8, rodY + 4), bracketPaint);
    canvas.drawLine(Offset(left + drawW - 8, rodY - 6), Offset(left + drawW - 8, rodY + 4), bracketPaint);

    // Cascading Wave Pleats
    const folds = 6;
    final foldW = drawW / folds;

    for (int i = 0; i < folds; i++) {
      final fLeft = left + i * foldW;
      final fRect = Rect.fromLTWH(fLeft, rodY + 4, foldW, drawH - 14);

      final grad = LinearGradient(
        colors: [
          primaryColor.withValues(alpha: 0.1),
          primaryColor.withValues(alpha: 0.45),
          primaryColor.withValues(alpha: 0.08),
        ],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      );

      final foldPaint = Paint()..shader = grad.createShader(fRect);
      canvas.drawRect(fRect, foldPaint);

      // Vertical fold line
      canvas.drawLine(
        Offset(fLeft + foldW / 2, rodY + 4),
        Offset(fLeft + foldW / 2, rodY + 4 + drawH - 14),
        Paint()..color = primaryColor.withValues(alpha: 0.6)..strokeWidth = 1.0,
      );
    }

    // Bottom Weighted Hem Line
    final hemY = rodY + 4 + drawH - 14;
    canvas.drawLine(
      Offset(left, hemY),
      Offset(left + drawW, hemY),
      Paint()..color = const Color(0xFFC5A880)..strokeWidth = 2.5,
    );
  }

  @override
  bool shouldRepaint(covariant _TapestryCadPainter oldDelegate) =>
      oldDelegate.widthMm != widthMm ||
      oldDelegate.heightMm != heightMm ||
      oldDelegate.primaryColor != primaryColor;
}


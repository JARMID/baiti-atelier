class OpeningSpec {
  final String id;
  final String title;
  final String projectName;
  final String openingReference;
  final String status; // 'quote', 'cutting', 'assembly', 'installed'
  final String tradeType; // 'aluminum', 'woodworking', 'metalwork', 'tapestry'
  final String openingType;
  final double widthMm;
  final double heightMm;
  final double depthMm;
  final int quantity;
  final String profileSystem;
  final String finishColor;
  final String glassType;
  final String shutterType;
  final String clientWilaya;

  const OpeningSpec({
    this.id = '',
    this.title = 'Fenêtre Principale',
    this.projectName = 'Chantier Villa Principale',
    this.openingReference = 'F1',
    this.status = 'quote',
    this.tradeType = 'aluminum',
    this.openingType = 'Coulissant 2 Vantaux',
    this.widthMm = 1200.0,
    this.heightMm = 1200.0,
    this.depthMm = 600.0,
    this.quantity = 1,
    this.profileSystem = 'Alugraf 40',
    this.finishColor = 'RAL 9016 Blanc',
    this.glassType = 'Double Vitrage 4/12/4',
    this.shutterType = 'Manuel à sangle',
    this.clientWilaya = 'Alger (16)',
  });

  OpeningSpec copyWith({
    String? id,
    String? title,
    String? projectName,
    String? openingReference,
    String? status,
    String? tradeType,
    String? openingType,
    double? widthMm,
    double? heightMm,
    double? depthMm,
    int? quantity,
    String? profileSystem,
    String? finishColor,
    String? glassType,
    String? shutterType,
    String? clientWilaya,
  }) {
    return OpeningSpec(
      id: id ?? this.id,
      title: title ?? this.title,
      projectName: projectName ?? this.projectName,
      openingReference: openingReference ?? this.openingReference,
      status: status ?? this.status,
      tradeType: tradeType ?? this.tradeType,
      openingType: openingType ?? this.openingType,
      widthMm: widthMm ?? this.widthMm,
      heightMm: heightMm ?? this.heightMm,
      depthMm: depthMm ?? this.depthMm,
      quantity: quantity ?? this.quantity,
      profileSystem: profileSystem ?? this.profileSystem,
      finishColor: finishColor ?? this.finishColor,
      glassType: glassType ?? this.glassType,
      shutterType: shutterType ?? this.shutterType,
      clientWilaya: clientWilaya ?? this.clientWilaya,
    );
  }

  // Cost calculation matching the web CPQ engine
  Map<String, double> calculateCost() {
    if (tradeType == 'woodworking') {
      final wM = widthMm / 1000.0;
      final hM = heightMm / 1000.0;
      final dM = depthMm / 1000.0;
      final boardAreaM2 = 2 * (hM * dM) + 2 * (wM * dM) + (wM * hM) * 2;
      final sheets = (boardAreaM2 / 5.0).clamp(1.0, 10.0).ceilToDouble();
      final boardCost = sheets * 8800.0;
      final edgeCost = (4 * hM + 4 * wM) * 120.0;
      final hardwareCost = 6500.0;
      final labor = 6000.0 + boardAreaM2 * 800.0;
      final unitTotal = boardCost + edgeCost + hardwareCost + labor;
      return {
        'primaryMaterial': boardCost * quantity,
        'secondaryMaterial': edgeCost * quantity,
        'hardware': hardwareCost * quantity,
        'finishing': 0.0,
        'labor': labor * quantity,
        'unitTotal': unitTotal,
        'grandTotal': unitTotal * quantity,
        'areaM2': boardAreaM2 * quantity,
      };
    }

    if (tradeType == 'metalwork') {
      final wM = widthMm / 1000.0;
      final hM = heightMm / 1000.0;
      final framePerimeter = 2 * (wM + hM);
      final barsCount = (widthMm / 110.0).floor();
      final steelWeightKg = (framePerimeter * 2.45 + barsCount * hM * 1.54) * 1.08;
      final steelCost = steelWeightKg * 215.0;
      final decorCost = 3500.0;
      final surfaceFinishing = (wM * hM) * 2200.0;
      final weldingLabor = 4500.0 + steelWeightKg * 45.0;
      final unitTotal = steelCost + decorCost + surfaceFinishing + weldingLabor;
      return {
        'primaryMaterial': steelCost * quantity,
        'secondaryMaterial': decorCost * quantity,
        'hardware': 2500.0 * quantity,
        'finishing': surfaceFinishing * quantity,
        'labor': weldingLabor * quantity,
        'unitTotal': unitTotal,
        'grandTotal': unitTotal * quantity,
        'areaM2': (wM * hM) * quantity,
      };
    }

    if (tradeType == 'tapestry') {
      final railM = widthMm / 1000.0;
      final fabricLinearM = railM * 2.0; // 2x pleat
      final fabricCost = fabricLinearM * 1950.0;
      final accessories = fabricLinearM * 280.0;
      final labor = 2500.0 + fabricLinearM * 450.0;
      final unitTotal = fabricCost + accessories + labor;
      return {
        'primaryMaterial': fabricCost * quantity,
        'secondaryMaterial': accessories * quantity,
        'hardware': 0.0,
        'finishing': 0.0,
        'labor': labor * quantity,
        'unitTotal': unitTotal,
        'grandTotal': unitTotal * quantity,
        'areaM2': fabricLinearM * quantity,
      };
    }

    // Default: Aluminum & PVC Fenestration
    final perimeterM = (2 * (widthMm + heightMm)) / 1000.0;
    final areaM2 = (widthMm * heightMm) / 1000000.0;

    double profileWeightPerM = 1.15;
    double ratePerKg = 850.0;

    if (profileSystem.contains('67')) {
      profileWeightPerM = 1.45;
      ratePerKg = 920.0;
    } else if (profileSystem.contains('RPT')) {
      profileWeightPerM = 1.65;
      ratePerKg = 1150.0;
    } else if (profileSystem.contains('PVC')) {
      profileWeightPerM = 1.30;
      ratePerKg = 780.0;
    }

    final aluminumCost = perimeterM * profileWeightPerM * ratePerKg * 1.08;

    double glassRatePerM2 = 2400.0;
    if (glassType.contains('Bronze')) {
      glassRatePerM2 = 3200.0;
    } else if (glassType.contains('Stopsol')) {
      glassRatePerM2 = 4200.0;
    } else if (glassType.contains('Double')) {
      glassRatePerM2 = 6500.0;
    }
    final glassCost = areaM2 * glassRatePerM2;

    double hardwareCost = 3500.0;
    if (openingType.contains('Oscillo')) {
      hardwareCost = 7500.0;
    }

    double shutterCost = 0.0;
    if (shutterType.contains('Manuel')) {
      shutterCost = areaM2 * 5500.0 + 3000.0;
    } else if (shutterType.contains('Électrique')) {
      shutterCost = areaM2 * 6800.0 + 8500.0;
    }

    final laborCost = 4500.0 + (perimeterM * 500.0);
    final subtotalUnit = aluminumCost + glassCost + hardwareCost + shutterCost + laborCost;
    final totalCost = subtotalUnit * quantity;

    return {
      'primaryMaterial': aluminumCost * quantity,
      'secondaryMaterial': glassCost * quantity,
      'hardware': hardwareCost * quantity,
      'finishing': shutterCost * quantity,
      'labor': laborCost * quantity,
      'unitTotal': subtotalUnit,
      'grandTotal': totalCost,
      'areaM2': areaM2 * quantity,
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'projectName': projectName,
      'openingReference': openingReference,
      'status': status,
      'tradeType': tradeType,
      'openingType': openingType,
      'widthMm': widthMm,
      'heightMm': heightMm,
      'depthMm': depthMm,
      'quantity': quantity,
      'profileSystem': profileSystem,
      'finishColor': finishColor,
      'glassType': glassType,
      'shutterType': shutterType,
      'clientWilaya': clientWilaya,
    };
  }

  factory OpeningSpec.fromJson(Map<String, dynamic> json) {
    return OpeningSpec(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? 'Fenêtre Principale',
      projectName: json['projectName'] as String? ?? 'Chantier Villa Principale',
      openingReference: json['openingReference'] as String? ?? 'F1',
      status: json['status'] as String? ?? 'quote',
      tradeType: json['tradeType'] as String? ?? 'aluminum',
      openingType: json['openingType'] as String? ?? 'Coulissant 2 Vantaux',
      widthMm: (json['widthMm'] as num?)?.toDouble() ?? 1200.0,
      heightMm: (json['heightMm'] as num?)?.toDouble() ?? 1200.0,
      depthMm: (json['depthMm'] as num?)?.toDouble() ?? 600.0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      profileSystem: json['profileSystem'] as String? ?? 'Alugraf 40',
      finishColor: json['finishColor'] as String? ?? 'RAL 9016 Blanc',
      glassType: json['glassType'] as String? ?? 'Double Vitrage 4/12/4',
      shutterType: json['shutterType'] as String? ?? 'Manuel à sangle',
      clientWilaya: json['clientWilaya'] as String? ?? 'Alger (16)',
    );
  }

  // Precise millimetric workshop cut calculations for all 4 trades
  List<WorkshopCutItem> computeCutList() {
    final w = widthMm;
    final h = heightMm;
    final q = quantity;

    if (tradeType == 'woodworking') {
      final p = depthMm;
      return [
        WorkshopCutItem(
          label: 'Joues latérales (montants)',
          lengthMm: h,
          cutAngles: '90°/90°',
          quantity: 2 * q,
          role: 'Panneau',
          note: 'Prof. ${p.toInt()} mm',
        ),
        WorkshopCutItem(
          label: 'Dessus et socle bas',
          lengthMm: w - 36,
          cutAngles: '90°/90°',
          quantity: 2 * q,
          role: 'Panneau',
        ),
        WorkshopCutItem(
          label: 'Fond arrière MDF 3mm',
          lengthMm: h - 36,
          cutAngles: '90°/90°',
          quantity: 1 * q,
          role: 'Panneau',
        ),
        WorkshopCutItem(
          label: 'Étagère intérieure amovible',
          lengthMm: w - 38,
          cutAngles: '90°/90°',
          quantity: 1 * q,
          role: 'Panneau',
        ),
        WorkshopCutItem(
          label: 'Façade tiroir supérieur',
          lengthMm: w - 40,
          cutAngles: '90°/90°',
          quantity: 1 * q,
          role: 'Façade',
        ),
        WorkshopCutItem(
          label: 'Portes battantes caisson',
          lengthMm: h - 230,
          cutAngles: '90°/90°',
          quantity: 2 * q,
          role: 'Façade',
        ),
      ];
    } else if (tradeType == 'metalwork') {
      final barCount = ((w - 80) / 110).clamp(3, 20).round();
      return [
        WorkshopCutItem(
          label: 'Montants cadre tube 40x40',
          lengthMm: h,
          cutAngles: '45°/45°',
          quantity: 2 * q,
          role: 'Cadre',
        ),
        WorkshopCutItem(
          label: 'Traverses cadre tube 40x40',
          lengthMm: w,
          cutAngles: '45°/45°',
          quantity: 2 * q,
          role: 'Cadre',
        ),
        WorkshopCutItem(
          label: 'Traverse médiane de sécurité',
          lengthMm: w - 80,
          cutAngles: '90°/90°',
          quantity: 1 * q,
          role: 'Renfort',
        ),
        WorkshopCutItem(
          label: 'Barreaux carrés forgés 14mm',
          lengthMm: h - 80,
          cutAngles: '90°/90°',
          quantity: barCount * q,
          role: 'Barreaudage',
        ),
        WorkshopCutItem(
          label: 'Pointes de lance soudées',
          lengthMm: 120,
          cutAngles: 'Direct',
          quantity: barCount * q,
          role: 'Ornement',
        ),
      ];
    } else if (tradeType == 'tapestry') {
      final fabricW = (w * 2.2).toInt().toDouble();
      return [
        WorkshopCutItem(
          label: 'Tringle aluminium renforcée',
          lengthMm: w + 300,
          cutAngles: '90°/90°',
          quantity: 1 * q,
          role: 'Support',
        ),
        WorkshopCutItem(
          label: 'Largeur tissu utile développée',
          lengthMm: fabricW,
          cutAngles: 'Coupe',
          quantity: 1 * q,
          role: 'Textile',
        ),
        WorkshopCutItem(
          label: 'Hauteur confection avec ourlet',
          lengthMm: h + 250,
          cutAngles: 'Coupe',
          quantity: 1 * q,
          role: 'Textile',
        ),
        WorkshopCutItem(
          label: 'Ruflette ruban fronceur',
          lengthMm: fabricW + 100,
          cutAngles: 'Coupe',
          quantity: 1 * q,
          role: 'Mercerie',
        ),
        WorkshopCutItem(
          label: 'Plomb de lestage inférieur',
          lengthMm: fabricW,
          cutAngles: 'Coupe',
          quantity: 1 * q,
          role: 'Lestage',
        ),
      ];
    }

    // Aluminum / PVC trades
    final isCoulissant = openingType.toLowerCase().contains('couliss');
    final is1V = openingType.contains('1 Vantail') || openingType.toLowerCase().contains('porte');
    final isFixe = openingType.toLowerCase().contains('fixe');

    final list = <WorkshopCutItem>[
      WorkshopCutItem(
        label: 'Dormant Horizontal Haut/Bas',
        lengthMm: w,
        cutAngles: '45°/45°',
        quantity: 2 * q,
        role: 'Dormant',
      ),
      WorkshopCutItem(
        label: 'Dormant Vertical Gauche/Droit',
        lengthMm: h,
        cutAngles: '45°/45°',
        quantity: 2 * q,
        role: 'Dormant',
      ),
    ];

    if (isFixe) {
      list.add(WorkshopCutItem(
        label: 'Parclose Horizontale',
        lengthMm: w - 110,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Parclose Verticale',
        lengthMm: h - 110,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Vitrage Net Fixe',
        lengthMm: w - 110,
        cutAngles: 'Verre',
        quantity: 1 * q,
        role: 'Vitrage',
        note: 'H: ${(h - 110).toInt()} mm',
      ));
    } else if (isCoulissant) {
      list.add(WorkshopCutItem(
        label: 'Montant Vantail Coulissant',
        lengthMm: h - 65,
        cutAngles: '90°/90°',
        quantity: 4 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Traverse Vantail Coulissant',
        lengthMm: (w / 2) - 15,
        cutAngles: '90°/90°',
        quantity: 4 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Chicane Centrale Renfort',
        lengthMm: h - 65,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Renfort',
      ));
      list.add(WorkshopCutItem(
        label: 'Vitrage Isolé Coulissant',
        lengthMm: (w / 2) - 80,
        cutAngles: 'Verre',
        quantity: 2 * q,
        role: 'Vitrage',
        note: 'H: ${(h - 140).toInt()} mm',
      ));
    } else if (is1V) {
      list.add(WorkshopCutItem(
        label: 'Montant Ouvrant Frappe',
        lengthMm: h - 76,
        cutAngles: '45°/45°',
        quantity: 2 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Traverse Ouvrant Frappe',
        lengthMm: w - 76,
        cutAngles: '45°/45°',
        quantity: 2 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Parclose Horizontale',
        lengthMm: w - 190,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Parclose Verticale',
        lengthMm: h - 190,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Vitrage Isolé',
        lengthMm: w - 190,
        cutAngles: 'Verre',
        quantity: 1 * q,
        role: 'Vitrage',
        note: 'H: ${(h - 190).toInt()} mm',
      ));
    } else {
      // 2 Vantaux
      list.add(WorkshopCutItem(
        label: 'Montant Ouvrant Frappe',
        lengthMm: h - 76,
        cutAngles: '45°/45°',
        quantity: 4 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Traverse Ouvrant Frappe',
        lengthMm: (w - 86) / 2,
        cutAngles: '45°/45°',
        quantity: 4 * q,
        role: 'Ouvrant',
      ));
      list.add(WorkshopCutItem(
        label: 'Profil Battement Central',
        lengthMm: h - 80,
        cutAngles: '90°/90°',
        quantity: 1 * q,
        role: 'Finition',
      ));
      list.add(WorkshopCutItem(
        label: 'Parclose Horizontale',
        lengthMm: (w - 210) / 2,
        cutAngles: '90°/90°',
        quantity: 4 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Parclose Verticale',
        lengthMm: h - 190,
        cutAngles: '90°/90°',
        quantity: 4 * q,
        role: 'Parclose',
      ));
      list.add(WorkshopCutItem(
        label: 'Vitrage Isolé',
        lengthMm: (w - 200) / 2,
        cutAngles: 'Verre',
        quantity: 2 * q,
        role: 'Vitrage',
        note: 'H: ${(h - 190).toInt()} mm',
      ));
    }

    if (shutterType != 'Sans Volet' && !shutterType.contains('Aucun')) {
      list.add(WorkshopCutItem(
        label: 'Coffre Volet Aluminium',
        lengthMm: w,
        cutAngles: '90°/90°',
        quantity: 1 * q,
        role: 'Volet',
      ));
      list.add(WorkshopCutItem(
        label: 'Coulisses Guides Latérales',
        lengthMm: h - 180,
        cutAngles: '90°/90°',
        quantity: 2 * q,
        role: 'Volet',
      ));
      final slatCount = ((h - 180) / 39).ceil();
      list.add(WorkshopCutItem(
        label: 'Lames Tablier Alu 39',
        lengthMm: w - 55,
        cutAngles: '90°/90°',
        quantity: slatCount * q,
        role: 'Volet',
      ));
    }

    return list;
  }
}

class WorkshopCutItem {
  final String label;
  final double lengthMm;
  final String cutAngles;
  final int quantity;
  final String role;
  final String note;

  const WorkshopCutItem({
    required this.label,
    required this.lengthMm,
    required this.cutAngles,
    required this.quantity,
    required this.role,
    this.note = '',
  });
}

import 'package:flutter/material.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:url_launcher/url_launcher.dart';
import '../models/opening_spec.dart';
import '../widgets/devis_preview_sheet.dart';
import '../widgets/baiti_app_bar.dart';
import '../services/app_settings.dart';
import '../utils/algerian_financials.dart';

class ChantiersScreen extends StatefulWidget {
  final List<OpeningSpec> savedSpecs;
  final Function(int) onRemove;
  final Function(int, OpeningSpec)? onUpdate;
  final Function(OpeningSpec)? onAddSpec;

  const ChantiersScreen({
    super.key,
    required this.savedSpecs,
    required this.onRemove,
    this.onUpdate,
    this.onAddSpec,
  });

  @override
  State<ChantiersScreen> createState() => _ChantiersScreenState();
}

class _ChantiersScreenState extends State<ChantiersScreen> {
  String _selectedTradeFilter = 'all';
  String _searchQuery = '';
  final Set<String> _expandedProjects = {};

  String _formatDzd(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount.round())} DZD';
  }

  List<OpeningSpec> get _filteredSpecs {
    return widget.savedSpecs.where((spec) {
      final matchesTrade =
          _selectedTradeFilter == 'all' || spec.tradeType == _selectedTradeFilter;
      final query = _searchQuery.toLowerCase();
      final matchesSearch = query.isEmpty ||
          spec.projectName.toLowerCase().contains(query) ||
          spec.title.toLowerCase().contains(query) ||
          spec.openingReference.toLowerCase().contains(query) ||
          spec.clientWilaya.toLowerCase().contains(query) ||
          spec.openingType.toLowerCase().contains(query) ||
          spec.profileSystem.toLowerCase().contains(query);
      return matchesTrade && matchesSearch;
    }).toList();
  }

  Map<String, List<OpeningSpec>> get _groupedProjects {
    final map = <String, List<OpeningSpec>>{};
    for (final spec in _filteredSpecs) {
      final pName = spec.projectName.trim().isEmpty
          ? 'Chantier Villa Principale'
          : spec.projectName.trim();
      map.putIfAbsent(pName, () => []).add(spec);
    }
    return map;
  }

  double get _totalEstimatedAmount {
    return widget.savedSpecs.fold(0.0, (sum, spec) {
      final costs = spec.calculateCost();
      return sum + (costs['grandTotal'] ?? costs['total'] ?? 0.0);
    });
  }

  void _cycleOpeningStatus(OpeningSpec spec) {
    const statuses = ['quote', 'cutting', 'assembly', 'installed'];
    final currentIdx = statuses.indexOf(spec.status);
    final nextStatus = statuses[(currentIdx + 1) % statuses.length];
    final updated = spec.copyWith(status: nextStatus);
    final origIdx = widget.savedSpecs.indexOf(spec);
    if (origIdx >= 0 && widget.onUpdate != null) {
      widget.onUpdate!(origIdx, updated);
    }
  }

  void _shareProjectViaWhatsApp(String projectName, List<OpeningSpec> specs) async {
    if (specs.isEmpty) return;

    final totalProject = specs.fold(
      0.0,
      (sum, s) => sum + (s.calculateCost()['grandTotal'] ?? 0.0),
    );
    final acompte40 = totalProject * 0.40;
    final solde60 = totalProject * 0.60;
    final wilaya = specs.first.clientWilaya;

    final buffer = StringBuffer();
    buffer.writeln('📋 *DEVIS COLLECTIF CHANTIER : BAITI ATELIER | بيتي*');
    buffer.writeln('Date : ${DateTime.now().toLocal().toString().split(' ')[0]}');
    buffer.writeln('Chantier : *$projectName*');
    buffer.writeln('Wilaya : $wilaya');
    buffer.writeln('Nombre d\'ouvrages : ${specs.length}');
    buffer.writeln('----------------------------------------');

    for (int i = 0; i < specs.length; i++) {
      final s = specs[i];
      final c = s.calculateCost();
      final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F${i + 1}';
      final cost = (c['grandTotal'] ?? 0.0).toStringAsFixed(0);
      buffer.writeln('*[$ref]* ${s.title} (${_getTradeLabel(s.tradeType)})');
      buffer.writeln('  Cotes: ${s.widthMm.toInt()} × ${s.heightMm.toInt()} mm (Qté: ${s.quantity})');
      buffer.writeln('  Système: ${s.profileSystem} • ${s.finishColor}');
      buffer.writeln('  Statut: ${_getStatusLabel(s.status)}');
      buffer.writeln('  Chiffrage: $cost DZD\n');
    }

    final wordsFr = amountInDzdWordsFr(totalProject);
    final wordsAr = amountInDzdWordsAr(totalProject);
    final dtrZone = getDtrZoneForWilayaName(wilaya);

    buffer.writeln('----------------------------------------');
    buffer.writeln('*MONTANT TOTAL CHANTIER : ${totalProject.toStringAsFixed(0)} DZD*');
    buffer.writeln('Arrêté à la somme de : $wordsFr');
    buffer.writeln('المبلغ بالحروف : $wordsAr');
    buffer.writeln('*ACOMPTE 40% REQUIS : ${acompte40.toStringAsFixed(0)} DZD*');
    buffer.writeln('*SOLDE À LA LIVRAISON : ${solde60.toStringAsFixed(0)} DZD*');
    buffer.writeln('Zone Bioclimatique DTR : ${dtrZone.label} (Uw max ${dtrZone.maxUw} W/m²K)');
    buffer.writeln('Règlement BaridiMob RIP : ${formatBaridiMobRip('00799999002145897442')}');
    buffer.writeln('_Menuiserie aluminium et PVC conforme aux exigences DTR Algérie_');

    final url = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(buffer.toString())}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _shareAllViaWhatsApp() async {
    if (widget.savedSpecs.isEmpty) return;

    final buffer = StringBuffer();
    buffer.writeln('📋 *BAITI ATELIER | بيتي : CARNET GLOBAL DE TOUS LES CHANTIERS*');
    buffer.writeln('Date : ${DateTime.now().toLocal().toString().split(' ')[0]}');
    buffer.writeln('Total relevés : ${widget.savedSpecs.length}');
    buffer.writeln('Montant global : ${_totalEstimatedAmount.toStringAsFixed(0)} DZD\n');

    final grouped = _groupedProjects;
    grouped.forEach((pName, specs) {
      final pTotal = specs.fold(
        0.0,
        (sum, s) => sum + (s.calculateCost()['grandTotal'] ?? 0.0),
      );
      buffer.writeln('========================================');
      buffer.writeln('📁 *PROJET : $pName* (${specs.first.clientWilaya})');
      buffer.writeln('Total projet : ${pTotal.toStringAsFixed(0)} DZD (${specs.length} châssis)');
      for (final s in specs) {
        final c = s.calculateCost();
        final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F';
        buffer.writeln('  • [$ref] ${s.title}: ${s.widthMm.toInt()}×${s.heightMm.toInt()}mm -> ${(c['grandTotal'] ?? 0).toStringAsFixed(0)} DZD');
      }
      buffer.writeln('');
    });

    buffer.writeln('========================================');
    buffer.writeln('Arrêté le carnet global à la somme de : ${amountInDzdWordsFr(_totalEstimatedAmount)}');
    buffer.writeln('المبلغ الإجمالي بالحروف : ${amountInDzdWordsAr(_totalEstimatedAmount)}');
    buffer.writeln('Coordonnées BaridiMob RIP : ${formatBaridiMobRip('00799999002145897442')}');
    buffer.writeln('_Baiti Atelier • Direction Financière et Suivi de Chantiers 58 Wilayas_');

    final url = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(buffer.toString())}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _showNewProjectDialog() {
    final settings = AppSettings.instance;
    final nameCtrl = TextEditingController();
    final wilayaCtrl = ValueNotifier<String>('Alger (16)');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: settings.dialogBackground,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: BorderSide(color: settings.dialogBorder),
        ),
        title: Row(
          children: [
            const Icon(Icons.create_new_folder_rounded, color: Color(0xFFD4AF37), size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                settings.tr('chantiers_new_project'),
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: settings.primaryText),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nom du Chantier / Client :',
              style: TextStyle(fontSize: 11, color: settings.secondaryText),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: nameCtrl,
              style: TextStyle(fontSize: 13, color: settings.primaryText),
              decoration: InputDecoration(
                hintText: 'ex: Villa Kouba R+2 - M. Benali',
                hintStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
                filled: true,
                fillColor: settings.inputBackground,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: settings.inputBorder),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(color: settings.inputBorder),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Wilaya d\'Exécution :',
              style: TextStyle(fontSize: 11, color: settings.secondaryText),
            ),
            const SizedBox(height: 6),
            ValueListenableBuilder<String>(
              valueListenable: wilayaCtrl,
              builder: (context, val, _) {
                final zone = getDtrZoneForWilayaName(val);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: settings.inputBackground,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: settings.inputBorder),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: val,
                          dropdownColor: settings.cardBackground,
                          style: TextStyle(fontSize: 12, color: settings.primaryText),
                          items: const [
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
                            'Biskra (07)',
                            'Ouargla (30)',
                            'Ghardaïa (47)',
                            'Béchar (08)',
                          ].map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                          onChanged: (newVal) {
                            if (newVal != null) wilayaCtrl.value = newVal;
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0x1FD4AF37),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0x4DD4AF37)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.wb_sunny_rounded, size: 14, color: Color(0xFFD4AF37)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              '${zone.label} • Uw max ${zone.maxUw} W/m²K',
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('Annuler', style: TextStyle(color: settings.secondaryText)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFD4AF37),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              final name = nameCtrl.text.trim();
              if (name.isNotEmpty && widget.onAddSpec != null) {
                final placeholderSpec = OpeningSpec(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  title: 'Fenêtre F1',
                  projectName: name,
                  openingReference: 'F1',
                  clientWilaya: wilayaCtrl.value,
                  widthMm: 1200,
                  heightMm: 1400,
                  profileSystem: 'TPR 40mm Standard',
                  openingType: 'Coulissant 2 Vantaux',
                  glassType: 'Double Vitrage 4/12/4',
                  finishColor: 'Blanc 9010',
                  quantity: 1,
                  status: 'cutting',
                );
                widget.onAddSpec!(placeholderSpec);
                _expandedProjects.add(name);
                Navigator.pop(ctx);
              }
            },
            child: const Text('Créer Chantier', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final grouped = _groupedProjects;

    return AnimatedBuilder(
      animation: AppSettings.instance,
      builder: (context, _) {
        final settings = AppSettings.instance;
        final isDark = settings.isDarkMode;

        return Scaffold(
          backgroundColor: settings.scaffoldBackground,
          appBar: BaitiAppBar(
            title: settings.tr('chantiers_header_title'),
            subtitle: settings.tr('chantiers_header_subtitle'),
            customActions: [
              IconButton(
                icon: const Icon(Icons.create_new_folder_rounded, color: Color(0xFF38BDF8), size: 20),
                tooltip: 'Nouveau chantier',
                onPressed: _showNewProjectDialog,
              ),
              if (widget.savedSpecs.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.share_rounded, color: Color(0xFFD4AF37), size: 19),
                  tooltip: 'Exporter récapitulatif WhatsApp global',
                  onPressed: _shareAllViaWhatsApp,
                ),
            ],
          ),
          body: Column(
            children: [
              // 1. Financial Aggregation Overview Card
              if (widget.savedSpecs.isNotEmpty)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: isDark
                          ? const [Color(0xFF1E293B), Color(0xFF0F172A)]
                          : const [Colors.white, Color(0xFFF1F5F9)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: settings.cardBorder),
                    boxShadow: isDark
                        ? null
                        : [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                settings.tr('chantiers_total_portfolio'),
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: settings.secondaryText,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '${grouped.length} Projet${grouped.length > 1 ? 's' : ''}',
                                style: const TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 9,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFFD4AF37),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerLeft,
                          child: Text(
                            _formatDzd(_totalEstimatedAmount),
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: settings.primaryText,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          settings.tr('chantiers_acompte_40'),
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF10B981),
                          ),
                        ),
                        const SizedBox(height: 4),
                        FittedBox(
                          fit: BoxFit.scaleDown,
                          alignment: Alignment.centerRight,
                          child: Text(
                            _formatDzd(_totalEstimatedAmount * 0.4),
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // 2. Search & Trade Filters Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 38,
                    decoration: BoxDecoration(
                      color: settings.inputBackground,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: settings.inputBorder),
                    ),
                    child: TextField(
                      style: TextStyle(fontSize: 12, color: settings.primaryText),
                      decoration: InputDecoration(
                        hintText: settings.tr('chantiers_search_hint'),
                        hintStyle: TextStyle(fontSize: 11, color: settings.secondaryText),
                        prefixIcon: Icon(Icons.search, size: 16, color: settings.secondaryText),
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      onChanged: (val) => setState(() => _searchQuery = val),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. Trade Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              children: [
                _buildFilterChip('all', '${settings.tr('chantiers_filter_all')} (${widget.savedSpecs.length})', const Color(0xFFD4AF37)),
                _buildFilterChip('aluminum', settings.tr('trade_aluminum'), const Color(0xFF38BDF8)),
                _buildFilterChip('woodworking', settings.tr('trade_wood'), const Color(0xFFF59E0B)),
                _buildFilterChip('metalwork', settings.tr('trade_metal'), const Color(0xFFEF4444)),
                _buildFilterChip('tapestry', settings.tr('trade_tapestry'), const Color(0xFFA855F7)),
              ],
            ),
          ),

          const SizedBox(height: 4),

          // 4. Grouped Projects List
          Expanded(
            child: grouped.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: settings.chipBackground,
                            shape: BoxShape.circle,
                            border: Border.all(color: settings.chipBorder),
                          ),
                          child: Icon(
                            Icons.folder_off_outlined,
                            size: 40,
                            color: settings.secondaryText,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.savedSpecs.isEmpty
                              ? settings.tr('chantiers_empty_title')
                              : 'Aucun projet ne correspond aux filtres',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: settings.primaryText),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          settings.tr('chantiers_empty_subtitle'),
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 11, color: settings.secondaryText),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD4AF37),
                            foregroundColor: Colors.black,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                          ),
                          onPressed: _showNewProjectDialog,
                          icon: const Icon(Icons.add, size: 16, color: Colors.black),
                          label: Text(
                            settings.tr('chantiers_new_project'),
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 140),
                    itemCount: grouped.length,
                    itemBuilder: (context, idx) {
                      final pName = grouped.keys.elementAt(idx);
                      final pSpecs = grouped[pName]!;
                      final isExpanded = _expandedProjects.contains(pName);

                      final pTotal = pSpecs.fold(
                        0.0,
                        (sum, s) => sum + (s.calculateCost()['grandTotal'] ?? 0.0),
                      );
                      final pAcompte = pTotal * 0.40;
                      final pSolde = pTotal * 0.60;
                      final installedCount = pSpecs.where((s) => s.status == 'installed').length;
                      final assembledCount = pSpecs.where((s) => s.status == 'assembly').length;
                      final cuttingCount = pSpecs.where((s) => s.status == 'cutting').length;

                      final wilaya = pSpecs.isNotEmpty ? pSpecs.first.clientWilaya : 'Alger';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 14),
                        decoration: BoxDecoration(
                          color: settings.cardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isExpanded ? const Color(0xFFD4AF37).withValues(alpha: 0.5) : settings.cardBorder,
                          ),
                          boxShadow: isDark
                              ? null
                              : [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.04),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                        ),
                        child: Column(
                           children: [
                            // Project Header
                            InkWell(
                              borderRadius: BorderRadius.circular(16),
                              onTap: () {
                                setState(() {
                                  if (isExpanded) {
                                    _expandedProjects.remove(pName);
                                  } else {
                                    _expandedProjects.add(pName);
                                  }
                                });
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: const Icon(
                                            Icons.folder_special_rounded,
                                            color: Color(0xFFD4AF37),
                                            size: 20,
                                          ),
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                pName,
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: settings.primaryText,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 2),
                                              FittedBox(
                                                fit: BoxFit.scaleDown,
                                                alignment: Alignment.centerLeft,
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Text(
                                                      wilaya,
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        color: settings.secondaryText,
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      '•  ouv.',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        color: settings.secondaryText,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        IconButton(
                                          padding: const EdgeInsets.all(4),
                                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                          icon: const Icon(Icons.receipt_long_rounded, size: 17, color: Color(0xFFD4AF37)),
                                          tooltip: 'Devis & Proforma Officiel',
                                          onPressed: () => DevisPreviewSheet.show(context, pName, pSpecs, initialTab: 0),
                                        ),
                                        IconButton(
                                          padding: const EdgeInsets.all(4),
                                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                          icon: const Icon(Icons.content_cut_rounded, size: 17, color: Color(0xFF38BDF8)),
                                          tooltip: 'Fiche Débit Scie & Verre',
                                          onPressed: () => DevisPreviewSheet.show(context, pName, pSpecs, initialTab: 1),
                                        ),
                                        IconButton(
                                          padding: const EdgeInsets.all(4),
                                          constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                                          icon: const Icon(Icons.share_rounded, size: 17, color: Color(0xFF10B981)),
                                          tooltip: 'Partager ce chantier WhatsApp',
                                          onPressed: () => _shareProjectViaWhatsApp(pName, pSpecs),
                                        ),
                                        Icon(
                                          isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                                          color: const Color(0xFF64748B),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 10),
                                    // Financial metrics line
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                      decoration: BoxDecoration(
                                        color: settings.subCardBackground,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: settings.subCardBorder),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  settings.tr('chantiers_total_project'),
                                                  style: TextStyle(fontSize: 8, fontFamily: 'monospace', color: settings.secondaryText),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                FittedBox(
                                                  fit: BoxFit.scaleDown,
                                                  alignment: Alignment.centerLeft,
                                                  child: Text(
                                                    _formatDzd(pTotal),
                                                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: settings.primaryText),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.center,
                                              children: [
                                                Text(
                                                  settings.tr('chantiers_acompte_40'),
                                                  style: const TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF10B981)),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                FittedBox(
                                                  fit: BoxFit.scaleDown,
                                                  alignment: Alignment.center,
                                                  child: Text(
                                                    _formatDzd(pAcompte),
                                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.end,
                                              children: [
                                                Text(
                                                  settings.tr('chantiers_solde_60'),
                                                  style: const TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF38BDF8)),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                FittedBox(
                                                  fit: BoxFit.scaleDown,
                                                  alignment: Alignment.centerRight,
                                                  child: Text(
                                                    _formatDzd(pSolde),
                                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8)),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Progress Bar
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: ClipRRect(
                                            borderRadius: BorderRadius.circular(4),
                                            child: LinearProgressIndicator(
                                              value: pSpecs.isEmpty
                                                  ? 0.0
                                                  : (installedCount * 1.0 + assembledCount * 0.7 + cuttingCount * 0.4) / pSpecs.length,
                                              backgroundColor: settings.chipBackground,
                                              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                                              minHeight: 4,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '$installedCount/${pSpecs.length} ${settings.tr("chantiers_installed_count")}',
                                          style: TextStyle(fontSize: 9, fontFamily: 'monospace', color: settings.secondaryText),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),

                            // Expandable Openings List
                            if (isExpanded)
                              Container(
                                padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                                decoration: BoxDecoration(
                                  border: Border(top: BorderSide(color: settings.cardBorder)),
                                ),
                                child: Column(
                                  children: [
                                    const SizedBox(height: 10),
                                    ...pSpecs.map((spec) {
                                      final origIdx = widget.savedSpecs.indexOf(spec);
                                      final cost = spec.calculateCost();
                                      final tradeColor = _getTradeColor(spec.tradeType);

                                      return Container(
                                        margin: const EdgeInsets.only(bottom: 8),
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: settings.subCardBackground,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: settings.subCardBorder),
                                        ),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.center,
                                          children: [
                                            // Reference Tag
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: tradeColor.withValues(alpha: 0.15),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: tradeColor.withValues(alpha: 0.4)),
                                              ),
                                              child: Text(
                                                spec.openingReference.isNotEmpty ? spec.openingReference : 'F',
                                                style: TextStyle(
                                                  fontFamily: 'monospace',
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                  color: tradeColor,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 10),
                                            // Title & Details
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: Text(
                                                          spec.title,
                                                          style: TextStyle(
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.bold,
                                                            color: settings.primaryText,
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                      const SizedBox(width: 6),
                                                      Flexible(
                                                        child: FittedBox(
                                                          fit: BoxFit.scaleDown,
                                                          alignment: Alignment.centerRight,
                                                          child: Text(
                                                            _formatDzd(cost['grandTotal'] ?? 0.0),
                                                            style: const TextStyle(
                                                              fontSize: 12,
                                                              fontWeight: FontWeight.bold,
                                                              color: Color(0xFFD4AF37),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    '${spec.widthMm.toInt()} × ${spec.heightMm.toInt()} mm • ${spec.quantity} u • ${spec.profileSystem}',
                                                    style: TextStyle(fontSize: 10, color: settings.secondaryText),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 4),
                                                  // Interactive Status Pill
                                                  GestureDetector(
                                                    onTap: () => _cycleOpeningStatus(spec),
                                                    child: Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                      decoration: BoxDecoration(
                                                        color: _getStatusColor(spec.status).withValues(alpha: 0.15),
                                                        borderRadius: BorderRadius.circular(6),
                                                        border: Border.all(
                                                          color: _getStatusColor(spec.status).withValues(alpha: 0.4),
                                                        ),
                                                      ),
                                                      child: Row(
                                                        mainAxisSize: MainAxisSize.min,
                                                        children: [
                                                          Icon(Icons.refresh, size: 9, color: _getStatusColor(spec.status)),
                                                          const SizedBox(width: 4),
                                                          Text(
                                                            _getStatusLabel(spec.status),
                                                            style: TextStyle(
                                                              fontSize: 9,
                                                              fontWeight: FontWeight.bold,
                                                              color: _getStatusColor(spec.status),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            IconButton(
                                              icon: const Icon(Icons.delete_outline, size: 16, color: Colors.redAccent),
                                              onPressed: () {
                                                if (origIdx >= 0) widget.onRemove(origIdx);
                                              },
                                              tooltip: settings.tr('chantiers_delete_tooltip'),
                                            ),
                                          ],
                                        ),
                                      );
                                    }),
                                  ],
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  },
);
}

  Widget _buildFilterChip(String tradeId, String label, Color chipColor) {
    final settings = AppSettings.instance;
    final isSelected = _selectedTradeFilter == tradeId;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? (settings.isDark ? Colors.white : const Color(0xFF0F172A)) : settings.secondaryText,
        ),
        backgroundColor: settings.chipBackground,
        selectedColor: chipColor.withValues(alpha: 0.25),
        side: BorderSide(
          color: isSelected ? chipColor : settings.chipBorder,
        ),
        onSelected: (_) => setState(() => _selectedTradeFilter = tradeId),
      ),
    );
  }

  String _getTradeLabel(String trade) {
    return AppSettings.instance.trTrade(trade);
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

  String _getStatusLabel(String status) {
    return AppSettings.instance.trStatus(status);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'cutting':
        return const Color(0xFFF97316);
      case 'assembly':
        return const Color(0xFFA855F7);
      case 'installed':
        return const Color(0xFF10B981);
      default:
        return const Color(0xFF38BDF8);
    }
  }
}

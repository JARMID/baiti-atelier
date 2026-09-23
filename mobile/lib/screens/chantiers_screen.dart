import 'package:flutter/material.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:url_launcher/url_launcher.dart';
import '../models/opening_spec.dart';
import '../widgets/devis_preview_sheet.dart';

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

    buffer.writeln('----------------------------------------');
    buffer.writeln('*MONTANT TOTAL CHANTIER : ${totalProject.toStringAsFixed(0)} DZD*');
    buffer.writeln('*ACOMPTE 40% REQUIS : ${acompte40.toStringAsFixed(0)} DZD*');
    buffer.writeln('*SOLDE À LA LIVRAISON : ${solde60.toStringAsFixed(0)} DZD*');
    buffer.writeln('_Menuiserie aluminium & bois conforme normes DTR Algérie_');

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

    final url = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(buffer.toString())}');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  void _showNewProjectDialog() {
    final nameCtrl = TextEditingController();
    final wilayaCtrl = ValueNotifier<String>('Alger (16)');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF121826),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: Color(0xFF1E293B)),
        ),
        title: const Row(
          children: [
            Icon(Icons.create_new_folder_rounded, color: Color(0xFFD4AF37), size: 20),
            SizedBox(width: 8),
            Text(
              'Créer un Nouveau Chantier',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Nom du Chantier / Client :',
              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: nameCtrl,
              style: const TextStyle(fontSize: 13, color: Colors.white),
              decoration: InputDecoration(
                hintText: 'ex: Villa Kouba R+2 - M. Benali',
                hintStyle: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                filled: true,
                fillColor: const Color(0xFF0B0F17),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFF1E293B)),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Wilaya d\'Exécution :',
              style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
            ),
            const SizedBox(height: 6),
            ValueListenableBuilder<String>(
              valueListenable: wilayaCtrl,
              builder: (context, val, _) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B0F17),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      isExpanded: true,
                      value: val,
                      dropdownColor: const Color(0xFF1E293B),
                      style: const TextStyle(fontSize: 12, color: Colors.white),
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
                      ].map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                      onChanged: (newVal) {
                        if (newVal != null) wilayaCtrl.value = newVal;
                      },
                    ),
                  ),
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Annuler', style: TextStyle(color: Color(0xFF64748B))),
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

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F17),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0B0F17),
        elevation: 0,
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
              const Text(
                'Carnet de Chantiers Multi-Ouvrages',
                style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.create_new_folder_rounded, color: Color(0xFF38BDF8)),
            tooltip: 'Nouveau chantier',
            onPressed: _showNewProjectDialog,
          ),
          if (widget.savedSpecs.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: IconButton(
                icon: const Icon(Icons.share_rounded, color: Color(0xFFD4AF37)),
                tooltip: 'Exporter récapitulatif WhatsApp global',
                onPressed: _shareAllViaWhatsApp,
              ),
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
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF334155)),
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
                            const Flexible(
                              child: Text(
                                'TOTAL PORTFOLIO CHANTIERS',
                                style: TextStyle(
                                  fontFamily: 'monospace',
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF94A3B8),
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
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
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
                        const Text(
                          'ACOMPTES 40%',
                          style: TextStyle(
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
                      color: const Color(0xFF121826),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E293B)),
                    ),
                    child: TextField(
                      style: const TextStyle(fontSize: 12, color: Colors.white),
                      decoration: const InputDecoration(
                        hintText: 'Rechercher chantier, repère F1, wilaya...',
                        hintStyle: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        prefixIcon: Icon(Icons.search, size: 16, color: Color(0xFF64748B)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
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
                _buildFilterChip('all', 'Tous (${widget.savedSpecs.length})', const Color(0xFFD4AF37)),
                _buildFilterChip('aluminum', 'Alu & PVC', const Color(0xFF38BDF8)),
                _buildFilterChip('woodworking', 'Bois', const Color(0xFFF59E0B)),
                _buildFilterChip('metalwork', 'Ferronnerie', const Color(0xFFEF4444)),
                _buildFilterChip('tapestry', 'Tapisserie', const Color(0xFFA855F7)),
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
                            color: const Color(0xFF121826),
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF1E293B)),
                          ),
                          child: const Icon(
                            Icons.folder_off_outlined,
                            size: 40,
                            color: Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.savedSpecs.isEmpty
                              ? 'Aucun chantier enregistré'
                              : 'Aucun projet ne correspond aux filtres',
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'Enregistrez des cotes depuis l\'onglet "Cotes & Devis"\nou appuyez sur l\'icône dossier en haut pour créer un chantier.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
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
                          label: const Text(
                            'Nouveau Chantier',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
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
                          color: const Color(0xFF121826),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isExpanded ? const Color(0xFFD4AF37).withValues(alpha: 0.5) : const Color(0xFF1E293B),
                          ),
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
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
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
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        color: Color(0xFF94A3B8),
                                                      ),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      '•  ouv.',
                                                      style: const TextStyle(
                                                        fontSize: 10,
                                                        color: Color(0xFF64748B),
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
                                        color: const Color(0xFF0B0F17),
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: const Color(0xFF1E293B)),
                                      ),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'TOTAL CHANTIER',
                                                  style: TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF64748B)),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                                FittedBox(
                                                  fit: BoxFit.scaleDown,
                                                  alignment: Alignment.centerLeft,
                                                  child: Text(
                                                    _formatDzd(pTotal),
                                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
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
                                                const Text(
                                                  'ACOMPTE 40%',
                                                  style: TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF10B981)),
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
                                                const Text(
                                                  'SOLDE 60%',
                                                  style: TextStyle(fontSize: 8, fontFamily: 'monospace', color: Color(0xFF38BDF8)),
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
                                              backgroundColor: const Color(0xFF1E293B),
                                              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                                              minHeight: 4,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          '$installedCount/${pSpecs.length} posés',
                                          style: const TextStyle(fontSize: 9, fontFamily: 'monospace', color: Color(0xFF94A3B8)),
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
                                decoration: const BoxDecoration(
                                  border: Border(top: BorderSide(color: Color(0xFF1E293B))),
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
                                          color: const Color(0xFF0B0F17),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: const Color(0xFF1E293B)),
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
                                                          style: const TextStyle(
                                                            fontSize: 12,
                                                            fontWeight: FontWeight.bold,
                                                            color: Colors.white,
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
                                                    style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
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
                                              tooltip: 'Supprimer',
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
  }

  Widget _buildFilterChip(String tradeId, String label, Color chipColor) {
    final isSelected = _selectedTradeFilter == tradeId;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        labelStyle: TextStyle(
          fontSize: 11,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? Colors.white : const Color(0xFF94A3B8),
        ),
        backgroundColor: const Color(0xFF121826),
        selectedColor: chipColor.withValues(alpha: 0.25),
        side: BorderSide(
          color: isSelected ? chipColor : const Color(0xFF1E293B),
        ),
        onSelected: (_) => setState(() => _selectedTradeFilter = tradeId),
      ),
    );
  }

  String _getTradeLabel(String trade) {
    switch (trade) {
      case 'woodworking':
        return 'Bois & Cuisine';
      case 'metalwork':
        return 'Ferronnerie';
      case 'tapestry':
        return 'Tapisserie';
      default:
        return 'Alu & PVC';
    }
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
    switch (status) {
      case 'cutting':
        return 'En Débitage Scie';
      case 'assembly':
        return 'Montage & Quincaillerie';
      case 'installed':
        return 'Posé sur Chantier';
      default:
        return 'Devis Chiffré';
    }
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

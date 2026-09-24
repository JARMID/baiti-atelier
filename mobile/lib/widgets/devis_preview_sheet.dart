import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart' hide TextDirection;
import 'package:url_launcher/url_launcher.dart';
import '../models/opening_spec.dart';
import '../models/artisan_profile.dart';
import '../services/storage_service.dart';
import '../services/app_settings.dart';
import '../utils/algerian_financials.dart';

class DevisPreviewSheet extends StatefulWidget {
  final String projectName;
  final List<OpeningSpec> specs;

  final int initialTab;

  const DevisPreviewSheet({
    super.key,
    required this.projectName,
    required this.specs,
    this.initialTab = 0,
  });

  static void show(
    BuildContext context,
    String projectName,
    List<OpeningSpec> specs, {
    int initialTab = 0,
  }) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DevisPreviewSheet(
        projectName: projectName,
        specs: specs,
        initialTab: initialTab,
      ),
    );
  }

  @override
  State<DevisPreviewSheet> createState() => _DevisPreviewSheetState();
}

class _DevisPreviewSheetState extends State<DevisPreviewSheet> {
  late int _activeTab;
  ArtisanProfile? _artisanProfile;

  @override
  void initState() {
    super.initState();
    _activeTab = widget.initialTab;
    _loadArtisanProfile();
  }

  Future<void> _loadArtisanProfile() async {
    final profile = await StorageService.loadArtisanProfile();
    if (mounted) {
      setState(() {
        _artisanProfile = profile;
      });
    }
  }

  String _formatDzd(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount.round())} DZD';
  }

  String _generateQuotationText(
    double totalHt,
    double tva19,
    double timbreFiscal,
    double totalTtc,
    double acompte40,
    double solde60,
    String wilaya,
    String quoteId,
  ) {
    final buffer = StringBuffer();
    final atelierName = _artisanProfile?.workshopName.isNotEmpty == true
        ? _artisanProfile!.workshopName
        : 'ATELIER ALUMINIUM KOUBA';
    final artisanPhone = _artisanProfile?.phone.isNotEmpty == true ? _artisanProfile!.phone : '0797780838';
    final artisanWilaya = _artisanProfile?.wilaya.isNotEmpty == true ? _artisanProfile!.wilaya : wilaya;
    final artisanName = _artisanProfile?.name.isNotEmpty == true ? _artisanProfile!.name : 'Mourad Hadj-Ali';
    final rip = _artisanProfile?.rip?.isNotEmpty == true ? _artisanProfile!.rip! : '00799999002145897442';
    final ccp = _artisanProfile?.ccp?.isNotEmpty == true ? _artisanProfile!.ccp! : '0021458974';
    final ccpKey = _artisanProfile?.ccpKey?.isNotEmpty == true ? _artisanProfile!.ccpKey! : '42';

    buffer.writeln('========================================');
    buffer.writeln('DEVIS CLIENT ET FACTURE PROFORMA');
    buffer.writeln(atelierName);
    buffer.writeln('Artisan: $artisanName');
    if (artisanPhone.isNotEmpty) {
      buffer.writeln('Contact Atelier: $artisanPhone ($artisanWilaya)');
    }
    if (_artisanProfile?.nif?.isNotEmpty == true || _artisanProfile?.rc?.isNotEmpty == true) {
      buffer.writeln('NIF: ${_artisanProfile?.nif ?? "001916012345678"} | RC: ${_artisanProfile?.rc ?? "16/00-1234567B19"}');
    }
    buffer.writeln('========================================');
    buffer.writeln('Reference Devis: $quoteId');
    buffer.writeln('Date: ${DateTime.now().toLocal().toString().split(' ')[0]}');
    buffer.writeln('Chantier: ${widget.projectName}');
    buffer.writeln('Wilaya: $wilaya');
    buffer.writeln('Nombre d\'ouvrages: ${widget.specs.length}');
    buffer.writeln('Norme: Conforme Document Technique Reglementaire DTR C3-2');
    buffer.writeln('----------------------------------------');
    buffer.writeln('DETAIL DES OUVRAGES FACTURES:');

    for (int i = 0; i < widget.specs.length; i++) {
      final s = widget.specs[i];
      final c = s.calculateCost();
      final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F${i + 1}';
      final itemTotal = (c['grandTotal'] ?? 0.0).round();
      buffer.writeln('');
      buffer.writeln('[$ref] ${s.title}');
      buffer.writeln('  Cotes: ${s.widthMm.toInt()} x ${s.heightMm.toInt()} mm (Qte: ${s.quantity})');
      buffer.writeln('  Systeme: ${s.profileSystem} | Teinte: ${s.finishColor}');
      buffer.writeln('  Vitrage: ${s.glassType}');
      buffer.writeln('  Sous-total: ${_formatDzd(itemTotal.toDouble())}');
    }

    buffer.writeln('');
    buffer.writeln('----------------------------------------');
    buffer.writeln('RECAPITULATIF FINANCIER ATELIER:');
    buffer.writeln('Total Ouvrages HT: ${_formatDzd(totalHt)}');
    buffer.writeln('TVA Legale 19%: ${_formatDzd(tva19)}');
    buffer.writeln('Droit de Timbre Fiscal: ${_formatDzd(timbreFiscal)}');
    buffer.writeln('TOTAL GENERAL TTC: ${_formatDzd(totalTtc)}');
    buffer.writeln('Arrete le present devis a la somme de:');
    buffer.writeln('  ${amountInDzdWordsFr(totalTtc)}');
    buffer.writeln('');
    buffer.writeln('CONDITIONS DE REGLEMENT:');
    buffer.writeln('Acompte a la commande (40%): ${_formatDzd(acompte40)}');
    buffer.writeln('Solde apres pose et reception (60%): ${_formatDzd(solde60)}');
    buffer.writeln('');
    buffer.writeln('PAIEMENT BARIDIMOB ALGERIE POSTE:');
    buffer.writeln('RIP: $rip');
    buffer.writeln('Compte CCP: $ccp Cle: $ccpKey');
    buffer.writeln('Titulaire: $artisanName');
    buffer.writeln('Validite de l\'offre: 30 jours');
    buffer.writeln('Delai moyen de fabrication: 15 a 21 jours ouvrables');
    buffer.writeln('========================================');
    buffer.writeln('Document genere via Baiti Atelier Mobile');

    return buffer.toString();
  }

  String _generateCollectiveCutSheetText(String wilaya) {
    final buffer = StringBuffer();
    final atelierName = _artisanProfile?.workshopName.isNotEmpty == true
        ? _artisanProfile!.workshopName
        : 'BAITI ATELIER | بيتي';
    buffer.writeln('========================================');
    buffer.writeln('$atelierName: FICHE DE DÉBIT COLLECTIVE');
    buffer.writeln('CHANTIER: ${widget.projectName} | WILAYA: $wilaya');
    buffer.writeln('DATE: ${DateTime.now().toLocal().toString().split(' ')[0]}');
    buffer.writeln('TOTAL OUVRAGES: ${widget.specs.length}');
    buffer.writeln('========================================');

    double totalLinearCutMm = 0;
    double totalGlassM2 = 0;

    for (int i = 0; i < widget.specs.length; i++) {
      final s = widget.specs[i];
      final cuts = s.computeCutList();
      final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F${i + 1}';
      buffer.writeln('');
      buffer.writeln('--- OUVRAGE [$ref] : ${s.title} ---');
      buffer.writeln('Dimensions: ${s.widthMm.toInt()} x ${s.heightMm.toInt()} mm | Qte: ${s.quantity}');
      buffer.writeln('Système: ${s.profileSystem} | Teinte: ${s.finishColor}');
      buffer.writeln('Vitrage: ${s.glassType}');
      buffer.writeln('DÉBITS DE SCIAGE:');
      for (int j = 0; j < cuts.length; j++) {
        final c = cuts[j];
        buffer.writeln('  ${j + 1}. ${c.label}: ${c.lengthMm.toInt()} mm (${c.cutAngles}) x ${c.quantity}');
        if (c.role != 'Vitrage') {
          totalLinearCutMm += c.lengthMm * c.quantity;
        }
      }
      final glassArea = (s.calculateCost()['areaM2'] ?? 0.0);
      totalGlassM2 += glassArea;
    }

    final totalBars6m = (totalLinearCutMm / 6000.0).ceil();

    buffer.writeln('');
    buffer.writeln('========================================');
    buffer.writeln('RÉSUMÉ MATIÈRE PREMIÈRE CHANTIER:');
    buffer.writeln('Estimation Barres de Stock (6.00m): $totalBars6m barres');
    buffer.writeln('Linéaire Total Usiné: ${(totalLinearCutMm / 1000).toStringAsFixed(1)} m');
    buffer.writeln('Surface Totale Vitrage Net: ${totalGlassM2.toStringAsFixed(2)} m²');
    buffer.writeln('========================================');
    buffer.writeln('Généré via Baiti Atelier Mobile | Conforme DTR C3-2');
    return buffer.toString();
  }

  Future<void> _shareViaWhatsApp(BuildContext context, String text) async {
    final uri = Uri.parse('whatsapp://send?text=${Uri.encodeComponent(text)}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Impossible d\'ouvrir WhatsApp sur cet appareil')),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur WhatsApp: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final wilaya = widget.specs.isNotEmpty ? widget.specs.first.clientWilaya : 'Alger';
    final quoteId = 'DEV-26-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

    final totalHt = widget.specs.fold<double>(
      0.0,
      (sum, s) => sum + (s.calculateCost()['grandTotal'] ?? 0.0),
    );
    final tva19 = totalHt * 0.19;
    final timbreFiscal = totalHt > 0 ? (totalHt * 0.01).clamp(50.0, 2500.0) : 0.0;
    final totalTtc = totalHt + tva19 + timbreFiscal;
    final acompte40 = totalTtc * 0.40;
    final solde60 = totalTtc * 0.60;

    final quotationText = _generateQuotationText(
      totalHt,
      tva19,
      timbreFiscal,
      totalTtc,
      acompte40,
      solde60,
      wilaya,
      quoteId,
    );

    final cutSheetText = _generateCollectiveCutSheetText(wilaya);

    // Aggregate saw statistics across all openings
    double aggregateLinearCutMm = 0;
    double aggregateGlassM2 = 0;
    int totalPiecesCount = 0;

    for (final s in widget.specs) {
      final cuts = s.computeCutList();
      for (final c in cuts) {
        totalPiecesCount += c.quantity;
        if (c.role != 'Vitrage') {
          aggregateLinearCutMm += c.lengthMm * c.quantity;
        }
      }
      aggregateGlassM2 += (s.calculateCost()['areaM2'] ?? 0.0);
    }
    final aggregateBars6m = (aggregateLinearCutMm / 6000.0).ceil();

    final settings = AppSettings.instance;
    final isDark = settings.isDarkMode;

    return DraggableScrollableSheet(
      initialChildSize: 0.9,
      minChildSize: 0.5,
      maxChildSize: 0.96,
      builder: (ctx, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: settings.sheetBackground,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border(top: BorderSide(color: settings.sheetBorder, width: 1.5)),
          ),
          child: Column(
            children: [
              // Sheet Drag Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 10, bottom: 8),
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: settings.sheetHandle,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Sheet Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.receipt_long_rounded, color: Color(0xFFD4AF37), size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            alignment: Alignment.centerLeft,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Baiti Atelier',
                                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: settings.primaryText),
                                ),
                                const SizedBox(width: 6),
                                const Text(
                                  'بيتي',
                                  textDirection: TextDirection.rtl,
                                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '${widget.projectName} • $quoteId',
                            style: TextStyle(fontSize: 11, color: settings.secondaryText, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.close, color: settings.secondaryText),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),

              // Segmented Tab Switcher: Devis Financier vs Fiche Débit Atelier
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: settings.subCardBackground,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: settings.subCardBorder),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() => _activeTab = 0);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 0 ? const Color(0xFFD4AF37).withValues(alpha: 0.18) : Colors.transparent,
                            borderRadius: BorderRadius.circular(9),
                            border: Border.all(
                              color: _activeTab == 0 ? const Color(0xFFD4AF37) : Colors.transparent,
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
                                    Icons.receipt_long_rounded,
                                    size: 14,
                                    color: _activeTab == 0 ? const Color(0xFFD4AF37) : const Color(0xFF64748B),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    settings.tr('sheet_devis_proforma'),
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      fontWeight: _activeTab == 0 ? FontWeight.bold : FontWeight.normal,
                                      color: _activeTab == 0 ? (isDark ? Colors.white : const Color(0xFF0F172A)) : settings.secondaryText,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          HapticFeedback.selectionClick();
                          setState(() => _activeTab = 1);
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _activeTab == 1 ? const Color(0xFF38BDF8).withValues(alpha: 0.18) : Colors.transparent,
                            borderRadius: BorderRadius.circular(9),
                            border: Border.all(
                              color: _activeTab == 1 ? const Color(0xFF38BDF8) : Colors.transparent,
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
                                    Icons.content_cut_rounded,
                                    size: 14,
                                    color: _activeTab == 1 ? const Color(0xFF38BDF8) : const Color(0xFF64748B),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    settings.tr('sheet_debit_saw_glass'),
                                    style: TextStyle(
                                      fontFamily: 'monospace',
                                      fontSize: 11,
                                      fontWeight: _activeTab == 1 ? FontWeight.bold : FontWeight.normal,
                                      color: _activeTab == 1 ? (isDark ? Colors.white : const Color(0xFF0F172A)) : settings.secondaryText,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Divider(color: settings.dividerColor, height: 1),

              // Document Sheet Body
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (_activeTab == 0) ...[
                      // TAB 0: FINANCIAL PROFORMA QUOTATION
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: settings.subCardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: settings.subCardBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        _artisanProfile?.workshopName.isNotEmpty == true
                                            ? _artisanProfile!.workshopName
                                            : 'BAITI ATELIER SARL | بيتي',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w900,
                                          color: settings.primaryText,
                                          letterSpacing: 0.5,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        _artisanProfile?.phone.isNotEmpty == true
                                            ? 'Atelier ${_artisanProfile!.wilaya} • Tél: ${_artisanProfile!.phone}'
                                            : 'Menuiserie Aluminium, PVC & Agencement',
                                        style: TextStyle(fontSize: 11, color: settings.secondaryText),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                                  ),
                                  child: Text(
                                    settings.tr('sheet_dtr_valid'),
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF10B981),
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Divider(color: settings.dividerColor, height: 1),
                            const SizedBox(height: 12),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(settings.tr('sheet_client_chantier'), style: TextStyle(fontSize: 9, color: settings.secondaryText, fontFamily: 'monospace')),
                                      const SizedBox(height: 2),
                                      Text(widget.projectName, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: settings.primaryText)),
                                      Text('Wilaya de $wilaya', maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 11, color: settings.secondaryText)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(settings.tr('sheet_date_emission'), style: TextStyle(fontSize: 9, color: settings.secondaryText, fontFamily: 'monospace')),
                                      const SizedBox(height: 2),
                                      Text(
                                        DateTime.now().toLocal().toString().split(' ')[0],
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: settings.primaryText, fontFamily: 'monospace'),
                                      ),
                                      Text(settings.tr('sheet_validite_30j'), style: TextStyle(fontSize: 10, color: settings.secondaryText)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Table of Items
                      Text(
                        settings.tr('sheet_nomenclature_openings'),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: settings.secondaryText, letterSpacing: 0.8),
                      ),
                      const SizedBox(height: 8),

                      ...widget.specs.asMap().entries.map((entry) {
                        final i = entry.key;
                        final s = entry.value;
                        final c = s.calculateCost();
                        final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F${i + 1}';
                        final itemTotal = (c['grandTotal'] ?? 0.0).round();

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: settings.cardBackground,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: settings.cardBorder),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD4AF37).withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  ref,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFD4AF37),
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      s.title,
                                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: settings.primaryText),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      '${s.widthMm.toInt()} x ${s.heightMm.toInt()} mm (Qte: ${s.quantity}) • ${s.profileSystem}',
                                      style: TextStyle(fontSize: 11, color: settings.secondaryText),
                                    ),
                                    Text(
                                      '${s.finishColor} • ${s.glassType}',
                                      style: TextStyle(fontSize: 10, color: settings.secondaryText),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                _formatDzd(itemTotal.toDouble()),
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: settings.primaryText,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        );
                      }),

                      const SizedBox(height: 16),

                      // Financial Summary Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: settings.subCardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: settings.subCardBorder),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(settings.tr('sheet_subtotal_chassis'), style: TextStyle(fontSize: 12, color: settings.secondaryText)),
                                Text(_formatDzd(totalHt), style: TextStyle(fontSize: 12, color: settings.primaryText, fontFamily: 'monospace')),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(settings.tr('sheet_tva_legal'), style: TextStyle(fontSize: 12, color: settings.secondaryText)),
                                Text(_formatDzd(tva19), style: TextStyle(fontSize: 12, color: settings.primaryText, fontFamily: 'monospace')),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(settings.tr('sheet_timbre_fiscal'), style: TextStyle(fontSize: 12, color: settings.secondaryText)),
                                Text(_formatDzd(timbreFiscal), style: TextStyle(fontSize: 12, color: settings.primaryText, fontFamily: 'monospace')),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              child: Divider(color: settings.dividerColor, height: 1),
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(settings.tr('sheet_total_general_ttc'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: settings.primaryText)),
                                Text(
                                  _formatDzd(totalTtc),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFFD4AF37),
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: settings.chipBackground,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: settings.chipBorder),
                              ),
                              child: Text(
                                '${settings.tr('sheet_arrete_somme')} ${amountInDzdWordsFr(totalTtc)}',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontStyle: FontStyle.italic,
                                  color: settings.primaryText,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // Payment Schedule Badges
                      Row(
                        children: [
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF0F231D) : const Color(0xFFECFDF5),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.4)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(settings.tr('sheet_acompte_requis'), style: const TextStyle(fontSize: 9, color: Color(0xFF10B981), fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 3),
                                  Text(_formatDzd(acompte40), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF181E2E) : const Color(0xFFEFF6FF),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.4)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(settings.tr('sheet_solde_reception'), style: const TextStyle(fontSize: 9, color: Color(0xFF60A5FA), fontFamily: 'monospace', fontWeight: FontWeight.bold)),
                                  const SizedBox(height: 3),
                                  Text(_formatDzd(solde60), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF60A5FA))),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 14),

                      // BaridiMob Direct Payment Card
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF111827) : settings.subCardBackground,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.35)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFD4AF37).withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Icon(Icons.account_balance_wallet_rounded, color: Color(0xFFD4AF37), size: 16),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      settings.tr('sheet_payment_baridimob_title'),
                                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37), letterSpacing: 0.6),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF0F231D),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.4)),
                                  ),
                                  child: Text(settings.tr('sheet_algerie_poste_badge'), style: const TextStyle(fontSize: 9, color: Color(0xFF10B981), fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.6) : settings.chipBackground,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(settings.tr('sheet_rip_algerie_poste'), style: TextStyle(fontSize: 9, color: settings.secondaryText)),
                                        const SizedBox(height: 2),
                                        Text(
                                          formatBaridiMobRip(_artisanProfile?.rip ?? '00799999002145897442'),
                                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: settings.primaryText, fontFamily: 'monospace'),
                                        ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.copy_rounded, size: 16, color: Color(0xFFD4AF37)),
                                    tooltip: settings.tr('sheet_copy_rip'),
                                    onPressed: () {
                                      HapticFeedback.selectionClick();
                                      Clipboard.setData(ClipboardData(text: _artisanProfile?.rip ?? '00799999002145897442'));
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text(settings.tr('sheet_rip_copied_snack')),
                                          backgroundColor: const Color(0xFF059669),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              '${settings.tr('sheet_titulaire_label')} ${_artisanProfile?.name ?? "Mourad Hadj-Ali"} (${_artisanProfile?.workshopName ?? "Atelier Aluminium Kouba"})',
                              style: TextStyle(fontSize: 10, color: settings.secondaryText),
                            ),
                          ],
                        ),
                      ),
                    ] else ...[
                      // TAB 1: WORKSHOP COLLECTIVE SAW CUT SHEET & GLAZING LIST
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: settings.subCardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFF38BDF8).withValues(alpha: 0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Row(
                                    children: [
                                      const Icon(Icons.content_cut_rounded, size: 18, color: Color(0xFF38BDF8)),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          settings.tr('sheet_cut_summary_title'),
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                            color: settings.primaryText,
                                            fontFamily: 'monospace',
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF38BDF8).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${widget.specs.length} ${settings.tr('sheet_chassis_count_label')} • $totalPiecesCount ${settings.tr('sheet_pieces_count_label')}',
                                    style: const TextStyle(fontSize: 10, color: Color(0xFF38BDF8), fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Divider(color: settings.dividerColor, height: 1),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.5) : settings.chipBackground,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(settings.tr('sheet_stock_barres_6m'), style: TextStyle(fontSize: 9, color: settings.secondaryText, fontFamily: 'monospace')),
                                        const SizedBox(height: 3),
                                        Text('$aggregateBars6m barres', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF10B981), fontFamily: 'monospace')),
                                        Text('${(aggregateLinearCutMm / 1000).toStringAsFixed(1)} ${settings.tr('sheet_linear_meters')}', style: TextStyle(fontSize: 10, color: settings.secondaryText)),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Container(
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: isDark ? const Color(0xFF1E293B).withValues(alpha: 0.5) : settings.chipBackground,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(settings.tr('sheet_vitrage_total_net'), style: TextStyle(fontSize: 9, color: settings.secondaryText, fontFamily: 'monospace')),
                                        const SizedBox(height: 3),
                                        Text('${aggregateGlassM2.toStringAsFixed(2)} m²', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF38BDF8), fontFamily: 'monospace')),
                                        Text(settings.tr('sheet_vitrage_surface_sub'), style: TextStyle(fontSize: 10, color: settings.secondaryText)),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      Text(
                        settings.tr('sheet_detail_coupes_title'),
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: settings.secondaryText, letterSpacing: 0.8),
                      ),
                      const SizedBox(height: 8),

                      ...widget.specs.asMap().entries.map((entry) {
                        final i = entry.key;
                        final s = entry.value;
                        final cuts = s.computeCutList();
                        final ref = s.openingReference.isNotEmpty ? s.openingReference : 'F${i + 1}';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: settings.subCardBackground,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: settings.subCardBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF38BDF8).withValues(alpha: 0.2),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            ref,
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF38BDF8),
                                              fontFamily: 'monospace',
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            s.title,
                                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: settings.primaryText),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${s.widthMm.toInt()} × ${s.heightMm.toInt()} mm',
                                    style: const TextStyle(fontFamily: 'monospace', fontSize: 11, color: Color(0xFFD4AF37), fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1E293B) : settings.chipBackground,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(flex: 5, child: Text(settings.tr('col_piece'), style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: settings.secondaryText, fontWeight: FontWeight.bold))),
                                    Expanded(flex: 3, child: Text(settings.tr('col_cote'), textAlign: TextAlign.right, style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: settings.secondaryText, fontWeight: FontWeight.bold))),
                                    Expanded(flex: 2, child: Text(settings.tr('col_angles'), textAlign: TextAlign.center, style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: settings.secondaryText, fontWeight: FontWeight.bold))),
                                    Expanded(flex: 2, child: Text(settings.tr('col_qte'), textAlign: TextAlign.right, style: TextStyle(fontFamily: 'monospace', fontSize: 9, color: settings.secondaryText, fontWeight: FontWeight.bold))),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 4),
                              ...cuts.map((c) {
                                return Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        flex: 5,
                                        child: Text(
                                          c.label,
                                          style: TextStyle(fontSize: 10.5, color: settings.primaryText),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      Expanded(
                                        flex: 3,
                                        child: Text(
                                          '${c.lengthMm.toInt()} mm',
                                          textAlign: TextAlign.right,
                                          style: const TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF38BDF8),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 2,
                                        child: Text(
                                          c.cutAngles,
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 9,
                                            color: settings.secondaryText,
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 2,
                                        child: Text(
                                          '${c.quantity}x',
                                          textAlign: TextAlign.right,
                                          style: TextStyle(
                                            fontFamily: 'monospace',
                                            fontSize: 10.5,
                                            fontWeight: FontWeight.bold,
                                            color: settings.primaryText,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }),
                            ],
                          ),
                        );
                      }),
                    ],

                    const SizedBox(height: 24),
                  ],
                ),
              ),

              // Action Toolbar: adapts dynamically to current active tab
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: settings.cardBackground,
                  border: Border(top: BorderSide(color: settings.dividerColor)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: settings.secondaryText,
                          side: BorderSide(color: settings.subCardBorder),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          final textToCopy = _activeTab == 0 ? quotationText : cutSheetText;
                          Clipboard.setData(ClipboardData(text: textToCopy));
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                _activeTab == 0
                                    ? settings.tr('sheet_quote_copied_snack')
                                    : settings.tr('sheet_cut_copied_snack'),
                              ),
                              backgroundColor: const Color(0xFF059669),
                            ),
                          );
                        },
                        icon: const Icon(Icons.copy_rounded, size: 16),
                        label: Text(
                          _activeTab == 0 ? settings.tr('sheet_copy_devis') : settings.tr('sheet_copy_debit'),
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _activeTab == 0 ? const Color(0xFF10B981) : const Color(0xFF0284C7),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          final textToSend = _activeTab == 0 ? quotationText : cutSheetText;
                          _shareViaWhatsApp(context, textToSend);
                        },
                        icon: Icon(
                          _activeTab == 0 ? Icons.send_rounded : Icons.content_cut_rounded,
                          size: 16,
                        ),
                        label: Text(
                          _activeTab == 0 ? settings.tr('sheet_wa_client') : settings.tr('sheet_wa_workshop'),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

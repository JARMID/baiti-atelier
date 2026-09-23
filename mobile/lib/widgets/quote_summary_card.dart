import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/opening_spec.dart';
import 'devis_preview_sheet.dart';

class QuoteSummaryCard extends StatelessWidget {
  final OpeningSpec spec;
  final VoidCallback onSaveLocally;

  const QuoteSummaryCard({
    super.key,
    required this.spec,
    required this.onSaveLocally,
  });

  String _formatDzd(double amount) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(amount.round())} DZD';
  }

  Future<void> _dispatchWhatsApp(BuildContext context) async {
    final cost = spec.calculateCost();
    final tradeLabel = spec.tradeType == 'woodworking'
        ? 'MENUISERIE BOIS'
        : spec.tradeType == 'metalwork'
            ? 'FERRONNERIE & MÉTAL'
            : spec.tradeType == 'tapestry'
                ? 'TAPISSERIE & RIDEAUX'
                : 'ALUMINIUM & PVC';

    final message = '''
*DEVIS ESTIMATIF $tradeLabel - BAITI ATELIER | بيتي*
Wilaya: ${spec.clientWilaya}
Ouvrage: ${spec.title} (${spec.quantity} unité(s))

*Spécifications Techniques :*
• Type: ${spec.openingType}
• Cotes: ${spec.widthMm.toInt()} mm (L) x ${spec.heightMm.toInt()} mm (H)
• Matériau / Système: ${spec.profileSystem}
• Finition: ${spec.finishColor}

*Détail du Chiffrage Atelier :*
• Matériau principal: ${_formatDzd(cost['primaryMaterial'] ?? 0.0)}
• Compléments & finitions: ${_formatDzd(cost['secondaryMaterial'] ?? 0.0)}
• Accessoires & quincaillerie: ${_formatDzd(cost['hardware'] ?? 0.0)}
• Main d'œuvre façonnage: ${_formatDzd(cost['labor'] ?? 0.0)}

*TOTAL ESTIMÉ: ${_formatDzd(cost['grandTotal']!)}*
_Généré via Baiti Atelier Mobile_
''';

    final uri = Uri.parse('https://wa.me/213550123456?text=${Uri.encodeComponent(message)}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Impossible d\'ouvrir WhatsApp')),
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
    final cost = spec.calculateCost();

    return Card(
      elevation: 0,
      color: const Color(0xFF0F172A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF1E293B), width: 1.2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
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
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFD4AF37),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Flexible(
                        child: Text(
                          'CHIFFRAGE DÉTAILLÉ EN DZD',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF94A3B8),
                            letterSpacing: 1.1,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${spec.quantity} unité(s)',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFFCBD5E1),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Cost lines
            _buildCostRow('Matériau principal', cost['primaryMaterial'] ?? 0.0),
            if ((cost['secondaryMaterial'] ?? 0.0) > 0)
              _buildCostRow('Second œuvre / vitrage / chants', cost['secondaryMaterial']!),
            if ((cost['hardware'] ?? 0.0) > 0)
              _buildCostRow('Accessoires & quincaillerie', cost['hardware']!),
            if ((cost['finishing'] ?? 0.0) > 0)
              _buildCostRow('Finition / volet / thermolaquage', cost['finishing']!),
            _buildCostRow('Main d\'œuvre & façonnage atelier', cost['labor'] ?? 0.0),

            const Divider(color: Color(0xFF1E293B), height: 24),

            // Grand Total
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'TOTAL INDICATIF HT',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Tarif atelier Algérie',
                      style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                    ),
                  ],
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerRight,
                    child: Text(
                      _formatDzd(cost['grandTotal']!),
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFFD4AF37),
                        letterSpacing: -0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _dispatchWhatsApp(context),
                    icon: const Icon(Icons.send_rounded, size: 16, color: Colors.white),
                    label: const FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        'Transmettre sur WhatsApp',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  onPressed: () => DevisPreviewSheet.show(
                    context,
                    spec.projectName.isNotEmpty ? spec.projectName : spec.title,
                    [spec],
                  ),
                  icon: const Icon(Icons.receipt_long_rounded, size: 19),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: const Color(0xFFD4AF37),
                    padding: const EdgeInsets.all(10),
                    minimumSize: const Size(40, 40),
                  ),
                  tooltip: 'Fiche Devis & Facture Proforma',
                ),
                const SizedBox(width: 6),
                IconButton.filledTonal(
                  onPressed: onSaveLocally,
                  icon: const Icon(Icons.bookmark_border_rounded, size: 19),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFF1E293B),
                    foregroundColor: const Color(0xFFE2E8F0),
                    padding: const EdgeInsets.all(10),
                    minimumSize: const Size(40, 40),
                  ),
                  tooltip: 'Enregistrer dans l\'historique chantier',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCostRow(String label, double amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            _formatDzd(amount),
            style: const TextStyle(
              fontFamily: 'monospace',
              fontSize: 13,
              color: Color(0xFFF1F5F9),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

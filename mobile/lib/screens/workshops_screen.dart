import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/baiti_app_bar.dart';
import '../services/app_settings.dart';

class WorkshopItem {
  final String id;
  final String name;
  final String trade;
  final String wilayaCode;
  final String wilayaName;
  final String address;
  final String phone;
  final String whatsapp;
  final double rating;
  final int completedJobs;
  final double aluminumRateKg;
  final double glassRateM2;

  const WorkshopItem({
    required this.id,
    required this.name,
    required this.trade,
    required this.wilayaCode,
    required this.wilayaName,
    required this.address,
    required this.phone,
    required this.whatsapp,
    required this.rating,
    required this.completedJobs,
    required this.aluminumRateKg,
    required this.glassRateM2,
  });
}

class WorkshopsScreen extends StatefulWidget {
  const WorkshopsScreen({super.key});

  @override
  State<WorkshopsScreen> createState() => _WorkshopsScreenState();
}

class _WorkshopsScreenState extends State<WorkshopsScreen> {
  String _selectedWilaya = 'Toutes';

  final List<WorkshopItem> _workshops = const [
    WorkshopItem(
      id: '1',
      name: 'Menuiserie Moderne Kouba',
      trade: 'Aluminium & PVC',
      wilayaCode: '16',
      wilayaName: 'Alger',
      address: 'Rue des Frères Abdeslami, Kouba',
      phone: '+213550123456',
      whatsapp: '213550123456',
      rating: 4.95,
      completedJobs: 420,
      aluminumRateKg: 840.0,
      glassRateM2: 2400.0,
    ),
    WorkshopItem(
      id: '2',
      name: 'Atelier Aluminium Es-Sénia',
      trade: 'Aluminium RPT & Façade',
      wilayaCode: '31',
      wilayaName: 'Oran',
      address: 'Zone d\'Activité Industrielle, Es-Sénia',
      phone: '+213555789012',
      whatsapp: '213555789012',
      rating: 4.88,
      completedJobs: 310,
      aluminumRateKg: 860.0,
      glassRateM2: 2600.0,
    ),
    WorkshopItem(
      id: '3',
      name: 'Profils & Façades Cirta',
      trade: 'Menuiserie Aluminium & Rideaux',
      wilayaCode: '25',
      wilayaName: 'Constantine',
      address: 'Route Nationale 3, El Khroub',
      phone: '+213661234567',
      whatsapp: '213661234567',
      rating: 4.90,
      completedJobs: 280,
      aluminumRateKg: 850.0,
      glassRateM2: 2500.0,
    ),
    WorkshopItem(
      id: '4',
      name: 'Sétif Vitrage & Menuiserie',
      trade: 'Double Vitrage & PVC',
      wilayaCode: '19',
      wilayaName: 'Sétif',
      address: 'Cité 500 Logements, Ain Oulmene',
      phone: '+213540678901',
      whatsapp: '213540678901',
      rating: 4.82,
      completedJobs: 195,
      aluminumRateKg: 870.0,
      glassRateM2: 2300.0,
    ),
    WorkshopItem(
      id: '5',
      name: 'Atelier Bois & Alu Aurès',
      trade: 'Bois Massif & Menuiserie Mixte',
      wilayaCode: '05',
      wilayaName: 'Batna',
      address: 'Zone Industrielle Kechida, Batna',
      phone: '+213551345678',
      whatsapp: '213551345678',
      rating: 4.87,
      completedJobs: 160,
      aluminumRateKg: 880.0,
      glassRateM2: 2500.0,
    ),
    WorkshopItem(
      id: '6',
      name: 'Mitidja Vitrage & Profils',
      trade: 'Coulissant & Volets Motorisés',
      wilayaCode: '09',
      wilayaName: 'Blida',
      address: 'Avenue de la Gare, Boufarik',
      phone: '+213559456789',
      whatsapp: '213559456789',
      rating: 4.89,
      completedJobs: 240,
      aluminumRateKg: 845.0,
      glassRateM2: 2450.0,
    ),
    WorkshopItem(
      id: '7',
      name: 'Ferronnerie d\'Art & Sécurité El Bahia',
      trade: 'Ferronnerie & Métal',
      wilayaCode: '31',
      wilayaName: 'Oran',
      address: 'Route d\'Arzew, Bir El Djir',
      phone: '+213661890123',
      whatsapp: '213661890123',
      rating: 4.93,
      completedJobs: 215,
      aluminumRateKg: 890.0,
      glassRateM2: 2700.0,
    ),
    WorkshopItem(
      id: '8',
      name: 'Tapisserie & Draperie Titteri',
      trade: 'Tapisserie & Draperie',
      wilayaCode: '26',
      wilayaName: 'Médéa',
      address: 'Boulevard de l\'ALN, Médéa',
      phone: '+213554123890',
      whatsapp: '213554123890',
      rating: 4.86,
      completedJobs: 175,
      aluminumRateKg: 830.0,
      glassRateM2: 2400.0,
    ),
  ];

  Future<void> _callPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openWhatsApp(String number, String name) async {
    final message = Uri.encodeComponent('Bonjour $name, je vous contacte suite à un projet de menuiserie sur Baiti Atelier | بيتي.');
    final uri = Uri.parse('https://wa.me/$number?text=$message');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedWilaya == 'Toutes'
        ? _workshops
        : _workshops.where((w) => w.wilayaName == _selectedWilaya).toList();

    final wilayas = ['Toutes', 'Alger', 'Oran', 'Constantine', 'Sétif', 'Batna', 'Blida', 'Médéa'];

    return AnimatedBuilder(
      animation: AppSettings.instance,
      builder: (context, _) {
        final settings = AppSettings.instance;
        final isDark = settings.isDarkMode;

        return Scaffold(
          backgroundColor: settings.scaffoldBackground,
          appBar: BaitiAppBar(
            title: settings.tr('ateliers_header_title'),
            subtitle: settings.tr('ateliers_header_subtitle'),
          ),
          body: Column(
            children: [
              // Wilaya filter horizontal list
              SizedBox(
                height: 48,
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: wilayas.length,
                  itemBuilder: (context, idx) {
                    final w = wilayas[idx];
                    final isSelected = _selectedWilaya == w;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSelected,
                        label: Text(w),
                        labelStyle: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected
                              ? (isDark ? Colors.black : Colors.white)
                              : settings.secondaryText,
                        ),
                        backgroundColor: isDark ? const Color(0xFF0F1B2D) : const Color(0xFFF1F5F9),
                        selectedColor: const Color(0xFFD4AF37),
                        side: BorderSide(
                          color: isSelected ? const Color(0xFFD4AF37) : settings.cardBorder,
                        ),
                        onSelected: (val) => setState(() => _selectedWilaya = w),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 8),

              // Workshops list with 140px bottom clearance for floating navbar
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 140),
                  itemCount: filtered.length,
                  itemBuilder: (context, idx) {
                    final w = filtered[idx];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: settings.cardBackground,
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
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: settings.cardBorder),
                                ),
                                child: const Center(
                                  child: Icon(Icons.business_rounded, color: Color(0xFFD4AF37), size: 22),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            w.name,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.bold,
                                              color: settings.primaryText,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                        const SizedBox(width: 6),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF059669).withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Row(
                                            children: [
                                              const Icon(Icons.star_rounded, size: 12, color: Color(0xFF10B981)),
                                              const SizedBox(width: 2),
                                              Text(
                                                w.rating.toStringAsFixed(1),
                                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '${w.trade} • ${w.wilayaName} (${w.wilayaCode})',
                                      style: const TextStyle(fontSize: 11, color: Color(0xFFD4AF37), fontWeight: FontWeight.w600),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      w.address,
                                      style: TextStyle(fontSize: 11, color: settings.secondaryText),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          Divider(color: settings.cardBorder, height: 20),

                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Tarif profilé :', style: TextStyle(fontSize: 10, color: settings.secondaryText), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        '${w.aluminumRateKg.toInt()} DZD / kg',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: settings.primaryText),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              Flexible(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Vitrage standard :', style: TextStyle(fontSize: 10, color: settings.secondaryText), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    FittedBox(
                                      fit: BoxFit.scaleDown,
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        '${w.glassRateM2.toInt()} DZD / m²',
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: settings.primaryText),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    onPressed: () => _callPhone(w.phone),
                                    icon: const Icon(Icons.call_rounded, size: 16),
                                    style: IconButton.styleFrom(
                                      backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                                      foregroundColor: settings.primaryText,
                                      padding: const EdgeInsets.all(8),
                                      minimumSize: const Size(36, 36),
                                    ),
                                    tooltip: 'Appeler',
                                  ),
                                  const SizedBox(width: 4),
                                  IconButton(
                                    onPressed: () => _openWhatsApp(w.whatsapp, w.name),
                                    icon: const Icon(Icons.chat_bubble_rounded, size: 16),
                                    style: IconButton.styleFrom(
                                      backgroundColor: const Color(0xFF059669),
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.all(8),
                                      minimumSize: const Size(36, 36),
                                    ),
                                    tooltip: 'WhatsApp',
                                  ),
                                ],
                              ),
                            ],
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
}

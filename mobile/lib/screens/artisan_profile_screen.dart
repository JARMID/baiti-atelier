import 'package:flutter/material.dart';
import '../models/artisan_profile.dart';
import '../services/storage_service.dart';

class ArtisanProfileScreen extends StatefulWidget {
  final VoidCallback? onProfileUpdated;

  const ArtisanProfileScreen({super.key, this.onProfileUpdated});

  @override
  State<ArtisanProfileScreen> createState() => _ArtisanProfileScreenState();
}

class _ArtisanProfileScreenState extends State<ArtisanProfileScreen> {
  ArtisanProfile _profile = ArtisanProfile.defaultProfile();
  bool _isLoading = true;
  bool _isSaving = false;

  late TextEditingController _nameController;
  late TextEditingController _workshopController;
  late TextEditingController _phoneController;
  late TextEditingController _nifController;
  late TextEditingController _rcController;
  String _selectedWilaya = '16 - Alger';
  int _selectedAvatarIndex = 0;

  static const List<String> _wilayasList = [
    '01 - Adrar',
    '02 - Chlef',
    '03 - Laghouat',
    '04 - Oum El Bouaghi',
    '05 - Batna',
    '06 - Béjaïa',
    '07 - Biskra',
    '08 - Béchar',
    '09 - Blida',
    '10 - Bouira',
    '11 - Tamanrasset',
    '12 - Tébessa',
    '13 - Tlemcen',
    '14 - Tiaret',
    '15 - Tizi Ouzou',
    '16 - Alger',
    '17 - Djelfa',
    '18 - Jijel',
    '19 - Sétif',
    '20 - Saïda',
    '21 - Skikda',
    '22 - Sidi Bel Abbès',
    '23 - Annaba',
    '24 - Guelma',
    '25 - Constantine',
    '26 - Médéa',
    '27 - Mostaganem',
    '28 - M\'Sila',
    '29 - Mascara',
    '30 - Ouargla',
    '31 - Oran',
    '32 - El Bayadh',
    '33 - Illizi',
    '34 - Bordj Bou Arreridj',
    '35 - Boumerdès',
    '36 - El Tarf',
    '37 - Tindouf',
    '38 - Tissemsilt',
    '39 - El Oued',
    '40 - Khenchela',
    '41 - Souk Ahras',
    '42 - Tipaza',
    '43 - Mila',
    '44 - Aïn Defla',
    '45 - Naâma',
    '46 - Aïn Témouchent',
    '47 - Ghardaïa',
    '48 - Relizane',
    '49 - Timimoun',
    '50 - Bordj Badji Mokhtar',
    '51 - Ouled Djellal',
    '52 - Béni Abbès',
    '53 - In Salah',
    '54 - In Guezzam',
    '55 - Touggourt',
    '56 - Djanet',
    '57 - El M\'Ghair',
    '58 - El Meniaa',
  ];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _workshopController = TextEditingController();
    _phoneController = TextEditingController();
    _nifController = TextEditingController();
    _rcController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _workshopController.dispose();
    _phoneController.dispose();
    _nifController.dispose();
    _rcController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    final loaded = await StorageService.loadArtisanProfile();
    if (mounted) {
      setState(() {
        _profile = loaded;
        _nameController.text = loaded.name;
        _workshopController.text = loaded.workshopName;
        _phoneController.text = loaded.phone;
        _nifController.text = loaded.nif ?? '';
        _rcController.text = loaded.rc ?? '';
        _selectedWilaya = _wilayasList.contains(loaded.wilaya)
            ? loaded.wilaya
            : '16 - Alger';
        _selectedAvatarIndex = loaded.avatarIndex;
        _isLoading = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    setState(() => _isSaving = true);
    final updated = _profile.copyWith(
      name: _nameController.text.trim(),
      workshopName: _workshopController.text.trim(),
      phone: _phoneController.text.trim(),
      wilaya: _selectedWilaya,
      avatarIndex: _selectedAvatarIndex,
      nif: _nifController.text.trim().isNotEmpty ? _nifController.text.trim() : null,
      rc: _rcController.text.trim().isNotEmpty ? _rcController.text.trim() : null,
    );
    await StorageService.saveArtisanProfile(updated);
    if (mounted) {
      setState(() {
        _profile = updated;
        _isSaving = false;
      });
      widget.onProfileUpdated?.call();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF10B981),
          content: Text(
            'Profil atelier et entête de devis enregistrés avec succès !',
            style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.bold),
          ),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  IconData _getAvatarIcon(int index) {
    switch (index) {
      case 0:
        return Icons.construction_rounded;
      case 1:
        return Icons.architecture_rounded;
      case 2:
        return Icons.carpenter_rounded;
      case 3:
        return Icons.precision_manufacturing_rounded;
      case 4:
        return Icons.design_services_rounded;
      case 5:
      default:
        return Icons.straighten_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF040B16),
        body: Center(
          child: CircularProgressIndicator(color: Color(0xFFD4AF37)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF040B16),
      appBar: AppBar(
        backgroundColor: const Color(0xFF040B16),
        elevation: 0,
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(
            'Espace Atelier Pro & Abonnement',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. TOP ARTISAN IDENTITY HEADER CARD
            _buildArtisanHeaderCard(),
            const SizedBox(height: 16),

            // 2. AVATAR SELECTION CAROUSEL
            _buildAvatarSelectionSection(),
            const SizedBox(height: 16),

            // 3. ANNUAL PRO SUBSCRIPTION TIER (35 000 DZD / 3.5M Centimes)
            _buildSubscriptionCard(),
            const SizedBox(height: 16),

            // 4. WORKSHOP COORDINATES & CARTOUCHE FORM
            _buildWorkshopDetailsForm(),
            const SizedBox(height: 24),

            // SAVE BUTTON
            SizedBox(
              height: 48,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD4AF37),
                  foregroundColor: const Color(0xFF040B16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 4,
                ),
                child: _isSaving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                      )
                    : const FittedBox(
                        fit: BoxFit.scaleDown,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.save_rounded, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'ENREGISTRER LES COORDONNÉES ATELIER',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildArtisanHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0B172B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFD4AF37), Color(0xFFC5A880)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFD4AF37).withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              _getAvatarIcon(_selectedAvatarIndex),
              color: const Color(0xFF040B16),
              size: 32,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Row(
                    children: [
                      Text(
                        _workshopController.text.isNotEmpty
                            ? _workshopController.text
                            : 'Mon Atelier Aluminium',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_rounded, size: 10, color: Color(0xFF10B981)),
                            SizedBox(width: 3),
                            Text(
                              'Agréé',
                              style: TextStyle(
                                fontSize: 9,
                                color: Color(0xFF10B981),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    '${_nameController.text.isNotEmpty ? _nameController.text : "Artisan"} · $_selectedWilaya',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ),
                const SizedBox(height: 3),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    _phoneController.text.isNotEmpty
                        ? _phoneController.text
                        : '0550 12 34 56',
                    style: const TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: Color(0xFFD4AF37),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarSelectionSection() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF081220),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              'AVATAR PROFESSIONNEL DE L\'ATELIER',
              style: TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: FontWeight.bold,
                color: Color(0xFF94A3B8),
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (idx) {
              final isSelected = _selectedAvatarIndex == idx;
              return GestureDetector(
                onTap: () => setState(() => _selectedAvatarIndex = idx),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFD4AF37) : const Color(0xFF0F1B2D),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? const Color(0xFFD4AF37) : const Color(0xFF334155),
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: const Color(0xFFD4AF37).withValues(alpha: 0.3),
                              blurRadius: 8,
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    _getAvatarIcon(idx),
                    color: isSelected ? const Color(0xFF040B16) : Colors.white70,
                    size: 22,
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              ArtisanProfile.presetAvatars[_selectedAvatarIndex]['title'] as String,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFFD4AF37),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F2547), Color(0xFF0A1830)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFD4AF37).withValues(alpha: 0.4), width: 1.2),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFD4AF37).withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Flexible(
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.workspace_premium_rounded, color: Color(0xFFD4AF37), size: 18),
                      SizedBox(width: 6),
                      Text(
                        'ABONNEMENT ATELIER PRO',
                        style: TextStyle(
                          fontSize: 12,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFD4AF37),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: const Text(
                  'Actif · 1 An',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF10B981),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  '35 000 DZD',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                SizedBox(width: 6),
                Text(
                  '/ an (3,5 Millions de Centimes)',
                  style: TextStyle(
                    fontSize: 13,
                    color: Color(0xFFC5A880),
                    fontFamily: 'Inter',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Formule complète pour maîtres ateliers : calculs illimités, plans de débitage, devis proforma WhatsApp certifiés et exports G-Code scies CNC.',
            style: TextStyle(
              fontSize: 11,
              color: Color(0xFF94A3B8),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    children: [
                      Icon(Icons.payment_rounded, size: 14, color: Color(0xFFD4AF37)),
                      SizedBox(width: 6),
                      Text(
                        'Paiement : BaridiMob · CCP · CIB / Edahabia',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Activation instantanée sur présentation du reçu BaridiMob.',
                  style: TextStyle(
                    fontSize: 10,
                    color: Color(0xFF94A3B8),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWorkshopDetailsForm() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF081220),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              'COORDONNÉES DE L\'ATELIER (CARTOUCHE DEVIS)',
              style: TextStyle(
                fontSize: 11,
                fontFamily: 'monospace',
                fontWeight: FontWeight.bold,
                color: Color(0xFF94A3B8),
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 12),
          _buildTextField(
            label: 'Raison sociale de l\'atelier',
            controller: _workshopController,
            icon: Icons.storefront_rounded,
            hint: 'Ex: Atelier Aluminium Kouba',
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: 'Nom du responsable / artisan',
            controller: _nameController,
            icon: Icons.person_rounded,
            hint: 'Ex: Mourad Hadj-Ali',
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: 'Téléphone Atelier (WhatsApp)',
            controller: _phoneController,
            icon: Icons.phone_rounded,
            hint: '0550 12 34 56',
            keyboardType: TextInputType.phone,
          ),
          const SizedBox(height: 10),
          // Wilaya Dropdown
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Wilaya d\'implantation',
                style: TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF040B16),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF1E293B)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedWilaya,
                    isExpanded: true,
                    dropdownColor: const Color(0xFF0B172B),
                    icon: const Icon(Icons.keyboard_arrow_down_rounded, color: Color(0xFFD4AF37)),
                    items: _wilayasList.map((w) {
                      return DropdownMenuItem(
                        value: w,
                        child: Text(
                          w,
                          style: const TextStyle(fontSize: 12, color: Colors.white),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() => _selectedWilaya = val);
                      }
                    },
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: 'NIF Fiscal (Optionnel)',
            controller: _nifController,
            icon: Icons.receipt_long_rounded,
            hint: 'Ex: 001916012345678',
          ),
          const SizedBox(height: 10),
          _buildTextField(
            label: 'Registre de Commerce - RC (Optionnel)',
            controller: _rcController,
            icon: Icons.business_center_rounded,
            hint: 'Ex: 16/00-1234567B19',
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8), fontFamily: 'monospace'),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: const Color(0xFF040B16),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(fontSize: 12, color: Colors.white),
            decoration: InputDecoration(
              isDense: true,
              prefixIcon: Icon(icon, size: 16, color: const Color(0xFF64748B)),
              hintText: hint,
              hintStyle: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
            ),
          ),
        ),
      ],
    );
  }
}

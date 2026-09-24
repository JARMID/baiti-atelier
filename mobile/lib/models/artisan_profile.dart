class ArtisanProfile {
  final String id;
  final String name;
  final String workshopName;
  final String phone;
  final String wilaya;
  final String role;
  final int avatarIndex;
  final String? nif;
  final String? rc;
  final bool isSubscriptionActive;
  final String subscriptionExpiry;
  final String subscriptionTier;

  const ArtisanProfile({
    required this.id,
    required this.name,
    required this.workshopName,
    required this.phone,
    required this.wilaya,
    this.role = 'Maître Artisan Fabricant',
    this.avatarIndex = 0,
    this.nif,
    this.rc,
    this.isSubscriptionActive = true,
    this.subscriptionExpiry = '2027-09-24',
    this.subscriptionTier = 'Abonnement Atelier Pro (35 000 DZD / an)',
  });

  static const List<Map<String, dynamic>> presetAvatars = [
    {
      'id': 0,
      'title': 'Maître Artisan Aluminium',
      'role': 'Fabrication Châssis & RPT',
      'icon': 'hardware',
    },
    {
      'id': 1,
      'title': 'Bureau d’Études & Chiffrage',
      'role': 'Calcul & Optimisation',
      'icon': 'architecture',
    },
    {
      'id': 2,
      'title': 'Ébéniste d’Art & Agencement',
      'role': 'Cuisines & Meubles MDF',
      'icon': 'carpenter',
    },
    {
      'id': 3,
      'title': 'Ferronnier & Métallerie',
      'role': 'Portails & Garde-corps',
      'icon': 'precision_manufacturing',
    },
    {
      'id': 4,
      'title': 'Architecte & Menuisier',
      'role': 'Façades & Murs-rideaux',
      'icon': 'design_services',
    },
    {
      'id': 5,
      'title': 'Technicien Poseur Chantier',
      'role': 'Prise de Cotes Laser',
      'icon': 'straighten',
    },
  ];

  static ArtisanProfile defaultProfile() {
    return const ArtisanProfile(
      id: 'artisan-kouba-16',
      name: 'Mourad Hadj-Ali',
      workshopName: 'Atelier Aluminium Kouba',
      phone: '0550 12 34 56',
      wilaya: '16 - Alger',
      role: 'Maître Artisan Fabricant',
      avatarIndex: 0,
      nif: '001916012345678',
      rc: '16/00-1234567B19',
      isSubscriptionActive: true,
      subscriptionExpiry: '24/09/2027',
      subscriptionTier: 'Atelier Pro Annuel · 35 000 DZD (3,5 M Centimes)',
    );
  }

  ArtisanProfile copyWith({
    String? id,
    String? name,
    String? workshopName,
    String? phone,
    String? wilaya,
    String? role,
    int? avatarIndex,
    String? nif,
    String? rc,
    bool? isSubscriptionActive,
    String? subscriptionExpiry,
    String? subscriptionTier,
  }) {
    return ArtisanProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      workshopName: workshopName ?? this.workshopName,
      phone: phone ?? this.phone,
      wilaya: wilaya ?? this.wilaya,
      role: role ?? this.role,
      avatarIndex: avatarIndex ?? this.avatarIndex,
      nif: nif ?? this.nif,
      rc: rc ?? this.rc,
      isSubscriptionActive: isSubscriptionActive ?? this.isSubscriptionActive,
      subscriptionExpiry: subscriptionExpiry ?? this.subscriptionExpiry,
      subscriptionTier: subscriptionTier ?? this.subscriptionTier,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'workshopName': workshopName,
      'phone': phone,
      'wilaya': wilaya,
      'role': role,
      'avatarIndex': avatarIndex,
      'nif': nif,
      'rc': rc,
      'isSubscriptionActive': isSubscriptionActive,
      'subscriptionExpiry': subscriptionExpiry,
      'subscriptionTier': subscriptionTier,
    };
  }

  factory ArtisanProfile.fromJson(Map<String, dynamic> json) {
    return ArtisanProfile(
      id: json['id'] as String? ?? 'artisan-kouba-16',
      name: json['name'] as String? ?? 'Mourad Hadj-Ali',
      workshopName: json['workshopName'] as String? ?? 'Atelier Aluminium Kouba',
      phone: json['phone'] as String? ?? '0550 12 34 56',
      wilaya: json['wilaya'] as String? ?? '16 - Alger',
      role: json['role'] as String? ?? 'Maître Artisan Fabricant',
      avatarIndex: json['avatarIndex'] as int? ?? 0,
      nif: json['nif'] as String?,
      rc: json['rc'] as String?,
      isSubscriptionActive: json['isSubscriptionActive'] as bool? ?? true,
      subscriptionExpiry: json['subscriptionExpiry'] as String? ?? '24/09/2027',
      subscriptionTier: json['subscriptionTier'] as String? ?? 'Atelier Pro Annuel · 35 000 DZD (3,5 M Centimes)',
    );
  }
}

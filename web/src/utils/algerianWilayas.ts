export interface AlgerianWilaya {
  code: string;
  codeNumber: number;
  nameFr: string;
  nameAr: string;
  nameEn: string;
  region: 'centre' | 'est' | 'ouest' | 'hauts_plateaux' | 'sud' | 'grand_sud';
  industrialZone: string;
  baseDistanceKm: number; // reference distance from coastal hubs (Alger/Oran/Constantine)
  freightTier: 1 | 2 | 3 | 4; // 1 = Coastal core, 2 = Interior/Plateaux, 3 = North Sahara, 4 = Deep Sahara
}

export const ALGERIAN_WILAYAS_58: AlgerianWilaya[] = [
  { code: '01', codeNumber: 1, nameFr: 'Adrar', nameAr: 'أدرار', nameEn: 'Adrar', region: 'grand_sud', industrialZone: 'Zone Artisanale Adrar Ville', baseDistanceKm: 1400, freightTier: 4 },
  { code: '02', codeNumber: 2, nameFr: 'Chlef', nameAr: 'الشلف', nameEn: 'Chlef', region: 'centre', industrialZone: 'Zone Industrielle Oued Sly', baseDistanceKm: 200, freightTier: 1 },
  { code: '03', codeNumber: 3, nameFr: 'Laghouat', nameAr: 'الأغواط', nameEn: 'Laghouat', region: 'hauts_plateaux', industrialZone: 'Zone d’Activité Bouchaker', baseDistanceKm: 400, freightTier: 2 },
  { code: '04', codeNumber: 4, nameFr: 'Oum El Bouaghi', nameAr: 'أم البواقي', nameEn: 'Oum El Bouaghi', region: 'est', industrialZone: 'Zone Industrielle Aïn Beïda', baseDistanceKm: 460, freightTier: 2 },
  { code: '05', codeNumber: 5, nameFr: 'Batna', nameAr: 'باتنة', nameEn: 'Batna', region: 'est', industrialZone: 'Zone Industrielle Kechida', baseDistanceKm: 430, freightTier: 2 },
  { code: '06', codeNumber: 6, nameFr: 'Béjaïa', nameAr: 'بجاية', nameEn: 'Bejaia', region: 'centre', industrialZone: 'Zone Industrielle El Kseur & Akbou', baseDistanceKm: 220, freightTier: 1 },
  { code: '07', codeNumber: 7, nameFr: 'Biskra', nameAr: 'بسكرة', nameEn: 'Biskra', region: 'sud', industrialZone: 'Zone Industrielle Chetma', baseDistanceKm: 420, freightTier: 3 },
  { code: '08', codeNumber: 8, nameFr: 'Béchar', nameAr: 'بشار', nameEn: 'Bechar', region: 'sud', industrialZone: 'Zone d’Activité Debdaba', baseDistanceKm: 950, freightTier: 3 },
  { code: '09', codeNumber: 9, nameFr: 'Blida', nameAr: 'البليدة', nameEn: 'Blida', region: 'centre', industrialZone: 'Zone Industrielle Ben Boulaïd & Boufarik', baseDistanceKm: 45, freightTier: 1 },
  { code: '10', codeNumber: 10, nameFr: 'Bouira', nameAr: 'البويرة', nameEn: 'Bouira', region: 'centre', industrialZone: 'Zone Industrielle Sidi Khaled', baseDistanceKm: 120, freightTier: 1 },
  { code: '11', codeNumber: 11, nameFr: 'Tamanrasset', nameAr: 'تمنراست', nameEn: 'Tamanrasset', region: 'grand_sud', industrialZone: 'Zone Artisanale In Kouf', baseDistanceKm: 1900, freightTier: 4 },
  { code: '12', codeNumber: 12, nameFr: 'Tébessa', nameAr: 'تبسة', nameEn: 'Tebessa', region: 'est', industrialZone: 'Zone Industrielle Bekkaria', baseDistanceKm: 580, freightTier: 2 },
  { code: '13', codeNumber: 13, nameFr: 'Tlemcen', nameAr: 'تلمسان', nameEn: 'Tlemcen', region: 'ouest', industrialZone: 'Zone Industrielle Chetouane', baseDistanceKm: 510, freightTier: 2 },
  { code: '14', codeNumber: 14, nameFr: 'Tiaret', nameAr: 'تيارت', nameEn: 'Tiaret', region: 'hauts_plateaux', industrialZone: 'Zone Industrielle Zaâroura', baseDistanceKm: 280, freightTier: 2 },
  { code: '15', codeNumber: 15, nameFr: 'Tizi Ouzou', nameAr: 'تيزي وزو', nameEn: 'Tizi Ouzou', region: 'centre', industrialZone: 'Zone Industrielle Oued Aïssi', baseDistanceKm: 100, freightTier: 1 },
  { code: '16', codeNumber: 16, nameFr: 'Alger', nameAr: 'الجزائر', nameEn: 'Algiers', region: 'centre', industrialZone: 'Pôle Industriel Oued Smar & Rouiba', baseDistanceKm: 10, freightTier: 1 },
  { code: '17', codeNumber: 17, nameFr: 'Djelfa', nameAr: 'الجلفة', nameEn: 'Djelfa', region: 'hauts_plateaux', industrialZone: 'Zone Industrielle Moudjbara', baseDistanceKm: 300, freightTier: 2 },
  { code: '18', codeNumber: 18, nameFr: 'Jijel', nameAr: 'جيجل', nameEn: 'Jijel', region: 'est', industrialZone: 'Zone Industrielle Ouled Salah & Bellara', baseDistanceKm: 340, freightTier: 1 },
  { code: '19', codeNumber: 19, nameFr: 'Sétif', nameAr: 'سطيف', nameEn: 'Setif', region: 'est', industrialZone: 'Zone Industrielle El Eulma & Sétif Est', baseDistanceKm: 300, freightTier: 1 },
  { code: '20', codeNumber: 20, nameFr: 'Saïda', nameAr: 'سعيدة', nameEn: 'Saida', region: 'ouest', industrialZone: 'Zone Industrielle Boukhors', baseDistanceKm: 420, freightTier: 2 },
  { code: '21', codeNumber: 21, nameFr: 'Skikda', nameAr: 'سكيكدة', nameEn: 'Skikda', region: 'est', industrialZone: 'Zone Industrielle Hamrouche Hamoudi', baseDistanceKm: 480, freightTier: 1 },
  { code: '22', codeNumber: 22, nameFr: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', nameEn: 'Sidi Bel Abbes', region: 'ouest', industrialZone: 'Zone Industrielle Sidi Bel Abbès Sud', baseDistanceKm: 440, freightTier: 2 },
  { code: '23', codeNumber: 23, nameFr: 'Annaba', nameAr: 'عنابة', nameEn: 'Annaba', region: 'est', industrialZone: 'Zone Industrielle Pont Bouchet & El Hadjar', baseDistanceKm: 550, freightTier: 1 },
  { code: '24', codeNumber: 24, nameFr: 'Guelma', nameAr: 'قالمة', nameEn: 'Guelma', region: 'est', industrialZone: 'Zone Industrielle Belkheir', baseDistanceKm: 500, freightTier: 2 },
  { code: '25', codeNumber: 25, nameFr: 'Constantine', nameAr: 'قسنطينة', nameEn: 'Constantine', region: 'est', industrialZone: 'Zone Industrielle Oued Hamimime & Palma', baseDistanceKm: 390, freightTier: 1 },
  { code: '26', codeNumber: 26, nameFr: 'Médéa', nameAr: 'المدية', nameEn: 'Medea', region: 'centre', industrialZone: 'Zone Industrielle Ouzera', baseDistanceKm: 85, freightTier: 1 },
  { code: '27', codeNumber: 27, nameFr: 'Mostaganem', nameAr: 'مستغانم', nameEn: 'Mostaganem', region: 'ouest', industrialZone: 'Zone Industrielle Fornaka & Mesra', baseDistanceKm: 330, freightTier: 1 },
  { code: '28', codeNumber: 28, nameFr: "M'Sila", nameAr: 'المسيلة', nameEn: 'MSila', region: 'hauts_plateaux', industrialZone: 'Zone Industrielle Magra', baseDistanceKm: 240, freightTier: 2 },
  { code: '29', codeNumber: 29, nameFr: 'Mascara', nameAr: 'معسكر', nameEn: 'Mascara', region: 'ouest', industrialZone: 'Zone Industrielle Mamounia', baseDistanceKm: 360, freightTier: 2 },
  { code: '30', codeNumber: 30, nameFr: 'Ouargla', nameAr: 'ورقلة', nameEn: 'Ouargla', region: 'sud', industrialZone: 'Zone Industrielle Hassi Messaoud', baseDistanceKm: 780, freightTier: 3 },
  { code: '31', codeNumber: 31, nameFr: 'Oran', nameAr: 'وهران', nameEn: 'Oran', region: 'ouest', industrialZone: 'Pôle Industriel Es Senia & Hassi Ameur', baseDistanceKm: 410, freightTier: 1 },
  { code: '32', codeNumber: 32, nameFr: 'El Bayadh', nameAr: 'البيض', nameEn: 'El Bayadh', region: 'hauts_plateaux', industrialZone: 'Zone d’Activité El Bayadh Ouest', baseDistanceKm: 520, freightTier: 3 },
  { code: '33', codeNumber: 33, nameFr: 'Illizi', nameAr: 'إيليزي', nameEn: 'Illizi', region: 'grand_sud', industrialZone: 'Zone Artisanale Illizi Centre', baseDistanceKm: 1750, freightTier: 4 },
  { code: '34', codeNumber: 34, nameFr: 'Bordj Bou Arreridj', nameAr: 'برج بوعريريج', nameEn: 'Bordj Bou Arreridj', region: 'est', industrialZone: 'Pôle Électronique & Industriel BBA', baseDistanceKm: 220, freightTier: 1 },
  { code: '35', codeNumber: 35, nameFr: 'Boumerdès', nameAr: 'بومرداس', nameEn: 'Boumerdes', region: 'centre', industrialZone: 'Zone Industrielle Corso & Boudouaou', baseDistanceKm: 45, freightTier: 1 },
  { code: '36', codeNumber: 36, nameFr: 'El Tarf', nameAr: 'الطارف', nameEn: 'El Tarf', region: 'est', industrialZone: 'Zone Industrielle El Matroha', baseDistanceKm: 620, freightTier: 2 },
  { code: '37', codeNumber: 37, nameFr: 'Tindouf', nameAr: 'تندوف', nameEn: 'Tindouf', region: 'grand_sud', industrialZone: 'Zone Artisanale Oued El Mhiriz', baseDistanceKm: 1800, freightTier: 4 },
  { code: '38', codeNumber: 38, nameFr: 'Tissemsilt', nameAr: 'تيسمسيلت', nameEn: 'Tissemsilt', region: 'hauts_plateaux', industrialZone: 'Zone d’Activité Tissemsilt Nord', baseDistanceKm: 220, freightTier: 2 },
  { code: '39', codeNumber: 39, nameFr: 'El Oued', nameAr: 'الوادي', nameEn: 'El Oued', region: 'sud', industrialZone: 'Zone Industrielle Kouinine', baseDistanceKm: 620, freightTier: 3 },
  { code: '40', codeNumber: 40, nameFr: 'Khenchela', nameAr: 'خنشلة', nameEn: 'Khenchela', region: 'est', industrialZone: 'Zone Industrielle Baghaï', baseDistanceKm: 500, freightTier: 2 },
  { code: '41', codeNumber: 41, nameFr: 'Souk Ahras', nameAr: 'سوق أهراس', nameEn: 'Souk Ahras', region: 'est', industrialZone: 'Zone Industrielle M’Daourouch', baseDistanceKm: 560, freightTier: 2 },
  { code: '42', codeNumber: 42, nameFr: 'Tipaza', nameAr: 'تيبازة', nameEn: 'Tipaza', region: 'centre', industrialZone: 'Zone d’Activité Koléa & Hadjout', baseDistanceKm: 70, freightTier: 1 },
  { code: '43', codeNumber: 43, nameFr: 'Mila', nameAr: 'ميلة', nameEn: 'Mila', region: 'est', industrialZone: 'Zone Industrielle Tadjenanet & Chelghoum', baseDistanceKm: 360, freightTier: 2 },
  { code: '44', codeNumber: 44, nameFr: 'Aïn Defla', nameAr: 'عين الدفلى', nameEn: 'Ain Defla', region: 'centre', industrialZone: 'Zone Industrielle Khemis Miliana', baseDistanceKm: 145, freightTier: 1 },
  { code: '45', codeNumber: 45, nameFr: 'Naâma', nameAr: 'النعامة', nameEn: 'Naama', region: 'hauts_plateaux', industrialZone: 'Zone d’Activité Mécheria', baseDistanceKm: 650, freightTier: 3 },
  { code: '46', codeNumber: 46, nameFr: 'Aïn Témouchent', nameAr: 'عين تموشنت', nameEn: 'Ain Temouchent', region: 'ouest', industrialZone: 'Zone Industrielle Tamzoura', baseDistanceKm: 480, freightTier: 2 },
  { code: '47', codeNumber: 47, nameFr: 'Ghardaïa', nameAr: 'غرداية', nameEn: 'Ghardaia', region: 'sud', industrialZone: 'Zone Industrielle Bounoura & Guerrara', baseDistanceKm: 590, freightTier: 3 },
  { code: '48', codeNumber: 48, nameFr: 'Relizane', nameAr: 'غليزان', nameEn: 'Relizane', region: 'ouest', industrialZone: 'Parc Industriel Sidi Khettab', baseDistanceKm: 290, freightTier: 1 },
  { code: '49', codeNumber: 49, nameFr: 'Timimoun', nameAr: 'تيميمون', nameEn: 'Timimoun', region: 'grand_sud', industrialZone: 'Zone Artisanale Gourara', baseDistanceKm: 1200, freightTier: 4 },
  { code: '50', codeNumber: 50, nameFr: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', nameEn: 'Bordj Badji Mokhtar', region: 'grand_sud', industrialZone: 'Zone Artisanale Frontalière', baseDistanceKm: 2100, freightTier: 4 },
  { code: '51', codeNumber: 51, nameFr: 'Ouled Djellal', nameAr: 'أولاد جلال', nameEn: 'Ouled Djellal', region: 'sud', industrialZone: 'Zone d’Activité Sidi Khaled', baseDistanceKm: 390, freightTier: 2 },
  { code: '52', codeNumber: 52, nameFr: 'Béni Abbès', nameAr: 'بني عباس', nameEn: 'Beni Abbes', region: 'sud', industrialZone: 'Zone Artisanale Saoura', baseDistanceKm: 1180, freightTier: 4 },
  { code: '53', codeNumber: 53, nameFr: 'In Salah', nameAr: 'عين صالح', nameEn: 'In Salah', region: 'grand_sud', industrialZone: 'Zone d’Activité Tidikelt', baseDistanceKm: 1250, freightTier: 4 },
  { code: '54', codeNumber: 54, nameFr: 'In Guezzam', nameAr: 'عين قزام', nameEn: 'In Guezzam', region: 'grand_sud', industrialZone: 'Zone Logistique Frontalière', baseDistanceKm: 2350, freightTier: 4 },
  { code: '55', codeNumber: 55, nameFr: 'Touggourt', nameAr: 'تقرت', nameEn: 'Touggourt', region: 'sud', industrialZone: 'Zone Industrielle Zaouia El Abidia', baseDistanceKm: 610, freightTier: 3 },
  { code: '56', codeNumber: 56, nameFr: 'Djanet', nameAr: 'جانت', nameEn: 'Djanet', region: 'grand_sud', industrialZone: 'Zone Artisanale Tassili', baseDistanceKm: 2100, freightTier: 4 },
  { code: '57', codeNumber: 57, nameFr: "El M'Ghair", nameAr: 'المغير', nameEn: 'El MGhair', region: 'sud', industrialZone: 'Zone d’Activité Oued Righ', baseDistanceKm: 550, freightTier: 3 },
  { code: '58', codeNumber: 58, nameFr: 'El Meniaa', nameAr: 'المنيعة', nameEn: 'El Meniaa', region: 'sud', industrialZone: 'Zone d’Activité Hassi El Gara', baseDistanceKm: 860, freightTier: 3 },
];

export interface DeliveryEstimate {
  wilaya: AlgerianWilaya;
  deliveryMode: 'workshop_pickup' | 'wilaya_hub' | 'direct_site' | 'express_crane';
  baseCostDzd: number;
  weightSurchargeDzd: number;
  craneSurchargeDzd: number;
  totalCostDzd: number;
  estimatedDays: string;
}

/**
 * Finds a Wilaya by its two-digit code or number
 */
export function getWilayaByCode(code: string | number): AlgerianWilaya | undefined {
  const codeStr = typeof code === 'number' ? code.toString().padStart(2, '0') : code.trim().padStart(2, '0');
  return ALGERIAN_WILAYAS_58.find((w) => w.code === codeStr);
}

/**
 * Finds a Wilaya by partial match of its name or code string (e.g. "16 - Alger")
 */
export function parseWilayaString(input: string): AlgerianWilaya {
  if (!input) return ALGERIAN_WILAYAS_58[15]; // Default to Alger
  const trimmed = input.trim();
  const codeMatch = trimmed.match(/^(\d{1,2})/);
  if (codeMatch) {
    const found = getWilayaByCode(codeMatch[1]);
    if (found) return found;
  }
  const cleanName = trimmed.toLowerCase();
  const foundByName = ALGERIAN_WILAYAS_58.find(
    (w) =>
      w.nameFr.toLowerCase().includes(cleanName) ||
      w.nameAr.includes(trimmed) ||
      w.nameEn.toLowerCase().includes(cleanName)
  );
  return foundByName || ALGERIAN_WILAYAS_58[15];
}

/**
 * Formats a Wilaya for display in dropdowns according to user language
 */
export function formatWilayaLabel(wilaya: AlgerianWilaya, language: 'fr' | 'ar' | 'en'): string {
  if (language === 'ar') {
    return `${wilaya.code} - ${wilaya.nameAr}`;
  }
  if (language === 'en') {
    return `${wilaya.code} - ${wilaya.nameEn}`;
  }
  return `${wilaya.code} - ${wilaya.nameFr}`;
}

/**
 * Computes exact logistics freight cost across Algerian Wilayas
 */
export function calculateWilayaLogistics(
  wilayaCode: string | number,
  totalWeightKg: number = 35,
  deliveryMode: 'workshop_pickup' | 'wilaya_hub' | 'direct_site' | 'express_crane' = 'direct_site'
): DeliveryEstimate {
  const wilaya = getWilayaByCode(wilayaCode) || ALGERIAN_WILAYAS_58[15];

  if (deliveryMode === 'workshop_pickup') {
    return {
      wilaya,
      deliveryMode,
      baseCostDzd: 0,
      weightSurchargeDzd: 0,
      craneSurchargeDzd: 0,
      totalCostDzd: 0,
      estimatedDays: 'Immédiat (À l’atelier)',
    };
  }

  // Base cost per freight tier
  const tierRates: Record<number, { hub: number; site: number; days: string }> = {
    1: { hub: 2200, site: 3800, days: '24 - 48h' },
    2: { hub: 3500, site: 5800, days: '2 - 3 jours' },
    3: { hub: 5500, site: 9200, days: '3 - 5 jours' },
    4: { hub: 8500, site: 14500, days: '5 - 7 jours' },
  };

  const currentTier = tierRates[wilaya.freightTier] || tierRates[1];
  const baseCostDzd = deliveryMode === 'wilaya_hub' ? currentTier.hub : currentTier.site;

  // Weight surcharge: 15 DZD per kg over 50kg for coastal/plateaux, 35 DZD for deep south
  const excessKg = Math.max(0, totalWeightKg - 50);
  const ratePerExcessKg = wilaya.freightTier >= 3 ? 35 : 15;
  const weightSurchargeDzd = Math.round(excessKg * ratePerExcessKg);

  // Crane or glass pupitre unloading surcharge for heavy openings
  const craneSurchargeDzd = deliveryMode === 'express_crane' ? 6500 : 0;

  const totalCostDzd = baseCostDzd + weightSurchargeDzd + craneSurchargeDzd;

  return {
    wilaya,
    deliveryMode,
    baseCostDzd,
    weightSurchargeDzd,
    craneSurchargeDzd,
    totalCostDzd,
    estimatedDays: currentTier.days,
  };
}

import React, { useState } from 'react';
import type { Workshop } from '../../types/window';
import { useConfigStore } from '../../store/configStore';
import { MapPin, Star, ShieldCheck, MessageCircle, Send, Phone, Search, ExternalLink } from 'lucide-react';
import { WorkshopDetailModal } from '../marketplace/WorkshopDetailModal';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';

const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: 'w1',
    name: 'Atelier Alum Moderne Kouba',
    ownerName: 'Mourad Hadj-Ali',
    wilaya: '16 - Alger',
    wilayaCode: 16,
    commune: 'Kouba (Garidi)',
    address: 'Cité Garidi 1, Bt 14, Kouba, Alger',
    phone: '+213550123456',
    whatsappPhone: '213550123456',
    telegramHandle: 'atelier_kouba_alu',
    rating: 4.9,
    reviewCount: 42,
    verified: true,
    specialties: ['Gamme 45 RPT', 'Baies Coulissantes', 'Double Vitrage Stop-Sol'],
    avatarUrl: '/branding/baiti_sculpture_3d.jpg',
    projectCount: 168,
    bio: '15 ans d’expérience dans la fabrication et pose de menuiseries aluminium haut de gamme dans la wilaya d’Alger.',
  },
  {
    id: 'w2',
    name: 'Menuiserie Alu & PVC El Bahia',
    ownerName: 'Abdelkader Benaissa',
    wilaya: '31 - Oran',
    wilayaCode: 31,
    commune: 'Es Senia',
    address: 'Zone Artisanale Es Senia, Oran',
    phone: '+213661987654',
    whatsappPhone: '213661987654',
    telegramHandle: 'elbahia_alu',
    rating: 4.8,
    reviewCount: 38,
    verified: true,
    specialties: ['Coulissant 3 Rails', 'Volets Roulants Motorisés', 'Portes Blindées'],
    avatarUrl: '/branding/baiti_emblem_3d.jpg',
    projectCount: 210,
    bio: 'Atelier équipé de scies à double tête et sertisseuses automatiques pour chantiers résidentiels et tertiaires.',
  },
  {
    id: 'w3',
    name: 'Cirta Profils & Verre',
    ownerName: 'Tarek Boukhedena',
    wilaya: '25 - Constantine',
    wilayaCode: 25,
    commune: 'Ali Mendjeli',
    address: 'UV 05, Ville Nouvelle Ali Mendjeli, Constantine',
    phone: '+213770456789',
    whatsappPhone: '213770456789',
    rating: 4.7,
    reviewCount: 29,
    verified: true,
    specialties: ['PVC Multi-chambres', 'Isolation Phonique', 'Vérandas'],
    avatarUrl: '/branding/baiti_app_icon.jpg',
    projectCount: 125,
    bio: 'Fabrication certifiée selon normes d’isolation thermique rigoureuses adaptées au climat de Constantine.',
  },
  {
    id: 'w4',
    name: 'Menuiserie Sétifienne des Plateaux',
    ownerName: 'Sofiane Merzoug',
    wilaya: '19 - Sétif',
    wilayaCode: 19,
    commune: 'Sétif Zone Industrielle',
    address: 'Zone Industrielle 1ère Tranche, Sétif',
    phone: '+213552345678',
    whatsappPhone: '213552345678',
    telegramHandle: 'setif_alu_pro',
    rating: 4.9,
    reviewCount: 54,
    verified: true,
    specialties: ['Menuiserie Mixte Alu-Bois', 'Gamme 67 Renforcée', 'Mur Rideau'],
    avatarUrl: '/branding/baiti_floating_emblem.jpg',
    projectCount: 310,
    bio: 'Leader régional en fourniture et pose de fenêtres thermiques et façades vitrées.',
  },
  {
    id: 'w5',
    name: 'Atelier Djurdjura Menuiserie',
    ownerName: 'Lounes Ait-Ahmed',
    wilaya: '15 - Tizi Ouzou',
    wilayaCode: 15,
    commune: 'Nouvelle Ville',
    address: 'Boulevard Stiti, Nouvelle Ville, Tizi Ouzou',
    phone: '+213662887766',
    whatsappPhone: '213662887766',
    rating: 4.8,
    reviewCount: 31,
    verified: true,
    specialties: ['Gamme 40 Éco', 'Volet Traditionnel', 'Garde-Corps Alu'],
    avatarUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80',
    projectCount: 140,
    bio: 'Artisan spécialisé dans la rénovation d’appartements et villas privées avec finitions soignées.',
  },
  {
    id: 'w6',
    name: 'Mitidja Vitrage & Profils',
    ownerName: 'Karim Zerrouki',
    wilaya: '09 - Blida',
    wilayaCode: 9,
    commune: 'Ouled Yaïch',
    address: 'Route Nationale 1, Ouled Yaïch, Blida',
    phone: '+213558112233',
    whatsappPhone: '213558112233',
    rating: 4.6,
    reviewCount: 22,
    verified: true,
    specialties: ['Portes Sectionnelles', 'Vitrines Magasins', 'Châssis Fixes'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    projectCount: 95,
    bio: 'Atelier réactif pour travaux urgents, vitrines de commerces et menuiseries industrielles.',
  },
];

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%230B101D'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%23D4AF37'/%3E%3Cpath d='M40 170c0-35 30-50 60-50s60 15 60 50' fill='%23D4AF37'/%3E%3C/svg%3E";

export const WorkshopsMarketplace: React.FC = () => {
  const { selectedWilaya, config, cost, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkshopForModal, setSelectedWorkshopForModal] = useState<Workshop | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const filteredWorkshops = MOCK_WORKSHOPS.filter((workshop) => {
    const wilayaClean = selectedWilaya.split(' - ')[1] || selectedWilaya;
    const matchesWilaya =
      selectedWilaya === 'Toutes les Wilayas' ||
      workshop.wilaya === selectedWilaya ||
      workshop.wilaya.toLowerCase().includes(wilayaClean.toLowerCase());

    const matchesSearch =
      searchQuery === '' ||
      workshop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWilaya && matchesSearch;
  });

  const sendDirectWhatsApp = (workshop: Workshop) => {
    playClampSound();
    let messageText = '';
    if (language === 'ar') {
      messageText =
        `السلام عليكم أخي ${workshop.ownerName}، أتواصل معك عبر منصة Baiti Atelier | بيتي بخصوص مشروع نجارة في ${workshop.commune} :\n` +
        `• النوع: ${config.openingType}\n` +
        `• المقاسات: ${config.width} × ${config.height} ملم\n` +
        `• الدهان: ${config.finishColor} | الزجاج: ${config.glassType}\n` +
        `• التكلفة التقديرية: ~${cost.totalEstimatedDzd.toLocaleString()} دج\n` +
        `هل أنت متاح لزيارة تقنية أو تقديم كشف حساب نهائي؟ شكراً.`;
    } else if (language === 'en') {
      messageText =
        `Hello ${workshop.ownerName}, contacting you through Baiti Atelier | بيتي for a joinery project in ${workshop.commune}:\n` +
        `• Type: ${config.openingType}\n` +
        `• Dimensions: ${config.width} x ${config.height} mm\n` +
        `• Finish: ${config.finishColor} | Glazing: ${config.glassType}\n` +
        `• Estimated Quote: ~${cost.totalEstimatedDzd.toLocaleString()} DZD\n` +
        `Are you available for a site measurement or finalized quote? Thank you.`;
    } else {
      messageText =
        `Salam ${workshop.ownerName}, je vous contacte via Baiti Atelier | بيتي pour un projet de menuiserie à ${workshop.commune} :\n` +
        `• Type: ${config.openingType}\n` +
        `• Dimensions: ${config.width} x ${config.height} mm\n` +
        `• Finition: ${config.finishColor} | Vitrage: ${config.glassType}\n` +
        `• Estimation indicative: ~${cost.totalEstimatedDzd.toLocaleString()} DZD\n` +
        `Êtes-vous disponible pour une visite technique ou un devis précis ? Merci.`;
    }
    const text = encodeURIComponent(messageText);
    window.open(`https://wa.me/${workshop.whatsappPhone}?text=${text}`, '_blank');
  };

  const badgeText =
    language === 'ar'
      ? 'شبكة الحرفيين والورشات المؤهلة'
      : language === 'en'
      ? 'Qualified Artisan Network'
      : 'Réseau d’Artisans Qualifiés';

  const titleText =
    language === 'ar'
      ? 'ورشات ومصانع محلية معتمدة'
      : language === 'en'
      ? 'Verified Local Workshops & Makers'
      : 'Ateliers et Fabricants Locaux';

  const descText =
    language === 'ar'
      ? 'تواصل مباشرة مع حرفيي النجارة المؤهلين في الجزائر. بدون وسطاء، اتصال فوري عبر واتساب، تيليغرام أو الهاتف.'
      : language === 'en'
      ? 'Connect directly with verified carpenters and joiners in Algeria. Zero intermediaries, direct contact via WhatsApp, Telegram, or phone.'
      : 'Prenez contact directement avec des menuisiers vérifiés en Algérie. Pas d’intermédiaires, contact direct par WhatsApp, Telegram ou appel.';

  const searchPlaceholder =
    language === 'ar'
      ? 'ابحث بالورشة، البلدية أو التخصص...'
      : language === 'en'
      ? 'Search workshop, commune, specialty...'
      : 'Rechercher atelier, spécialité...';

  const portfolioBtnText =
    language === 'ar'
      ? 'معرض الأعمال والعتاد'
      : language === 'en'
      ? 'Portfolio & Machinery'
      : 'Portfolio & Parc Machines';

  const callBtnText = language === 'ar' ? 'اتصال' : language === 'en' ? 'Call' : 'Appel';

  return (
    <section
      id="workshops"
      className={`py-20 border-t relative transition-colors duration-300 ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-xs font-mono text-[#D4AF37] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              {titleText}
            </h2>
            <p
              className={`text-sm mt-1.5 max-w-2xl leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              {descText}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search
                className={`w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                  isRtl ? 'right-3' : 'left-3'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full ${
                  isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
                } py-2 rounded-xl border text-xs focus:outline-none focus:border-[#D4AF37] ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                    : 'bg-white/5 border-white/10 text-white placeholder-zinc-500'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 group hover-lift spotlight-card ${
                isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={workshop.avatarUrl}
                      alt={workshop.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-black/10 dark:border-white/15 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3
                          className={`font-semibold text-sm group-hover:text-[#D4AF37] transition-colors ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {workshop.name}
                        </h3>
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {workshop.ownerName}
                      </p>
                    </div>
                  </div>

                  {workshop.verified && (
                    <span
                      className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                      title="Atelier vérifié sur site"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between mt-4 text-xs font-mono ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>
                      {workshop.commune} ({workshop.wilaya.split(' - ')[0]})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className={`font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                      {workshop.rating}
                    </span>
                    <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      ({workshop.reviewCount})
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs mt-3 line-clamp-2 leading-relaxed ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {workshop.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {workshop.specialties.map((spec) => (
                    <span
                      key={spec}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        isLight
                          ? 'bg-slate-100 border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-300'
                      }`}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className={`pt-4 mt-4 border-t flex flex-col gap-2 ${
                  isLight ? 'border-slate-100' : 'border-white/10'
                }`}
              >
                <button
                  onClick={() => {
                    playTactileClick();
                    setSelectedWorkshopForModal(workshop);
                    setIsDetailModalOpen(true);
                  }}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-press ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{portfolioBtnText}</span>
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => sendDirectWhatsApp(workshop)}
                    className="py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 hover:border-emerald-600 text-emerald-600 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-all cursor-pointer btn-press"
                    title="Envoyer la configuration actuelle sur WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {workshop.telegramHandle ? (
                    <a
                      href={`https://t.me/${workshop.telegramHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => playTactileClick()}
                      className="py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500 border border-sky-500/30 hover:border-sky-500 text-sky-600 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-all btn-press"
                      title="Discuter sur Telegram"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-2 rounded-xl bg-black/5 dark:bg-white/5 text-zinc-400 text-xs font-medium flex items-center justify-center gap-1 cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Telegram</span>
                    </button>
                  )}

                  <a
                    href={`tel:${workshop.phone}`}
                    onClick={() => playTactileClick()}
                    className={`py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1 transition-all btn-press ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                    }`}
                    title="Appeler directement l'atelier"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{callBtnText}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workshop Profile & Portfolio Modal */}
      <WorkshopDetailModal
        workshop={selectedWorkshopForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </section>
  );
};

import React, { useState } from 'react';
import type { Workshop } from '../../types/window';
import { useConfigStore } from '../../store/configStore';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  MessageCircle,
  Phone,
  Wrench,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';

interface WorkshopDetailModalProps {
  workshop: Workshop | null;
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_PROJECT_PHOTOS = [
  {
    title: 'Villa Moderne à Kouba',
    desc: 'Baies vitrées coulissantes Gamme 67 avec double vitrage réfléchissant Stop-Sol et volets électriques.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    trade: 'Aluminium & PVC',
    date: 'Janvier 2026',
  },
  {
    title: 'Résidence Les Orangers, Hydra',
    desc: 'Fenêtres oscillo-battantes avec rupture de pont thermique RPT 52, thermolaquage gris anthracite RAL 7016.',
    image: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&auto=format&fit=crop&q=80',
    trade: 'Menuiserie RPT',
    date: 'Novembre 2025',
  },
  {
    title: 'Restaurant Panoramique, Chéraga',
    desc: 'Façade mur-rideau aluminium en profilés renforcés avec garde-corps vitré en verre trempé 10mm.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80',
    trade: 'Façade Mur-Rideau',
    date: 'Septembre 2025',
  },
];

const MOCK_REVIEWS = [
  {
    author: 'Kamel M.',
    wilaya: 'Alger (Hydra)',
    rating: 5,
    comment: 'Travail très soigné pour les 8 fenêtres de ma villa. Découpe propre, isolation phonique impeccable.',
    date: 'Il y a 2 semaines',
  },
  {
    author: 'Yacine B.',
    wilaya: 'Blida',
    rating: 5,
    comment: 'Artisan ponctuel et professionnel. Le devis généré sur l’application correspondait exactement au prix final.',
    date: 'Il y a 1 mois',
  },
  {
    author: 'Samira T.',
    wilaya: 'Oran',
    rating: 4.8,
    comment: 'Très belle finition des baies coulissantes et volets roulants motorisés très silencieux.',
    date: 'Il y a 2 mois',
  },
];

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%230B101D'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%23D4AF37'/%3E%3Cpath d='M40 170c0-35 30-50 60-50s60 15 60 50' fill='%23D4AF37'/%3E%3C/svg%3E";
const FALLBACK_PROJECT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23131722'/%3E%3Cpath d='M100 80h400v240H100z' fill='none' stroke='%23D4AF37' stroke-width='4'/%3E%3Cpath d='M300 80v240M100 200h400' stroke='%2338BDF8' stroke-width='2' stroke-dasharray='6 6'/%3E%3Ctext x='300' y='210' fill='%23FFFFFF' font-family='sans-serif' font-size='16' text-anchor='middle'%3EBaiti Atelier Alg%C3%A9rie%3C/text%3E%3C/svg%3E";

export const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = ({
  workshop,
  isOpen,
  onClose,
}) => {
  const { config, cost, theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'equipment'>('portfolio');

  if (!isOpen || !workshop) return null;

  const handleSendWhatsAppQuote = () => {
    playClampSound();
    const text =
      language === 'ar'
        ? `السلام عليكم ${workshop.ownerName}، أتواصل معكم عبر منصة Baiti Atelier | بيتي.
أرغب في طلب مقايسة لـ:
- المنتج: نجارة ألمنيوم / PVC
- الأبعاد: ${Math.round(config.width)} × ${Math.round(config.height)} ملم
- السلسلة: ${config.profileSystem}
- الزجاج: ${config.glassType}
- اللون: ${config.finishColor}
- التقدير الأولي للمنصة: ${cost.totalEstimatedDzd.toLocaleString('fr-DZ')} دج
يرجى تأكيد إمكانية أخذ القياسات الميدانية أو اعتماد الورشة.`
        : language === 'en'
        ? `Hello ${workshop.ownerName}, contacting you via the Baiti Atelier | بيتي platform.
I would like to request a quote for:
- Product: Aluminum / PVC Joinery
- Dimensions: ${Math.round(config.width)} x ${Math.round(config.height)} mm
- Profile System: ${config.profileSystem}
- Glazing: ${config.glassType}
- Color: ${config.finishColor}
- Platform Estimate: ${cost.totalEstimatedDzd.toLocaleString('fr-DZ')} DZD
Please confirm your availability for technical measurement or workshop validation.`
        : `Salam Alikoum ${workshop.ownerName}, je vous contacte depuis la plateforme Baiti Atelier | بيتي.
Je souhaite obtenir un devis pour :
- Produit : Menuiserie Aluminium / PVC
- Dimensions : ${Math.round(config.width)} x ${Math.round(config.height)} mm
- Gamme : ${config.profileSystem}
- Vitrage : ${config.glassType}
- Couleur : ${config.finishColor}
- Estimation indicative plateforme : ${cost.totalEstimatedDzd.toLocaleString('fr-DZ')} DZD
Merci de me confirmer vos disponibilités pour une prise de cotes ou validation atelier.`;

    const cleanNumber = workshop.whatsappPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0B0F19] border-white/10 text-white'
        }`}
      >
        {/* Header Hero Banner */}
        <div
          className={`relative p-6 sm:p-8 border-b transition-colors ${
            isLight
              ? 'bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-slate-200'
              : 'bg-gradient-to-r from-[#121829] via-[#1A2238] to-[#0E1424] border-white/10'
          }`}
        >
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`absolute top-4 ${
              isRtl ? 'left-4' : 'right-4'
            } p-2 rounded-xl transition-colors cursor-pointer btn-press ${
              isLight
                ? 'bg-slate-200/80 hover:bg-slate-300 text-slate-700 border border-slate-300'
                : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={workshop.avatarUrl}
              alt={workshop.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_AVATAR;
              }}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37]/40 shadow-xl"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {workshop.name}
                </h3>
                {workshop.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {language === 'ar'
                        ? 'ورشة معتمدة بالجزائر'
                        : language === 'en'
                        ? 'Certified Algerian Workshop'
                        : 'Atelier Certifié Algérie'}
                    </span>
                  </span>
                )}
              </div>

              <div className={`flex flex-wrap items-center gap-4 text-xs font-mono mt-2 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-zinc-300'}`}>
                  {workshop.ownerName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{workshop.address}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{workshop.rating}</span>
                  <span className={`font-normal ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    ({workshop.reviewCount}{' '}
                    {language === 'ar' ? 'تقييم' : language === 'en' ? 'reviews' : 'avis'})
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {workshop.specialties.map((spec) => (
                  <span
                    key={spec}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-700 shadow-xs'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div
          className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0E1424] border-white/5'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => {
                playSwitchSound();
                setActiveTab('portfolio');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer btn-press ${
                activeTab === 'portfolio'
                  ? 'bg-[#D4AF37] text-white font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-zinc-400 hover:text-white bg-white/5'
              }`}
            >
              <ImageIcon className={`w-3.5 h-3.5 inline ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
              {language === 'ar'
                ? `الإنجازات (${MOCK_PROJECT_PHOTOS.length})`
                : language === 'en'
                ? `Portfolio (${MOCK_PROJECT_PHOTOS.length})`
                : `Réalisations (${MOCK_PROJECT_PHOTOS.length})`}
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setActiveTab('equipment');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer btn-press ${
                activeTab === 'equipment'
                  ? 'bg-[#D4AF37] text-white font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-zinc-400 hover:text-white bg-white/5'
              }`}
            >
              <Wrench className={`w-3.5 h-3.5 inline ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
              {language === 'ar' ? 'العتاد والآلات' : language === 'en' ? 'Machinery' : 'Parc Machines'}
            </button>
            <button
              onClick={() => {
                playSwitchSound();
                setActiveTab('reviews');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer btn-press ${
                activeTab === 'reviews'
                  ? 'bg-[#D4AF37] text-white font-bold shadow-sm'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
                  : 'text-zinc-400 hover:text-white bg-white/5'
              }`}
            >
              <Star className={`w-3.5 h-3.5 inline ${isRtl ? 'ml-1.5' : 'mr-1.5'}`} />
              {language === 'ar'
                ? `التقييمات (${workshop.reviewCount})`
                : language === 'en'
                ? `Reviews (${workshop.reviewCount})`
                : `Avis Clients (${workshop.reviewCount})`}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSendWhatsAppQuote}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer btn-press hover-lift"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {language === 'ar'
                  ? 'مراسلة واتساب'
                  : language === 'en'
                  ? 'WhatsApp Quote'
                  : 'Devis Direct WhatsApp'}
              </span>
            </button>

            <a
              href={`tel:${workshop.phone}`}
              onClick={() => playTactileClick()}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all btn-press ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                  : 'bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/15'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{workshop.phone}</span>
            </a>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          {/* TAB 1: PORTFOLIO GALLERY */}
          {activeTab === 'portfolio' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'ar'
                    ? 'أحدث المشاريع المسلّمة في الجزائر'
                    : language === 'en'
                    ? 'Recent Completed Projects in Algeria'
                    : 'Chantiers Récents Livrés en Algérie'}
                </h4>
                <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  {workshop.projectCount}{' '}
                  {language === 'ar' ? 'مشروع منجز' : language === 'en' ? 'projects completed' : 'projets réalisés'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_PROJECT_PHOTOS.map((p, idx) => (
                  <div
                    key={idx}
                    className={`group rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-md hover-lift ${
                      isLight
                        ? 'bg-white border-slate-200 hover:border-[#D4AF37]/50 shadow-sm'
                        : 'bg-zinc-900/90 border-white/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_PROJECT_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono text-[10px]">
                        {p.trade}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h5
                          className={`text-sm font-bold group-hover:text-[#D4AF37] transition-colors ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {p.title}
                        </h5>
                        <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                          {p.desc}
                        </p>
                      </div>

                      <div
                        className={`flex items-center justify-between text-[11px] font-mono pt-3 mt-3 border-t ${
                          isLight ? 'border-slate-100 text-slate-500' : 'border-white/5 text-zinc-500'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.date}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {language === 'ar' ? 'مطابق 100%' : language === 'en' ? '100% Compliant' : '100% Conforme'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: WORKSHOP EQUIPMENT */}
          {activeTab === 'equipment' && (
            <div className="flex flex-col gap-4">
              <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'ar'
                  ? 'عتاد وآلات خط التصنيع'
                  : language === 'en'
                  ? 'Production Machinery & Tooling'
                  : 'Outillage & Équipements de Production'}
              </h4>
              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {language === 'ar'
                  ? 'تتوفر هذه الورشة على آلات صناعية متخصصة تضمن دقة القطع إلى نصف المليمتر وسحب الإطارات العازلة حرارياً وفق معايير الجودة.'
                  : language === 'en'
                  ? 'This workshop is equipped with precision machinery to ensure half-millimeter cut tolerances and thermal crimping.'
                  : "Cet atelier dispose des machines professionnelles nécessaires pour exécuter des découpes précises au demi-millimètre et sertir les profilés à rupture thermique selon les spécifications des gammistes."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Scie Radiale Double Tête Pneumatique
                    </h5>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Lames carbure 450 mm, inclinaison numérique 45° et 90° avec système de microlubrification pour coupe aluminium sans bavure.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Sertisseuse d’Angle à Vérins Hydrauliques
                    </h5>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Sertissage haute pression des équerres d'assemblage en aluminium extrudé, garantissant l'étanchéité à l'air et à l'eau AEV.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Fraiseuse Copieuse & Percement Quincaillerie
                    </h5>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Usinage précis des fentes pour serrures multipoints, poignées et gâches crémones oscillo-battantes.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Table de Montage & Calage Vitrage
                    </h5>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                      Pose de cales de vitrage ventilées et joints EPDM périphériques pour un drainage optimal des eaux de condensation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {language === 'ar'
                    ? 'آراء وتقييمات الزبائن'
                    : language === 'en'
                    ? 'Customer Reviews & Feedback'
                    : "Retours d'Expérience Clients"}
                </h4>
                <span className="text-xs font-mono text-amber-500 font-bold">
                  ★ {workshop.rating} / 5.0{' '}
                  {language === 'ar' ? 'المعدل العام' : language === 'en' ? 'Average' : 'Note Moyenne'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {MOCK_REVIEWS.map((rev, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white'
                          }`}
                        >
                          {rev.author[0]}
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {rev.author}
                          </span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                            {rev.wilaya}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: Math.round(rev.rating) }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed pt-1 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                      "{rev.comment}"
                    </p>

                    <div className={`text-[10px] font-mono pt-1 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                      {rev.date} •{' '}
                      {language === 'ar'
                        ? 'مؤكد عبر وصل استلام Baiti'
                        : language === 'en'
                        ? 'Verified via Baiti delivery receipt'
                        : 'Vérifié via bon de livraison Baiti'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

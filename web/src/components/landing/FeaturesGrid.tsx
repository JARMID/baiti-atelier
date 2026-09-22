import React from 'react';
import { Scissors, Box, Calculator, Shield, Smartphone, FileSpreadsheet } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

export const FeaturesGrid: React.FC = () => {
  const { language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const FEATURES = [
    {
      icon: Scissors,
      title:
        language === 'ar'
          ? 'خوارزمية تقطيع القضبان 1D'
          : language === 'en'
          ? 'Linear 1D Saw Cut Optimizer'
          : 'Optimisation de Débitage 1D (Coupe)',
      desc:
        language === 'ar'
          ? 'توزيع ذكي لقطع الألمنيوم والـ PVC على قضبان بطول 6 أمتار مع مراعاة سمك شفرة المنشار لتقليل الفواضل بنسبة 18%.'
          : language === 'en'
          ? 'Linear cutting stock algorithm for 6-meter bars. Reduces aluminum and PVC scrap by an average of 18% factoring saw blade kerf.'
          : 'Algorithme de découpe linéaire pour barres de 6 mètres. Réduit les chutes d’aluminium et de PVC de 18% en moyenne avec gestion de la lame.',
      badge:
        language === 'ar' ? 'اقتصاد المواد' : language === 'en' ? 'Material Savings' : 'Économie Matière',
    },
    {
      icon: Box,
      title:
        language === 'ar'
          ? 'تصميم ثلاثي وثنائي الأبعاد'
          : language === 'en'
          ? 'Parametric 2D / 3D Design'
          : 'Conception Paramétrique 2D / 3D',
      desc:
        language === 'ar'
          ? 'رسم وضبط قياسات الشاسيه بالمليمتر في ثوانٍ دون الحاجة لبرامج ثقيلة، مع محاكاة حركة الفتح والإغلاق.'
          : language === 'en'
          ? 'Configure millimeter-accurate assemblies in seconds without heavy desktop CAD. Real-time PBR rendering and opening kinematics.'
          : 'Dessinez et personnalisez vos châssis en quelques secondes sans logiciel lourd. Aperçu temps réel avec cinématique d’ouverture.',
      badge: 'WebGL Three.js',
    },
    {
      icon: Calculator,
      title:
        language === 'ar'
          ? 'محرك حساب التكلفة الآلي'
          : language === 'en'
          ? 'Automated CPQ Cost Engine'
          : 'Moteur de Chiffrage Automatisé',
      desc:
        language === 'ar'
          ? 'حساب فوري لوزن الألمنيوم بالكيلوغرام، مساحات الزجاج، أطوال الحواشي المطاطية، والإكسسوارات بأسعار الورشات الوطنية.'
          : language === 'en'
          ? 'Instant calculation of aluminum mass, glass surfaces, gasket lengths, and hardware packs aligned with Algerian market costs.'
          : 'Calcul instantané de la masse d’aluminium, des surfaces de vitrage, des longueurs de joints et des packs de quincaillerie.',
      badge:
        language === 'ar' ? 'دقة بالدينار دج' : language === 'en' ? 'DZD Accuracy' : 'Précision DZD',
    },
    {
      icon: FileSpreadsheet,
      title:
        language === 'ar'
          ? 'كشوفات الحساب وبطاقات المنشار'
          : language === 'en'
          ? 'Saw Cut Sheets & Client PDF Quotes'
          : 'Fiches Atelier & Devis Client PDF',
      desc:
        language === 'ar'
          ? 'استخراج بطاقات تقطيع جاهزة للمشغل على منشار الورشة، مع كشوف حساب رسمية تحمل رمز الاستجابة السريعة وبيانات الورشة.'
          : language === 'en'
          ? 'Generate ready-to-cut operator sheets for double-head miter saws, plus professional client quotes with workshop QR codes.'
          : 'Générez des fiches de débit pour l’opérateur de scie et des devis clients avec QR code et coordonnées de votre atelier.',
      badge:
        language === 'ar' ? 'تصدير فوري' : language === 'en' ? 'Instant Export' : 'Export Immédiat',
    },
    {
      icon: Smartphone,
      title:
        language === 'ar'
          ? 'رفع القياسات في ورشة البناء'
          : language === 'en'
          ? 'On-Site Measurement App'
          : 'Prise de Cotes sur Chantier',
      desc:
        language === 'ar'
          ? 'تطبيق للهاتف لتدوين مقاسات الفتحات عند الزبون، إرفاق الصور الميدانية، ومشاركة كشف الحساب فوراً عبر واتساب.'
          : language === 'en'
          ? 'Mobile companion application to record dimensions on site, attach opening photos, and share estimates via WhatsApp.'
          : 'Application mobile compagnon pour relever les dimensions chez le client, joindre des photos et partager sur WhatsApp.',
      badge: 'Mobile Flutter',
    },
    {
      icon: Shield,
      title:
        language === 'ar'
          ? 'حماية وهوامش ربح سرية'
          : language === 'en'
          ? 'Confidential Margin Control'
          : 'Confidentialité Stricte des Marges',
      desc:
        language === 'ar'
          ? 'أسعار شراء الألمنيوم الخام، أسعار الجملة وهوامش ربح الورشة تبقى مشفرة ومحمية لا تظهر للزبون النهائي.'
          : language === 'en'
          ? 'Workshop extrusion purchase rates per kilogram, wholesale supplier discounts, and margins remain private and encrypted.'
          : 'Vos prix d’achat profilés au kilo, marges nettes et accords fournisseurs restent chiffrés et invisibles pour les clients.',
      badge:
        language === 'ar' ? 'بيانات مشفرة' : language === 'en' ? 'Encrypted Data' : 'Données Protégées',
    },
  ];

  const sectionBadge =
    language === 'ar'
      ? 'منظومة مهام الورشة'
      : language === 'en'
      ? 'Workshop Professional Suite'
      : 'Suite Métier Atelier';

  const sectionTitle =
    language === 'ar'
      ? 'أدوات رقمية مخصصة للحرفيين'
      : language === 'en'
      ? 'Specialized Tools for Craft Workshops'
      : 'Outils Dédiés aux Artisans Menuisiers';

  const sectionDesc =
    language === 'ar'
      ? 'حلول برمجية مطورة لاستبدال الحسابات اليدوية التقديرية وضبط الإنتاج اليومي في ورشات الجزائر.'
      : language === 'en'
      ? 'Engineered to replace manual scratch estimates and modernize daily fabrication workflows across Algeria.'
      : 'Conçu pour remplacer les calculs manuels approximatifs et moderniser la gestion quotidienne des ateliers en Algérie.';

  const readMoreText =
    language === 'ar' ? 'المزيد من التفاصيل' : language === 'en' ? 'Explore details' : 'En savoir plus';

  return (
    <section
      id="features"
      className={`py-20 border-t relative transition-colors duration-300 ${
        isLight ? 'border-slate-200' : 'border-white/10'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono font-semibold tracking-wider text-[#D4AF37] px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            {sectionBadge}
          </span>
          <h2
            className={`text-3xl sm:text-4xl font-bold tracking-tight mt-3 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {sectionTitle}
          </h2>
          <p
            className={`text-sm mt-2 leading-relaxed ${
              isLight ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            {sectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-6 rounded-2xl border transition-all duration-300 group flex flex-col justify-between hover-lift spotlight-card ${
                  isLight
                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-xl'
                    : 'glass-panel border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-slate-950'
                          : 'bg-white/5 border-white/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-slate-950'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      {feat.badge}
                    </span>
                  </div>

                  <h3
                    className={`text-base font-semibold group-hover:text-[#D4AF37] transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {feat.title}
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      isLight ? 'text-slate-600' : 'text-zinc-400'
                    }`}
                  >
                    {feat.desc}
                  </p>
                </div>

                <div
                  onClick={() => playTactileClick()}
                  className={`pt-4 mt-4 border-t flex items-center text-xs text-[#D4AF37] font-medium btn-press cursor-pointer select-none ${
                    isLight ? 'border-slate-100' : 'border-white/5'
                  }`}
                >
                  <span>{readMoreText}</span>
                  <span
                    className={`transition-transform ${
                      isRtl
                        ? 'mr-1 group-hover:-translate-x-1'
                        : 'ml-1 group-hover:translate-x-1'
                    }`}
                  >
                    {isRtl ? '←' : '→'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

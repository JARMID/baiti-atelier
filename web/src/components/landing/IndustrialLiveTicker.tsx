import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { Activity, ShieldCheck, Zap, Pause, Play } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';

interface TickerItem {
  id: string;
  wilayaFr: string;
  wilayaAr: string;
  wilayaEn: string;
  tradeFr: string;
  tradeAr: string;
  tradeEn: string;
  messageFr: string;
  messageAr: string;
  messageEn: string;
  tag: string;
}

const TICKER_DATA: TickerItem[] = [
  {
    id: 't1',
    wilayaFr: 'Alger (Kouba)',
    wilayaAr: 'الجزائر (القبة)',
    wilayaEn: 'Algiers (Kouba)',
    tradeFr: 'Aluminium TPR',
    tradeAr: 'ألمنيوم TPR',
    tradeEn: 'TPR Aluminum',
    messageFr: 'Châssis coulissant 3 rails débité • Chute optimisée à 4.6%',
    messageAr: 'تقطيع إطار سحاب 3 سكك • تقليص نسبة الفاقد إلى 4.6%',
    messageEn: '3-track sliding frame cut • Cut waste reduced to 4.6%',
    tag: 'DEBITAGE CNC',
  },
  {
    id: 't2',
    wilayaFr: 'Oran (Es Senia)',
    wilayaAr: 'وهران (السانية)',
    wilayaEn: 'Oran (Es Senia)',
    tradeFr: 'Thermolaquage',
    tradeAr: 'طلاء حراري',
    tradeEn: 'Powder Coating',
    messageFr: '24 profilés RAL 7016 cuits au four • Contrôle brillance validé',
    messageAr: 'معالجة 24 مقطع طلاء RAL 7016 بالفرن • فحص اللمعان مطابق',
    messageEn: '24 RAL 7016 profiles oven cured • Gloss inspection passed',
    tag: 'FOUR 200°C',
  },
  {
    id: 't3',
    wilayaFr: 'Constantine',
    wilayaAr: 'قسنطينة',
    wilayaEn: 'Constantine',
    tradeFr: 'Paiement SATIM',
    tradeAr: 'دفع ساتيم',
    tradeEn: 'SATIM Gateway',
    messageFr: 'Acompte 30% validé via CIB / BaridiMob • Commande en fabrication',
    messageAr: 'تأكيد دفعة 30% عبر CIB و بريدي موب • إطلاق التصنيع بالورشة',
    messageEn: '30% deposit confirmed via CIB / BaridiMob • Order in fabrication',
    tag: 'PAIEMENT CIB',
  },
  {
    id: 't4',
    wilayaFr: 'Sétif (El Eulma)',
    wilayaAr: 'سطيف (العلمة)',
    wilayaEn: 'Setif (El Eulma)',
    tradeFr: 'Pilotage Scie',
    tradeAr: 'تحكم المنشار',
    tradeEn: 'Saw Control',
    messageFr: 'Export Elumatec XML & TigerStop CSV généré pour la scie double tête',
    messageAr: 'توليد ملفات Elumatec XML و TigerStop لمنشار الزوايا المزدوج',
    messageEn: 'Elumatec XML & TigerStop CSV generated for double-head miter saw',
    tag: 'G-CODE CNC',
  },
  {
    id: 't5',
    wilayaFr: 'Blida (Boufarik)',
    wilayaAr: 'البليدة (بوفاريك)',
    wilayaEn: 'Blida (Boufarik)',
    tradeFr: 'Norme DTR',
    tradeAr: 'مطابقة DTR',
    tradeEn: 'DTR Standard',
    messageFr: 'Contrôle perméabilité à l\'air AEV validé sur baie vitrée 2800 mm',
    messageAr: 'فحص عزل الهواء والماء AEV مطابق على واجهة زجاجية 2800 مم',
    messageEn: 'Air/water AEV sealing check passed on 2800 mm glass slider',
    tag: 'TEST AEV',
  },
  {
    id: 't6',
    wilayaFr: 'Tlemcen',
    wilayaAr: 'تلمسان',
    wilayaEn: 'Tlemcen',
    tradeFr: 'Double Vitrage',
    tradeAr: 'زجاج مضاعف',
    tradeEn: 'Double Glazing',
    messageFr: 'Assemblage vitrage Stop-Sol 4/16/4 avec gaz Argon • Uw = 1.4',
    messageAr: 'تركيب زجاج Stop-Sol 4/16/4 مع غاز الآرغون العازل • Uw = 1.4',
    messageEn: 'Stop-Sol 4/16/4 glass assembled with Argon gas • Uw = 1.4',
    tag: 'ISOLATION THERMIQUE',
  },
  {
    id: 't7',
    wilayaFr: 'Batna',
    wilayaAr: 'باتنة',
    wilayaEn: 'Batna',
    tradeFr: 'Ferronnerie',
    tradeAr: 'حدادة فنية',
    tradeEn: 'Wrought Iron',
    messageFr: 'Grille de sécurité en carré 14 forgé à chaud • Scellement chimique',
    messageAr: 'شباك حماية بقضبان 14 مم مشغولة على الساخن • تثبيت كيميائي',
    messageEn: 'Security window grille with 14mm solid square steel • Chemical anchor',
    tag: 'FORGE D\'ART',
  },
  {
    id: 't8',
    wilayaFr: 'Tizi Ouzou',
    wilayaAr: 'تيزي وزو',
    wilayaEn: 'Tizi Ouzou',
    tradeFr: 'Menuiserie Bois',
    tradeAr: 'نجارة خشب',
    tradeEn: 'Cabinetmaking',
    messageFr: 'Découpe CNC de panneaux MDF hydrofuge vert pour dressing sur-mesure',
    messageAr: 'قص لوحات MDF المقاومة للرطوبة بالتحكم الرقمي لخزانة مفصلة',
    messageEn: 'CNC machining of moisture-resistant green MDF for custom closet',
    tag: 'BOIS & MDF',
  },
];

export const IndustrialLiveTicker: React.FC = () => {
  const { language, theme } = useConfigStore();
  const [isPaused, setIsPaused] = useState(false);
  const isRtl = language === 'ar';
  const isLight = theme === 'light';

  const titleBadge = {
    fr: 'FLUX ATELIERS EN DIRECT',
    ar: 'نشاط الورشات المباشر',
    en: 'LIVE WORKSHOP FEED',
  }[language] || 'FLUX ATELIERS EN DIRECT';

  const wilayasActive = {
    fr: '58 Wilayas Connectées',
    ar: '58 ولاية متصلة',
    en: '58 Wilayas Live',
  }[language] || '58 Wilayas Connectées';

  // Duplicate items for continuous smooth ticker wrap
  const loopedItems = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`relative w-full overflow-hidden border-b z-40 transition-colors select-none text-xs ${
        isLight
          ? 'bg-slate-900 border-slate-800 text-slate-200'
          : 'bg-[#06080C] border-white/10 text-zinc-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center h-9">
        {/* Left Live Pulse Badge */}
        <div className={`flex items-center gap-2 shrink-0 z-10 bg-inherit ${isRtl ? 'pl-3 sm:pl-4 border-l' : 'pr-3 sm:pr-4 border-r'} border-white/10 dark:border-white/10`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-[#D4AF37] flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span className="hidden md:inline">{titleBadge}</span>
          </span>
          <span className="hidden lg:inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span>{wilayasActive}</span>
          </span>
        </div>

        {/* Ticker Viewport with Left and Right Gradient Edge Fades */}
        <div
          className="flex-1 overflow-hidden relative flex items-center h-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left subtle fade mask */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-inherit to-transparent" />

          <div
            className="animate-ticker flex items-center py-1"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {loopedItems.map((item, index) => {
              const wilaya = language === 'ar' ? item.wilayaAr : language === 'en' ? item.wilayaEn : item.wilayaFr;
              const trade = language === 'ar' ? item.tradeAr : language === 'en' ? item.tradeEn : item.tradeFr;
              const message = language === 'ar' ? item.messageAr : language === 'en' ? item.messageEn : item.messageFr;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className="inline-flex items-center gap-2.5 px-4 font-mono text-[11px] whitespace-nowrap cursor-pointer hover:text-[#D4AF37] transition-colors"
                >
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-semibold border border-white/5">
                    <Zap className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span>{item.tag}</span>
                  </span>
                  <span className="font-bold text-white/90">{wilaya}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-amber-400/90 text-[10px]">{trade}</span>
                  <span className="text-zinc-400 text-[10px]">{message}</span>
                  <span className="text-zinc-600 px-2 font-light">|</span>
                </div>
              );
            })}
          </div>

          {/* Right subtle fade mask */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-inherit to-transparent" />
        </div>

        {/* Right Play / Pause Controller & Live GMT+1 Clock */}
        <div className={`shrink-0 z-10 bg-inherit flex items-center gap-2 ${isRtl ? 'pr-2 sm:pr-3 border-r' : 'pl-2 sm:pl-3 border-l'} border-white/10`}>
          <span className="hidden sm:inline font-mono text-[10px] text-zinc-400">
            DZ 24/7
          </span>
          <button
            onClick={() => {
              playTactileClick();
              setIsPaused(!isPaused);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer btn-press"
            title={isPaused ? 'Reprendre le défilement' : 'Mettre en pause le défilement'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

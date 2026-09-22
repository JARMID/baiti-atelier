import React from 'react';
import type { TradeCategory } from '../../types/trades';
import { Layers, Axe, ShieldAlert, Sparkles } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { getTranslation } from '../../utils/i18n';
import { playSwitchSound } from '../../utils/audioFeedback';

interface TradeSelectorProps {
  selectedTrade: TradeCategory;
  onSelectTrade: (trade: TradeCategory) => void;
}

export const TradeSelector: React.FC<TradeSelectorProps> = ({
  selectedTrade,
  onSelectTrade,
}) => {
  const { language, theme } = useConfigStore();
  const t = getTranslation(language);
  const isLight = theme === 'light';

  const trades: {
    id: TradeCategory;
    label: string;
    sub: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'aluminum',
      label: t.tradeAluminum,
      sub:
        language === 'ar'
          ? 'نوافذ، أبواب وواجهات زجاجية'
          : language === 'en'
          ? 'Windows, Doors & Glazed Bays'
          : 'Fenêtres, Portes & Baies',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'woodworking',
      label: t.tradeWood,
      sub:
        language === 'ar'
          ? 'مطابخ، غرف نوم وخزائن حائطية'
          : language === 'en'
          ? 'Kitchens, Wardrobes & Interior Doors'
          : 'Cuisines, Dressings & Portes',
      icon: <Axe className="w-4 h-4" />,
    },
    {
      id: 'metalwork',
      label: t.tradeMetal,
      sub:
        language === 'ar'
          ? 'بوابات، شبابيك حماية وسلالم حديدية'
          : language === 'en'
          ? 'Security Grilles, Gates & Railings'
          : 'Grilles, Portails & Rampes',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'tapestry',
      label: t.tradeTapestry,
      sub:
        language === 'ar'
          ? 'صالونات مغربية، ستائر ومفروشات'
          : language === 'en'
          ? 'Custom Couches, Curtains & Drapery'
          : 'Rideaux, Salons & Voilages',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  const headerTitle =
    language === 'ar'
      ? 'اختر تخصص ورشة التصنيع'
      : language === 'en'
      ? 'Select Workshop Craft Discipline'
      : 'Sélectionnez votre Spécialité d’Atelier';

  const headerBadge =
    language === 'ar'
      ? 'منظومة مهنية متعددة التخصصات • 58 ولاية'
      : language === 'en'
      ? 'Multi-Trade Platform • 58 Wilayas'
      : 'Écosystème Multi-Métiers • 58 Wilayas';

  const headerDesc =
    language === 'ar'
      ? 'محرك حسابي مخصص لكل حرفة، مخططات تقطيع للألواح والقطاعات، وأسعار موحدة بالدينار الجزائري.'
      : language === 'en'
      ? 'Dedicated parametric formulas, saw cut lists, and verified pricing in Algerian Dinars.'
      : 'Chaque métier dispose de son moteur paramétrique, de sa liste de débitage et de ses tarifs professionnels en Dinars Algériens.';

  return (
    <div className="w-full max-w-5xl mx-auto mb-10 px-4">
      <div className="text-center mb-5">
        <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider font-semibold">
          {headerBadge}
        </span>
        <h3
          className={`text-2xl sm:text-3xl font-bold mt-1 tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          {headerTitle}
        </h3>
        <p
          className={`text-xs sm:text-sm mt-1 max-w-xl mx-auto leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-zinc-400'
          }`}
        >
          {headerDesc}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {trades.map((item) => {
          const isSelected = selectedTrade === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playSwitchSound();
                onSelectTrade(item.id);
              }}
              className={`p-4 rounded-2xl border ${
                language === 'ar' ? 'text-right' : 'text-left'
              } transition-all duration-300 cursor-pointer flex flex-col justify-between hover-lift card-sheen btn-press relative overflow-hidden ${
                isSelected
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                  : isLight
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#D4AF37] text-white'
                      : isLight
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {item.icon}
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                )}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold truncate ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {item.label}
                </h4>
                <p
                  className={`text-[11px] mt-0.5 truncate ${
                    isLight ? 'text-slate-500' : 'text-zinc-400'
                  }`}
                >
                  {item.sub}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

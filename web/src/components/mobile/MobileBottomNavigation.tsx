import React from 'react';
import {
  Box,
  Grid,
  Scissors,
  FileText,
  Cpu,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

export type MobileNavTab = 'configurator' | 'cad' | 'cutting' | 'field_quotes' | 'workshop';

interface MobileBottomNavigationProps {
  isWorkshopMode?: boolean;
  onToggleWorkshopMode?: () => void;
  onOpenOfflineQuotes?: () => void;
  activeTab?: MobileNavTab;
  onSelectTab?: (tab: MobileNavTab) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  isWorkshopMode: _isWorkshopMode = false,
  onToggleWorkshopMode: _onToggleWorkshopMode,
  onOpenOfflineQuotes: _onOpenOfflineQuotes,
  activeTab = 'configurator',
  onSelectTab,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const handleTabClick = (tab: MobileNavTab, fallbackSectionId: string) => {
    playTactileClick();
    if (onSelectTab) {
      onSelectTab(tab);
    } else {
      const el = document.getElementById(fallbackSectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isDedicatedApp = Boolean(onSelectTab);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-auto ${
        isDedicatedApp ? 'flex justify-center px-2 md:px-4' : 'md:hidden'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className={`w-full ${
          isDedicatedApp ? 'max-w-lg md:mb-3 md:rounded-3xl md:border md:shadow-2xl' : 'border-t'
        } backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around transition-colors shadow-2xl ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-400/30'
            : 'bg-[#06080C]/95 border-white/10 text-zinc-300 shadow-black/80'
        }`}
      >
        {/* 1. 3D Configurateur */}
        <button
          onClick={() => handleTabClick('configurator', 'configurator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-mono transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            activeTab === 'configurator'
              ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-xs'
              : 'hover:text-[#D4AF37]'
          }`}
        >
          <Box className="w-4 h-4 mb-0.5" />
          <span>{language === 'ar' ? 'ثلاثي الأبعاد' : '3D'}</span>
        </button>

        {/* 2. Studio CAO 2D */}
        <button
          onClick={() => handleTabClick('cad', 'cad-studio')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-mono transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            activeTab === 'cad'
              ? 'bg-[#38BDF8] text-slate-950 font-bold shadow-xs'
              : 'hover:text-[#38BDF8]'
          }`}
        >
          <Grid className="w-4 h-4 mb-0.5" />
          <span>CAO 2D</span>
        </button>

        {/* 3. Débit Scie 1D */}
        <button
          onClick={() => handleTabClick('cutting', 'debitage-optimizer')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-mono transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            activeTab === 'cutting'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'hover:text-amber-400'
          }`}
        >
          <Scissors className="w-4 h-4 mb-0.5" />
          <span>Débit</span>
        </button>

        {/* 4. Carnet Relevé de Cotes */}
        <button
          onClick={() => handleTabClick('field_quotes', 'quotes')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-mono transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            activeTab === 'field_quotes'
              ? 'bg-emerald-400 text-slate-950 font-bold shadow-xs'
              : 'hover:text-emerald-400'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span>Cotes</span>
        </button>

        {/* 5. Suivi Atelier Pro */}
        <button
          onClick={() => handleTabClick('workshop', 'workshop')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-mono transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            activeTab === 'workshop'
              ? 'bg-purple-500 text-white font-bold shadow-xs'
              : 'hover:text-purple-400'
          }`}
        >
          <Cpu className="w-4 h-4 mb-0.5" />
          <span>Atelier</span>
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;

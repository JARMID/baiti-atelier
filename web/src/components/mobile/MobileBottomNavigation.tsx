import React from 'react';
import {
  Box,
  Grid,
  Scissors,
  FileText,
  Cpu,
  Eye,
} from 'lucide-react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';

interface MobileBottomNavigationProps {
  isWorkshopMode: boolean;
  onToggleWorkshopMode: () => void;
  onOpenOfflineQuotes: () => void;
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

export const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({
  isWorkshopMode,
  onToggleWorkshopMode,
  onOpenOfflineQuotes,
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const scrollToSection = (id: string) => {
    playTactileClick();
    if (isWorkshopMode) {
      onToggleWorkshopMode();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-auto"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className={`border-t backdrop-blur-2xl px-2 py-1 flex items-center justify-around transition-colors shadow-2xl ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-700 shadow-slate-400/30'
            : 'bg-[#06080C]/95 border-white/10 text-zinc-300 shadow-black/80'
        }`}
      >
        {/* 1. Vitrine 3D / Configurateur */}
        <button
          onClick={() => scrollToSection('configurator')}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-mono transition-colors min-w-[56px] min-h-[44px] cursor-pointer hover:text-[#D4AF37]"
        >
          <Box className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
          <span>{language === 'ar' ? 'ثلاثي الأبعاد' : '3D'}</span>
        </button>

        {/* 2. Studio CAO 2D */}
        <button
          onClick={() => scrollToSection('cad-studio')}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-mono transition-colors min-w-[56px] min-h-[44px] cursor-pointer hover:text-[#38BDF8]"
        >
          <Grid className="w-4 h-4 mb-0.5 text-[#38BDF8]" />
          <span>CAO 2D</span>
        </button>

        {/* 3. Débit Scie 1D/2D */}
        <button
          onClick={() => scrollToSection('debitage-optimizer')}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-mono transition-colors min-w-[56px] min-h-[44px] cursor-pointer hover:text-amber-400"
        >
          <Scissors className="w-4 h-4 mb-0.5 text-amber-400" />
          <span>Débit</span>
        </button>

        {/* 4. Carnet Devis Hors-Ligne */}
        <button
          onClick={() => {
            playTactileClick();
            onOpenOfflineQuotes();
          }}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[10px] font-mono transition-colors min-w-[56px] min-h-[44px] cursor-pointer hover:text-emerald-400"
        >
          <FileText className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span>Devis</span>
        </button>

        {/* 5. Mode Atelier Pro Switcher */}
        <button
          onClick={() => {
            playTactileClick();
            onToggleWorkshopMode();
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-mono font-bold transition-all min-w-[56px] min-h-[44px] cursor-pointer ${
            isWorkshopMode
              ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
              : isLight
              ? 'bg-slate-100 text-slate-900 border border-slate-300'
              : 'bg-white/10 text-white border border-white/10'
          }`}
        >
          {isWorkshopMode ? (
            <>
              <Eye className="w-4 h-4 mb-0.5" />
              <span>Vitrine</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4 mb-0.5 text-[#D4AF37]" />
              <span>Atelier</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MobileBottomNavigation;

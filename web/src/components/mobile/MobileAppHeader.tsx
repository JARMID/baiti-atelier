import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Hammer,
  MapPin,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  HardDrive,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  playTactileClick,
  playSwitchSound,
  isSoundEnabled,
  toggleSound,
} from '../../utils/audioFeedback';
import { ALGERIAN_WILAYAS_58, formatWilayaLabel } from '../../utils/algerianWilayas';

interface MobileAppHeaderProps {
  onSwitchToDesktopView: () => void;
  activeTabTitle: string;
  onOpenOfflineQuotes?: () => void;
  onOpenMaterialMarket?: () => void;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  onSwitchToDesktopView,
  activeTabTitle,
  onOpenOfflineQuotes,
  onOpenMaterialMarket,
}) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    selectedWilaya,
    setSelectedWilaya,
  } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleSelectLanguage = (lang: 'fr' | 'ar' | 'en') => {
    playSwitchSound();
    setLanguage(lang);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all select-none ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-xs text-slate-800'
            : 'bg-[#080B12]/95 border-white/10 text-white shadow-lg'
        }`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="px-3 h-14 flex items-center justify-between gap-2">
          {/* LEFT: BRAND ICON + TITLE */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <div
                className={`w-full h-full rounded-[9px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-[#0A0D14]'
                }`}
              >
                <Hammer className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight">Baiti</span>
                <span className="text-xs font-bold text-[#D4AF37] font-arabic">بيتي</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 truncate">
                {activeTabTitle}
              </span>
            </div>
          </div>

          {/* RIGHT ACTIONS: SWITCH TO DESKTOP VIEW & MENU DRAWER */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Direct button to switch to the full desktop showcase */}
            <button
              onClick={() => {
                playTactileClick();
                onSwitchToDesktopView();
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-medium transition-all flex items-center gap-1 cursor-pointer min-h-[36px] ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
              }`}
              title="Voir le site vitrine complet avec scrollytelling 3D"
            >
              <Monitor className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xs:inline">Vitrine Web</span>
            </button>

            {/* Wilaya Quick Badge */}
            <div
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-mono ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-white/5 border-white/10 text-zinc-300'
              }`}
            >
              <MapPin className="w-3 h-3 text-[#D4AF37]" />
              <span className="truncate max-w-[90px]">{selectedWilaya.split('-')[1]?.trim() || selectedWilaya}</span>
            </div>

            {/* Menu Hamburger */}
            <button
              onClick={() => {
                playTactileClick();
                setIsDrawerOpen(true);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
              }`}
              title="Menu & Préférences"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={`relative ml-auto w-full max-w-xs h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto transition-transform ${
              isLight ? 'bg-white text-slate-900' : 'bg-[#0B0F19] text-white border-l border-white/10'
            }`}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-bold text-base">Baiti Atelier</span>
                  <span className="text-xs font-mono text-[#D4AF37]">58 Wilayas</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Wilaya Selection */}
              <div className="mt-5 space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Wilaya de Chantier & Tarifs</span>
                </label>
                <div
                  className={`rounded-2xl border p-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                  }`}
                >
                  <select
                    value={selectedWilaya}
                    onChange={(e) => {
                      playSwitchSound();
                      setSelectedWilaya(e.target.value);
                    }}
                    className={`w-full bg-transparent border-none text-xs font-mono focus:outline-none cursor-pointer ${
                      isLight ? 'text-slate-800' : 'text-zinc-200'
                    }`}
                  >
                    {ALGERIAN_WILAYAS_58.map((w) => {
                      const label = formatWilayaLabel(w, language);
                      const val = `${w.code} - ${w.nameFr}`;
                      return (
                        <option
                          key={w.code}
                          value={val}
                          className={isLight ? 'bg-white text-slate-800' : 'bg-[#0E121C] text-white'}
                        >
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Quick Settings: Language & Theme */}
              <div className="mt-5 space-y-3">
                <label className="text-xs font-mono font-bold text-zinc-400 block">
                  Langue & Affichage
                </label>

                {/* Language Picker */}
                <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                  {(['fr', 'ar', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleSelectLanguage(lang)}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        language === lang
                          ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
                          : isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-white/5 border-white/10 text-zinc-400'
                      }`}
                    >
                      {lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'English'}
                    </button>
                  ))}
                </div>

                {/* Theme & Sound toggles */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      playSwitchSound();
                      toggleTheme();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-2 cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                  >
                    {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>{isLight ? 'Mode Sombre' : 'Mode Clair'}</span>
                  </button>

                  <button
                    onClick={handleToggleSound}
                    className={`p-2 rounded-xl border text-xs cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-white/5 border-white/10 text-zinc-300'
                    }`}
                    title="Activer/Désactiver le son d'atelier"
                  >
                    {soundOn ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                  </button>
                </div>
              </div>

              {/* Special Workshop Links */}
              <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
                {onOpenOfflineQuotes && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenOfflineQuotes();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                      isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-amber-400" />
                      <span>Carnet Devis Hors-Ligne</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">Local</span>
                  </button>
                )}

                {onOpenMaterialMarket && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenMaterialMarket();
                    }}
                    className={`w-full p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between cursor-pointer transition-all ${
                      isLight ? 'hover:bg-slate-100 border-slate-200' : 'hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-[#D4AF37]" />
                      <span>Bourse Matières & Marges</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">DZD</span>
                  </button>
                )}
              </div>
            </div>

            {/* Switch to Full Showcase Button at Drawer Bottom */}
            <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onSwitchToDesktopView();
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-md hover:brightness-110 cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Basculer vers la Vitrine Web (PC)</span>
              </button>

              <div className="text-center text-[10px] font-mono text-zinc-500 pt-1">
                Baiti Atelier • v2.6.0 • 58 Wilayas
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileAppHeader;

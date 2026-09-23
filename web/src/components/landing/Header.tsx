import React, { useState, useEffect, useRef } from 'react';
import { useConfigStore } from '../../store/configStore';
import { getTranslation } from '../../utils/i18n';
import {
  MapPin,
  Camera,
  HardDrive,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  TrendingUp,
  Wrench,
  Menu,
  X,
  ChevronDown,
  Scissors,
  Grid,
  Layers,
  Download,
  Smartphone,
  KeyRound,
} from 'lucide-react';
import { Setup2FAModal } from '../auth/Setup2FAModal';
import {
  isSoundEnabled,
  toggleSound,
  playSwitchSound,
  playTactileClick,
} from '../../utils/audioFeedback';
import { ALGERIAN_WILAYAS_58, formatWilayaLabel } from '../../utils/algerianWilayas';

interface HeaderProps {
  onOpenSketchModal?: () => void;
  onOpenOfflineModal?: () => void;
  onOpenMaterialMarket?: () => void;
  onToggleWorkshopMode?: () => void;
  isWorkshopMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSketchModal,
  onOpenOfflineModal,
  onOpenMaterialMarket,
  onToggleWorkshopMode,
  isWorkshopMode = false,
}) => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    selectedWilaya,
    setSelectedWilaya,
  } = useConfigStore();
  const t = getTranslation(language);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isToolboxOpen, setIsToolboxOpen] = useState(false);
  const [is2FaOpen, setIs2FaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const toolboxRef = useRef<HTMLDivElement>(null);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleToggleTheme = () => {
    playSwitchSound();
    toggleTheme();
  };

  const handleSelectLanguage = (lang: 'fr' | 'ar' | 'en') => {
    playSwitchSound();
    setLanguage(lang);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    playTactileClick();
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice?.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Close toolbox popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolboxRef.current && !toolboxRef.current.contains(e.target as Node)) {
        setIsToolboxOpen(false);
      }
    };
    if (isToolboxOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isToolboxOpen]);

  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-2xl transition-all duration-300 relative ${
        isLight
          ? 'bg-white/95 border-slate-200/80 shadow-xs text-slate-800'
          : 'bg-gradient-to-r from-[#020d1f]/95 via-[#061e3d]/95 to-[#02132a]/95 border-b border-sky-500/20 text-zinc-100 shadow-2xl shadow-[#020d1f]/90'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Ambient Top Light Beam */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4 relative z-10">
        {/* LEFT: BRAND MARK & REGIONAL WILAYA CHIP */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="#"
            onClick={() => playTactileClick()}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F355E] to-[#D4AF37] p-0.5 shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div
                className={`w-full h-full rounded-[10px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-[#060D18]'
                }`}
              >
                <Grid className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className={`text-lg font-serif font-bold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Baiti Atelier
                </span>
                <span
                  dir="rtl"
                  lang="ar"
                  className="text-base font-bold text-[#D4AF37] font-arabic tracking-wide"
                >
                  بيتي
                </span>
              </div>
              <span className={`text-[10px] font-mono -mt-1 hidden sm:block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Menuiserie & Débitage · 58 Wilayas
              </span>
            </div>
          </a>

          {/* Clean Wilaya Selector Chip */}
          <div
            className={`hidden md:flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs border transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                : 'bg-white/5 border-white/10 text-zinc-300 hover:border-white/20'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={selectedWilaya}
              onChange={(e) => {
                playSwitchSound();
                setSelectedWilaya(e.target.value);
              }}
              className={`bg-transparent border-none text-xs font-mono focus:outline-none cursor-pointer pr-1 max-w-[130px] truncate ${
                isLight ? 'text-slate-800' : 'text-zinc-200'
              }`}
              title="Sélectionnez votre Wilaya pour les tarifs et le transport"
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

        {/* CENTER: STREAMLINED LUXURY NAVIGATION LINKS */}
        <nav
          className={`hidden xl:flex items-center gap-1 p-1 rounded-2xl border text-xs font-medium backdrop-blur-md ${
            isLight ? 'bg-slate-50/80 border-slate-200 text-slate-700' : 'bg-[#081b38]/70 border-sky-400/25 text-zinc-200 shadow-inner'
          }`}
        >
          <a
            href="#cad-studio"
            onClick={() => playTactileClick()}
            className="px-3 py-1.5 rounded-xl hover:text-white transition-colors hover:bg-white/10 flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>{t.navCadStudio}</span>
          </a>
          <a
            href="#debitage-optimizer"
            onClick={() => playTactileClick()}
            className="px-3 py-1.5 rounded-xl hover:text-white transition-colors hover:bg-white/10 flex items-center gap-1.5"
          >
            <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t.navCutting}</span>
          </a>
          <a
            href="#configurator"
            onClick={() => playTactileClick()}
            className="px-3 py-1.5 rounded-xl hover:text-white transition-colors hover:bg-white/10 flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Châssis 3D</span>
          </a>
          {onOpenMaterialMarket && (
            <button
              onClick={() => {
                playTactileClick();
                onOpenMaterialMarket();
              }}
              className="px-3 py-1.5 rounded-xl hover:text-white transition-colors hover:bg-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'بورصة المواد' : 'Bourse Matières'}</span>
            </button>
          )}
          <a
            href="#workshops"
            onClick={() => playTactileClick()}
            className="px-3 py-1.5 rounded-xl hover:text-white transition-colors hover:bg-white/10 flex items-center gap-1.5"
          >
            <span>{t.navWorkshops}</span>
          </a>
        </nav>

        {/* RIGHT: NAVBAR CONTROLS, THEME TOGGLE & PRIMARY WORKSHOP ACTION */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Trilingual Toggle */}
          <div
            className={`flex items-center rounded-xl p-0.5 text-[11px] font-mono border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            {(['fr', 'ar', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleSelectLanguage(lang)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer font-bold ${
                  language === lang
                    ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'عربي' : lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Direct 1-Click Sun / Moon Theme Switcher in Navbar */}
          <button
            onClick={handleToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleSound}
            className={`hidden sm:flex p-2 rounded-xl border transition-all cursor-pointer items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title={soundOn ? 'Désactiver les effets sonores' : 'Activer les effets sonores'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Desktop Setup Download Button */}
          <a
            href="/downloads/baiti-atelier-desktop-setup.exe"
            download
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all hover-lift ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:border-[#D4AF37]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:border-white/20'
            }`}
            title="Télécharger Baiti Atelier pour Windows (.exe)"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>App Desktop</span>
          </a>



          {/* PWA Install Button (Promptable) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallPwa}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold hover:brightness-110 cursor-pointer btn-press"
              title="Installer Baiti Atelier sur cet appareil (PWA hors-ligne)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Installer PWA</span>
            </button>
          )}

          {/* Artisan Toolbox Dropdown (Local Quotes & AI Scanner) */}
          <div className="relative" ref={toolboxRef}>
            <button
              onClick={() => {
                playTactileClick();
                setIsToolboxOpen(!isToolboxOpen);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isToolboxOpen
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                  : isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
              }`}
              title="Outils spécialisés d'atelier"
            >
              <Wrench className="w-4 h-4 text-[#D4AF37]" />
              <ChevronDown className={`w-3 h-3 transition-transform ${isToolboxOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Toolbox Popover Menu */}
            {isToolboxOpen && (
              <div
                className={`absolute ${isRtl ? 'left-0' : 'right-0'} mt-2 w-72 p-3 rounded-2xl border backdrop-blur-2xl shadow-2xl z-50 transition-all ${
                  isLight
                    ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/60'
                    : 'bg-[#041124]/98 border-sky-500/30 text-white shadow-2xl shadow-[#010814]'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D4AF37]">
                    Outils Atelier
                  </span>
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isOnline
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span>{isOnline ? 'En Ligne' : 'Hors-Ligne'}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  {onOpenOfflineModal && (
                    <button
                      onClick={() => {
                        playTactileClick();
                        setIsToolboxOpen(false);
                        onOpenOfflineModal();
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-amber-400" />
                        <span>Carnet Devis Hors-Ligne</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Disque Local</span>
                    </button>
                  )}

                  {onOpenSketchModal && (
                    <button
                      onClick={() => {
                        playTactileClick();
                        setIsToolboxOpen(false);
                        onOpenSketchModal();
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#D4AF37]" />
                        <span>Scanner Croquis & Cotes</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Relevé Photo</span>
                    </button>
                  )}

                  {/* 2FA TOTP Authenticator Configuration */}
                  <button
                    onClick={() => {
                      playTactileClick();
                      setIsToolboxOpen(false);
                      setIs2FaOpen(true);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-left rtl:text-right"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'ar' ? 'المصادقة الثنائية 2FA' : 'Sécurité & 2FA TOTP'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">TOTP</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button / Toggle Mode Atelier Pro */}
          {onToggleWorkshopMode ? (
            <button
              onClick={() => {
                playTactileClick();
                onToggleWorkshopMode();
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover-lift btn-press ${
                isWorkshopMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 shadow-[#D4AF37]/20'
              }`}
              title={isWorkshopMode ? 'Revenir à la vitrine publique' : "Ouvrir l'Espace Atelier Pro"}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>{isWorkshopMode ? 'Vitrine Client' : 'Atelier Pro'}</span>
            </button>
          ) : (
            <a
              href="#cad-studio"
              onClick={() => playTactileClick()}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20 cursor-pointer hover-lift btn-press"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ouvrir l'Atelier</span>
              <span className="sm:hidden">Atelier</span>
            </a>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => {
              playTactileClick();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className={`xl:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
            title="Menu de navigation mobile"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div
          className={`xl:hidden border-t px-4 py-4 flex flex-col gap-3 backdrop-blur-2xl transition-all ${
            isLight ? 'bg-white/95 border-slate-200' : 'bg-gradient-to-b from-[#030e20]/98 to-[#020b18]/98 border-sky-500/25 text-white'
          }`}
        >
          {/* Mobile Wilaya Selector Card */}
          <div
            className={`flex items-center justify-between p-3 rounded-2xl border text-xs ${
              isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-mono font-bold">Wilaya :</span>
            </div>
            <select
              value={selectedWilaya}
              onChange={(e) => {
                playSwitchSound();
                setSelectedWilaya(e.target.value);
              }}
              className="bg-transparent border-none font-mono text-xs focus:outline-none cursor-pointer pr-1 max-w-[200px] truncate font-bold text-[#D4AF37]"
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

          <a
            href="#cad-studio"
            onClick={() => {
              playTactileClick();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl hover:bg-white/10 text-sm font-medium"
          >
            <Grid className="w-4 h-4 text-[#38BDF8]" />
            <span>Studio CAD 2D Paramétrique</span>
          </a>
          <a
            href="#debitage-optimizer"
            onClick={() => {
              playTactileClick();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl hover:bg-white/10 text-sm font-medium"
          >
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span>Optimiseur de Débitage & Scie</span>
          </a>
          <a
            href="#configurator"
            onClick={() => {
              playTactileClick();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl hover:bg-white/10 text-sm font-medium"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Configurateur 3D Châssis</span>
          </a>
          {onOpenMaterialMarket && (
            <button
              onClick={() => {
                playTactileClick();
                setIsMobileMenuOpen(false);
                onOpenMaterialMarket();
              }}
              className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl hover:bg-white/10 text-sm font-medium text-left rtl:text-right cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Bourse des Matières Premières Algérie</span>
            </button>
          )}
          <a
            href="#workshops"
            onClick={() => {
              playTactileClick();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-xl hover:bg-white/10 text-sm font-medium"
          >
            <span>Réseau des Ateliers (58 Wilayas)</span>
          </a>

          {/* Quick Offline Tools & Desktop App */}
          <div className="pt-2 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
            {onOpenOfflineModal && (
              <button
                onClick={() => {
                  playTactileClick();
                  setIsMobileMenuOpen(false);
                  onOpenOfflineModal();
                }}
                className="flex items-center justify-between p-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>Carnet Devis Hors-Ligne</span>
                </div>
                <span className="text-[10px] text-zinc-500">Local</span>
              </button>
            )}

            {deferredPrompt && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleInstallPwa();
                }}
                className="flex items-center justify-center gap-2 p-2.5 min-h-[44px] rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Installer l'App Baiti Atelier (PWA)</span>
              </button>
            )}



            <a
              href="/downloads/baiti-atelier-desktop-setup.exe"
              download
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2.5 min-h-[44px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono"
            >
              <Download className="w-4 h-4 text-[#D4AF37]" />
              <span>Télécharger Baiti Desktop (.exe)</span>
            </a>
          </div>
        </div>
      )}

      {/* 2FA Authenticator Modal */}
      <Setup2FAModal isOpen={is2FaOpen} onClose={() => setIs2FaOpen(false)} />
    </header>
  );
};

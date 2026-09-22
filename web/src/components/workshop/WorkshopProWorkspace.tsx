import React, { useState, useEffect, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import { isTauriDesktop, getWorkshopSystemInfo, type WorkshopSystemInfo } from '../../services/desktopBridge';
import { computeDetailedBOM } from '../../utils/cadEngine';
import { CadStudio2D } from '../cad/CadStudio2D';
import { CuttingStudio } from '../optimizer/CuttingStudio';
import { CuttingAssemblyTerminal } from '../optimizer/CuttingAssemblyTerminal';
import { WorkshopJobTracker } from './WorkshopJobTracker';
import { WorkshopFinancialSettings } from './WorkshopFinancialSettings';
import {
  isSoundEnabled,
  toggleSound,
  playSwitchSound,
  playTactileClick,
} from '../../utils/audioFeedback';
import {
  Grid,
  Scissors,
  FileText,
  TrendingUp,
  HardDrive,
  Printer,
  Sparkles,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Eye,
  Cpu,
  MapPin,
  Layers,
  Sliders,
} from 'lucide-react';
import { ALGERIAN_WILAYAS_58, formatWilayaLabel } from '../../utils/algerianWilayas';

interface WorkshopProWorkspaceProps {
  onSwitchToVitrine: () => void;
  onOpenSketchModal: () => void;
  onOpenOfflineQuotes: () => void;
  onOpenMaterialMarket: () => void;
}

export type WorkshopTab = 'cad' | 'optimizer' | 'terminal' | 'tracking' | 'settings';

export const WorkshopProWorkspace: React.FC<WorkshopProWorkspaceProps> = ({
  onSwitchToVitrine,
  onOpenSketchModal,
  onOpenOfflineQuotes,
  onOpenMaterialMarket,
}) => {
  const {
    config,
    language,
    theme,
    toggleTheme,
    selectedWilaya,
    setSelectedWilaya,
  } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<WorkshopTab>('cad');
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [systemInfo, setSystemInfo] = useState<WorkshopSystemInfo | null>(null);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);

  useEffect(() => {
    getWorkshopSystemInfo().then(setSystemInfo).catch(() => {});
  }, []);

  const currentBom = useMemo(() => {
    return computeDetailedBOM(
      {
        width: config.width,
        height: config.height,
        verticalDividers: [Math.round(config.width / 2)],
        horizontalDividers: [],
        cellTypes: { '0-0': 'sash_left', '0-1': 'sash_right' },
      },
      config
    );
  }, [config]);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleToggleTheme = () => {
    playSwitchSound();
    toggleTheme();
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-[#D4AF37] selection:text-slate-950 transition-colors duration-200 ${
        isLight ? 'bg-[#F1F5F9] text-slate-900' : 'bg-[#06080E] text-zinc-100'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* TOP DESKTOP WORKSPACE CONTROL BAR */}
      <header
        className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl px-4 sm:px-6 h-16 flex items-center justify-between gap-3 ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-xs'
            : 'bg-[#090C14]/95 border-white/10 shadow-lg'
        }`}
      >
        {/* Left: Branding & Atelier Status Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A880] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md">
              <div
                className={`w-full h-full rounded-[6px] flex items-center justify-center ${
                  isLight ? 'bg-white text-slate-900' : 'bg-[#0D121F] text-[#D4AF37]'
                }`}
              >
                <Grid className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Baiti Atelier</span>
                <span className="text-xs text-[#D4AF37] font-bold font-arabic">بيتي</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                  PRO WORKSPACE
                </span>
              </div>
              <p className={`text-[10px] font-mono -mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                {isTauriDesktop() ? 'Desktop App Enclave (Tauri v2)' : 'Mode Atelier Connecté'}
              </p>
            </div>
          </div>

          {/* Wilaya Selector */}
          <div
            className={`hidden md:flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs border ml-2 ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-white/5 border-white/10 text-zinc-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className={`bg-transparent border-none text-xs font-mono focus:outline-none cursor-pointer ${
                isLight ? 'text-slate-800' : 'text-zinc-200'
              }`}
            >
              {ALGERIAN_WILAYAS_58.map((w) => (
                <option
                  key={w.code}
                  value={`${w.code} - ${w.nameFr}`}
                  className={isLight ? 'bg-white text-slate-800' : 'bg-[#0E121C] text-white'}
                >
                  {formatWilayaLabel(w, language)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Primary Tab Switcher */}
        <nav
          className={`flex items-center gap-1 p-1 rounded-2xl border text-xs font-mono overflow-x-auto no-scrollbar max-w-full ${
            isLight
              ? 'bg-slate-100 border-slate-200 text-slate-700'
              : 'bg-white/5 border-white/10 text-zinc-400'
          }`}
        >
          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('cad');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0 ${
              activeTab === 'cad'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'hover:text-slate-900 hover:bg-slate-200/60'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Studio CAO 2D</span>
            <span className="sm:hidden">CAO</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('optimizer');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0 ${
              activeTab === 'optimizer'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'hover:text-slate-900 hover:bg-slate-200/60'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Optimiseur Débit</span>
            <span className="sm:hidden">Débit</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('terminal');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0 ${
              activeTab === 'terminal'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'hover:text-slate-900 hover:bg-slate-200/60'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal Scie</span>
            <span className="sm:hidden">Scie</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('tracking');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0 ${
              activeTab === 'tracking'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'hover:text-slate-900 hover:bg-slate-200/60'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Suivi Fabrication</span>
            <span className="sm:hidden">Suivi</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('settings');
            }}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer font-bold shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#D4AF37] text-slate-950 shadow-sm'
                : isLight
                ? 'hover:text-slate-900 hover:bg-slate-200/60'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paramètres Marge</span>
            <span className="sm:hidden">Marge</span>
          </button>
        </nav>

        {/* Right: Vitrine Toggle, Modals & Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Vision Scanner */}
          <button
            onClick={() => {
              playTactileClick();
              onOpenSketchModal();
            }}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Scanner un croquis chantier avec l'IA"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden xl:inline font-mono text-[11px]">Scanner Croquis</span>
          </button>

          {/* Quotes Disk */}
          <button
            onClick={() => {
              playTactileClick();
              onOpenOfflineQuotes();
            }}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Ouvrir le carnet de devis local"
          >
            <FileText className="w-4 h-4 text-amber-500" />
            <span className="hidden xl:inline font-mono text-[11px]">Carnet Devis</span>
          </button>

          {/* Material Bourse */}
          <button
            onClick={() => {
              playTactileClick();
              onOpenMaterialMarket();
            }}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title="Bourse des matières premières en Algérie"
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="hidden xl:inline font-mono text-[11px]">Bourse Matières</span>
          </button>

          {/* Direct Navbar Sun/Moon Toggle */}
          <button
            onClick={handleToggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
            title={soundOn ? 'Désactiver les sons' : 'Activer les sons'}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {/* Big Switch Button: Flip to Client 3D Showcase */}
          <button
            onClick={() => {
              playTactileClick();
              onSwitchToVitrine();
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/25 cursor-pointer hover-lift btn-press ml-1"
            title="Afficher la vitrine 3D pour un client"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Vitrine Client 3D</span>
            <span className="sm:hidden">Vitrine</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE STATUS TICKER */}
      <div
        className={`px-4 sm:px-6 py-2 border-b text-[11px] font-mono flex flex-wrap items-center justify-between gap-3 ${
          isLight
            ? 'bg-slate-200/60 border-slate-300/70 text-slate-700'
            : 'bg-[#0B0E17] border-white/5 text-zinc-400'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Poste Débitage Actif</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>
              {systemInfo?.offline_storage_active
                ? `Base SQLite Locale: Active (${systemInfo.app_version})`
                : 'Pilote Scie Double-Tête: Prêt (COM3)'}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {systemInfo?.thermal_printer_ready
                ? 'Étiqueteuse Thermique: Connectée (ESC/POS)'
                : 'Étiqueteuse Thermique: En Ligne'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span>Norme: DTR C3-2 / CNERIB</span>
          <span>•</span>
          <span className="text-[#D4AF37] font-semibold">Tolérance 0.1 mm</span>
          <span>•</span>
          <span>58 Wilayas</span>
        </div>
      </div>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'cad' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0F1422] border-white/10'
              }`}
            >
              <div>
                <h2 className="text-base font-bold">Studio CAO Châssis & Meneaux</h2>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Dessinez les traverses, affectez les ouvertures oscillo-battantes ou coulissantes et calculez instantanément la liste de débit.
                </p>
              </div>
            </div>
            <CadStudio2D />
          </div>
        )}

        {activeTab === 'optimizer' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CuttingStudio />
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div
              className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0F1422] border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Terminal Opérateur Scie & Étiqueteuse</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                    POSTE ATELIER
                  </span>
                </div>
                <p className={`text-xs mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                  Suivez la découpe barre par barre en atelier avec validation par lecteur code-barres USB/Bluetooth et impression des étiquettes d'usinage et d'assemblage.
                </p>
              </div>

              <button
                onClick={() => {
                  playTactileClick();
                  setIsTerminalModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#D4AF37]/25 cursor-pointer shrink-0"
              >
                <HardDrive className="w-4 h-4" />
                <span>Lancer le Terminal Scie Plein Écran</span>
              </button>
            </div>

            {/* Quick summary grid of current cuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0F1422] border-white/10'
                }`}
              >
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Pièces au Bordereau</div>
                <div className="text-2xl font-bold font-mono mt-1 text-[#D4AF37]">{currentBom.cuts.length}</div>
                <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Dormants, ouvrants et parcloses
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0F1422] border-white/10'
                }`}
              >
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Longueur Totale Profilés</div>
                <div className="text-2xl font-bold font-mono mt-1 text-sky-400">
                  {currentBom.totalProfileMeters.toFixed(2)} m
                </div>
                <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Châssis {config.width} × {config.height} mm
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0F1422] border-white/10'
                }`}
              >
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Lecteur Code-barres</div>
                <div className="text-base font-bold font-mono mt-1 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Actif & Prêt (HID)</span>
                </div>
                <div className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Validation tactile ou automatique au scan
                </div>
              </div>
            </div>

            {/* List of Cut pieces preview */}
            <div
              className={`p-5 rounded-2xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0F1422] border-white/10'
              }`}
            >
              <h3 className="text-sm font-bold mb-3 font-mono">Bordereau Préparatoire de Découpe</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-zinc-400'}`}>
                      <th className="text-left py-2 px-3">Repère</th>
                      <th className="text-left py-2 px-3">Désignation Profilé</th>
                      <th className="text-right py-2 px-3">Longueur (mm)</th>
                      <th className="text-center py-2 px-3">Onglets G / D</th>
                      <th className="text-center py-2 px-3">Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentBom.cuts.slice(0, 8).map((cut, idx) => (
                      <tr key={cut.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'}>
                        <td className="py-2.5 px-3 text-[#D4AF37] font-bold">#{idx + 1}</td>
                        <td className="py-2.5 px-3">{cut.label}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{cut.lengthMm.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-center">{cut.cutLeftAngle}° / {cut.cutRightAngle}°</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            cut.role === 'frame'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {cut.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Terminal */}
            <CuttingAssemblyTerminal
              isOpen={isTerminalModalOpen}
              onClose={() => setIsTerminalModalOpen(false)}
              bom={currentBom}
              config={config}
              jobName="Poste Scie Atelier Pro"
            />
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <WorkshopJobTracker />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <WorkshopFinancialSettings />
          </div>
        )}
      </main>
    </div>
  );
};
export default WorkshopProWorkspace;

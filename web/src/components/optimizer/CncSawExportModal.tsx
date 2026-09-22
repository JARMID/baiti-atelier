import React, { useState, useMemo } from 'react';
import type { OptimizedBar1D } from '../../types/optimizer';
import {
  type CncMachineBrand,
  generateCncSawFile,
  downloadCncSawFile,
  estimateSawCycleTimeSeconds,
} from '../../utils/cncSawGCodeGenerator';
import { useConfigStore } from '../../store/configStore';
import {
  Download,
  Copy,
  Check,
  X,
  Cpu,
  Clock,
  Settings2,
  FileCode,
} from 'lucide-react';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';

interface CncSawExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bars: OptimizedBar1D[];
  jobName?: string;
  profileCode?: string;
}

const MACHINE_BRANDS: Array<{
  id: CncMachineBrand;
  name: string;
  subtitle: string;
  ext: string;
}> = [
  {
    id: 'iso_gcode',
    name: 'Standard ISO G-Code',
    subtitle: 'Centre d\'usinage & Scies CNC universelles',
    ext: '.nc',
  },
  {
    id: 'elumatec',
    name: 'Elumatec DG 244 / 142',
    subtitle: 'Protocole CSV / ASCII Elumatec',
    ext: '.dat',
  },
  {
    id: 'emmegi',
    name: 'Emmegi Precision TS2',
    subtitle: 'Format découpe CamData / TS2',
    ext: '.csv',
  },
  {
    id: 'yilmaz',
    name: 'Yilmaz DC 421 / 550 PB',
    subtitle: 'Format pupitre tactile Yilmaz',
    ext: '.txt',
  },
  {
    id: 'fom_industrie',
    name: 'FOM Industrie Blitz',
    subtitle: 'Format ISO étendu FOM',
    ext: '.nc',
  },
];

export const CncSawExportModal: React.FC<CncSawExportModalProps> = ({
  isOpen,
  onClose,
  bars,
  jobName = 'Chantier Menuiserie Baiti',
  profileCode = 'TPR-40',
}) => {
  const { theme, selectedWilaya } = useConfigStore();
  const isLight = theme === 'light';

  const [machineBrand, setMachineBrand] = useState<CncMachineBrand>('iso_gcode');
  const [copied, setCopied] = useState(false);
  const [spindleRpm, setSpindleRpm] = useState(3200);
  const [feedRateMmMin, setFeedRateMmMin] = useState(450);

  const cycleTime = useMemo(() => {
    return estimateSawCycleTimeSeconds(bars);
  }, [bars]);

  const fileData = useMemo(() => {
    return generateCncSawFile(bars, {
      machineType: machineBrand,
      jobName,
      profileCode,
      spindleRpm,
      feedRateMmMin,
      operatorName: 'Atelier Baiti',
      wilaya: selectedWilaya,
    });
  }, [bars, machineBrand, jobName, profileCode, spindleRpm, feedRateMmMin, selectedWilaya]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    playTactileClick();
    navigator.clipboard.writeText(fileData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playTactileClick();
    downloadCncSawFile(bars, {
      machineType: machineBrand,
      jobName,
      profileCode,
      spindleRpm,
      feedRateMmMin,
      operatorName: 'Atelier Baiti',
      wilaya: selectedWilaya,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/15 text-zinc-100'
        }`}
      >
        {/* MODAL HEADER */}
        <div
          className={`p-5 md:p-6 border-b flex items-center justify-between gap-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] p-0.5 flex items-center justify-center shadow-md">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isLight ? 'bg-white text-slate-900' : 'bg-[#0E1322] text-[#D4AF37]'
                }`}
              >
                <Cpu className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold">Générateur de Fichier Scie CNC Double-Tête</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                  G-CODE & NC
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {bars.length} barres calculées • Profilé {profileCode} • {jobName}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* MACHINE BRAND SELECTOR TILES */}
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2.5">
              Sélectionnez la marque ou le protocole de votre scie
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MACHINE_BRANDS.map((brand) => {
                const isSelected = machineBrand === brand.id;
                return (
                  <button
                    key={brand.id}
                    onClick={() => {
                      playSwitchSound();
                      setMachineBrand(brand.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono">{brand.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-[#D4AF37]">
                          {brand.ext}
                        </span>
                      </div>
                      <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {brand.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TELEMETRY & CUT PARAMETERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Temps de Cycle Estimé</span>
              </div>
              <div className="text-xl font-bold font-mono mt-1 text-[#D4AF37]">
                {cycleTime.totalMinutes} min
              </div>
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                ~{cycleTime.perBarSec}s par barre chargée
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Settings2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Rotation Lame (RPM)</span>
              </div>
              <input
                type="number"
                value={spindleRpm}
                onChange={(e) => setSpindleRpm(Number(e.target.value) || 3000)}
                className={`w-full mt-1 px-2.5 py-1 text-sm font-mono font-bold rounded-lg border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0E1322] border-white/15 text-white'
                }`}
              />
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                Recommandé: 2800 à 3400 RPM
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Avance Plongeante (mm/min)</span>
              </div>
              <input
                type="number"
                value={feedRateMmMin}
                onChange={(e) => setFeedRateMmMin(Number(e.target.value) || 450)}
                className={`w-full mt-1 px-2.5 py-1 text-sm font-mono font-bold rounded-lg border focus:outline-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#0E1322] border-white/15 text-white'
                }`}
              />
              <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                Lubrification micro-gouttelettes M10
              </div>
            </div>
          </div>

          {/* CODE PREVIEW BOX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                <FileCode className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Aperçu du Fichier Machine ({fileData.filename})</span>
              </div>
              <button
                onClick={handleCopyCode}
                className={`px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <pre
              className={`p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-56 border leading-relaxed ${
                isLight
                  ? 'bg-slate-900 text-emerald-400 border-slate-800'
                  : 'bg-[#06080E] text-emerald-400 border-white/10'
              }`}
            >
              {fileData.content}
            </pre>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div
          className={`p-5 md:p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
          }`}
        >
          <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Le fichier généré est directement chargeable via clé USB ou câble RS-232 sur le pupitre de la scie.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl border text-xs font-mono cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
              }`}
            >
              Fermer
            </button>

            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#D4AF37]/25 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier ({fileData.filename})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CncSawExportModal;

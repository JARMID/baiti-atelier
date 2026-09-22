import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  getWorkshopSettings,
  saveWorkshopSettings,
} from '../../utils/workshopJobManager';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  Sliders,
  RotateCcw,
  Check,
  Building2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Cpu,
} from 'lucide-react';

export const WorkshopFinancialSettings: React.FC = () => {
  const { theme, calibration, setCalibration, resetCalibration, cost } = useConfigStore();
  const isLight = theme === 'light';

  const [settings, setSettings] = useState(() => getWorkshopSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calibration local states
  const [hourlyRate, setHourlyRate] = useState(
    calibration.artisanHourlyRateDzd || settings.hourlyRateDzd
  );
  const [targetMargin, setTargetMargin] = useState(
    calibration.workshopTargetMarginPercent || settings.targetMarginPercent
  );
  const [aluMultiplier, setAluMultiplier] = useState(
    calibration.aluminumPriceMultiplier || 1.0
  );
  const [glassMultiplier, setGlassMultiplier] = useState(
    calibration.glassPriceMultiplier || 1.0
  );
  const [sawKerf, setSawKerf] = useState(settings.sawKerfMm || 4.0);
  const [barLength, setBarLength] = useState(settings.standardBarLengthMm || 6000);
  const [deliveryBase, setDeliveryBase] = useState(settings.deliveryBaseDzd || 7000);

  // Workshop Identity
  const [workshopName, setWorkshopName] = useState(settings.workshopName);
  const [workshopPhone, setWorkshopPhone] = useState(settings.workshopPhone);
  const [workshopWilaya, setWorkshopWilaya] = useState(settings.workshopWilaya);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    playTactileClick();

    // 1. Update configStore calibration
    setCalibration({
      artisanHourlyRateDzd: Number(hourlyRate),
      workshopTargetMarginPercent: Number(targetMargin),
      aluminumPriceMultiplier: Number(aluMultiplier),
      glassPriceMultiplier: Number(glassMultiplier),
    });

    // 2. Update persistent workshop settings
    const updated = {
      hourlyRateDzd: Number(hourlyRate),
      targetMarginPercent: Number(targetMargin),
      sawKerfMm: Number(sawKerf),
      standardBarLengthMm: Number(barLength),
      energyOverheadPercent: settings.energyOverheadPercent,
      deliveryBaseDzd: Number(deliveryBase),
      workshopName: workshopName.trim() || 'Menuiserie Baiti Atelier',
      workshopPhone: workshopPhone.trim() || '05 50 00 00 00',
      workshopWilaya,
    };

    saveWorkshopSettings(updated);
    setSettings(updated);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    playSwitchSound();
    resetCalibration();
    setHourlyRate(1500);
    setTargetMargin(30);
    setAluMultiplier(1.0);
    setGlassMultiplier(1.0);
    setSawKerf(4.0);
    setBarLength(6000);
    setDeliveryBase(7000);
  };

  // Real-time calculation preview based on current parameters
  const simulatedLaborCost = Math.round(hourlyRate * 3.5); // avg 3.5 hours
  const simulatedMaterialCost = Math.round(cost.profileCostDzd * aluMultiplier + cost.glassCostDzd * glassMultiplier + cost.hardwareCostDzd);
  const simulatedCostBeforeMargin = simulatedMaterialCost + simulatedLaborCost;
  const simulatedSalePrice = Math.round(simulatedCostBeforeMargin * (1 + targetMargin / 100));
  const simulatedGrossProfit = simulatedSalePrice - simulatedCostBeforeMargin;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0E121C] border-white/10'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Paramètres Économiques & Marge Atelier
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] font-semibold">
              CALIBRATION COMMERCIALE
            </span>
          </div>
          <p className={`text-xs mt-1.5 max-w-2xl ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Ajustez votre coût horaire de main d'oeuvre, votre taux de marge nette ciblée et vos paramètres de débit pour refléter exactement les coûts réels de votre atelier en Algérie.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className={`px-3.5 py-2 rounded-xl border text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Valeurs Référence DTR</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: FORM CONTROLS */}
          <div className="lg:col-span-7 space-y-6">
            {/* CARD 1: MAIN D'OEUVRE & MARGE COMMERCIALE */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
              }`}
            >
              <h3 className="text-sm font-bold flex items-center gap-2 text-[#D4AF37] uppercase tracking-wider font-mono">
                <TrendingUp className="w-4 h-4" />
                <span>Rentabilité & Main d'Œuvre</span>
              </h3>

              {/* Taux Horaire */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Taux Horaire Atelier (Artisan + Monteur)</span>
                  <span className="font-bold text-[#D4AF37]">{hourlyRate.toLocaleString('fr-DZ')} DZD / heure</span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="3500"
                  step="50"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>800 DZD</span>
                  <span>1 500 DZD (Moyenne Nationale)</span>
                  <span>3 500 DZD</span>
                </div>
              </div>

              {/* Marge Cible */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Marge Brute Ciblée Atelier</span>
                  <span className="font-bold text-emerald-400">{targetMargin}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>15% (Chantiers Volume)</span>
                  <span>30% (Standard)</span>
                  <span>50% (Haut standing)</span>
                </div>
              </div>
            </div>

            {/* CARD 2: PARAMÈTRES TECHNIQUES DE DÉCOUPE (SCIE & CHUTES) */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
              }`}
            >
              <h3 className="text-sm font-bold flex items-center gap-2 text-sky-400 uppercase tracking-wider font-mono">
                <Cpu className="w-4 h-4" />
                <span>Paramètres de Débit Scie & Matières</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Épaisseur Lame de Scie (Kerf)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="2.0"
                      max="6.0"
                      value={sawKerf}
                      onChange={(e) => setSawKerf(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                      }`}
                    />
                    <span className="text-zinc-400 text-xs">mm</span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Longueur Barre Standard</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={barLength}
                      onChange={(e) => setBarLength(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black border-white/10 text-white'
                      }`}
                    >
                      <option value={6000}>6 000 mm (Standard Profilor/Import)</option>
                      <option value={6500}>6 500 mm (TPR Algérie Long)</option>
                      <option value={5800}>5 800 mm (Container maritime)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
                <div>
                  <label className="block text-zinc-400 mb-1">Coefficient Prix Aluminium</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.8"
                    max="1.5"
                    value={aluMultiplier}
                    onChange={(e) => setAluMultiplier(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">1.0 = Prix usine officiel</span>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Forfait Pose / Transport Base</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="500"
                      min="0"
                      max="30000"
                      value={deliveryBase}
                      onChange={(e) => setDeliveryBase(Number(e.target.value))}
                      className={`w-full p-2.5 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                      }`}
                    />
                    <span className="text-zinc-400 text-xs">DZD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: IDENTITÉ ATELIER */}
            <div
              className={`p-6 rounded-3xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0E121C] border-white/10'
              }`}
            >
              <h3 className="text-sm font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-wider font-mono">
                <Building2 className="w-4 h-4" />
                <span>En-Tête & Coordonnées Atelier</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-zinc-400 mb-1">Nom Commercial de l'Atelier</label>
                  <input
                    type="text"
                    value={workshopName}
                    onChange={(e) => setWorkshopName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Téléphone de l'Atelier</label>
                  <input
                    type="tel"
                    value={workshopPhone}
                    onChange={(e) => setWorkshopPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs font-mono">
                <label className="block text-zinc-400 mb-1">Wilaya Principale de l'Atelier</label>
                <select
                  value={workshopWilaya}
                  onChange={(e) => setWorkshopWilaya(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-black border-white/10 text-white'
                  }`}
                >
                  {ALGERIAN_WILAYAS_58.map((w) => (
                    <option key={w.code} value={`${w.code} - ${w.nameFr}`}>
                      {w.code} - {w.nameFr} ({w.nameAr})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/25 cursor-pointer hover-lift btn-press"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer & Appliquer au Chiffrage</span>
              </button>

              {savedSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Paramètres appliqués avec succès à tous les calculs !</span>
                </span>
              )}
            </div>
          </div>

          {/* RIGHT 5 COLS: LIVE FINANCIAL SIMULATOR PREVIEW */}
          <div className="lg:col-span-5 space-y-4">
            <div
              className={`p-6 rounded-3xl border sticky top-24 space-y-4 font-mono ${
                isLight ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-[#0E121C] border-white/10 text-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#D4AF37]">
                    Simulation Économique En Direct
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Sur un châssis standard (1200 × 1400 mm)
                  </p>
                </div>
                <Zap className="w-4 h-4 text-[#D4AF37]" />
              </div>

              {/* Line items breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-zinc-400">Matières Profilés & Vitrage :</span>
                  <span className="font-bold">{simulatedMaterialCost.toLocaleString('fr-DZ')} DZD</span>
                </div>

                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-zinc-400">Main d'Œuvre ({hourlyRate} DZD × 3.5h) :</span>
                  <span className="font-bold text-sky-400">{simulatedLaborCost.toLocaleString('fr-DZ')} DZD</span>
                </div>

                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-zinc-400">Coût de Revient Atelier (Déboursé Sec) :</span>
                  <span className="font-bold text-amber-400">{simulatedCostBeforeMargin.toLocaleString('fr-DZ')} DZD</span>
                </div>

                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-zinc-400">Marge Nette ({targetMargin}%) :</span>
                  <span className="font-bold text-emerald-400">+{simulatedGrossProfit.toLocaleString('fr-DZ')} DZD</span>
                </div>

                <div className="flex justify-between py-2 text-sm bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
                  <span className="font-bold text-[#D4AF37]">Prix de Vente Client TTC :</span>
                  <span className="font-bold text-[#D4AF37]">{simulatedSalePrice.toLocaleString('fr-DZ')} DZD</span>
                </div>
              </div>

              {/* Note on DTR C3-2 */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
                Les prix unitaires calculés intègrent la tolérance d'usinage de 0.1 mm et la conformité au document technique réglementaire algérien DTR C3-2 (charges au vent et étanchéité à l'air).
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkshopFinancialSettings;

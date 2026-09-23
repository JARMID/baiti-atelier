import React, { useState, useMemo } from 'react';
import {
  X,
  FileCheck,
  Compass,
  Sliders,
  Sun,
  ShieldCheck,
  Zap,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playSlideTick } from '../../utils/audioFeedback';
import {
  computeSolarSunshadeAudit,
  BLADE_SPECS,
  type SunshadeType,
  type FacadeOrientation,
  type BladeProfileModel,
} from '../../utils/solarSunshadeManager';
import { generateSolarSunshadeNoticePdf } from '../../utils/pdfGenerator';

interface SolarSunshadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWidth?: number;
  initialHeight?: number;
  projectReference?: string;
  wilayaName?: string;
  clientName?: string;
}

export const SolarSunshadeModal: React.FC<SolarSunshadeModalProps> = ({
  isOpen,
  onClose,
  initialWidth = 1800,
  initialHeight = 2150,
  projectReference = 'Brise-Soleil Baie 1800x2150',
  wilayaName = '16 - Alger',
  clientName = 'Chantier Client',
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'solar_factors' | 'cad_sun_ray_view' | 'energy_daylight'>('config');

  // Geometry
  const [windowWidthMm, setWindowWidthMm] = useState<number>(initialWidth);
  const [windowHeightMm, setWindowHeightMm] = useState<number>(initialHeight);

  // Sunshade Configuration
  const [sunshadeType, setSunshadeType] = useState<SunshadeType>('horizontal_louvers_blades');
  const [bladeModel, setBladeModel] = useState<BladeProfileModel>('blade_150_elliptical');
  const [bladePitchSpacingMm, setBladePitchSpacingMm] = useState<number>(160);
  const [bladeTiltAngleDeg, setBladeTiltAngleDeg] = useState<number>(30);
  const [canopyProjectionMm, setCanopyProjectionMm] = useState<number>(600);
  const [facadeOrientation, setFacadeOrientation] = useState<FacadeOrientation>('south');
  const [targetMonth, setTargetMonth] = useState<'summer_solstice' | 'mid_season_equinox' | 'winter_solstice'>('summer_solstice');

  // Glazing performance
  const glassSolarFactorG = 0.60;
  const glassLightTransmissionTv = 0.78;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Audit Calculations
  const audit = useMemo(() => {
    return computeSolarSunshadeAudit({
      windowWidthMm,
      windowHeightMm,
      sunshadeType,
      bladeModel,
      bladePitchSpacingMm,
      bladeTiltAngleDeg,
      canopyProjectionMm,
      facadeOrientation,
      glassSolarFactorG,
      glassLightTransmissionTv,
      targetMonth,
      wilayaName,
      clientName,
      projectReference,
    });
  }, [
    windowWidthMm,
    windowHeightMm,
    sunshadeType,
    bladeModel,
    bladePitchSpacingMm,
    bladeTiltAngleDeg,
    canopyProjectionMm,
    facadeOrientation,
    glassSolarFactorG,
    glassLightTransmissionTv,
    targetMonth,
    wilayaName,
    clientName,
    projectReference,
  ]);

  if (!isOpen) return null;

  const handleExportPdf = async () => {
    playTactileClick();
    setIsGeneratingPdf(true);
    try {
      const docId = `SOL-${Date.now().toString().slice(-6)}`;
      await generateSolarSunshadeNoticePdf({
        documentId: docId,
        projectRef: projectReference,
        clientName,
        wilayaName,
        input: {
          windowWidthMm,
          windowHeightMm,
          sunshadeType,
          bladeModel,
          bladePitchSpacingMm,
          bladeTiltAngleDeg,
          canopyProjectionMm,
          facadeOrientation,
          glassSolarFactorG,
          glassLightTransmissionTv,
          targetMonth,
          wilayaName,
          clientName,
          projectReference,
        },
        audit,
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Brise-Soleil Architectural & Masque Solaire</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  DTR C3-2 / NF EN 13363-1
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Facteur solaire combiné g_tot, économie de climatisation et confort lumineux naturel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Générer l attestation officielle en PDF"
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isGeneratingPdf ? 'Génération...' : 'Notice PDF'}</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global KPI Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Facteur g_tot</span>
            <strong className="text-amber-400 text-sm">{audit.totalCombinedSolarFactorGtot}</strong>
            <span className="text-[10px] text-emerald-400 block">-{audit.solarHeatReductionPercent}% chaleur</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Conformité DTR C3-2</span>
            <strong className={audit.isDtrCompliant ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>
              {audit.isDtrCompliant ? 'Conforme' : 'Dépassement'}
            </strong>
            <span className="text-[10px] text-slate-400 block">Plafond : {audit.dtrMaxAllowedGtot}</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Économie Clim Été</span>
            <strong className="text-emerald-400 text-sm">{audit.summerEnergySavedKwh} kWh</strong>
            <span className="text-[10px] text-slate-400 block">~{audit.coolingCostSavedDzd.toLocaleString('fr-DZ')} DZD/an</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Lumière Naturelle (FLJ)</span>
            <strong className="text-cyan-400 text-sm">{audit.daylightFactorEstimatedPercent}%</strong>
            <span className="text-[10px] text-slate-400 block">TL total {Math.round(audit.effectiveLightTransmissionTvTot * 100)}%</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 overflow-x-auto">
          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('config');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'config'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Configuration & Lames
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('solar_factors');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'solar_factors'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Facteur Solaire & DTR C3-2
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('cad_sun_ray_view');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'cad_sun_ray_view'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Rayons Solaires & Coupe CAD
          </button>

          <button
            onClick={() => {
              playSwitchSound();
              setActiveTab('energy_daylight');
            }}
            className={`min-h-[44px] px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'energy_daylight'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Énergie & Confort Visuel
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              
              {/* Dimensions Section */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Dimensions de la Baie & Orientation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Largeur Baie : {windowWidthMm} mm
                    </label>
                    <input
                      type="range"
                      min="800"
                      max="4000"
                      step="50"
                      value={windowWidthMm}
                      onChange={(e) => {
                        playSlideTick();
                        setWindowWidthMm(parseInt(e.target.value));
                      }}
                      className="w-full accent-amber-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.8 m</span>
                      <span className="text-amber-400 font-bold">{(windowWidthMm / 1000).toFixed(2)} m</span>
                      <span>4.0 m</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Hauteur Baie : {windowHeightMm} mm
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="3500"
                      step="50"
                      value={windowHeightMm}
                      onChange={(e) => {
                        playSlideTick();
                        setWindowHeightMm(parseInt(e.target.value));
                      }}
                      className="w-full accent-amber-500 cursor-pointer min-h-[44px]"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>1.0 m</span>
                      <span className="text-amber-400 font-bold">{(windowHeightMm / 1000).toFixed(2)} m</span>
                      <span>3.5 m</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Orientation de la Façade</label>
                    <select
                      value={facadeOrientation}
                      onChange={(e) => {
                        playTactileClick();
                        setFacadeOrientation(e.target.value as FacadeOrientation);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="south">Sud (Soleil haut de mi-journée)</option>
                      <option value="south_west">Sud-Ouest (Chaleur critique après-midi)</option>
                      <option value="west">Ouest (Soleil rasant d été très chaud)</option>
                      <option value="east">Est (Soleil du matin)</option>
                      <option value="north">Nord (Lumière diffuse)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sunshade Type and Blade Selector */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Type de Dispositif & Profilé de Lame
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Forme du Brise-Soleil</label>
                    <select
                      value={sunshadeType}
                      onChange={(e) => {
                        playTactileClick();
                        setSunshadeType(e.target.value as SunshadeType);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="horizontal_louvers_blades">Lames Horizontales Multiples Fixes (Standard)</option>
                      <option value="horizontal_canopy_casquette">Casquette Horizontale Unique en Débord (Toiture)</option>
                      <option value="vertical_louvers_blades">Lames Verticales (Optimal pour façades Est / Ouest)</option>
                      <option value="motorized_adjustable_louvers">Lames Orientables Motorisées (Suivi solaire actif)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modèle de Lame Aluminium</label>
                    <select
                      value={bladeModel}
                      onChange={(e) => {
                        playTactileClick();
                        setBladeModel(e.target.value as BladeProfileModel);
                      }}
                      className="min-h-[44px] w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      {Object.values(BLADE_SPECS).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.labelFr} (P={b.depthMm} mm, Portée max {b.maxSpanM}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  {sunshadeType !== 'horizontal_canopy_casquette' ? (
                    <>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Entraxe vertical entre lames (S) : {bladePitchSpacingMm} mm
                        </label>
                        <input
                          type="range"
                          min="80"
                          max="280"
                          step="10"
                          value={bladePitchSpacingMm}
                          onChange={(e) => {
                            playSlideTick();
                            setBladePitchSpacingMm(parseInt(e.target.value));
                          }}
                          className="w-full accent-amber-500 cursor-pointer min-h-[44px]"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>80 mm</span>
                          <span className="text-amber-400 font-bold">{bladePitchSpacingMm} mm</span>
                          <span>280 mm</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">
                          Inclinaison des lames : {bladeTiltAngleDeg}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="5"
                          value={bladeTiltAngleDeg}
                          onChange={(e) => {
                            playSlideTick();
                            setBladeTiltAngleDeg(parseInt(e.target.value));
                          }}
                          className="w-full accent-amber-500 cursor-pointer min-h-[44px]"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>0° (Plat)</span>
                          <span className="text-amber-400 font-bold">{bladeTiltAngleDeg}°</span>
                          <span>60° (Fort)</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-400 block mb-1">
                        Profondeur de la casquette : {canopyProjectionMm} mm
                      </label>
                      <input
                        type="range"
                        min="400"
                        max="1400"
                        step="50"
                        value={canopyProjectionMm}
                        onChange={(e) => {
                          playSlideTick();
                          setCanopyProjectionMm(parseInt(e.target.value));
                        }}
                        className="w-full accent-amber-500 cursor-pointer min-h-[44px]"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>400 mm</span>
                        <span className="text-amber-400 font-bold">{canopyProjectionMm} mm</span>
                        <span>1400 mm</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOLAR FACTORS & DTR C3-2 */}
          {activeTab === 'solar_factors' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Facteur Solaire Combiné (NF EN 13363-1)</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      audit.isDtrCompliant ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {audit.isDtrCompliant ? 'Conforme DTR C3-2' : 'Dépassement'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 font-mono pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facteur solaire vitrage nu g :</span>
                      <strong>{audit.unshadedSolarFactorG}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Facteur solaire combiné g_tot :</span>
                      <strong className="text-amber-400 text-sm">{audit.totalCombinedSolarFactorGtot}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seuil réglementaire max DTR :</span>
                      <strong>{audit.dtrMaxAllowedGtot}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Réduction de la surchauffe :</span>
                      <strong className="text-emerald-400">-{audit.solarHeatReductionPercent}%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Géométrie du Masque Solaire</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300">
                      Ombrage {Math.round(audit.effectiveShadingRatio * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1.5 font-mono pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Angle de coupure directe (cutoff) :</span>
                      <strong>{audit.cutOffAngleDeg}°</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hauteur solaire zénithale midi :</span>
                      <strong>{audit.solarProfileAngleDeg}°</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre de lames :</span>
                      <strong>{audit.bladeCount} lames ({audit.bladeLengthMm} mm)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Classe confort thermique :</span>
                      <strong className="text-teal-400">{audit.thermalComfortSummerClass.split('(')[0].trim()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Season Selection Chips */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-white block">
                  Simuler la Saison & la Course Solaire en Algérie (Latitude 36°N)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setTargetMonth('summer_solstice');
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-mono text-left cursor-pointer transition-all ${
                      targetMonth === 'summer_solstice'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">21 Juin (Solstice d Été)</span>
                    <span className="text-[10px] block opacity-75">Soleil haut (77.5°) • Chaleur max</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setTargetMonth('mid_season_equinox');
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-mono text-left cursor-pointer transition-all ${
                      targetMonth === 'mid_season_equinox'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">21 Mars/Sept (Équinoxe)</span>
                    <span className="text-[10px] block opacity-75">Soleil moyen (54.0°) • Mi-saison</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playTactileClick();
                      setTargetMonth('winter_solstice');
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-mono text-left cursor-pointer transition-all ${
                      targetMonth === 'winter_solstice'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-bold">21 Décembre (Solstice d Hiver)</span>
                    <span className="text-[10px] block opacity-75">Soleil bas (30.5°) • Apports gratuits</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CAD DYNAMIC SUN RAY VIEW */}
          {activeTab === 'cad_sun_ray_view' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                
                {/* SVG Sun Ray Simulation */}
                <div className="w-full overflow-x-auto flex justify-center py-2">
                  <svg
                    viewBox="0 0 700 320"
                    className="w-full max-w-2xl h-auto bg-slate-900 rounded-xl border border-slate-800 shadow-inner"
                  >
                    <defs>
                      <linearGradient id="wallSectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#334155" />
                        <stop offset="100%" stopColor="#1E293B" />
                      </linearGradient>

                      <linearGradient id="louverAluGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D97706" />
                        <stop offset="100%" stopColor="#B45309" />
                      </linearGradient>
                    </defs>

                    {/* Masonry Wall Top (Linteau) */}
                    <rect x="180" y="20" width="70" height="70" fill="url(#wallSectionGrad)" stroke="#475569" strokeWidth="1.5" />
                    <text x="215" y="60" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Linteau
                    </text>

                    {/* Masonry Wall Bottom (Allège) */}
                    <rect x="180" y="230" width="70" height="70" fill="url(#wallSectionGrad)" stroke="#475569" strokeWidth="1.5" />
                    <text x="215" y="270" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Allège
                    </text>

                    {/* Window Frame & Glazing Pane */}
                    <rect x="205" y="90" width="20" height="140" fill="#0284C7" opacity="0.3" stroke="#38BDF8" strokeWidth="2" />
                    <line x1="215" y1="90" x2="215" y2="230" stroke="#38BDF8" strokeWidth="3" />
                    <text x="215" y="165" fill="#38BDF8" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Vitrage
                    </text>

                    {/* Sun Position */}
                    <circle cx="560" cy="40" r="24" fill="#F59E0B" />
                    <text x="560" y="44" fill="#0F172A" fontSize="9" fontWeight="bold" textAnchor="middle">
                      Soleil
                    </text>
                    <text x="560" y="75" fill="#FBBF24" fontSize="8" fontWeight="bold" textAnchor="middle">
                      Angle {audit.solarProfileAngleDeg}°
                    </text>

                    {/* Louver Mounting Bracket Arm */}
                    <line x1="250" y1="95" x2="360" y2="95" stroke="#94A3B8" strokeWidth="4" />
                    <line x1="250" y1="225" x2="360" y2="225" stroke="#94A3B8" strokeWidth="4" />
                    <line x1="360" y1="90" x2="360" y2="230" stroke="#64748B" strokeWidth="3" />

                    {/* Louver Blades Array */}
                    {[110, 150, 190].map((ly) => {
                      const tiltRad = (bladeTiltAngleDeg * Math.PI) / 180;
                      const bladeWidth = BLADE_SPECS[bladeModel].depthMm * 0.35;
                      const x1 = 360 - Math.cos(tiltRad) * (bladeWidth / 2);
                      const y1 = ly - Math.sin(tiltRad) * (bladeWidth / 2);
                      const x2 = 360 + Math.cos(tiltRad) * (bladeWidth / 2);
                      const y2 = ly + Math.sin(tiltRad) * (bladeWidth / 2);

                      return (
                        <g key={ly}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#louverAluGrad)" strokeWidth="6" strokeLinecap="round" />
                          <circle cx="360" cy={ly} r="3" fill="#D4AF37" />
                        </g>
                      );
                    })}

                    {/* Incident Sun Rays */}
                    <g opacity="0.75">
                      <line x1="530" y1="55" x2="375" y2="105" stroke="#FBBF24" strokeWidth="2" strokeDasharray="5 3" />
                      <line x1="530" y1="75" x2="375" y2="145" stroke="#FBBF24" strokeWidth="2" strokeDasharray="5 3" />
                      <line x1="530" y1="95" x2="375" y2="185" stroke="#FBBF24" strokeWidth="2" strokeDasharray="5 3" />
                    </g>

                    {/* Shadow Zone on Window */}
                    {audit.effectiveShadingRatio > 0.3 && (
                      <rect
                        x="200"
                        y="90"
                        width="30"
                        height={140 * audit.effectiveShadingRatio}
                        fill="#10B981"
                        opacity="0.25"
                      />
                    )}

                    {/* Annotations */}
                    <text x="350" y="270" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      {Math.round(audit.effectiveShadingRatio * 100)}% de la surface vitrée protégée du rayonnement direct
                    </text>
                    <text x="350" y="285" fill="#D97706" fontSize="8" textAnchor="middle" fontFamily="monospace">
                      Angle de coupure : {audit.cutOffAngleDeg}° • Entraxe : {bladePitchSpacingMm} mm
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ENERGY & VISUAL COMFORT */}
          {activeTab === 'energy_daylight' && (
            <div className="space-y-4">
              
              {/* Cooling Power Section */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Bilan Énergétique & Économies de Climatisation
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Apport Solaire Évité</span>
                    <strong className="text-emerald-400 text-base">{audit.coolingPowerSavedW} W</strong>
                    <span className="text-[10px] text-slate-500 block">Sur {audit.glazingAreaM2} m² de vitrage</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Énergie Épargnée / Été</span>
                    <strong className="text-emerald-400 text-base">{audit.summerEnergySavedKwh} kWh</strong>
                    <span className="text-[10px] text-slate-500 block">Climatisation COP 2.8</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Gain Facture Sonelgaz</span>
                    <strong className="text-amber-400 text-base">~{audit.coolingCostSavedDzd.toLocaleString('fr-DZ')} DZD</strong>
                    <span className="text-[10px] text-slate-500 block">Économie annuelle récurrente</span>
                  </div>
                </div>
              </div>

              {/* Visual Comfort (NF EN 14501) */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Confort Visuel & Lumière du Jour (NF EN 14501)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Transmission Lumineuse Globale</span>
                    <strong className="text-cyan-400 text-sm">{Math.round(audit.effectiveLightTransmissionTvTot * 100)}%</strong>
                    <p className="text-[10px] text-slate-400">
                      Garantit un éclairage naturel doux sans obscurcir la pièce.
                    </p>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-slate-400 block text-[10px]">Protection Anti-Éblouissement</span>
                    <strong className="text-emerald-400 text-sm">{audit.glareProtectionLabelFr}</strong>
                    <p className="text-[10px] text-slate-400">
                      Supprime les reflets gênants sur écrans d ordinateurs et téléviseurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {audit.bladeCount} lames ({audit.bladeLengthMm} mm) • g_tot = {audit.totalCombinedSolarFactorGtot} • DTR C3-2 {audit.isDtrCompliant ? 'Validé' : 'À ajuster'}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isGeneratingPdf}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Génération du PDF...' : 'Télécharger Attestation (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

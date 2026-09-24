import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Sun,
  MapPin,
  FileCheck,
  CheckCircle,
  HelpCircle,
  Share2,
} from 'lucide-react';
import { ALGERIAN_WILAYAS_58 } from '../../utils/algerianWilayas';
import { playTactileClick, playSwitchSound } from '../../utils/audioFeedback';
import {
  DTR_ZONE_THRESHOLDS,
  getDtrZoneForWilaya,
} from '../../utils/dtrThermal';
import { generateDtrThermalCertificatePdf } from '../../utils/pdfGenerator';

interface ThermalComplianceCardProps {
  widthMm: number;
  heightMm: number;
  glassAreaM2?: number;
  onExportReport?: () => void;
}

export const ThermalComplianceCard: React.FC<ThermalComplianceCardProps> = ({
  widthMm,
  heightMm,
  glassAreaM2,
  onExportReport,
}) => {
  const { config, theme, selectedWilaya, setSelectedWilaya } = useConfigStore();
  const isLight = theme === 'light';

  const [spacerType, setSpacerType] = useState<'standard_alu' | 'warm_edge'>('standard_alu');
  const [showDtrGlossary, setShowDtrGlossary] = useState(false);

  // Active Wilaya & Zone
  const currentWilaya = useMemo(() => {
    return (
      ALGERIAN_WILAYAS_58.find((w) => w.nameFr.toLowerCase() === selectedWilaya.toLowerCase()) ||
      ALGERIAN_WILAYAS_58[15] // Default: Alger
    );
  }, [selectedWilaya]);

  const zoneKey = useMemo(() => getDtrZoneForWilaya(currentWilaya), [currentWilaya]);
  const zoneThreshold = DTR_ZONE_THRESHOLDS[zoneKey];

  // Component thermal properties
  const thermalData = useMemo(() => {
    // Glass thermal & solar factors
    let ug = 2.7;
    let rw = 32;
    let sw = 0.52; // Solar factor
    let glassName = 'Double vitrage 4/16/4 Clair';

    if (config.glassType === 'double_clear') {
      ug = 2.7;
      rw = 32;
      sw = 0.52;
      glassName = 'Double vitrage 4/16/4 isolation';
    } else if (config.glassType === 'simple_clear') {
      ug = 5.7;
      rw = 29;
      sw = 0.82;
      glassName = 'Simple vitrage 6mm clair';
    } else if (config.glassType === 'stop_sol') {
      ug = 2.4;
      rw = 32;
      sw = 0.28;
      glassName = 'Double vitrage Stop-Sol réfléchissant';
    } else if (config.glassType === 'sable') {
      ug = 3.0;
      rw = 31;
      sw = 0.44;
      glassName = 'Vitrage sablé dépoli translucide';
    } else if (config.glassType === 'double_argon_warmedge') {
      ug = 1.3;
      rw = 33;
      sw = 0.50;
      glassName = 'Double vitrage 4/16/4 Argon 90% + Warm-Edge';
    } else if (config.glassType === 'phonique_stadip') {
      ug = 1.4;
      rw = 38;
      sw = 0.48;
      glassName = 'Feuilleté phonique Stadip Silence 6/16/4';
    } else if (config.glassType === 'securit_tempered') {
      ug = 5.5;
      rw = 32;
      sw = 0.79;
      glassName = 'Verre trempé Sécurit 8mm';
    }

    // Frame thermal factor
    let uf = 2.4;
    let frameName = 'Alu Gamme 45 RPT (Barrette 14.8mm)';
    if (config.profileSystem === 'pvc_70_chamber') {
      uf = 1.4;
      frameName = 'PVC 70mm 5 Chambres Haute Isolation';
    } else if (config.profileSystem === 'gamme_40') {
      uf = 5.8;
      frameName = 'Alu Gamme 40 Standard (Sans Rupture)';
    } else if (config.profileSystem === 'gamme_67_slide') {
      uf = 3.2;
      frameName = 'Alu Coulissant Lourd Gamme 67';
    }

    // Linear thermal transmittance of spacer
    const psiG = spacerType === 'warm_edge' ? 0.04 : 0.08;

    // Geometric areas
    const totalAreaM2 = Math.max(0.2, (widthMm * heightMm) / 1000000);
    const calculatedGlassAreaM2 = glassAreaM2 ? Math.min(totalAreaM2 * 0.85, glassAreaM2) : totalAreaM2 * 0.72;
    const frameAreaM2 = Math.max(0.04, totalAreaM2 - calculatedGlassAreaM2);
    const glassPerimeterM = Math.max(0.8, (2 * (widthMm + heightMm) * 0.85) / 1000);

    // Global Window U-value formula: Uw = (Ag*Ug + Af*Uf + lg*psiG) / A
    const uw = Number(
      ((calculatedGlassAreaM2 * ug + frameAreaM2 * uf + glassPerimeterM * psiG) / totalAreaM2).toFixed(2)
    );

    // DTR C3-2 Compliance status
    const isUwCompliant = uw <= zoneThreshold.maxUw;
    const isSwCompliant = sw <= zoneThreshold.maxSw;
    const isRwCompliant = rw >= zoneThreshold.minRw;
    const isFullyCompliant = isUwCompliant && isSwCompliant;

    // Energy Efficiency Class (A+ to F)
    let energyClass: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' = 'C';
    let energyColor = '#EAB308';
    if (uw <= 1.4) {
      energyClass = 'A+';
      energyColor = '#10B981';
    } else if (uw <= 1.8) {
      energyClass = 'A';
      energyColor = '#22C55E';
    } else if (uw <= 2.3) {
      energyClass = 'B';
      energyColor = '#84CC16';
    } else if (uw <= 2.8) {
      energyClass = 'C';
      energyColor = '#EAB308';
    } else if (uw <= 3.5) {
      energyClass = 'D';
      energyColor = '#F97316';
    } else if (uw <= 4.5) {
      energyClass = 'E';
      energyColor = '#EF4444';
    } else {
      energyClass = 'F';
      energyColor = '#991B1B';
    }

    return {
      ug,
      uf,
      uw,
      sw,
      rw,
      psiG,
      glassName,
      frameName,
      totalAreaM2: Number(totalAreaM2.toFixed(2)),
      glassAreaM2: Number(calculatedGlassAreaM2.toFixed(2)),
      frameAreaM2: Number(frameAreaM2.toFixed(2)),
      isUwCompliant,
      isSwCompliant,
      isRwCompliant,
      isFullyCompliant,
      energyClass,
      energyColor,
    };
  }, [
    config.glassType,
    config.profileSystem,
    spacerType,
    widthMm,
    heightMm,
    glassAreaM2,
    zoneThreshold.maxUw,
    zoneThreshold.maxSw,
    zoneThreshold.minRw,
  ]);

  return (
    <div
      className={`rounded-2xl border flex flex-col overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B0F19] border-white/10 text-zinc-100'
      }`}
    >
      {/* HEADER WITH WILAYA & REGULATION BADGE */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Thermometer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold font-mono tracking-tight uppercase">
                Bilan Thermo-Acoustique DTR C3-2
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-semibold">
                CNERIB OFFICIEL
              </span>
            </div>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Calcul des déperditions calorifiques selon la zone bioclimatique
            </p>
          </div>
        </div>

        {/* WILAYA SELECTOR */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono ${
              isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/15'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={currentWilaya.nameFr}
              onChange={(e) => {
                playSwitchSound();
                setSelectedWilaya(e.target.value);
              }}
              className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer"
            >
              {ALGERIAN_WILAYAS_58.map((w) => (
                <option key={w.code} value={w.nameFr} className={isLight ? 'text-slate-900' : 'bg-[#111622] text-white'}>
                  {w.code} - {w.nameFr} ({w.nameAr})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              setShowDtrGlossary(!showDtrGlossary);
            }}
            title="Explications DTR C3-2"
            className={`p-1.5 rounded-xl border text-xs cursor-pointer transition-colors ${
              showDtrGlossary
                ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                : isLight
                ? 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DTR GLOSSARY ACCORDION (OPTIONAL) */}
      {showDtrGlossary && (
        <div
          className={`p-4 border-b text-xs font-mono leading-relaxed transition-all ${
            isLight ? 'bg-amber-50/50 border-amber-200 text-slate-800' : 'bg-amber-950/20 border-amber-500/20 text-amber-200/90'
          }`}
        >
          <div className="flex items-start gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <span className="font-bold text-amber-400">Règlement Thermique National Algérien (DTR C3-2) :</span>
          </div>
          <p className="text-[11px] mb-2">
            Le DTR C3-2 fixe les déperditions thermiques maximales admises pour les parois vitrées par zone géographique.
            Un coefficient <strong className="text-white">Uw</strong> bas garantit un confort intérieur optimal et réduit la facture de climatisation et de chauffage.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="p-2 rounded-lg bg-black/20 border border-white/10">
              <span className="font-bold text-sky-400 block">Zone A (Littoral)</span>
              <span>Uw ≤ 3.20 W/(m²·K)</span>
            </div>
            <div className="p-2 rounded-lg bg-black/20 border border-white/10">
              <span className="font-bold text-purple-400 block">Zone B (Plateaux)</span>
              <span>Uw ≤ 2.60 W/(m²·K)</span>
            </div>
            <div className="p-2 rounded-lg bg-black/20 border border-white/10">
              <span className="font-bold text-amber-400 block">Zone C (Sud)</span>
              <span>Uw ≤ 2.80 | Sw ≤ 0.35</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN METRIC HUD */}
      <div className="p-4 flex flex-col gap-4">
        {/* TOP ROW: GLOBAL UW & ENERGY LABEL BADGE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Tile 1: Uw Coefficient */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              thermalData.isUwCompliant
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">Transmittance Globale (Uw)</span>
              {thermalData.isUwCompliant ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                {thermalData.uw}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">W/(m²·K)</span>
            </div>
            <div className="mt-2 text-[10px] font-mono flex items-center justify-between pt-1.5 border-t border-white/10">
              <span className="text-zinc-400">Seuil {zoneThreshold.label.split(' - ')[0]} :</span>
              <span className="font-bold text-zinc-200">≤ {zoneThreshold.maxUw} W/m²K</span>
            </div>
          </div>

          {/* Tile 2: Solar & Acoustic Factor */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Facteur Solaire (Sw)
              </span>
              <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                Acoustique
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-amber-400">{thermalData.sw}</span>
                <span className="text-[10px] text-zinc-400">g</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-sky-400">{thermalData.rw}</span>
                <span className="text-[10px] text-zinc-400">dB</span>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-mono flex items-center justify-between pt-1.5 border-t border-white/10">
              <span className="text-zinc-400">Affaiblissement Rw :</span>
              <span className="font-bold text-zinc-200">{thermalData.rw >= 30 ? 'Excellente Isolation' : 'Standard'}</span>
            </div>
          </div>

          {/* Tile 3: Algerian Bioclimatic Zone Match */}
          <div
            className={`p-3.5 rounded-xl border flex flex-col justify-between ${
              thermalData.isFullyCompliant
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">Conformité DTR C3-2</span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs text-slate-950 font-mono shadow-xs"
                style={{ backgroundColor: thermalData.energyColor }}
              >
                {thermalData.energyClass}
              </div>
            </div>
            <div className="mt-1">
              <span
                className={`text-sm font-bold font-mono block ${
                  thermalData.isFullyCompliant ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {thermalData.isFullyCompliant
                  ? 'HOMOLOGUÉ CONFORME'
                  : 'OPTIMISATION REQUISE'}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                Wilaya: {currentWilaya.code} - {currentWilaya.nameFr} ({zoneThreshold.label.split(' - ')[0]})
              </span>
            </div>
            <div className="mt-2 text-[10px] font-mono pt-1.5 border-t border-white/10 flex items-center justify-between">
              <span className="text-zinc-400">Classe Énergétique :</span>
              <span className="font-bold" style={{ color: thermalData.energyColor }}>
                Classe {thermalData.energyClass}
              </span>
            </div>
          </div>
        </div>

        {/* DETAILED TECHNICAL BREAKDOWN (Ug, Uf, Psi) */}
        <div
          className={`p-3.5 rounded-xl border flex flex-col gap-2.5 text-xs font-mono ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-white/10">
            <span className="text-zinc-400">Composant de la Menuiserie</span>
            <span className="text-zinc-400">Valeur & Quote-Part</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-zinc-200 font-medium">Vitrage : {thermalData.glassName}</span>
              <span className="text-[10px] text-zinc-500">Surface vitrée : {thermalData.glassAreaM2} m²</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-sky-400">Ug = {thermalData.ug} W/m²K</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-zinc-200 font-medium">Profilé : {thermalData.frameName}</span>
              <span className="text-[10px] text-zinc-500">Surface cadre : {thermalData.frameAreaM2} m²</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#D4AF37]">Uf = {thermalData.uf} W/m²K</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-zinc-300">Intercalaire de vitrage :</span>
              <button
                onClick={() => {
                  playSwitchSound();
                  setSpacerType(spacerType === 'standard_alu' ? 'warm_edge' : 'standard_alu');
                }}
                className={`px-2 py-0.5 rounded-md border text-[10px] cursor-pointer transition-colors ${
                  spacerType === 'warm_edge'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-700'
                    : 'bg-white/5 border-white/15 text-zinc-300'
                }`}
              >
                {spacerType === 'warm_edge' ? 'Warm-Edge (Ψ=0.04)' : 'Alu Standard (Ψ=0.08)'}
              </button>
            </div>
            <div className="text-right">
              <span className="font-bold text-purple-400">Ψg = {thermalData.psiG} W/(m·K)</span>
            </div>
          </div>
        </div>

        {/* RECOMMANDATIONS CONSTRUCTIVES POUR LA WILAYA */}
        {!thermalData.isFullyCompliant && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-[11px]">
              <span className="font-bold text-amber-400">Recommandations pour conformité {currentWilaya.nameFr} :</span>
              {thermalData.uw > zoneThreshold.maxUw && (
                <span>
                  • Remplacer le profilé par une <strong>série à rupture de pont thermique (RPT 24mm)</strong> ou <strong>PVC multi-chambres</strong> pour abaisser Uw en dessous de {zoneThreshold.maxUw} W/m²K.
                </span>
              )}
              {thermalData.sw > zoneThreshold.maxSw && zoneKey === 'zone_c' && (
                <span>
                  • En zone Sud/Sahara, opter pour un <strong>vitrage Stop-Sol réfléchissant</strong> (Facteur solaire Sw ≤ 0.35) pour éviter la surchauffe estivale.
                </span>
              )}
              {spacerType === 'standard_alu' && (
                <span>
                  • Activer l'option <strong>Intercalaire Warm-Edge</strong> pour éliminer les ponts thermiques en périphérie du vitrage.
                </span>
              )}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
          <button
            onClick={() => {
              playTactileClick();
              const lines = [
                '========================================',
                'BAITI ATELIER | بيتي : BILAN THERMIQUE DTR C3-2',
                `DATE : ${new Date().toLocaleDateString('fr-FR')}`,
                `OUVRAGE : Menuiserie ${widthMm} × ${heightMm} mm`,
                `WILAYA : ${currentWilaya.code} - ${currentWilaya.nameFr} (${zoneThreshold.label.split(' - ')[0]})`,
                `TRANSMITTANCE Uw : ${thermalData.uw} W/m²K (Seuil max : ${zoneThreshold.maxUw} W/m²K)`,
                `FACTEUR SOLAIRE Sw : ${thermalData.sw.toFixed(2)} (Seuil max : ${zoneThreshold.maxSw})`,
                `ISOLATION ACOUSTIQUE Rw : ${thermalData.rw} dB`,
                `CLASSE ÉNERGÉTIQUE : Classe ${thermalData.energyClass}`,
                `STATUT : ${thermalData.isFullyCompliant ? 'CONFORME REGLEMENTATION ALGERIENNE' : 'NON CONFORME - OPTIMISATION REQUISE'}`,
                '========================================',
                'Genere via Baiti Atelier • Norme CNERIB DTR C3-2',
              ];
              const text = lines.join('\n');
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(url, '_blank');
            }}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer hover-lift ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}
            title="Partager le bilan thermique DTR C3-2 directement sur WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp DTR</span>
          </button>

          <button
            onClick={async () => {
              playTactileClick();
              if (onExportReport) {
                onExportReport();
                return;
              }
              await generateDtrThermalCertificatePdf({
                projectTitle: `Étude Thermique ${currentWilaya.nameFr}`,
                clientName: 'Client Particulier',
                wilayaName: currentWilaya.nameFr,
                widthMm,
                heightMm,
                openingType: config.openingType,
                profileSystem: config.profileSystem,
                glassType: config.glassType,
                spacerType,
                glassAreaM2: thermalData.glassAreaM2,
              });
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 cursor-pointer hover-lift"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Générer Fiche Homologation DTR C3-2 (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Scissors,
  Plus,
  Minus,
  Grid,
  Layers,
  FileText,
} from 'lucide-react';
import { playTactileClick, playSwitchSound, playClampSound } from '../../utils/audioFeedback';
import { generateWorkshopCutSheetPdf } from '../../utils/pdfGenerator';
import { computeCadCells, computeDetailedBOM } from '../../utils/cadEngine';
import type { CadStructure, CellType } from '../../types/cad';

const CELL_TYPE_CONFIG: {
  type: CellType;
  labelFr: string;
  sub: string;
  color: string;
}[] = [
  { type: 'glass_fixed', labelFr: 'Vitrage Fixe', sub: 'Châssis dormant', color: 'text-sky-400' },
  { type: 'sash_slide', labelFr: 'Coulissant', sub: 'Vantail sur rail', color: 'text-emerald-400' },
  { type: 'sash_tilt_turn', labelFr: 'Oscillo-Battant', sub: 'Double manœuvre', color: 'text-cyan-400' },
  { type: 'sash_left', labelFr: 'Ouvrant G', sub: 'Ferré à gauche', color: 'text-amber-400' },
  { type: 'sash_right', labelFr: 'Ouvrant D', sub: 'Ferré à droite', color: 'text-amber-400' },
  { type: 'panel_solid', labelFr: 'Panneau Opaque', sub: 'Sandwich alu/pvc', color: 'text-zinc-300' },
];

export const MobileCadScreen: React.FC = () => {
  const { config, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  // Parametric CAD Dividers & Types
  const [gridState, setGridState] = useState<{
    verticalDividers: number[];
    horizontalDividers: number[];
    cellTypes: Record<string, CellType>;
  }>(() => ({
    verticalDividers: [Math.round(config.width / 2)],
    horizontalDividers: [],
    cellTypes: {
      '0-0': 'sash_slide',
      '0-1': 'sash_slide',
    },
  }));

  const [rawSelectedCellKey, setRawSelectedCellKey] = useState<string>('0-0');
  const [isGeneratingCutSheet, setIsGeneratingCutSheet] = useState(false);

  // Derived CAD Structure with current config dimensions
  const cadStructure: CadStructure = useMemo(() => ({
    width: config.width,
    height: config.height,
    verticalDividers: gridState.verticalDividers,
    horizontalDividers: gridState.horizontalDividers,
    cellTypes: gridState.cellTypes,
  }), [config.width, config.height, gridState]);

  // Derived CAD cells & Workshop Bill of Materials
  const cells = useMemo(() => computeCadCells(cadStructure), [cadStructure]);
  const bom = useMemo(() => computeDetailedBOM(cadStructure, config), [cadStructure, config]);

  // Active cell resolved safely
  const selectedCellKey = cells.some((c) => `${c.row}-${c.col}` === rawSelectedCellKey)
    ? rawSelectedCellKey
    : `${cells[0]?.row ?? 0}-${cells[0]?.col ?? 0}`;

  const activeCell = useMemo(() => {
    return cells.find((c) => `${c.row}-${c.col}` === selectedCellKey) || cells[0] || null;
  }, [cells, selectedCellKey]);

  // Vertical Mullions (+ / - Meneaux)
  const handleAddMullion = () => {
    playTactileClick();
    const currentCount = cadStructure.verticalDividers.length;
    if (currentCount >= 3) return; // Max 4 bays on mobile

    const newBayCount = currentCount + 2;
    const step = Math.round(cadStructure.width / newBayCount);
    const newDividers: number[] = [];
    for (let i = 1; i < newBayCount; i++) {
      newDividers.push(step * i);
    }

    setGridState((prev) => {
      const nextCellTypes = { ...prev.cellTypes };
      // Default new cells to sliding or fixed
      for (let r = 0; r <= prev.horizontalDividers.length; r++) {
        for (let c = 0; c < newBayCount; c++) {
          const k = `${r}-${c}`;
          if (!nextCellTypes[k]) nextCellTypes[k] = 'sash_slide';
        }
      }
      return {
        ...prev,
        verticalDividers: newDividers,
        cellTypes: nextCellTypes,
      };
    });
  };

  const handleRemoveMullion = () => {
    playTactileClick();
    const currentCount = cadStructure.verticalDividers.length;
    if (currentCount <= 0) return;

    if (currentCount === 1) {
      // Back to 1 single bay
      setGridState((prev) => ({
        ...prev,
        verticalDividers: [],
      }));
      return;
    }

    const newBayCount = currentCount;
    const step = Math.round(cadStructure.width / newBayCount);
    const newDividers: number[] = [];
    for (let i = 1; i < newBayCount; i++) {
      newDividers.push(step * i);
    }

    setGridState((prev) => ({
      ...prev,
      verticalDividers: newDividers,
    }));
  };

  // Horizontal Transom (+ / - Traverse Imposte)
  const handleToggleTransom = () => {
    playTactileClick();
    if (cadStructure.horizontalDividers.length > 0) {
      // Remove transom
      setGridState((prev) => ({
        ...prev,
        horizontalDividers: [],
      }));
    } else {
      // Add transom at 450mm from top (imposte)
      const transomY = Math.max(300, cadStructure.height - 450);
      setGridState((prev) => {
        const nextTypes = { ...prev.cellTypes };
        // Upper row defaults to fixed glass
        for (let c = 0; c <= prev.verticalDividers.length; c++) {
          nextTypes[`1-${c}`] = 'glass_fixed';
        }
        return {
          ...prev,
          horizontalDividers: [transomY],
          cellTypes: nextTypes,
        };
      });
    }
  };

  // Set cell opening type
  const handleSelectCellType = (type: CellType) => {
    if (!activeCell) return;
    playSwitchSound();
    const key = `${activeCell.row}-${activeCell.col}`;
    setGridState((prev) => ({
      ...prev,
      cellTypes: {
        ...prev.cellTypes,
        [key]: type,
      },
    }));
  };

  // SVG Scaled Viewport Metrics
  const svgW = 500;
  const svgH = 380;
  const pad = 40;
  const scale = Math.min((svgW - pad * 2) / cadStructure.width, (svgH - pad * 2) / cadStructure.height);
  const drawW = cadStructure.width * scale;
  const drawH = cadStructure.height * scale;
  const startX = (svgW - drawW) / 2;
  const startY = (svgH - drawH) / 2;

  // PDF Cut Sheet Export
  const handleExportCutSheet = () => {
    playClampSound();
    setIsGeneratingCutSheet(true);
    try {
      generateWorkshopCutSheetPdf(cadStructure, config, bom);
    } catch {
      // Handled
    } finally {
      setIsGeneratingCutSheet(false);
    }
  };

  const bayCount = cadStructure.verticalDividers.length + 1;
  const hasTransom = cadStructure.horizontalDividers.length > 0;

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. CAD CONTROLS BAR (+ MENEAUX / + TRAVERSES) */}
      <div
        className={`p-3 rounded-2xl border shadow-sm flex items-center justify-between gap-2 font-mono text-xs ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        {/* Mullions (+/- Meneaux) */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Travées :</span>
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/10 dark:border-white/10">
            <button
              onClick={handleRemoveMullion}
              disabled={cadStructure.verticalDividers.length === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Supprimer un meneau"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold px-1 text-center min-w-[24px] text-[#D4AF37]">
              {bayCount}V
            </span>
            <button
              onClick={handleAddMullion}
              disabled={cadStructure.verticalDividers.length >= 3}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Ajouter un meneau vertical"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Transom (+/- Traverse) */}
        <button
          onClick={handleToggleTransom}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer min-h-[36px] ${
            hasTransom
              ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37]'
              : isLight
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{hasTransom ? 'Imposte Active' : '+ Imposte'}</span>
        </button>

        {/* Total Cells Badge */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Grid className="w-3.5 h-3.5 text-cyan-400" />
          <span>{cells.length} case{cells.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* 2. DYNAMIC 2D BLUEPRINT SVG VIEWER */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-[#D4AF37]">Plan CAO 2D Paramétrique</span>
          <span className="text-zinc-500">{cadStructure.width} × {cadStructure.height} mm</span>
        </div>

        <div className="relative w-full aspect-4/3 rounded-2xl bg-[#070A10] border border-cyan-500/20 flex items-center justify-center p-3 overflow-hidden select-none">
          {/* Blueprint Grid Lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-full max-h-[290px] select-none"
          >
            {/* Dimension Callout Labels */}
            <text
              x={startX + drawW / 2}
              y={Math.max(16, startY - 14)}
              fill="#D4AF37"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              L = {cadStructure.width} mm
            </text>
            <text
              x={Math.max(12, startX - 14)}
              y={startY + drawH / 2}
              fill="#D4AF37"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
              transform={`rotate(-90 ${Math.max(12, startX - 14)} ${startY + drawH / 2})`}
            >
              H = {cadStructure.height} mm
            </text>

            {/* Outer Frame (Dormant) */}
            <rect
              x={startX}
              y={startY}
              width={drawW}
              height={drawH}
              fill="#111827"
              stroke="#D4AF37"
              strokeWidth="5"
              rx="3"
            />

            {/* Individual Grid Cells */}
            {cells.map((cell) => {
              const xSplits = [0, ...cadStructure.verticalDividers.slice().sort((a, b) => a - b), cadStructure.width];
              const ySplits = [0, ...cadStructure.horizontalDividers.slice().sort((a, b) => a - b), cadStructure.height];

              const cellX = startX + xSplits[cell.col] * scale;
              const cellY = startY + (cadStructure.height - ySplits[cell.row + 1]) * scale;
              const cW = cell.widthMm * scale;
              const cH = cell.heightMm * scale;
              const key = `${cell.row}-${cell.col}`;
              const isSelected = selectedCellKey === key;

              return (
                <g
                  key={key}
                  onClick={() => {
                    playTactileClick();
                    setRawSelectedCellKey(key);
                  }}
                  className="cursor-pointer"
                >
                  {/* Glass / Panel Infill */}
                  <rect
                    x={cellX + 4}
                    y={cellY + 4}
                    width={cW - 8}
                    height={cH - 8}
                    fill={
                      cell.type === 'panel_solid'
                        ? '#1F2937'
                        : isSelected
                        ? 'rgba(56, 189, 248, 0.22)'
                        : 'rgba(56, 189, 248, 0.08)'
                    }
                    stroke={isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.2)'}
                    strokeWidth={isSelected ? '3' : '1.5'}
                    rx="2"
                  />

                  {/* Kinematic Opening Lines */}
                  {cell.type === 'sash_slide' && (
                    <g opacity="0.85">
                      <line
                        x1={cellX + cW / 2 - 12}
                        y1={cellY + cH / 2}
                        x2={cellX + cW / 2 + 12}
                        y2={cellY + cH / 2}
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <polygon
                        points={`${cellX + cW / 2 - 12},${cellY + cH / 2} ${cellX + cW / 2 - 6},${cellY + cH / 2 - 4} ${cellX + cW / 2 - 6},${cellY + cH / 2 + 4}`}
                        fill="#10B981"
                      />
                      <polygon
                        points={`${cellX + cW / 2 + 12},${cellY + cH / 2} ${cellX + cW / 2 + 6},${cellY + cH / 2 - 4} ${cellX + cW / 2 + 6},${cellY + cH / 2 + 4}`}
                        fill="#10B981"
                      />
                    </g>
                  )}

                  {cell.type === 'sash_left' && (
                    <path
                      d={`M ${cellX + 8} ${cellY + 8} L ${cellX + cW - 8} ${cellY + cH / 2} L ${cellX + 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'sash_right' && (
                    <path
                      d={`M ${cellX + cW - 8} ${cellY + 8} L ${cellX + 8} ${cellY + cH / 2} L ${cellX + cW - 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'sash_tilt_turn' && (
                    <path
                      d={`M ${cellX + 8} ${cellY + cH - 8} L ${cellX + cW / 2} ${cellY + 8} L ${cellX + cW - 8} ${cellY + cH - 8}`}
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  )}

                  {cell.type === 'panel_solid' && (
                    <line
                      x1={cellX + 8}
                      y1={cellY + cH / 2}
                      x2={cellX + cW - 8}
                      y2={cellY + cH / 2}
                      stroke="rgba(255, 255, 255, 0.2)"
                      strokeWidth="1"
                    />
                  )}

                  {/* Cell Dimension Label */}
                  <text
                    x={cellX + cW / 2}
                    y={cellY + cH / 2 - 12}
                    fill={isSelected ? '#38BDF8' : '#94A3B8'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cell.type === 'glass_fixed'
                      ? 'FIXE'
                      : cell.type === 'sash_slide'
                      ? 'COULISSANT'
                      : cell.type === 'sash_tilt_turn'
                      ? 'OSCILLO'
                      : cell.type === 'sash_left'
                      ? 'BATTANT G'
                      : cell.type === 'sash_right'
                      ? 'BATTANT D'
                      : 'PANNEAU'}
                  </text>

                  <text
                    x={cellX + cW / 2}
                    y={cellY + cH / 2 + 14}
                    fill="#E2E8F0"
                    fontSize="8.5"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {cell.widthMm} × {cell.heightMm}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Active Selection Info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
          <span>Touchez une case pour modifier son ouvrant</span>
          {activeCell && (
            <span className="text-cyan-400 font-bold">
              Case sélectionnée: {activeCell.widthMm} × {activeCell.heightMm} mm
            </span>
          )}
        </div>
      </div>

      {/* 3. CELL OPENING TYPE SELECTOR */}
      {activeCell && (
        <div
          className={`p-3.5 rounded-3xl border shadow-sm space-y-2.5 ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Type d'ouverture de la case active</span>
            <span className="text-[10px] text-zinc-500">
              Verre: {activeCell.glassWidthMm} × {activeCell.glassHeightMm} mm
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {CELL_TYPE_CONFIG.map((opt) => {
              const isSelected = activeCell.type === opt.type;
              return (
                <button
                  key={opt.type}
                  onClick={() => handleSelectCellType(opt.type)}
                  className={`p-2 rounded-2xl border text-center transition-all cursor-pointer min-h-[46px] flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-[#D4AF37] text-slate-950 font-bold border-[#D4AF37] shadow-sm'
                      : isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs font-semibold leading-tight">{opt.labelFr}</span>
                  <span className="text-[9px] opacity-75 leading-tight">{opt.sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. REAL-TIME WORKSHOP CUT SHEET TABLE */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-bold">Fiche de Débit Paramétrique</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-zinc-400">
            {bom.cuts.length} Pièces à Scier
          </span>
        </div>

        {/* Real-time KPI summary */}
        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Profilés</span>
            <span className="font-bold text-[#D4AF37]">{bom.totalProfileMeters.toFixed(1)} m</span>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Vitrage</span>
            <span className="font-bold text-cyan-400">{bom.totalGlassAreaM2.toFixed(2)} m²</span>
          </div>
          <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <span className="text-zinc-500 block text-[10px]">Barres 6m</span>
            <span className="font-bold text-emerald-400">~{bom.estimatedBars6m} barres</span>
          </div>
        </div>

        {/* Cut pieces list */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {bom.cuts.map((p) => (
            <div
              key={p.id}
              className={`p-2.5 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span>{p.label}</span>
                </div>
                <div className="text-[10px] text-zinc-500 pl-3">
                  Coupes: {p.cutLeftAngle}° / {p.cutRightAngle}° • Rôle: {p.role}
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {p.lengthMm} <span className="text-[10px]">mm</span>
                </span>
                <span className="text-[10px] text-zinc-400 block">Qté : {p.quantity}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Download Action */}
        <button
          onClick={handleExportCutSheet}
          disabled={isGeneratingCutSheet}
          className="w-full py-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md mt-2"
        >
          <FileText className="w-4 h-4" />
          <span>{isGeneratingCutSheet ? 'Génération...' : 'Télécharger Fiche Scie PDF'}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileCadScreen;

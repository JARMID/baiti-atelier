import React, { useState, useMemo } from 'react';
import { useConfigStore } from '../../store/configStore';
import { optimize1DLinearStock } from '../../utils/linearCutOptimizer';
import type { CutDemand1D, LinearOptimizationResult } from '../../types/optimizer';
import {
  Scissors,
  Plus,
  Trash2,
  Download,
} from 'lucide-react';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';

export const MobileCuttingScreen: React.FC = () => {
  const { config, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  // Pre-fill initial demands from current active window
  const [demands, setDemands] = useState<CutDemand1D[]>(() => [
    {
      id: 'd1',
      length: config.width,
      quantity: 2,
      miterLeft: 45,
      miterRight: 45,
      label: 'Dormant Haut/Bas',
      profileCode: 'DORMANT-45',
    },
    {
      id: 'd2',
      length: config.height,
      quantity: 2,
      miterLeft: 45,
      miterRight: 45,
      label: 'Dormant Montants',
      profileCode: 'DORMANT-45',
    },
    {
      id: 'd3',
      length: Math.round(config.width / 2 + 15),
      quantity: 4,
      miterLeft: 45,
      miterRight: 45,
      label: 'Ouvrant Traverses',
      profileCode: 'OUVRANT-45',
    },
    {
      id: 'd4',
      length: config.height - 70,
      quantity: 4,
      miterLeft: 45,
      miterRight: 45,
      label: 'Ouvrant Montants',
      profileCode: 'OUVRANT-45',
    },
  ]);

  const [newLength, setNewLength] = useState(1200);
  const [newQty, setNewQty] = useState(2);
  const [newLabel, setNewLabel] = useState('Nouvelle Pièce');

  // Compute 1D optimization
  const optimizationResult: LinearOptimizationResult = useMemo(() => {
    return optimize1DLinearStock(demands, [], {
      kerf: 3,
      clampTrim: 25,
      minRemnantLength: 800,
      standardBarLength: 6000,
    });
  }, [demands]);

  const handleAddDemand = () => {
    if (newLength <= 0 || newQty <= 0) return;
    playClampSound();
    const newDemand: CutDemand1D = {
      id: `d_${Date.now()}`,
      length: newLength,
      quantity: newQty,
      miterLeft: 45,
      miterRight: 45,
      label: newLabel || 'Profilé',
      profileCode: 'ALU-6M',
    };
    setDemands((prev) => [...prev, newDemand]);
  };

  const handleRemoveDemand = (id: string) => {
    playTactileClick();
    setDemands((prev) => prev.filter((d) => d.id !== id));
  };

  const handleImportCurrentWindow = () => {
    playClampSound();
    setDemands([
      {
        id: `d1_${Date.now()}`,
        length: config.width,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: `Dormant (${config.width}mm)`,
        profileCode: 'DORMANT-45',
      },
      {
        id: `d2_${Date.now()}`,
        length: config.height,
        quantity: 2,
        miterLeft: 45,
        miterRight: 45,
        label: `Montants (${config.height}mm)`,
        profileCode: 'DORMANT-45',
      },
      {
        id: `d3_${Date.now()}`,
        length: Math.round(config.width / 2 + 15),
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrants Horiz.',
        profileCode: 'OUVRANT-45',
      },
      {
        id: `d4_${Date.now()}`,
        length: config.height - 70,
        quantity: 4,
        miterLeft: 45,
        miterRight: 45,
        label: 'Ouvrants Vert.',
        profileCode: 'OUVRANT-45',
      },
    ]);
  };

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. TOP STATS CARDS */}
      <div className="grid grid-cols-3 gap-2 font-mono text-center">
        <div
          className={`p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <span className="text-[10px] text-zinc-400 block uppercase">Barres 6m</span>
          <span className="text-xl font-black text-[#D4AF37]">
            {optimizationResult.totalStockBars}
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <span className="text-[10px] text-zinc-400 block uppercase">Rendement</span>
          <span className="text-xl font-black text-emerald-400">
            {(optimizationResult.overallUtilizationRate * 100).toFixed(1)}%
          </span>
        </div>

        <div
          className={`p-3 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
          }`}
        >
          <span className="text-[10px] text-zinc-400 block uppercase">Chutes</span>
          <span className="text-xl font-black text-amber-400">
            {((1 - optimizationResult.overallUtilizationRate) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2. OPTIMIZED BARS DIAGRAM */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span>Découpe Linéaire Optimisée</span>
          </div>
          <span className="text-[10px] text-zinc-400">Lame : 3.0 mm</span>
        </div>

        {/* Visual Bar Render */}
        <div className="space-y-2.5">
          {optimizationResult.bars.map((bar, barIdx) => (
            <div
              key={barIdx}
              className={`p-3 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                <span className="font-bold text-[#D4AF37]">Barre #{barIdx + 1} (6000 mm)</span>
                <span className="text-zinc-400">
                  {bar.cuts.length} pièces • {bar.totalUsedLength} mm coupés
                </span>
              </div>

              {/* Graphical Bar Track */}
              <div className="h-7 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center p-0.5 gap-0.5">
                {bar.cuts.map((cut, cutIdx) => {
                  const widthPct = (cut.length / 6000) * 100;
                  return (
                    <div
                      key={cutIdx}
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-lg bg-cyan-500/80 border border-cyan-400/50 flex items-center justify-center text-[10px] font-mono font-bold text-slate-950 truncate px-1"
                      title={`${cut.label} : ${cut.length} mm`}
                    >
                      {cut.length}
                    </div>
                  );
                })}

                {/* Waste Segment */}
                {bar.wasteLength > 0 && (
                  <div
                    style={{ width: `${(bar.wasteLength / 6000) * 100}%` }}
                    className="h-full rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-mono text-amber-400 truncate px-1"
                    title={`Chute : ${bar.wasteLength} mm`}
                  >
                    {bar.wasteLength >= 400 ? `${bar.wasteLength} chute` : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CUT DEMANDS LIST & ADD FORM */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold">Pièces à Débiter</span>
          <button
            onClick={handleImportCurrentWindow}
            className="px-2.5 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer hover:brightness-110"
          >
            <Download className="w-3 h-3" />
            <span>Depuis Châssis 3D</span>
          </button>
        </div>

        {/* Existing Demands List */}
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {demands.map((d) => (
            <div
              key={d.id}
              className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-white/5'
              }`}
            >
              <div>
                <span className="font-bold">{d.label}</span>
                <span className="text-[10px] text-zinc-500 block">
                  Coupes 45°/45° • Longueur : {d.length} mm
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-bold text-cyan-400">× {d.quantity}</span>
                <button
                  onClick={() => handleRemoveDemand(d.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add piece form */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 grid grid-cols-12 gap-1.5 text-xs font-mono">
          <input
            type="text"
            placeholder="Désignation"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className={`col-span-5 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
            }`}
          />
          <input
            type="number"
            placeholder="Longueur"
            value={newLength}
            onChange={(e) => setNewLength(parseInt(e.target.value) || 0)}
            className={`col-span-4 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
            }`}
          />
          <input
            type="number"
            placeholder="Qté"
            value={newQty}
            onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
            className={`col-span-3 p-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-300' : 'bg-black/40 border-white/10 text-white'
            }`}
          />

          <button
            onClick={handleAddDemand}
            className="col-span-12 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 active:scale-98 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter au Plan de Coupe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCuttingScreen;

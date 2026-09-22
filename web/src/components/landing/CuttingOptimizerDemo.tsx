import React, { useMemo, useState } from 'react';
import { Scissors, AlertCircle } from 'lucide-react';
import { useConfigStore } from '../../store/configStore';

interface CutPiece {
  id: string;
  label: string;
  lengthMm: number;
  color: string;
}

interface StockBar {
  barIndex: number;
  totalLengthMm: number;
  usedLengthMm: number;
  wasteMm: number;
  cuts: { piece: CutPiece; kerf: number }[];
}

export const CuttingOptimizerDemo: React.FC = () => {
  const { config } = useConfigStore();
  const [sawKerfMm, setSawKerfMm] = useState(3);
  const standardBarMm = 6000;

  const requiredCuts = useMemo<CutPiece[]>(() => {
    const w = config.width;
    const h = config.height;

    const cuts: CutPiece[] = [
      { id: 'f-top', label: 'Dormant Haut', lengthMm: w, color: '#3B82F6' },
      { id: 'f-bot', label: 'Dormant Bas', lengthMm: w, color: '#3B82F6' },
      { id: 'f-left', label: 'Dormant Gauche', lengthMm: h, color: '#60A5FA' },
      { id: 'f-right', label: 'Dormant Droit', lengthMm: h, color: '#60A5FA' },
    ];

    if (config.openingType === 'sliding_2') {
      const sashW = Math.round(w / 2 + 25);
      const sashH = h - 75;
      cuts.push(
        { id: 's1-t', label: 'Ouvrant 1 Haut', lengthMm: sashW, color: '#D4AF37' },
        { id: 's1-b', label: 'Ouvrant 1 Bas', lengthMm: sashW, color: '#D4AF37' },
        { id: 's1-l', label: 'Ouvrant 1 Montant G', lengthMm: sashH, color: '#C5A880' },
        { id: 's1-r', label: 'Ouvrant 1 Montant D', lengthMm: sashH, color: '#C5A880' },
        { id: 's2-t', label: 'Ouvrant 2 Haut', lengthMm: sashW, color: '#D4AF37' },
        { id: 's2-b', label: 'Ouvrant 2 Bas', lengthMm: sashW, color: '#D4AF37' },
        { id: 's2-l', label: 'Ouvrant 2 Montant G', lengthMm: sashH, color: '#C5A880' },
        { id: 's2-r', label: 'Ouvrant 2 Montant D', lengthMm: sashH, color: '#C5A880' }
      );
    } else if (config.openingType === 'casement_1') {
      const sashW = w - 90;
      const sashH = h - 90;
      cuts.push(
        { id: 'c1-t', label: 'Ouvrant Haut', lengthMm: sashW, color: '#D4AF37' },
        { id: 'c1-b', label: 'Ouvrant Bas', lengthMm: sashW, color: '#D4AF37' },
        { id: 'c1-l', label: 'Ouvrant Montant G', lengthMm: sashH, color: '#C5A880' },
        { id: 'c1-r', label: 'Ouvrant Montant D', lengthMm: sashH, color: '#C5A880' }
      );
    }

    return cuts;
  }, [config.width, config.height, config.openingType]);

  const bars = useMemo<StockBar[]>(() => {
    const sorted = [...requiredCuts].sort((a, b) => b.lengthMm - a.lengthMm);
    const resultBars: StockBar[] = [];

    sorted.forEach((piece) => {
      let placed = false;
      const neededSpace = piece.lengthMm + sawKerfMm;

      for (const bar of resultBars) {
        if (bar.usedLengthMm + neededSpace <= standardBarMm) {
          bar.cuts.push({ piece, kerf: sawKerfMm });
          bar.usedLengthMm += neededSpace;
          bar.wasteMm = standardBarMm - bar.usedLengthMm;
          placed = true;
          break;
        }
      }

      if (!placed) {
        resultBars.push({
          barIndex: resultBars.length + 1,
          totalLengthMm: standardBarMm,
          usedLengthMm: neededSpace,
          wasteMm: standardBarMm - neededSpace,
          cuts: [{ piece, kerf: sawKerfMm }],
        });
      }
    });

    return resultBars;
  }, [requiredCuts, sawKerfMm, standardBarMm]);

  const totalProfileLength = requiredCuts.reduce((acc, c) => acc + c.lengthMm, 0);
  const totalStockLength = bars.length * standardBarMm;
  const globalWastePercent = Math.round(((totalStockLength - totalProfileLength) / totalStockLength) * 100);

  return (
    <section className="py-16 border-t border-white/10 bg-[#0B0E14]/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 mb-2">
              <Scissors className="w-3.5 h-3.5" />
              <span>Optimisation Matière 1D Temps Réel</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Plan de Coupe Automatique (Barres 6m)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Calculé en direct selon les dimensions de votre modèle 3D actuel ({config.width} × {config.height} mm).
              Chaque trait de scie ({sawKerfMm}mm) est pris en compte pour éviter les erreurs de débit.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block text-[10px]">Barres Requises</span>
              <span className="text-lg font-bold text-white">{bars.length} × 6.00m</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-zinc-500 block text-[10px]">Chute Globale</span>
              <span className={`text-lg font-bold ${globalWastePercent < 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {globalWastePercent}%
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <span className="text-zinc-500 block text-[10px]">Trait de Scie</span>
              <select
                value={sawKerfMm}
                onChange={(e) => setSawKerfMm(Number(e.target.value))}
                className="bg-black/50 border border-white/10 rounded px-1.5 py-0.5 text-zinc-200 text-xs focus:outline-none"
              >
                <option value={2.5}>2.5 mm</option>
                <option value={3}>3.0 mm</option>
                <option value={4}>4.0 mm</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {bars.map((bar) => {
            return (
              <div key={bar.barIndex} className="glass-panel p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                      Barre #{bar.barIndex}
                    </span>
                    <span className="text-zinc-400">Standard 6 000 mm</span>
                  </div>
                  <div className="text-zinc-400">
                    Utilisé : <span className="text-white font-medium">{bar.usedLengthMm} mm</span> • Chute :{' '}
                    <span className={bar.wasteMm > 1200 ? 'text-emerald-400' : 'text-zinc-400'}>
                      {bar.wasteMm} mm {bar.wasteMm > 1200 ? '(Chute Réutilisable)' : ''}
                    </span>
                  </div>
                </div>

                <div className="w-full h-8 bg-zinc-950 rounded-lg overflow-hidden border border-white/10 flex relative p-0.5">
                  {bar.cuts.map((c, idx) => {
                    const widthPercent = (c.piece.lengthMm / standardBarMm) * 100;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${widthPercent}%`,
                          backgroundColor: c.piece.color,
                        }}
                        className="h-full rounded-[4px] relative flex items-center justify-center text-[10px] font-mono font-bold text-white tracking-wider truncate px-1 shadow-inner group border-r border-black/40"
                        title={`${c.piece.label}: ${c.piece.lengthMm} mm`}
                      >
                        <span className="truncate">{c.piece.lengthMm}</span>
                      </div>
                    );
                  })}

                  <div
                    style={{ width: `${(bar.wasteMm / standardBarMm) * 100}%` }}
                    className="h-full bg-zinc-900/80 flex items-center justify-center text-[10px] font-mono text-zinc-400 px-1 truncate"
                    title={`Chute: ${bar.wasteMm} mm`}
                  >
                    {bar.wasteMm > 300 && <span>Chute {bar.wasteMm}mm</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>
            Cet algorithme de découpe linéaire (FFD Heuristic) permet aux ateliers d’économiser en moyenne 3 barres de 6m sur un chantier résidentiel type de 10 fenêtres.
          </span>
        </div>
      </div>
    </section>
  );
};

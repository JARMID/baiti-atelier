import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import {
  Download,
  Scissors,
} from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';
import { generateWorkshopCutSheetPdf } from '../../utils/pdfGenerator';
import { computeDetailedBOM } from '../../utils/cadEngine';
import type { CadStructure } from '../../types/cad';

export const MobileCadScreen: React.FC = () => {
  const { config, language, theme } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';

  const [activeBay, setActiveBay] = useState<number>(0);
  const [isGeneratingCutSheet, setIsGeneratingCutSheet] = useState(false);

  // Compute profile cut segments based on current window dimensions
  const cutPieces = [
    { label: 'Dormant Haut (Traverse)', len: config.width, angle: '45° / 45°', qty: 1, type: 'Dormant' },
    { label: 'Dormant Bas (Seuil)', len: config.width, angle: '45° / 45°', qty: 1, type: 'Dormant' },
    { label: 'Montant Gauche', len: config.height, angle: '45° / 45°', qty: 1, type: 'Dormant' },
    { label: 'Montant Droit', len: config.height, angle: '45° / 45°', qty: 1, type: 'Dormant' },
    {
      label: 'Ouvrant Vantail 1 (Haut/Bas)',
      len: Math.round(config.width / 2 + 15),
      angle: '45° / 45°',
      qty: 2,
      type: 'Ouvrant',
    },
    {
      label: 'Ouvrant Vantail 1 (Montants)',
      len: config.height - 70,
      angle: '45° / 45°',
      qty: 2,
      type: 'Ouvrant',
    },
    {
      label: 'Ouvrant Vantail 2 (Haut/Bas)',
      len: Math.round(config.width / 2 + 15),
      angle: '45° / 45°',
      qty: 2,
      type: 'Ouvrant',
    },
    {
      label: 'Ouvrant Vantail 2 (Montants)',
      len: config.height - 70,
      angle: '45° / 45°',
      qty: 2,
      type: 'Ouvrant',
    },
  ];

  const handleExportCutSheet = () => {
    playTactileClick();
    setIsGeneratingCutSheet(true);
    try {
      const dummyCad: CadStructure = {
        width: config.width,
        height: config.height,
        verticalDividers: [Math.round(config.width / 2)],
        horizontalDividers: [],
        cellTypes: {
          '0-0': 'sash_slide',
          '0-1': 'sash_slide',
        },
      };
      const bom = computeDetailedBOM(dummyCad, config);
      generateWorkshopCutSheetPdf(dummyCad, config, bom);
    } catch {
      // Handled
    } finally {
      setIsGeneratingCutSheet(false);
    }
  };

  return (
    <div className="pb-36 px-3 sm:px-6 pt-2 max-w-xl md:max-w-2xl mx-auto space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. 2D BLUEPRINT SVG VIEWER */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="font-bold text-[#D4AF37]">Plan CAO 2D Paramétrique</span>
          <span className="text-zinc-500">{config.width} × {config.height} mm</span>
        </div>

        {/* Scalable Vector Graphics 2D Window Blueprint */}
        <div className="relative w-full aspect-4/3 rounded-2xl bg-[#070A10] border border-cyan-500/20 flex items-center justify-center p-4 overflow-hidden">
          {/* Blueprint Grid Lines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #38BDF8 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          <svg
            viewBox={`0 0 ${Math.max(config.width, 800) + 120} ${Math.max(config.height, 800) + 120}`}
            className="w-full h-full max-h-[260px] select-none"
          >
            {/* Outer Frame (Dormant) */}
            <rect
              x="50"
              y="50"
              width={config.width}
              height={config.height}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="12"
              rx="4"
            />

            {/* Inner Sash 1 (Left) */}
            <rect
              x="65"
              y="65"
              width={config.width / 2 - 10}
              height={config.height - 30}
              fill={activeBay === 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
              stroke="#38BDF8"
              strokeWidth="8"
              strokeDasharray={activeBay === 0 ? 'none' : '4 2'}
              className="cursor-pointer"
              onClick={() => {
                playTactileClick();
                setActiveBay(0);
              }}
            />

            {/* Inner Sash 2 (Right) */}
            <rect
              x={50 + config.width / 2}
              y="65"
              width={config.width / 2 - 15}
              height={config.height - 30}
              fill={activeBay === 1 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
              stroke="#38BDF8"
              strokeWidth="8"
              className="cursor-pointer"
              onClick={() => {
                playTactileClick();
                setActiveBay(1);
              }}
            />

            {/* Center Overlap Meeting Stile */}
            <line
              x1={50 + config.width / 2}
              y1="55"
              x2={50 + config.width / 2}
              y2={50 + config.height - 5}
              stroke="#E2E8F0"
              strokeWidth="6"
            />

            {/* Dimensions Labels on Blueprint */}
            <text
              x={50 + config.width / 2}
              y="32"
              fill="#D4AF37"
              fontSize="34"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              L = {config.width} mm
            </text>
            <text
              x="20"
              y={50 + config.height / 2}
              fill="#D4AF37"
              fontSize="34"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
              transform={`rotate(-90 20 ${50 + config.height / 2})`}
            >
              H = {config.height} mm
            </text>
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
          <span>Touchez une travée pour la sélectionner</span>
          <span className="text-cyan-400">Travée active : {activeBay + 1} / 2</span>
        </div>
      </div>

      {/* 2. OPERATOR CUT SHEET LIST */}
      <div
        className={`p-4 rounded-3xl border shadow-md space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#0B0F19] border-white/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-bold">Fiche de Débit Atelier</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-zinc-400">
            {cutPieces.length} Barres à Couper
          </span>
        </div>

        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {cutPieces.map((p, idx) => (
            <div
              key={idx}
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
                  Coupe d'Onglet : {p.angle} • Type : {p.type}
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {p.len} <span className="text-[10px]">mm</span>
                </span>
                <span className="text-[10px] text-zinc-400 block">Qté : {p.qty}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleExportCutSheet}
          disabled={isGeneratingCutSheet}
          className="w-full py-3 rounded-2xl bg-[#D4AF37] text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer min-h-[48px] hover:brightness-110 active:scale-98 transition-all shadow-md mt-2"
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingCutSheet ? 'Génération...' : 'Télécharger Fiche Scie PDF'}</span>
        </button>
      </div>
    </div>
  );
};

export default MobileCadScreen;

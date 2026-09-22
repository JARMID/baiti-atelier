import React, { useState } from 'react';
import { useConfigStore } from '../../store/configStore';
import { playTactileClick } from '../../utils/audioFeedback';
import {
  FileDown,
  MessageCircle,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface MobilePriceStickyBarProps {
  onOpenQuoteModal: () => void;
}

export const MobilePriceStickyBar: React.FC<MobilePriceStickyBarProps> = ({
  onOpenQuoteModal,
}) => {
  const { config, cost, theme, selectedWilaya } = useConfigStore();
  const isLight = theme === 'light';
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShareWhatsApp = () => {
    playTactileClick();
    const msg = `*DEMANDE DE DEVIS BAITI ATELIER*\nChâssis : ${config.width} × ${config.height} mm\nSystème : ${config.profileSystem}\nFinition : ${config.finishColor}\nVitrage : ${config.glassType}\nWilaya : ${selectedWilaya}\nMontant Estimé : ${cost.totalEstimatedDzd.toLocaleString('fr-DZ')} DZD\n\nConçu sur https://web-two-tan-31.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div
      className="md:hidden fixed bottom-14 left-0 right-0 z-40 px-3 pb-1 pointer-events-auto"
    >
      <div
        className={`rounded-2xl border backdrop-blur-2xl p-2.5 transition-all shadow-xl ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/60'
            : 'bg-[#0A0D15]/95 border-white/15 text-white shadow-black/90'
        }`}
      >
        {/* Top summary row */}
        <div className="flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-400"
              title="Détails chiffrage"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
            </button>

            <div>
              <div className="text-[10px] text-zinc-400">
                {config.width} × {config.height} mm
              </div>
              <div className="text-sm font-bold text-[#D4AF37]">
                {cost.totalEstimatedDzd.toLocaleString('fr-DZ')} <span className="text-[10px]">DZD</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShareWhatsApp}
              className="p-2 min-h-[40px] rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              title="Partager sur WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="text-[11px]">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onOpenQuoteModal();
              }}
              className="px-3 py-2 min-h-[40px] rounded-xl bg-gradient-to-r from-[#C5A880] to-[#D4AF37] text-slate-950 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer hover:brightness-110 shadow-xs"
              title="Recevoir le devis officiel"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Devis</span>
            </button>
          </div>
        </div>

        {/* Collapsible details breakdown */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 text-[11px] font-mono space-y-1 animate-in fade-in">
            <div className="flex justify-between text-zinc-400">
              <span>Profilés ({cost.profileLengthMeters.toFixed(1)}m) :</span>
              <span className="text-white font-semibold">
                {cost.profileCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Vitrage ({cost.glassAreaM2.toFixed(2)}m²) :</span>
              <span className="text-white font-semibold">
                {cost.glassCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Quincaillerie & Joints :</span>
              <span className="text-white font-semibold">
                {cost.hardwareCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Main d'Œuvre & Assemblage :</span>
              <span className="text-sky-400 font-semibold">
                {cost.laborCostDzd.toLocaleString('fr-DZ')} DZD
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePriceStickyBar;

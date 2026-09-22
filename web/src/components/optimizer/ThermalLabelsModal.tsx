import React, { useState } from 'react';
import type { LinearOptimizationResult, OptimizedBar1D, PlacedCut1D } from '../../types/optimizer';
import { X, Printer, Download, Scissors, CheckCircle2, FileSpreadsheet, Code2 } from 'lucide-react';
import { printThermalLabelsBatch, isTauriDesktop } from '../../services/desktopBridge';
import { useConfigStore } from '../../store/configStore';
import {
  generateSawGcode,
  generateTigerStopCsv,
  generateElumatecXml,
  downloadSawFile,
} from '../../utils/sawMachineBridge';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';

interface ThermalLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  solution: LinearOptimizationResult;
  jobName?: string;
}

export const ThermalLabelsModal: React.FC<ThermalLabelsModalProps> = ({
  isOpen,
  onClose,
  solution,
  jobName = 'Chantier Résidence Kouba',
}) => {
  const { theme, language } = useConfigStore();
  const isLight = theme === 'light';
  const isRtl = language === 'ar';
  const [spoolMessage, setSpoolMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Flatten all pieces from all stock bars
  const allCutPieces = solution.bars.flatMap((bar: OptimizedBar1D) =>
    bar.cuts.map((cut: PlacedCut1D, cutIdx: number) => ({
      ...cut,
      barIndex: bar.barIndex,
      sequence: cutIdx + 1,
      totalInBar: bar.cuts.length,
      stockLength: bar.stockLength,
    }))
  );

  const handleDownloadGcode = () => {
    playTactileClick();
    const gcode = generateSawGcode(solution, jobName);
    downloadSawFile(gcode, `CNC_SAW_${jobName.replace(/\s+/g, '_')}.nc`);
  };

  const handleDownloadTigerStop = () => {
    playTactileClick();
    const csv = generateTigerStopCsv(solution, jobName);
    downloadSawFile(csv, `TIGERSTOP_${jobName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8');
  };

  const handleDownloadElumatec = () => {
    playTactileClick();
    const xml = generateElumatecXml(solution, jobName);
    downloadSawFile(xml, `ELUMATEC_${jobName.replace(/\s+/g, '_')}.xml`, 'application/xml;charset=utf-8');
  };

  const handlePrintLabels = async () => {
    playClampSound();
    const labelsText = allCutPieces.map((piece) =>
      `BAITI SAW CUT LABEL | بيتي\nJOB: ${jobName}\nPIECE: ${piece.label}\nPROFILE: ${piece.profileCode || 'Standard'}\nLENGTH: ${piece.length.toFixed(1)}mm\nANGLES: ${piece.miterLeft}° / ${piece.miterRight}°\nBAR #${piece.barIndex} (Stock: ${piece.stockLength}mm) • SEQUENCE #${piece.sequence}`
    );

    const result = await printThermalLabelsBatch(labelsText);
    if (result && isTauriDesktop()) {
      setSpoolMessage(result.message);
      setTimeout(() => setSpoolMessage(null), 5000);
    }
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md print:p-0 print:bg-white"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col transition-colors print:border-none print:shadow-none print:max-w-none print:max-h-none print:bg-white print:text-black ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-[#0D121D] border-white/15 text-white'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-6 border-b flex items-center justify-between print:hidden transition-colors ${
            isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/10 bg-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {language === 'ar'
                  ? 'طباعة الملصقات الحرارية للقطع المقصوصة'
                  : language === 'en'
                  ? 'Thermal Label Printing for Cut Pieces'
                  : 'Étiquetage Thermique des Pièces Débitées'}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                {language === 'ar'
                  ? `${allCutPieces.length} ملصق جاهز للطابعات الحرارية 80×50 ملم (Zebra, Brother, Xprinter).`
                  : language === 'en'
                  ? `${allCutPieces.length} labels ready for 80x50mm thermal printers (Zebra, Brother, Xprinter).`
                  : `${allCutPieces.length} étiquettes prêtes pour imprimante thermique 80×50mm (Zebra, Brother, Xprinter).`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadGcode}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
              }`}
              title="Télécharger fichier ISO G-code pour butées et scies numériques"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>G-Code (.NC)</span>
            </button>

            <button
              onClick={handleDownloadTigerStop}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                isLight
                  ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
              }`}
              title="Format TigerStop et butées numériques atelier CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-500" />
              <span>TigerStop CSV</span>
            </button>

            <button
              onClick={handleDownloadElumatec}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer btn-press ${
                isLight
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30 text-purple-300'
              }`}
              title="Format d'échange XML pour centres d'usinage et scies double tête"
            >
              <Code2 className="w-3.5 h-3.5 text-purple-500" />
              <span>Elumatec XML</span>
            </button>

            <button
              onClick={handlePrintLabels}
              className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-xs font-bold text-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/20 btn-press hover-lift"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>
                {language === 'ar'
                  ? 'طباعة الملصقات'
                  : language === 'en'
                  ? 'Print Labels'
                  : 'Imprimer Étiquettes'}
              </span>
            </button>

            <button
              onClick={() => {
                playTactileClick();
                onClose();
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ml-1 btn-press ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300'
                  : 'text-zinc-400 hover:text-white bg-white/5 border border-white/10'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spool Confirmation Banner */}
        {spoolMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-mono flex items-center gap-2 print:hidden ${
              isLight
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{spoolMessage}</span>
          </div>
        )}

        {/* Labels Scrollable Grid */}
        <div
          className={`p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2 print:p-2 ${
            isLight ? 'bg-slate-50/50' : ''
          }`}
        >
          {allCutPieces.map((piece, idx) => (
            <div
              key={`${piece.id}-${idx}`}
              className="p-4 rounded-2xl bg-white text-black border-2 border-black font-sans shadow-md flex flex-col justify-between h-48 print:shadow-none print:rounded-none print:border-black print:page-break-inside-avoid"
            >
              {/* Header */}
              <div className="border-b-2 border-black pb-1.5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] font-black tracking-wider block">
                    BAITI ATELIER | بيتي • DÉBITAGE
                  </span>
                  <span className="text-[11px] font-bold text-zinc-800 truncate block max-w-[170px]">
                    {jobName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">
                    B#{piece.barIndex} P#{piece.sequence}
                  </span>
                </div>
              </div>

              {/* Main Content */}
              <div className="my-auto py-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-zinc-700 truncate max-w-[140px]">
                    {piece.label}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-zinc-600">
                    {piece.profileCode || 'TPR-ALU'}
                  </span>
                </div>

                <div className="text-2xl font-mono font-black tracking-tight text-black my-0.5">
                  {piece.length.toFixed(1)} <span className="text-xs font-normal">mm</span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-zinc-700 bg-zinc-100 px-2 py-1 rounded border border-zinc-300">
                  <span>ANGLE G : <b>{piece.miterLeft}°</b></span>
                  <span>ANGLE D : <b>{piece.miterRight}°</b></span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div className="border-t border-dashed border-zinc-400 pt-1.5 flex items-center justify-between">
                <div className="font-mono text-[8px] text-zinc-600">
                  <div>ID : {piece.id.substring(0, 8)}</div>
                  <div>ALGÉRIE 58W</div>
                </div>

                {/* Simulated Barcode */}
                <div className="flex items-center gap-0.5 h-6">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2].map((w, i) => (
                    <div
                      key={i}
                      style={{ width: `${w}px` }}
                      className="h-full bg-black"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs font-mono print:hidden transition-colors ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-white/10 text-zinc-400'
          }`}
        >
          <span>
            {language === 'ar'
              ? 'حجم الملصق: لفة حرارية 80×50 ملم'
              : language === 'en'
              ? 'Format: 80x50 mm thermal roll'
              : 'Format : Rouleau thermique 80×50 mm'}
          </span>
          <span>
            {allCutPieces.length}{' '}
            {language === 'ar'
              ? 'قطعة إجمالية'
              : language === 'en'
              ? 'pieces total'
              : 'pièces au total'}
          </span>
        </div>
      </div>
    </div>
  );
};

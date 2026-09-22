import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';
import { playTactileClick } from '../../utils/audioFeedback';

export interface TouchSignaturePadProps {
  label: string;
  subtitle?: string;
  initialDataUrl?: string;
  onSignatureChange: (dataUrl: string | undefined) => void;
  isLight?: boolean;
}

export const TouchSignaturePad: React.FC<TouchSignaturePadProps> = ({
  label,
  subtitle,
  initialDataUrl,
  onSignatureChange,
  isLight = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Setup canvas resolution and redraw if initialDataUrl
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = isLight ? '#0F172A' : '#F8FAFC';

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl, isLight]);

  const getCoordinates = (
    e: MouseEvent | TouchEvent,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable && 'touches' in e) {
      e.preventDefault();
    }

    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e, canvas);

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (e.cancelable && 'touches' in e) {
      e.preventDefault();
    }

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  }, []);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  }, [onSignatureChange]);

  // Touch and mouse listeners attached directly with { passive: false } to prevent scroll jitter
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => startDrawing(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => stopDrawing();

    const handleMouseDown = (e: MouseEvent) => startDrawing(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => stopDrawing();
    const handleMouseLeave = () => stopDrawing();

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);

      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [startDrawing, draw, stopDrawing]);

  const handleClear = () => {
    playTactileClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width * dpr, rect.height * dpr);

    setHasSignature(false);
    onSignatureChange(undefined);
  };

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <PenTool className="w-3.5 h-3.5 text-[#D4AF37]" />
            {label}
          </span>
          {subtitle && (
            <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasSignature ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-2.5 h-2.5" />
              Signé
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500">En attente</span>
          )}

          <button
            type="button"
            onClick={handleClear}
            disabled={!hasSignature}
            className={`p-1.5 rounded-xl border flex items-center gap-1 text-[10px] cursor-pointer transition-all ${
              hasSignature
                ? isLight
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'border-white/10 text-zinc-300 hover:bg-white/10'
                : 'opacity-40 cursor-not-allowed border-transparent text-zinc-600'
            }`}
            title="Effacer la signature"
          >
            <Eraser className="w-3 h-3" />
            <span>Effacer</span>
          </button>
        </div>
      </div>

      <div
        className={`relative w-full h-28 rounded-2xl border overflow-hidden transition-all ${
          isLight
            ? 'bg-slate-50/80 border-slate-300'
            : 'bg-black/40 border-white/15'
        }`}
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
          style={{ touchAction: 'none' }}
        />

        {/* Watermark baseline hint */}
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-1 text-zinc-500/50">
            <span className="text-[11px] font-sans">Signer du doigt ou au stylet ici</span>
            <span className="text-[10px]" dir="rtl">التوقيع باليد هنا</span>
            <div className="w-3/4 border-b border-dashed border-zinc-500/30 mt-1" />
          </div>
        )}
      </div>
    </div>
  );
};

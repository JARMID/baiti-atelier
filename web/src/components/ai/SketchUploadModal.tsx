import React, { useState, useRef } from 'react';
import { useConfigStore } from '../../store/configStore';
import { extractCadFromImage, type ExtractedCadDimensions } from '../../utils/aiVisionService';
import { getTranslation } from '../../utils/i18n';
import { playTactileClick, playClampSound } from '../../utils/audioFeedback';
import {
  Camera,
  CheckCircle2,
  X,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SketchUploadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { setDimensions, setOpeningType, setProfileSystem, theme, language } = useConfigStore();
  const t = getTranslation(language);
  const isRtl = language === 'ar';
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ExtractedCadDimensions | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playTactileClick();
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    playTactileClick();
    setIsAnalyzing(true);

    try {
      const data = await extractCadFromImage(selectedImage);
      setResult(data);
      playClampSound();
    } catch {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    playTactileClick();
    setDimensions(result.width, result.height);
    setOpeningType(result.openingType);
    setProfileSystem(result.profileSystem);
    onClose();
  };

  const subtitle =
    language === 'ar'
      ? 'استخراج تلقائي للمقاسات من الصور لورشات الألمنيوم والنجارة'
      : language === 'en'
      ? 'Automatic dimension extraction for aluminum and PVC joinery'
      : 'Extraction automatique de cotes pour menuiserie aluminium & PVC';

  const dropPrompt =
    language === 'ar'
      ? 'انقر لرفع صورة المخطط أو القياسات اليدوية'
      : language === 'en'
      ? 'Click to upload a blueprint photo or handwritten sketch'
      : 'Cliquez pour déposer une photo ou un croquis papier';

  const formatNote =
    language === 'ar'
      ? 'يدعم القياسات المكتوبة بخط اليد وصور النوافذ والأبواب (PNG, JPG, WebP)'
      : language === 'en'
      ? 'Supports handwritten measurements and window/door photos (PNG, JPG, WebP)'
      : 'Prend en charge les cotes manuscrites et photos de baies vitrées (PNG, JPG, WebP)';

  const analyzingText =
    language === 'ar'
      ? 'جاري قراءة وتحديد أبعاد المخطط...'
      : language === 'en'
      ? 'Analyzing image dimensions...'
      : 'Analyse et détection des cotes...';

  const extractActionText =
    language === 'ar'
      ? 'استخراج المقاسات تلقائياً'
      : language === 'en'
      ? 'Extract dimensions automatically'
      : 'Extraire les dimensions automatiquement';

  const successText =
    language === 'ar'
      ? 'تم التعرف على المقاسات بنجاح'
      : language === 'en'
      ? 'Dimensions Recognized Successfully'
      : 'Cotes Reconnues avec Succès';

  const confidenceText =
    language === 'ar' ? 'الدقة التقديرية :' : language === 'en' ? 'Confidence:' : 'Confiance :';

  const detectedWidthText =
    language === 'ar' ? 'العرض المكتشف :' : language === 'en' ? 'Detected width:' : 'Largeur détectée :';

  const detectedHeightText =
    language === 'ar' ? 'الارتفاع المكتشف :' : language === 'en' ? 'Detected height:' : 'Hauteur détectée :';

  const applyButtonText =
    language === 'ar'
      ? 'تطبيق في الاستوديو ثلاثي الأبعاد وحساب التكلفة'
      : language === 'en'
      ? 'Apply to 3D Studio and Compute Quote'
      : 'Appliquer au Studio 3D et Calculer le Devis';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 shadow-2xl flex flex-col gap-6 transition-all duration-300 border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800 shadow-2xl'
            : 'bg-[#0F141C] border-white/10 text-zinc-100'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t.scanSketchBtn}
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className={`p-1.5 rounded-lg transition-all btn-press cursor-pointer shrink-0 ${
              isLight
                ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Dropzone */}
        {!selectedImage ? (
          <div
            onClick={() => {
              playTactileClick();
              fileInputRef.current?.click();
            }}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover-lift btn-press text-center ${
              isLight
                ? 'border-slate-300 hover:border-[#D4AF37] bg-slate-50/70 hover:bg-slate-50'
                : 'border-white/15 hover:border-[#D4AF37]/50 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-zinc-300'
              }`}
            >
              <Camera className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              {dropPrompt}
            </p>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
              {formatNote}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Image Preview */}
            <div
              className={`relative rounded-2xl overflow-hidden border max-h-56 flex items-center justify-center ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-black border-white/10'
              }`}
            >
              <img src={selectedImage} alt="Croquis" className="max-h-56 w-auto object-contain" />
              <button
                onClick={() => {
                  playTactileClick();
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-zinc-300 hover:text-white backdrop-blur-md cursor-pointer btn-press"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Analyze Action */}
            {!result && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C5A880] text-black font-semibold text-sm shadow-lg shadow-[#D4AF37]/20 transition-all disabled:opacity-50 btn-press cursor-pointer hover-lift"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{analyzingText}</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>{extractActionText}</span>
                  </>
                )}
              </button>
            )}

            {/* Extracted Results Card */}
            {result && (
              <div
                className={`p-4 rounded-2xl border flex flex-col gap-3 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-300' : 'bg-[#141B26] border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{successText}</span>
                  </span>
                  <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
                    {confidenceText} {Math.round(result.confidence * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-white border-emerald-200' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                      {detectedWidthText}
                    </span>
                    <p
                      className={`text-base font-extrabold font-mono mt-0.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {result.width} mm
                    </p>
                  </div>
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isLight ? 'bg-white border-emerald-200' : 'bg-black/30 border-white/5'
                    }`}
                  >
                    <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>
                      {detectedHeightText}
                    </span>
                    <p
                      className={`text-base font-extrabold font-mono mt-0.5 ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}
                    >
                      {result.height} mm
                    </p>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-mono ${
                    isLight ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {language === 'ar' ? 'نظام الفتح :' : 'Type :'} <b className={isLight ? 'text-slate-900' : 'text-zinc-200'}>{result.openingType}</b> • {language === 'ar' ? 'القطاع الموصى به :' : 'Profil :'} <b className={isLight ? 'text-slate-900' : 'text-zinc-200'}>{result.profileSystem}</b>
                </div>

                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-900/30 cursor-pointer btn-press hover-lift"
                >
                  <span>{applyButtonText}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

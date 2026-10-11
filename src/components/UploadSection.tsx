import React, { useRef } from 'react';
import { UploadedMedia, SampleStudyCase } from '../types/trading';
import { SAMPLE_STUDY_CASES } from '../data/samples';
import { Upload, FileText, Image as ImageIcon, Sparkles, BookOpen, Trash2 } from 'lucide-react';

interface UploadSectionProps {
  media: UploadedMedia | null;
  onMediaSelect: (media: UploadedMedia | null) => void;
  onSelectSampleCase: (studyCase: SampleStudyCase) => void;
  activeConcept: string;
  onConceptChange: (concept: string) => void;
  userPrompt: string;
  onPromptChange: (val: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  media,
  onMediaSelect,
  onSelectSampleCase,
  activeConcept,
  onConceptChange,
  userPrompt,
  onPromptChange,
  onAnalyze,
  isAnalyzing,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      alert('Por favor selecciona una imagen de gráfico (PNG, JPG, WEBP) o un archivo PDF.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1] || '';

      const uploaded: UploadedMedia = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: isPdf ? 'pdf' : 'image',
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png'),
        dataUrl: result,
        base64: base64Data,
      };

      onMediaSelect(uploaded);
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1] || '';

      const uploaded: UploadedMedia = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: isPdf ? 'pdf' : 'image',
        mimeType: file.type || (isPdf ? 'application/pdf' : 'image/png'),
        dataUrl: result,
        base64: base64Data,
      };

      onMediaSelect(uploaded);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center space-x-2">
          <Upload className="w-4 h-4 text-blue-400" />
          <span>ENTRADA DE GRÁFICOS & MANUALES SMC</span>
        </h4>
        <span className="text-[10px] text-slate-400 font-mono">Multimodal Gemini 3.8</span>
      </div>

      {/* Preloaded Sample Cases Quick Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 block uppercase">
          Casos de Estudio Precargados (Prueba en 1 clic):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SAMPLE_STUDY_CASES.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onSelectSampleCase(sc)}
              className="p-2 rounded-lg bg-[#080b12] border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition text-left group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                <span className="text-blue-400 font-bold group-hover:text-blue-300">{sc.pair}</span>
                <span className="text-slate-400">{sc.timeframe}</span>
              </div>
              <div className="text-[11px] text-slate-300 font-medium truncate">{sc.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 ${
          media
            ? 'border-emerald-500/40 bg-emerald-950/10'
            : 'border-slate-700/80 hover:border-blue-500/50 bg-[#080b14]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {media ? (
          <div className="flex items-center justify-between w-full px-2">
            <div className="flex items-center space-x-2.5 text-left truncate">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                {media.type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div className="truncate">
                <span className="text-xs font-bold font-mono text-white block truncate">{media.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(media.size / 1024).toFixed(1)} KB • {media.type.toUpperCase()} listo para análisis
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onMediaSelect(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Quitar archivo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Arrastra tu captura de TradingView o manual PDF aquí
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Soporta capturas de broker (MT4/5, cTrader, TradingView) y guías técnicas en PDF
              </p>
            </div>
          </>
        )}
      </div>

      {/* Contextual Concept Selector & Prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block uppercase">
            Enfoque Metodológico:
          </label>
          <select
            value={activeConcept}
            onChange={(e) => onConceptChange(e.target.value)}
            className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
          >
            <option value="Análisis Completo ICT / SMC">Análisis Completo ICT / SMC</option>
            <option value="Liquidez: BSL / SSL Sweeps e Inducement">Liquidez (BSL/SSL Sweeps & IDM)</option>
            <option value="Zonas: Order Blocks y Fair Value Gaps (FVG)">Order Blocks & Fair Value Gaps</option>
            <option value="Estructura: Market Structure Shift (MSS) y BOS">Estructura (MSS / CHoCH & BOS)</option>
            <option value="Tiempo & Precio: Killzones y Modelos AMD">Killzones & Modelo AMD (PO3)</option>
            <option value="Gestión de Riesgo y Psicotrading">Gestión de Riesgo & Psicotrading</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="text-[10px] font-mono text-slate-400 block uppercase">
            Instrucción o Pregunta al Mentor:
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Ej: ¿Dónde está el MSS y el FVG para ejecutar compra?..."
              className="flex-1 bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 font-sans focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAnalyze();
              }}
            />
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition shadow-lg shadow-blue-600/25 flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>ANALIZANDO...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ANALIZAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

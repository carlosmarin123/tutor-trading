import React, { useState, useEffect } from 'react';
import { AnalysisResult, UploadedMedia, SampleStudyCase, SchematicType, JournalEntry } from './types/trading';
import { SAMPLE_STUDY_CASES } from './data/samples';
import { getJournalEntries } from './services/journalStorage';
import { KillzonesTracker } from './components/KillzonesTracker';
import { UploadSection } from './components/UploadSection';
import { ChartViewer } from './components/ChartViewer';
import { VoiceMentorPanel } from './components/VoiceMentorPanel';
import { ExecutionCard } from './components/ExecutionCard';
import { SmcSchematicsViewer } from './components/schematics/SmcSchematicsViewer';
import { RiskCalculatorModal } from './components/RiskCalculatorModal';
import { TradingJournal } from './components/TradingJournal';
import {
  TrendingUp,
  Shield,
  HelpCircle,
  Calculator,
  Volume2,
  RefreshCw,
  ExternalLink,
  BookMarked,
  BookOpen,
  Info,
} from 'lucide-react';

export default function App() {
  const [selectedMedia, setSelectedMedia] = useState<UploadedMedia | null>(null);
  const [activeConcept, setActiveConcept] = useState<string>('Análisis Completo ICT / SMC');
  const [userPrompt, setUserPrompt] = useState<string>('Identifica el barrido de liquidez, la estructura MSS y el Fair Value Gap para la entrada.');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Current analysis result (initialized with sample case 1)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(SAMPLE_STUDY_CASES[0].mockResult);
  const [activeSchematic, setActiveSchematic] = useState<SchematicType>(SAMPLE_STUDY_CASES[0].mockResult.recommendedSchematic);
  const [voiceAudioBase64, setVoiceAudioBase64] = useState<string | null>(null);

  // Modals & Panels
  const [isRiskModalOpen, setIsRiskModalOpen] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [journalEntriesCount, setJournalEntriesCount] = useState<number>(0);

  // Sync journal count
  useEffect(() => {
    try {
      const entries = getJournalEntries();
      setJournalEntriesCount(entries.length);
    } catch {
      setJournalEntriesCount(0);
    }
  }, [isJournalOpen]);

  // Load sample case
  const handleSelectSample = (studyCase: SampleStudyCase) => {
    setSelectedMedia(null);
    setUserPrompt(studyCase.defaultPrompt);
    setAnalysisResult(studyCase.mockResult);
    setActiveSchematic(studyCase.mockResult.recommendedSchematic);
    setVoiceAudioBase64(null);
  };

  // Load an existing journal entry into active terminal
  const handleLoadJournalEntryToTerminal = (entry: JournalEntry) => {
    setAnalysisResult(entry.analysis);
    if (entry.analysis.recommendedSchematic) {
      setActiveSchematic(entry.analysis.recommendedSchematic);
    }
    setUserPrompt(entry.title);
    if (entry.voiceNotes && entry.voiceNotes.length > 0 && entry.voiceNotes[0].audioBase64) {
      setVoiceAudioBase64(entry.voiceNotes[0].audioBase64);
    }
  };

  // Run backend Gemini multimodal analysis
  const handleAnalyze = async (promptOverride?: string) => {
    setIsAnalyzing(true);
    setVoiceAudioBase64(null);

    const promptText = promptOverride || userPrompt;

    try {
      const payload: any = {
        prompt: promptText,
        activeConcept,
        marketPair: selectedMedia ? selectedMedia.name : 'EUR/USD (TradingView)',
        timeframe: '15m / M5 Intradía',
      };

      if (selectedMedia) {
        payload.files = [
          {
            name: selectedMedia.name,
            mimeType: selectedMedia.mimeType,
            base64: selectedMedia.base64,
          },
        ];
      }

      const res = await fetch('/api/analyze-trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: AnalysisResult = json.data;
        setAnalysisResult(result);
        if (result.recommendedSchematic) {
          setActiveSchematic(result.recommendedSchematic);
        }

        // Request Gemini TTS audio for the spoken explanation
        if (result.spokenExplanation) {
          try {
            const ttsRes = await fetch('/api/text-to-speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: result.spokenExplanation,
                voiceName: 'Fenrir',
              }),
            });
            const ttsData = await ttsRes.json();
            if (ttsData.success && ttsData.audioBase64) {
              setVoiceAudioBase64(ttsData.audioBase64);
            }
          } catch (ttsErr) {
            console.warn('TTS request fallback to browser speech synthesis:', ttsErr);
          }
        }
      } else {
        console.warn('Analysis fallback used:', json.error);
      }
    } catch (err) {
      console.error('Error during analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoicePrompt = (transcript: string) => {
    setUserPrompt(transcript);
    handleAnalyze(transcript);
  };

  const currentPairName = selectedMedia ? selectedMedia.name.split('.')[0] : 'EUR/USD';

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-blue-500/20 selection:text-blue-300">
      {/* Top Institutional Header */}
      <header className="border-b border-slate-800/80 bg-[#0a0e19]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Method */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#090d18] rounded-[10px] flex items-center justify-center text-emerald-400 font-mono font-black text-sm">
                ICT
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold font-mono tracking-tight text-white">
                  MENTOR EXPERTO EN TRADING SMC / ICT
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  IPDA v3.8
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Análisis Institucional de Liquidez, Order Blocks, FVGs y Modelos AMD por Voz
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsJournalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 text-xs font-mono font-medium transition shadow-sm"
              title="Abrir Diario de Operativa con filtro por fecha y par de divisas"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Diario de Operativa</span>
              {journalEntriesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-bold text-[10px] ml-0.5">
                  {journalEntriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsRiskModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-mono font-medium transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculadora R:R</span>
            </button>

            <button
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition"
            >
              <BookMarked className="w-3.5 h-3.5 text-blue-400" />
              <span>Glosario SMC</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Institutional Killzones Clock Bar */}
        <KillzonesTracker />

        {/* 2-Column Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (Trading Terminal, Upload, Chart & Voice Mentor) - 7 cols */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* 1. File Upload & Preloaded Cases */}
            <UploadSection
              media={selectedMedia}
              onMediaSelect={setSelectedMedia}
              onSelectSampleCase={handleSelectSample}
              activeConcept={activeConcept}
              onConceptChange={setActiveConcept}
              userPrompt={userPrompt}
              onPromptChange={setUserPrompt}
              onAnalyze={() => handleAnalyze()}
              isAnalyzing={isAnalyzing}
            />

            {/* 2. Interactive Chart Viewer with Overlays */}
            <div className="min-h-[400px]">
              <ChartViewer
                media={selectedMedia}
                overlays={analysisResult.visualOverlays}
                bias={analysisResult.bias}
              />
            </div>

            {/* 3. Spoken Voice Mentor Panel (Interactive Audio Player & Mic) */}
            <VoiceMentorPanel
              spokenText={analysisResult.spokenExplanation}
              isAnalyzing={isAnalyzing}
              onSendVoicePrompt={handleVoicePrompt}
              voiceAudioBase64={voiceAudioBase64}
            />

            {/* 4. Institutional Execution Card & POI Zones */}
            <ExecutionCard
              analysis={analysisResult}
              onOpenRiskCalculator={() => setIsRiskModalOpen(true)}
              onSaveToJournal={() => setIsJournalOpen(true)}
            />
          </div>

          {/* Right Column (Visual Schematics, Blueprints & Educational Matrix) - 5 cols */}
          <div className="lg:col-span-5 flex flex-col space-y-4 sticky top-16">
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 shadow-xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                  <h3 className="text-xs font-bold font-mono text-white tracking-wider uppercase">
                    PANEL LATERAL: ESQUEMAS VISUALES SMC & ICT
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono">
                  Sincronizado con Audio
                </span>
              </div>

              {/* Master Schematic Switcher */}
              <SmcSchematicsViewer
                currentSchematic={activeSchematic}
                onSelectSchematic={setActiveSchematic}
              />
            </div>

            {/* Concept Quick Reference Card */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CONFLUENCIAS INSTITUCIONALES CLAVE</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Guía de Alta Probabilidad</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-amber-400 font-bold block text-[11px]">1. Liquidez (BSL / SSL)</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    El precio se mueve de una piscina de liquidez a otra. Sin sweep previo, la operación carece de combustible.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-blue-400 font-bold block text-[11px]">2. Estructura (MSS vs BOS)</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    MSS cambia la dirección institucional tras un sweep; BOS confirma la continuación tendencial del algoritmo.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-purple-400 font-bold block text-[11px]">3. Ineficiencia (FVG)</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    El Consequent Encroachment (50%) del FVG es el punto exacto de entrada con invalidación en el swing high/low.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-emerald-400 font-bold block text-[11px]">4. Time & Price (Killzone)</span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                    Solo operar en London Open (02:00-05:00 EST) y NY AM (07:00-10:00 EST). El tiempo invalida el precio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Trading Journal Modal */}
      <TradingJournal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        currentAnalysis={analysisResult}
        currentPair={currentPairName}
        currentTimeframe="15m"
        currentScreenshot={selectedMedia?.dataUrl}
        onLoadEntryToTerminal={handleLoadJournalEntryToTerminal}
      />

      {/* Risk & Psicotrading Calculator Modal */}
      <RiskCalculatorModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
        defaultEntry={analysisResult.executionPlan.entryZone.split(' ')[0] || '1.08270'}
        defaultSL={analysisResult.executionPlan.stopLoss.split(' ')[0] || '1.08170'}
        defaultTP={analysisResult.executionPlan.takeProfit2.split(' ')[0] || '1.08650'}
      />

      {/* Info / Glossary Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1422] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                <BookMarked className="w-5 h-5 text-blue-400" />
                <span>GLOSARIO INSTITUCIONAL ICT & SMART MONEY CONCEPTS</span>
              </h3>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 text-xs font-mono"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <strong className="text-amber-400 font-mono block">Buy-side Liquidity (BSL) / Sell-side Liquidity (SSL):</strong>
                Grupos de órdenes pendientes (Stop-Losses y Buy/Sell Stops) acumulados por encima de máximos o por debajo de mínimos. Son el objetivo principal del algoritmo bancario.
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <strong className="text-purple-400 font-mono block">Fair Value Gap (FVG) / Consequent Encroachment (CE):</strong>
                Ineficiencia en la entrega de precio donde no hubo equilibrio entre compradores y vendedores (patrón de 3 velas). El nivel del 50% (CE) suele actuar como imán institucional.
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <strong className="text-blue-400 font-mono block">Order Block (OB) / Mean Threshold (MT):</strong>
                La última vela contraria antes de un desplazamiento contundente con FVG. El 50% de su cuerpo es el Mean Threshold; si una vela cierra más allá, el bloque pierde validez.
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <strong className="text-emerald-400 font-mono block">Breaker Block (BB):</strong>
                Un bloque de órdenes que fue quebrado violentamente tras barrer liquidez previa. Al ser retesteado, se convierte en un soporte/resistencia institucional de alta fiabilidad.
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                <strong className="text-cyan-400 font-mono block">AMD / Power of 3 (PO3):</strong>
                El ciclo algorítmico diario de tres fases: Acumulación (Asia), Manipulación o Judas Swing (Londres/apertura NY) y Distribución hacia el objetivo de expansión.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

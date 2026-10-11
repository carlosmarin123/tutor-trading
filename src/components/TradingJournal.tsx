import React, { useState, useEffect, useRef } from 'react';
import {
  JournalEntry,
  TradeOutcome,
  VoiceNote,
  AnalysisResult,
} from '../types/trading';
import {
  getJournalEntries,
  saveJournalEntry,
  deleteJournalEntry,
  updateJournalEntryOutcome,
  addVoiceNoteToEntry,
} from '../services/journalStorage';
import {
  BookOpen,
  Calendar,
  Filter,
  Search,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Tag,
  Plus,
  Play,
  Pause,
  Award,
  Layers,
  FileSpreadsheet,
  Download,
  ExternalLink,
  ChevronDown,
  X,
} from 'lucide-react';

interface TradingJournalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalysis?: AnalysisResult;
  currentPair?: string;
  currentTimeframe?: string;
  currentScreenshot?: string;
  onLoadEntryToTerminal?: (entry: JournalEntry) => void;
}

export const TradingJournal: React.FC<TradingJournalProps> = ({
  isOpen,
  onClose,
  currentAnalysis,
  currentPair = 'EUR/USD',
  currentTimeframe = '15m',
  currentScreenshot,
  onLoadEntryToTerminal,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedPairFilter, setSelectedPairFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD or empty
  const [outcomeFilter, setOutcomeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // New Save Modal State
  const [isSavingCurrent, setIsSavingCurrent] = useState<boolean>(false);
  const [newEntryNotes, setNewEntryNotes] = useState<string>('');
  const [newEntryTitle, setNewEntryTitle] = useState<string>('');
  const [newEntryOutcome, setNewEntryOutcome] = useState<TradeOutcome>('PENDING');

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceDraftTranscript, setVoiceDraftTranscript] = useState<string>('');
  const [audioPlayState, setAudioPlayState] = useState<{ [id: string]: boolean }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Load entries on mount or open
  useEffect(() => {
    if (isOpen) {
      refreshEntries();
    }
  }, [isOpen]);

  const refreshEntries = () => {
    const data = getJournalEntries();
    setEntries(data);
    if (data.length > 0 && !selectedEntry) {
      setSelectedEntry(data[0]);
    }
  };

  // Extract unique pairs for the filter dropdown
  const uniquePairs = Array.from(new Set(entries.map((e) => e.pair))).filter(Boolean);

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    // 1. Pair filter
    if (selectedPairFilter !== 'ALL' && entry.pair !== selectedPairFilter) {
      return false;
    }

    // 2. Date filter
    if (dateFilter && entry.date !== dateFilter) {
      return false;
    }

    // 3. Outcome filter
    if (outcomeFilter !== 'ALL' && entry.outcome !== outcomeFilter) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = entry.title?.toLowerCase().includes(q);
      const matchPair = entry.pair?.toLowerCase().includes(q);
      const matchNotes = entry.userNotes?.toLowerCase().includes(q);
      const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
      const matchMarket = entry.analysis?.marketState?.toLowerCase().includes(q);
      if (!matchTitle && !matchPair && !matchNotes && !matchTags && !matchMarket) {
        return false;
      }
    }

    return true;
  });

  // Performance stats calculation
  const totalTrades = entries.length;
  const closedTrades = entries.filter((e) => e.outcome === 'WIN' || e.outcome === 'LOSS');
  const winTrades = entries.filter((e) => e.outcome === 'WIN').length;
  const winRate = closedTrades.length > 0 ? Math.round((winTrades / closedTrades.length) * 100) : 0;

  // Handle Quick Save of currently active analysis
  const handleSaveActiveAnalysis = () => {
    if (!currentAnalysis) return;

    const today = new Date().toISOString().split('T')[0];
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
      date: today,
      pair: currentPair,
      timeframe: currentTimeframe,
      title: newEntryTitle.trim() || `${currentPair} - ${currentAnalysis.marketState || 'Análisis Institucional'}`,
      analysis: currentAnalysis,
      userNotes: newEntryNotes.trim(),
      voiceNotes: voiceDraftTranscript.trim()
        ? [
            {
              id: `vn-${Date.now()}`,
              createdAt: new Date().toISOString(),
              transcript: voiceDraftTranscript.trim(),
              durationSeconds: recordingSeconds || 10,
            },
          ]
        : [],
      outcome: newEntryOutcome,
      screenshotThumbnail: currentScreenshot,
      tags: currentAnalysis.identifiedConcepts.slice(0, 4),
    };

    saveJournalEntry(newEntry);
    refreshEntries();
    setSelectedEntry(newEntry);
    setIsSavingCurrent(false);
    setNewEntryNotes('');
    setNewEntryTitle('');
    setVoiceDraftTranscript('');
    setRecordingSeconds(0);
  };

  // Start voice recording for journal note
  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setIsRecordingVoice(true);
    setRecordingSeconds(0);
    setVoiceDraftTranscript('');

    recordIntervalRef.current = setInterval(() => {
      setRecordingSeconds((sec) => sec + 1);
    }, 1000);

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';

        recognition.onresult = (event: any) => {
          let str = '';
          for (let i = 0; i < event.results.length; i++) {
            str += event.results[i][0].transcript + ' ';
          }
          setVoiceDraftTranscript(str);
        };

        recognition.onerror = () => {
          stopVoiceRecording();
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition failed:', err);
      }
    }
  };

  const stopVoiceRecording = () => {
    setIsRecordingVoice(false);
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Play voice note / spoken text
  const playVoiceNote = (noteId: string, textToSpeak?: string, audioBase64?: string) => {
    if (audioPlayState[noteId]) {
      // Pause
      window.speechSynthesis?.cancel();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setAudioPlayState((prev) => ({ ...prev, [noteId]: false }));
      return;
    }

    // Stop other playbacks
    window.speechSynthesis?.cancel();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    setAudioPlayState({ [noteId]: true });

    if (audioBase64) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(`data:audio/wav;base64,${audioBase64}`);
      } else {
        audioPlayerRef.current.src = `data:audio/wav;base64,${audioBase64}`;
      }
      audioPlayerRef.current.onended = () => {
        setAudioPlayState((prev) => ({ ...prev, [noteId]: false }));
      };
      audioPlayerRef.current.play().catch(() => {
        fallbackSpeak(noteId, textToSpeak);
      });
    } else if (textToSpeak && 'speechSynthesis' in window) {
      fallbackSpeak(noteId, textToSpeak);
    } else {
      setAudioPlayState((prev) => ({ ...prev, [noteId]: false }));
    }
  };

  const fallbackSpeak = (noteId: string, text?: string) => {
    if (!text || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onend = () => {
      setAudioPlayState((prev) => ({ ...prev, [noteId]: false }));
    };
    utterance.onerror = () => {
      setAudioPlayState((prev) => ({ ...prev, [noteId]: false }));
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Confirmas que deseas eliminar este registro del Diario?')) {
      deleteJournalEntry(id);
      refreshEntries();
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    }
  };

  const handleOutcomeChange = (id: string, newOutcome: TradeOutcome) => {
    updateJournalEntryOutcome(id, newOutcome);
    refreshEntries();
    if (selectedEntry?.id === id) {
      setSelectedEntry({ ...selectedEntry, outcome: newOutcome });
    }
  };

  // Export journal as JSON backup
  const exportJournalData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Diario_Trading_SMC_ICT_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b0f19] border border-slate-700/80 rounded-2xl w-full max-w-[1550px] h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-800 bg-[#0d1220]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-mono tracking-tight">
                  DIARIO DE OPERATIVA INSTITUCIONAL (TRADING JOURNAL)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Almacenamiento Local (LocalStorage)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Registro riguroso de operaciones, notas de voz, capturas de pantalla y ratios R:R según metodología ICT/SMC.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {currentAnalysis && (
              <button
                onClick={() => setIsSavingCurrent(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Análisis Actual</span>
              </button>
            )}

            <button
              onClick={exportJournalData}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-mono transition"
              title="Exportar copia de seguridad en JSON"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats & Quick Metrics Bar */}
        <div className="bg-[#080b12] border-b border-slate-800 px-4 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Total Operaciones:</span>
            <span className="text-white font-bold text-sm">{totalTrades}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Win Rate:</span>
            <span className={`font-bold text-sm ${winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {winRate}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Ganadas / Cerradas:</span>
            <span className="text-emerald-400 font-bold">{winTrades}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">{closedTrades.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500">Pares Registrados:</span>
            <span className="text-blue-400 font-bold">{uniquePairs.length}</span>
          </div>
        </div>

        {/* Filters Toolbar: Currency Pair, Date, Outcome, Search */}
        <div className="bg-[#0e1322] border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Currency Pair */}
            <div className="flex items-center space-x-1.5 bg-[#080b12] border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <label className="text-[10px] text-slate-400 font-mono">Par:</label>
              <select
                value={selectedPairFilter}
                onChange={(e) => setSelectedPairFilter(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los Pares ({entries.length})</option>
                {uniquePairs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Date */}
            <div className="flex items-center space-x-1.5 bg-[#080b12] border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <label className="text-[10px] text-slate-400 font-mono">Fecha:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                  title="Limpiar fecha"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter by Outcome */}
            <div className="flex items-center space-x-1.5 bg-[#080b12] border border-slate-700/80 rounded-lg px-2.5 py-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <label className="text-[10px] text-slate-400 font-mono">Estado:</label>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="bg-transparent text-xs text-white font-mono focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="WIN">✓ Ganadas (WIN)</option>
                <option value="LOSS">✗ Pérdidas (LOSS)</option>
                <option value="BREAKEVEN">Breakeven</option>
                <option value="PENDING">En Curso / Planificadas</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por setup, nota, FVG..."
              className="w-full bg-[#080b12] border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Main Content Area: Master-Detail Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Entries List Column */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-800 bg-[#090d16] flex flex-col overflow-y-auto">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>{filteredEntries.length} entradas encontradas</span>
              {(selectedPairFilter !== 'ALL' || dateFilter || outcomeFilter !== 'ALL' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedPairFilter('ALL');
                    setDateFilter('');
                    setOutcomeFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-[11px]"
                >
                  Restablecer filtros
                </button>
              )}
            </div>

            {filteredEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs">No hay operaciones que coincidan con los filtros.</p>
                <button
                  onClick={() => {
                    setSelectedPairFilter('ALL');
                    setDateFilter('');
                    setOutcomeFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono"
                >
                  Ver todas
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredEntries.map((entry) => {
                  const isSelected = selectedEntry?.id === entry.id;
                  const isBullish = entry.analysis.bias === 'BULLISH';
                  const isBearish = entry.analysis.bias === 'BEARISH';

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`p-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/15 border-l-4 border-l-blue-500 shadow-inner'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{entry.pair}</span>
                          <span className="text-[10px] text-slate-400">({entry.timeframe})</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              isBullish
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : isBearish
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {entry.analysis.bias}
                          </span>
                        </div>

                        {/* Outcome Badge */}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                            entry.outcome === 'WIN'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : entry.outcome === 'LOSS'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : entry.outcome === 'BREAKEVEN'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {entry.outcome}
                        </span>
                      </div>

                      <h4 className="text-xs font-medium text-slate-200 line-clamp-1 mb-1">
                        {entry.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{entry.date}</span>
                        </span>

                        <div className="flex items-center space-x-2">
                          {entry.voiceNotes && entry.voiceNotes.length > 0 && (
                            <span className="flex items-center space-x-0.5 text-blue-400" title="Contiene notas de voz">
                              <Volume2 className="w-3 h-3" />
                              <span className="text-[10px]">{entry.voiceNotes.length}</span>
                            </span>
                          )}
                          <span className="text-emerald-400 font-semibold">
                            R:R {entry.analysis.executionPlan.riskRewardRatio}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entry Details Column */}
          <div className="flex-1 bg-[#0b0f19] p-4 sm:p-6 overflow-y-auto space-y-5">
            {selectedEntry ? (
              <>
                {/* Detail Header & Action Buttons */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-lg font-bold font-mono text-white">
                        {selectedEntry.pair}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {selectedEntry.timeframe}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        • Fecha: {selectedEntry.date}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-mono font-bold ${
                          selectedEntry.analysis.bias === 'BULLISH'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        BIAS: {selectedEntry.analysis.bias}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-100">
                      {selectedEntry.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedEntry.analysis.marketState}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Outcome Selector */}
                    <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
                      <span className="text-[10px] text-slate-500 px-1">Resultado:</span>
                      {(['PENDING', 'WIN', 'LOSS', 'BREAKEVEN'] as TradeOutcome[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleOutcomeChange(selectedEntry.id, st)}
                          className={`px-2 py-0.5 rounded transition ${
                            selectedEntry.outcome === st
                              ? st === 'WIN'
                                ? 'bg-emerald-600 text-white font-bold'
                                : st === 'LOSS'
                                ? 'bg-rose-600 text-white font-bold'
                                : 'bg-blue-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    {onLoadEntryToTerminal && (
                      <button
                        onClick={() => {
                          onLoadEntryToTerminal(selectedEntry);
                          onClose();
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition shadow-md shadow-blue-600/20"
                        title="Cargar esta configuración en el visor de gráficos y esquemas"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver en Terminal</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition"
                      title="Eliminar este trade del diario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Execution Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#080b12] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Zona de Entrada
                    </span>
                    <span className="text-sm font-bold font-mono text-white">
                      {selectedEntry.analysis.executionPlan.entryZone}
                    </span>
                    <span className="text-[10px] text-blue-400 block font-mono">
                      {selectedEntry.analysis.executionPlan.action}
                    </span>
                  </div>

                  <div className="bg-[#080b12] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-rose-400 block uppercase">
                      Stop Loss
                    </span>
                    <span className="text-sm font-bold font-mono text-rose-300">
                      {selectedEntry.analysis.executionPlan.stopLoss}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Invalidación Estructural
                    </span>
                  </div>

                  <div className="bg-[#080b12] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                      Take Profit
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-300">
                      {selectedEntry.analysis.executionPlan.takeProfit1}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      TP2: {selectedEntry.analysis.executionPlan.takeProfit2}
                    </span>
                  </div>

                  <div className="bg-[#080b12] border border-slate-800 p-3 rounded-xl">
                    <span className="text-[10px] font-mono text-amber-400 block uppercase">
                      Ratio Riesgo/Beneficio
                    </span>
                    <span className="text-sm font-bold font-mono text-amber-300">
                      {selectedEntry.analysis.executionPlan.riskRewardRatio}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {selectedEntry.analysis.executionPlan.killzoneTimeframe}
                    </span>
                  </div>
                </div>

                {/* Voice Notes & Spoken Explanation Section */}
                <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>NOTAS DE VOZ & EXPLICACIÓN HABLADA INSTITUCIONAL</span>
                    </div>

                    {/* Mentor Spoken Audio Playback button */}
                    <button
                      onClick={() =>
                        playVoiceNote(
                          `mentor-${selectedEntry.id}`,
                          selectedEntry.analysis.spokenExplanation
                        )
                      }
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30 text-xs font-mono transition"
                    >
                      {audioPlayState[`mentor-${selectedEntry.id}`] ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pausar Mentor</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Escuchar Mentoría</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mentor explanation text transcript */}
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs leading-relaxed text-slate-300 font-sans">
                    <span className="text-emerald-400 font-mono font-bold block mb-1">
                      Transcripción del Mentor:
                    </span>
                    <p className="whitespace-pre-wrap">
                      {selectedEntry.analysis.spokenExplanation}
                    </p>
                  </div>

                  {/* Attached User Voice Notes */}
                  {selectedEntry.voiceNotes && selectedEntry.voiceNotes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">
                        Notas de voz grabadas por el trader:
                      </span>
                      {selectedEntry.voiceNotes.map((vn, idx) => (
                        <div
                          key={vn.id || idx}
                          className="bg-[#080b12] border border-slate-800 p-2.5 rounded-lg flex items-center justify-between space-x-3 text-xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            <button
                              onClick={() => playVoiceNote(vn.id, vn.transcript, vn.audioBase64)}
                              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition shrink-0"
                            >
                              {audioPlayState[vn.id] ? (
                                <Pause className="w-3 h-3 fill-current" />
                              ) : (
                                <Play className="w-3 h-3 fill-current ml-0.5" />
                              )}
                            </button>
                            <div>
                              <p className="text-slate-200 text-xs italic">
                                "{vn.transcript || 'Nota de voz guardada'}"
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {vn.durationSeconds ? `${vn.durationSeconds}s` : 'Audio'} • Grabada:{' '}
                                {new Date(vn.createdAt).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Trading Notes (Editable) */}
                <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bitácora & Observaciones Personales</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#080b12] p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                    {selectedEntry.userNotes || 'Sin notas personalizadas registradas.'}
                  </p>
                </div>

                {/* Concept Tags & Psychology Rule */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#080b12] border border-slate-800 p-3 rounded-xl space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 block uppercase">
                      Conceptos Institucionales Detectados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.analysis.identifiedConcepts.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl space-y-1">
                    <span className="text-[11px] font-mono text-amber-300 block font-bold uppercase">
                      Regla de Psicotrading del Trade
                    </span>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {selectedEntry.analysis.psychologyRule}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-3">
                <BookOpen className="w-12 h-12 opacity-30 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-300">Selecciona una Operación</h3>
                <p className="text-xs max-w-sm">
                  Elige un registro del panel izquierdo o filtra por fecha y par de divisas para inspeccionar el análisis, las notas de voz y las métricas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Guardar Análisis Actual */}
        {isSavingCurrent && currentAnalysis && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#0f1422] border border-slate-700 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    GUARDAR EN DIARIO DE OPERATIVA
                  </h4>
                </div>
                <button
                  onClick={() => setIsSavingCurrent(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Título de la Operación:</label>
                  <input
                    type="text"
                    value={newEntryTitle}
                    onChange={(e) => setNewEntryTitle(e.target.value)}
                    placeholder={`${currentPair} - ${currentAnalysis.marketState}`}
                    className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Par de Divisas / Activo:</label>
                    <input
                      type="text"
                      disabled
                      value={currentPair}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Estado Inicial:</label>
                    <select
                      value={newEntryOutcome}
                      onChange={(e) => setNewEntryOutcome(e.target.value as TradeOutcome)}
                      className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="PENDING">En Curso / Planificada</option>
                      <option value="WIN">Ganada (WIN)</option>
                      <option value="LOSS">Pérdida (LOSS)</option>
                      <option value="BREAKEVEN">Breakeven</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Observaciones / Notas Personales:</label>
                  <textarea
                    rows={3}
                    value={newEntryNotes}
                    onChange={(e) => setNewEntryNotes(e.target.value)}
                    placeholder="Escribe tus sensaciones, confluencias clave, confirmación de Killzone..."
                    className="w-full bg-[#080b12] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-sans focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Voice Note Recorder inside save modal */}
                <div className="bg-[#080b12] border border-slate-800 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-300 font-bold flex items-center space-x-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-400" />
                      <span>Grabar Nota de Voz para el Diario</span>
                    </span>
                    {isRecordingVoice && (
                      <span className="text-[10px] text-rose-400 animate-pulse font-mono">
                        GRABANDO ({recordingSeconds}s)...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition ${
                        isRecordingVoice
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isRecordingVoice ? (
                        <>
                          <MicOff className="w-3.5 h-3.5" />
                          <span>Finalizar Grabación</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-rose-400" />
                          <span>Grabar por Micrófono</span>
                        </>
                      )}
                    </button>

                    {voiceDraftTranscript && (
                      <span className="text-[10px] text-emerald-400">✓ Nota capturada</span>
                    )}
                  </div>

                  {voiceDraftTranscript && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 italic">
                      "{voiceDraftTranscript}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsSavingCurrent(false)}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveActiveAnalysis}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition shadow-lg shadow-emerald-600/25"
                >
                  Guardar en LocalStorage
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

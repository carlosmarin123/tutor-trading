import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, Sparkles, Radio } from 'lucide-react';

interface VoiceMentorPanelProps {
  spokenText: string;
  isAnalyzing: boolean;
  onSendVoicePrompt: (transcript: string) => void;
  voiceAudioBase64?: string | null;
}

export const VoiceMentorPanel: React.FC<VoiceMentorPanelProps> = ({
  spokenText,
  isAnalyzing,
  onSendVoicePrompt,
  voiceAudioBase64,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<'Fenrir' | 'Zephyr' | 'Kore'>('Fenrir');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'es-ES';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscriptDraft(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcriptDraft.trim()) {
          onSendVoicePrompt(transcriptDraft.trim());
          setTranscriptDraft('');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [transcriptDraft, onSendVoicePrompt]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcriptDraft.trim()) {
        onSendVoicePrompt(transcriptDraft.trim());
        setTranscriptDraft('');
      }
    } else {
      setTranscriptDraft('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  };

  // Play audio using either returned base64 WAV or native SpeechSynthesis fallback
  const playSpeech = () => {
    if (!spokenText) return;

    if (voiceAudioBase64) {
      // Use the high fidelity Gemini TTS audio
      if (!audioRef.current) {
        audioRef.current = new Audio(`data:audio/wav;base64,${voiceAudioBase64}`);
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.volume = isMuted ? 0 : speechVolume;
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = `data:audio/wav;base64,${voiceAudioBase64}`;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.volume = isMuted ? 0 : speechVolume;
      }

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Gemini audio playback error, falling back to browser speech:', err);
          fallbackBrowserSpeech();
        });
    } else {
      fallbackBrowserSpeech();
    }
  };

  const fallbackBrowserSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'es-ES';
      utterance.rate = playbackSpeed;
      utterance.volume = isMuted ? 0 : speechVolume;

      // Find Spanish voice if possible
      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find((v) => v.lang.startsWith('es'));
      if (esVoice) utterance.voice = esVoice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const pauseSpeech = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    }
  };

  const stopAndReplay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setTimeout(() => {
      playSpeech();
    }, 150);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : speechVolume;
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-400" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            MENTORÍA POR VOZ INSTITUCIONAL
          </h4>
        </div>

        {/* Speed & Mute toggles */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[1.0, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] transition ${
                  playbackSpeed === s ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Main Playback Bar with Visualizer */}
      <div className="bg-[#070a11] border border-slate-800/80 rounded-xl p-3 flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={isPlaying ? pauseSpeech : playSpeech}
              disabled={!spokenText || isAnalyzing}
              className={`p-3 rounded-full flex items-center justify-center transition shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
              title={isPlaying ? 'Pausar explicación' : 'Escuchar mentoría'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={stopAndReplay}
              disabled={!spokenText || isAnalyzing}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition disabled:opacity-40"
              title="Reiniciar audio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Audio Wave Visualizer */}
            <div className="flex items-center space-x-1 h-8 px-2">
              {isPlaying ? (
                <>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-1"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-2"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-3"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-4"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-5"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-2"></div>
                  <div className="w-1 bg-emerald-400 rounded-full animate-wave-3"></div>
                </>
              ) : (
                <div className="flex items-center space-x-1">
                  {[...Array(7)].map((_, idx) => (
                    <div key={idx} className="w-1 h-1.5 bg-slate-700 rounded-full"></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Microphone Input Button */}
          <button
            onClick={toggleListening}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-mono font-bold transition shadow-lg ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                : 'bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>ESCUCHANDO...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>PREGUNTAR POR VOZ</span>
              </>
            )}
          </button>
        </div>

        {/* Listening transcription draft banner */}
        {isListening && transcriptDraft && (
          <div className="p-2 rounded bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 font-mono italic">
            "{transcriptDraft}"
          </div>
        )}
      </div>

      {/* Spoken Text Transcript Display */}
      <div className="max-h-36 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60 font-sans">
        {spokenText ? (
          <p className="whitespace-pre-wrap">{spokenText}</p>
        ) : (
          <p className="text-slate-500 italic text-[11px]">
            Sube un gráfico de TradingView o manual PDF y presiona "Analizar" o activa el micrófono para recibir la explicación institucional por voz.
          </p>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';

export const MssFvgSchematic: React.FC = () => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Esquema: MSS + FVG (Market Structure Shift)
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
          Setup Institucional A+
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Pasa el cursor por cada elemento para ver la lógica institucional de entrada y despojo de liquidez.
      </p>

      {/* SVG Canvas */}
      <div className="relative bg-[#070a10] border border-slate-800/80 rounded-lg p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 700 360" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="fvgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="bearishDisplacement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="bullishDisplacement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="60" x2="680" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="120" x2="680" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="180" x2="680" y2="180" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="240" x2="680" y2="240" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1="300" x2="680" y2="300" stroke="#1e293b" strokeDasharray="3 3" />

          {/* 1. Previo Uptrend / Retail Trendline */}
          <path
            d="M 40 260 L 90 200 L 120 220 L 170 140 L 200 170 L 260 80"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* BSL Pool at Swing High */}
          <rect x="230" y="45" width="130" height="24" rx="4" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
          <text x="295" y="61" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            $$$ BSL (Buy-Side Liq)
          </text>

          {/* Sweep Wick (Vela de barrido) */}
          {/* Wick */}
          <line x1="270" y1="40" x2="270" y2="140" stroke="#f59e0b" strokeWidth="2" />
          {/* Candle Body */}
          <rect x="260" y="70" width="20" height="40" rx="1" fill="#ef4444" stroke="#dc2626" />
          <text x="270" y="32" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
            Sweep / Judas
          </text>

          {/* Higher Low to be broken (MSS Key Level) */}
          <circle cx="200" cy="170" r="5" fill="#3b82f6" />
          <text x="175" y="195" fill="#93c5fd" fontSize="10" fontFamily="monospace">
            HL (Swing Protector)
          </text>

          {/* MSS Horizontal Broken Level */}
          <line x1="200" y1="170" x2="480" y2="170" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" />
          <rect x="330" y="158" width="80" height="20" rx="3" fill="#1e3a8a" fillOpacity="0.8" stroke="#3b82f6" />
          <text x="370" y="172" fill="#bfdbfe" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            MSS / CHoCH
          </text>

          {/* Displaced Leg (3 candles creating Bearish FVG) */}
          {/* Candle 1 (pre-FVG) */}
          <line x1="310" y1="80" x2="310" y2="160" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="302" y="95" width="16" height="45" fill="url(#bearishDisplacement)" rx="1" />

          {/* Candle 2 (Giant displacement candle) */}
          <line x1="340" y1="130" x2="340" y2="250" stroke="#ef4444" strokeWidth="2" />
          <rect x="330" y="145" width="20" height="85" fill="url(#bearishDisplacement)" rx="1" />

          {/* Candle 3 */}
          <line x1="370" y1="210" x2="370" y2="270" stroke="#ef4444" strokeWidth="1.5" />
          <rect x="362" y="225" width="16" height="35" fill="url(#bearishDisplacement)" rx="1" />

          {/* FVG Box between Candle 1 low and Candle 3 high */}
          {/* Candle 1 low is at y=140, Candle 3 high is at y=210 */}
          <rect
            x="320"
            y="140"
            width="170"
            height="70"
            fill="url(#fvgGradient)"
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            rx="4"
            className="cursor-pointer transition-all hover:fill-purple-600/40"
            onMouseEnter={() => setActiveTooltip('fvg')}
            onMouseLeave={() => setActiveTooltip(null)}
          />

          {/* CE (Consequent Encroachment 50% line) */}
          <line x1="320" y1="175" x2="490" y2="175" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="495" y="178" fill="#c084fc" fontSize="10" fontFamily="monospace">
            CE 50%
          </text>

          <text x="405" y="160" fill="#e9d5ff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            BEARISH FVG
          </text>

          {/* Retracement leg back into FVG (Entry zone) */}
          <path
            d="M 370 240 L 410 260 L 440 165"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="3 3"
          />

          {/* Entry Trigger Point */}
          <circle
            cx="440"
            cy="165"
            r="7"
            fill="#ef4444"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <circle cx="440" cy="165" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="420" y="125" width="85" height="24" rx="4" fill="#ef4444" />
          <text x="462" y="141" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            SHORT ENTRY
          </text>

          {/* Stop Loss (Invalidation) */}
          <line x1="420" y1="65" x2="490" y2="65" stroke="#f87171" strokeWidth="2" />
          <rect x="495" y="55" width="85" height="20" rx="3" fill="#7f1d1d" stroke="#f87171" />
          <text x="537" y="69" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            SL: Por encima OB
          </text>

          {/* Expansion Downward to SSL Target */}
          <path
            d="M 440 165 L 480 230 L 520 215 L 590 310"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
          />

          {/* Target SSL Pool */}
          <rect x="520" y="300" width="160" height="28" rx="4" fill="#f59e0b" fillOpacity="0.2" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="600" y="318" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            TP / DRAW ON LIQUIDITY (SSL)
          </text>

          {/* R:R Bracket */}
          <line x1="620" y1="65" x2="620" y2="300" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 2" />
          <rect x="630" y="170" width="60" height="22" rx="3" fill="#1e293b" stroke="#475569" />
          <text x="660" y="185" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            1 : 3.8 R:R
          </text>
        </svg>

        {activeTooltip === 'fvg' && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900/95 border border-purple-500/40 p-3 rounded-lg text-xs text-purple-200 shadow-xl backdrop-blur-sm">
            <span className="font-bold text-purple-300">Fair Value Gap (FVG):</span> Ineficiencia de precio
            donde las órdenes de venta desplazaron agresivamente sin contraparte compradora. La entrada óptima se da
            en la mitigación del Consequent Encroachment (50% del rango del FVG).
          </div>
        )}
      </div>

      {/* Anatomy legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
          <span className="text-amber-400 block font-bold">1. Sweep de BSL</span>
          <span className="text-slate-400 text-[10px]">Toma liquidez de compradores retail.</span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
          <span className="text-blue-400 block font-bold">2. MSS / CHoCH</span>
          <span className="text-slate-400 text-[10px]">Quiebre con cuerpo del último HL.</span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
          <span className="text-purple-400 block font-bold">3. FVG Imbalance</span>
          <span className="text-slate-400 text-[10px]">Ineficiencia institucional para entrada.</span>
        </div>
        <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
          <span className="text-emerald-400 block font-bold">4. Take Profit SSL</span>
          <span className="text-slate-400 text-[10px]">Objetivo en mínimos no mitigados.</span>
        </div>
      </div>
    </div>
  );
};

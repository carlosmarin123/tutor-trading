import React, { useState } from 'react';

export const OrderBlockBreakerSchematic: React.FC = () => {
  const [mode, setMode] = useState<'OB' | 'BREAKER'>('OB');

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Anatomía: Order Block vs. Breaker Block
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[11px] font-mono">
          <button
            onClick={() => setMode('OB')}
            className={`px-2 py-0.5 rounded transition ${
              mode === 'OB' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Order Block (OB)
          </button>
          <button
            onClick={() => setMode('BREAKER')}
            className={`px-2 py-0.5 rounded transition ${
              mode === 'BREAKER' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Breaker Block (BB)
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        {mode === 'OB'
          ? 'Un Order Block válido es la última vela opuesta antes de una ruptura con desplazamiento y FVG. La línea clave es el Mean Threshold (50%).'
          : 'Un Breaker Block es un Order Block que fue invalidado tras realizar un sweep del último swing. Al ser atravesado con fuerza, se invierte en resistencia/soporte.'}
      </p>

      {/* SVG Canvas */}
      <div className="relative bg-[#070a10] border border-slate-800/80 rounded-lg p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 700 340" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="obFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e40af" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="breakerFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {mode === 'OB' ? (
            /* ORDER BLOCK SCENE */
            <g>
              {/* Order Block Candidate (Last down candle) */}
              {/* Wick */}
              <line x1="160" y1="180" x2="160" y2="280" stroke="#ef4444" strokeWidth="2" />
              {/* Body */}
              <rect x="145" y="195" width="30" height="70" rx="2" fill="#ef4444" stroke="#dc2626" strokeWidth="1.5" />
              <text x="160" y="240" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                OB
              </text>

              {/* OB Extension Zone to the right */}
              <rect x="175" y="195" width="320" height="70" fill="url(#obFill)" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 3" rx="3" />
              <text x="260" y="215" fill="#bfdbfe" fontSize="11" fontWeight="bold" fontFamily="monospace">
                BULLISH ORDER BLOCK (+OB)
              </text>

              {/* Mean Threshold 50% */}
              <line x1="145" y1="230" x2="500" y2="230" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="505" y="234" fill="#93c5fd" fontSize="10" fontFamily="monospace">
                Mean Threshold (50%)
              </text>

              {/* Violent Displacement Upward (BOS) */}
              <line x1="220" y1="160" x2="220" y2="80" stroke="#10b981" strokeWidth="2" />
              <rect x="210" y="90" width="20" height="90" fill="#10b981" rx="1" />

              <line x1="250" y1="110" x2="250" y2="50" stroke="#10b981" strokeWidth="2" />
              <rect x="240" y="60" width="20" height="80" fill="#10b981" rx="1" />

              <line x1="280" y1="90" x2="280" y2="30" stroke="#10b981" strokeWidth="2" />
              <rect x="270" y="40" width="20" height="60" fill="#10b981" rx="1" />

              {/* BOS annotation */}
              <line x1="120" y1="80" x2="310" y2="80" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
              <rect x="280" y="70" width="55" height="18" rx="2" fill="#581c87" />
              <text x="307" y="83" fill="#e9d5ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                BOS
              </text>

              {/* Retracement leg touching the Mean Threshold */}
              <path
                d="M 280 40 L 330 110 L 370 80 L 410 225"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Clean Touch & Entry point */}
              <circle cx="410" cy="225" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <rect x="360" y="240" width="105" height="22" rx="3" fill="#065f46" stroke="#10b981" />
              <text x="412" y="255" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                LONG ENTRADA
              </text>

              {/* Explosion upward */}
              <path
                d="M 410 225 L 470 120 L 510 140 L 590 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
              />
              <circle cx="590" cy="30" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <text x="600" y="34" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                TP TARGET
              </text>
            </g>
          ) : (
            /* BREAKER BLOCK SCENE */
            <g>
              {/* Swing High -> Lower Low -> Higher High sweep -> Violates Old Low */}
              <path
                d="M 60 210 L 120 120 L 180 180 L 260 60 L 340 270"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />

              {/* The failed bullish Order Block at the valley (180, 180) */}
              <rect x="155" y="165" width="50" height="30" fill="#3b82f6" fillOpacity="0.3" stroke="#3b82f6" rx="2" />
              <text x="180" y="184" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                Old OB
              </text>

              {/* BSL Sweep at the Higher High (260, 60) */}
              <circle cx="260" cy="60" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              <rect x="220" y="30" width="110" height="20" rx="3" fill="#78350f" stroke="#f59e0b" />
              <text x="275" y="44" fill="#fef08a" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SWEEP BSL (Trap)
              </text>

              {/* Extension of the Broken OB into a BEARISH BREAKER BLOCK */}
              <rect x="180" y="165" width="370" height="30" fill="url(#breakerFill)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" rx="3" />
              <text x="320" y="184" fill="#fef08a" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                BEARISH BREAKER BLOCK (BB)
              </text>

              {/* Retest of the Breaker Block */}
              <path
                d="M 340 270 L 400 240 L 450 175"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Short Entry at Breaker */}
              <circle cx="450" cy="175" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <rect x="410" y="135" width="115" height="22" rx="3" fill="#7f1d1d" stroke="#ef4444" />
              <text x="467" y="150" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SHORT ENTRY (BB)
              </text>

              {/* Expansion Downward */}
              <path
                d="M 450 175 L 500 240 L 530 220 L 610 310"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
              />
              <circle cx="610" cy="310" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <text x="560" y="328" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
                TP: SSL SWEEP
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed">
        {mode === 'OB' ? (
          <p className="text-slate-300">
            <strong className="text-blue-400">Regla del 50% Mean Threshold:</strong> Si el cuerpo de una vela de cierre de 15m penetra más del 50% del cuerpo del Order Block, la probabilidad institucional disminuye drásticamente y el bloque se considera mitigado o fallido.
          </p>
        ) : (
          <p className="text-slate-300">
            <strong className="text-amber-400">Poder del Breaker Block:</strong> A diferencia de un Order Block regular, el Breaker Block tiene una tasa de acierto superior porque involucra un despojo previo de liquidez (un sweep del máximo anterior) antes de pulverizar el soporte. Es una trampa institucional de dos bandas.
          </p>
        )}
      </div>
    </div>
  );
};

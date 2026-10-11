import React, { useState } from 'react';

export const AmdPowerOfThreeSchematic: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'A' | 'M' | 'D'>('M');

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Modelo AMD: Power of 3 (PO3)
          </h4>
        </div>
        <div className="flex items-center space-x-1 text-[11px] font-mono">
          <button
            onClick={() => setActiveStage('A')}
            className={`px-2 py-0.5 rounded transition ${
              activeStage === 'A' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            A: Acumulación
          </button>
          <button
            onClick={() => setActiveStage('M')}
            className={`px-2 py-0.5 rounded transition ${
              activeStage === 'M' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            M: Manipulación
          </button>
          <button
            onClick={() => setActiveStage('D')}
            className={`px-2 py-0.5 rounded transition ${
              activeStage === 'D' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            D: Distribución
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Ciclo de entrega algorítmica diaria: Sesión Asiática (rango cerrado) → Judas Swing en Londres (falso quiebre) → Expansión en Nueva York hacia el Draw on Liquidity.
      </p>

      {/* SVG Canvas */}
      <div className="relative bg-[#070a10] border border-slate-800/80 rounded-lg p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 700 340" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="asianRangeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="judasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="expansionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Time Vertical Dividers */}
          <line x1="220" y1="20" x2="220" y2="300" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="440" y1="20" x2="440" y2="300" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Session Header Labels */}
          <rect x="25" y="25" width="180" height="24" rx="4" fill="#1e293b" />
          <text x="115" y="41" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            ASIA (20:00 - 00:00 EST)
          </text>

          <rect x="235" y="25" width="190" height="24" rx="4" fill="#1e293b" />
          <text x="330" y="41" fill="#fcd34d" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            LONDRES (02:00 - 05:00 EST)
          </text>

          <rect x="455" y="25" width="220" height="24" rx="4" fill="#1e293b" />
          <text x="565" y="41" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            NUEVA YORK (07:00 - 10:00 EST)
          </text>

          {/* Asian Range Box (Accumulation) */}
          <rect
            x="30"
            y="130"
            width="170"
            height="70"
            fill="url(#asianRangeGrad)"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
          />
          {/* Asian High / Asian Low */}
          <line x1="30" y1="130" x2="260" y2="130" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />
          <text x="75" y="122" fill="#60a5fa" fontSize="10" fontFamily="monospace">
            Asian High (BSL Pool)
          </text>
          <line x1="30" y1="200" x2="260" y2="200" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2 2" />
          <text x="75" y="215" fill="#60a5fa" fontSize="10" fontFamily="monospace">
            Asian Low (SSL Pool)
          </text>

          {/* Asian Range Price Waves */}
          <path
            d="M 40 165 Q 65 140 85 160 T 130 185 T 170 145 T 195 170"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
          />

          {/* Judas Swing (Manipulation) */}
          <rect
            x="230"
            y="190"
            width="190"
            height="90"
            fill="url(#judasGrad)"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            rx="4"
          />
          <path
            d="M 195 170 L 240 185 L 290 270 L 320 230"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
          />
          {/* Judas Low Sweep Marker */}
          <circle cx="290" cy="270" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <rect x="235" y="280" width="120" height="22" rx="3" fill="#7f1d1d" stroke="#f87171" />
          <text x="295" y="295" fill="#fca5a5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            JUDAS SWING (SSL TAKEN)
          </text>

          {/* MSS after Judas Swing */}
          <line x1="260" y1="185" x2="370" y2="185" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="350" y="175" fill="#d8b4fe" fontSize="10" fontFamily="monospace">
            MSS / CHoCH
          </text>

          {/* London High of Day / Transition */}
          <path
            d="M 320 230 L 360 150 L 400 180 L 440 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
          />

          {/* NY AM Distribution / Institutional Expansion */}
          <rect
            x="450"
            y="60"
            width="230"
            height="180"
            fill="url(#expansionGrad)"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            rx="4"
          />

          {/* Retracement into FVG in NY Silver Bullet (08:30 - 10:00 EST) */}
          <rect x="460" y="140" width="60" height="35" rx="3" fill="#8b5cf6" fillOpacity="0.4" stroke="#a855f7" />
          <text x="490" y="162" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            NY FVG
          </text>

          {/* Big Green Institutional Trend Run */}
          <path
            d="M 440 120 L 470 155 L 530 80 L 570 105 L 650 50"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
          />

          {/* Target: Daily High / BSL Objective */}
          <circle cx="650" cy="50" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <rect x="560" y="25" width="125" height="22" rx="3" fill="#065f46" stroke="#34d399" />
          <text x="622" y="40" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            EXPANSIÓN / TP: BSL
          </text>

          {/* Stage highlight indicator bottom */}
          <rect
            x={activeStage === 'A' ? 30 : activeStage === 'M' ? 230 : 450}
            y="312"
            width={activeStage === 'A' ? 170 : activeStage === 'M' ? 190 : 230}
            height="4"
            rx="2"
            fill="#38bdf8"
          />
        </svg>
      </div>

      {/* Explanatory breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs leading-relaxed space-y-1">
        {activeStage === 'A' && (
          <p className="text-blue-300">
            <strong className="text-white">Acumulación (Asia):</strong> La liquidez se acumula por encima del máximo asiático (BSL) y por debajo del mínimo (SSL). El algoritmo interbancario mantiene un rango estrecho creando liquidez retail antes de la apertura de Londres.
          </p>
        )}
        {activeStage === 'M' && (
          <p className="text-amber-300">
            <strong className="text-white">Manipulación / Judas Swing (Londres 02:00-05:00 EST):</strong> Movimiento falso agresivo en dirección opuesta a la verdadera intención del día. Barre los stops en el mínimo asiático, induce ventas minoristas en ruptura y llena las órdenes institucionales de compra.
          </p>
        )}
        {activeStage === 'D' && (
          <p className="text-emerald-300">
            <strong className="text-white">Distribución (Nueva York 07:00-10:00 EST):</strong> El verdadero movimiento direccional (Silver Bullet). El precio expande fuertemente hacia la liquidez contraria (Asian High / Prev Day High), distribuyendo contratos a los compradores tardíos.
          </p>
        )}
      </div>
    </div>
  );
};

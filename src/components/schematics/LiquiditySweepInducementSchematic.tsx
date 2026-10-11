import React from 'react';

export const LiquiditySweepInducementSchematic: React.FC = () => {
  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Liquidez Institucional: Sweeps & Inducement (IDM)
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
          Pools BSL & SSL
        </span>
      </div>

      <p className="text-xs text-slate-400">
        El algoritmo IPDA necesita contrapartida. El Inducement (IDM) crea falsos soportes para inducir a los traders antes de barrer la liquidez y mitigar el Order Block real.
      </p>

      {/* SVG Canvas */}
      <div className="relative bg-[#070a10] border border-slate-800/80 rounded-lg p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 700 340" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="idmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="obGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Equal Highs Line (BSL Pool) */}
          <line x1="80" y1="80" x2="420" y2="80" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="180" y="55" width="170" height="22" rx="3" fill="#78350f" stroke="#f59e0b" />
          <text x="265" y="70" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            $$$ EQH (Equal Highs) / BSL Pool
          </text>

          {/* Double Top retail structure */}
          <path
            d="M 60 220 L 140 85 L 180 145 L 260 85 L 300 160"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Retail Stop Losses Zone */}
          <rect x="130" y="30" width="145" height="18" rx="2" fill="#ef4444" fillOpacity="0.2" stroke="#ef4444" strokeDasharray="2 2" />
          <text x="202" y="43" fill="#fca5a5" fontSize="9" textAnchor="middle" fontFamily="monospace">
            Retail Buy Stops (Stops minoristas)
          </text>

          {/* True Institutional Bullish Order Block below */}
          <rect x="360" y="230" width="130" height="45" rx="3" fill="url(#obGrad)" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="425" y="255" fill="#bfdbfe" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            BULLISH ORDER BLOCK (OB)
          </text>
          <line x1="360" y1="252" x2="490" y2="252" stroke="#93c5fd" strokeWidth="1" strokeDasharray="3 2" />
          <text x="495" y="255" fill="#93c5fd" fontSize="9" fontFamily="monospace">
            MT 50%
          </text>

          {/* Inducement (IDM) setup */}
          <path
            d="M 300 160 L 340 120 L 380 180"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="4 2"
          />
          <circle cx="340" cy="120" r="4" fill="#f59e0b" />
          <rect x="320" y="95" width="80" height="20" rx="3" fill="#78350f" stroke="#f59e0b" />
          <text x="360" y="108" fill="#fde68a" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            IDM (Trampa)
          </text>

          {/* Aggressive sweep of IDM down into the true OB */}
          <path
            d="M 380 180 L 420 245"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
          />

          {/* Sweep Wick piercing OB */}
          <circle cx="420" cy="245" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <rect x="390" y="280" width="120" height="22" rx="3" fill="#065f46" stroke="#10b981" />
          <text x="450" y="295" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            MITIGACIÓN + ENTRADA
          </text>

          {/* Violent displacement upward sweeping the EQH / BSL Pool */}
          <path
            d="M 420 245 L 470 140 L 510 170 L 590 60 L 640 40"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
          />

          {/* Sweep of EQH at top */}
          <circle cx="590" cy="60" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <rect x="535" y="15" width="140" height="22" rx="3" fill="#78350f" stroke="#f59e0b" />
          <text x="605" y="30" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            SWEEP DE BSL COMPLETO
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-amber-400 font-bold block mb-1">Equal Highs (EQH)</span>
          <p className="text-slate-400 text-[11px]">
            Los dobles techos minoristas son magnetos de liquidez. Las instituciones usan estas áreas para salir de posiciones de compra o activar órdenes pendientes.
          </p>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-rose-400 font-bold block mb-1">Inducement (IDM)</span>
          <p className="text-slate-400 text-[11px]">
            Un retroceso menor superficial que seduce a los compradores impacientes, cuyos stop losses alimentarán la caída final hasta el Order Block real.
          </p>
        </div>
        <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
          <span className="text-emerald-400 font-bold block mb-1">Mitigación Limpia</span>
          <p className="text-slate-400 text-[11px]">
            El precio toca el Mean Threshold (50%) del Order Block sin cerrar por debajo, iniciando la verdadera expansión hacia la BSL contraria.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const PremiumDiscountOteSchematic: React.FC = () => {
  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <h4 className="text-sm font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Matriz Institucional: Premium vs. Discount & OTE
          </h4>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
          Regla de Oro ICT
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Regla de oro institucional: <em>Nunca comprar en zona Premium, nunca vender en zona Discount</em>. La Entrada de Alta Probabilidad (OTE) se ubica entre 62% y 79% de retroceso.
      </p>

      {/* SVG Canvas */}
      <div className="relative bg-[#070a10] border border-slate-800/80 rounded-lg p-2 overflow-hidden shadow-inner">
        <svg viewBox="0 0 700 340" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="oteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Premium Area Top */}
          <rect x="50" y="40" width="600" height="110" fill="url(#premGrad)" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" rx="4" />
          <text x="590" y="70" fill="#fca5a5" fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            ZONA PREMIUM (Precios Caros)
          </text>
          <text x="590" y="90" fill="#f87171" fontSize="10" textAnchor="end">
            Solo buscar distribución / ventas institucionales
          </text>

          {/* Equilibrium Line (50%) */}
          <line x1="40" y1="150" x2="660" y2="150" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 3" />
          <rect x="500" y="138" width="150" height="24" rx="4" fill="#0369a1" />
          <text x="575" y="154" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            EQUILIBRIUM (50.0%)
          </text>

          {/* Discount Area Bottom */}
          <rect x="50" y="150" width="600" height="140" fill="url(#discGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" rx="4" />
          <text x="590" y="270" fill="#86efac" fontSize="13" fontWeight="bold" textAnchor="end" fontFamily="monospace">
            ZONA DISCOUNT (Precios Baratos)
          </text>
          <text x="590" y="285" fill="#4ade80" fontSize="10" textAnchor="end">
            Solo buscar compras institucionales con descuento
          </text>

          {/* OTE (Optimal Trade Entry) Zone: between 62% and 79% */}
          {/* In this scale, 0.0% is at y=40 (Swing High), 100% is at y=290 (Swing Low) for a retracement from Low to High */}
          {/* Swing Low at y=290, Swing High at y=40, total height = 250 */}
          {/* 62% retrace = 40 + (250 * 0.618) = 194.5 */}
          {/* 79% retrace = 40 + (250 * 0.79) = 237.5 */}
          <rect x="50" y="195" width="400" height="45" fill="url(#oteGrad)" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
          <text x="60" y="222" fill="#fef08a" fontSize="12" fontWeight="bold" fontFamily="monospace">
            ★ OTE (Optimal Trade Entry): 0.618 - 0.705 - 0.786
          </text>

          {/* Fib level markers on left */}
          <line x1="40" y1="40" x2="50" y2="40" stroke="#94a3b8" strokeWidth="2" />
          <text x="35" y="44" fill="#cbd5e1" fontSize="10" textAnchor="end" fontFamily="monospace">1.00 (High)</text>

          <line x1="40" y1="195" x2="50" y2="195" stroke="#f59e0b" strokeWidth="2" />
          <text x="35" y="199" fill="#fcd34d" fontSize="10" textAnchor="end" fontFamily="monospace">0.618 Fib</text>

          <line x1="40" y1="217" x2="50" y2="217" stroke="#f59e0b" strokeWidth="2" />
          <text x="35" y="221" fill="#fbbf24" fontSize="10" textAnchor="end" fontFamily="monospace">0.705 OTE</text>

          <line x1="40" y1="240" x2="50" y2="240" stroke="#f59e0b" strokeWidth="2" />
          <text x="35" y="244" fill="#f59e0b" fontSize="10" textAnchor="end" fontFamily="monospace">0.786 Fib</text>

          <line x1="40" y1="290" x2="50" y2="290" stroke="#94a3b8" strokeWidth="2" />
          <text x="35" y="294" fill="#cbd5e1" fontSize="10" textAnchor="end" fontFamily="monospace">0.00 (Low)</text>

          {/* Impulsive Bullish Leg (Dealing Range) */}
          <path
            d="M 80 290 L 130 190 L 170 210 L 250 40"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
          />
          <circle cx="80" cy="290" r="5" fill="#10b981" />
          <circle cx="250" cy="40" r="5" fill="#38bdf8" />

          {/* Retracement leg entering OTE & Discount */}
          <path
            d="M 250 40 L 290 120 L 320 90 L 370 220"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="4 2"
          />

          {/* Entry Trigger in OTE */}
          <circle cx="370" cy="220" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <rect x="330" y="235" width="115" height="22" rx="3" fill="#065f46" stroke="#10b981" />
          <text x="387" y="250" fill="#a7f3d0" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            LONG ENTRY (OTE)
          </text>

          {/* Expansion Out of Discount toward BSL in Premium */}
          <path
            d="M 370 220 L 420 130 L 450 160 L 530 25"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.5"
          />
          <circle cx="530" cy="25" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <rect x="470" y="10" width="130" height="22" rx="3" fill="#065f46" stroke="#34d399" />
          <text x="535" y="25" fill="#d1fae5" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            TP EN BSL PREMIUM
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-rose-950/20 border border-rose-800/40 p-2.5 rounded text-rose-300">
          <span className="font-bold block text-rose-200">Zona Premium (&gt; 50%)</span>
          Cualquier compra ejecutada aquí es retail chase (perseguir precio). Si buscas compras, aquí solo tomas ganancias parciales.
        </div>
        <div className="bg-emerald-950/20 border border-emerald-800/40 p-2.5 rounded text-emerald-300">
          <span className="font-bold block text-emerald-200">Zona Discount (&lt; 50%) + OTE</span>
          Donde las instituciones acumulan órdenes al por mayor. Entrar en el nivel 0.705 reduce el Stop Loss al mínimo garantizando un R:R superior a 1:3.
        </div>
      </div>
    </div>
  );
};

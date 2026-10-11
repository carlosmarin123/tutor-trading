import React, { useState } from 'react';
import { X, ShieldCheck, Calculator, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface RiskCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEntry?: string;
  defaultSL?: string;
  defaultTP?: string;
}

export const RiskCalculatorModal: React.FC<RiskCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultEntry = '1.08500',
  defaultSL = '1.08350',
  defaultTP = '1.09100',
}) => {
  const [accountBalance, setAccountBalance] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<string>(defaultEntry);
  const [stopLoss, setStopLoss] = useState<string>(defaultSL);
  const [takeProfit, setTakeProfit] = useState<string>(defaultTP);

  // Psychotrading Checklist state
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({
    killzone: true,
    sweep: true,
    fvgDisplacement: false,
    rrValid: true,
    acceptRisk: false,
    maxDailyLoss: false,
  });

  if (!isOpen) return null;

  const entry = parseFloat(entryPrice) || 0;
  const sl = parseFloat(stopLoss) || 0;
  const tp = parseFloat(takeProfit) || 0;

  const riskAmount = (accountBalance * riskPercent) / 100;
  const priceRiskDiff = Math.abs(entry - sl);
  const priceRewardDiff = Math.abs(tp - entry);

  const rrRatio = priceRiskDiff > 0 ? (priceRewardDiff / priceRiskDiff).toFixed(2) : '0';
  const rewardAmount = parseFloat(rrRatio) * riskAmount;

  // Position sizing in standard lots (assuming Forex 100,000 units per lot, 1 pip = 0.0001)
  const pipDistance = priceRiskDiff * 10000;
  const standardLots = pipDistance > 0 ? (riskAmount / (pipDistance * 10)).toFixed(2) : '0';

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecksPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1422] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0a0e1a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">
                GESTIÓN DE RIESGO INSTITUCIONAL & PSICOTRADING
              </h3>
              <p className="text-xs text-slate-400">
                Protocolo matemático estricto según la metodología ICT
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Balance de Cuenta ($)</label>
              <div className="relative">
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <div className="flex space-x-1 mt-1 text-[10px] font-mono">
                  {[10000, 25000, 50000, 100000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAccountBalance(amt)}
                      className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 hover:text-blue-400"
                    >
                      ${amt / 1000}k
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Riesgo por Operación (%)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="3"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
                />
                <div className="flex space-x-1 text-[11px] font-mono shrink-0">
                  {[0.5, 1.0, 2.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setRiskPercent(pct)}
                      className={`px-2 py-1.5 rounded border transition ${
                        riskPercent === pct
                          ? 'bg-blue-600 border-blue-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Precio de Entrada</label>
              <input
                type="text"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#080b12] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-rose-400 flex items-center justify-between">
                <span>Stop Loss (Invalidación)</span>
                <span className="text-[10px] text-slate-500">Detrás del OB</span>
              </label>
              <input
                type="text"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#080b12] border border-rose-900/60 rounded-lg px-3 py-2 text-sm text-rose-200 font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono text-emerald-400 flex items-center justify-between">
                <span>Take Profit (Draw on Liquidity)</span>
                <span className="text-[10px] text-slate-500">BSL / SSL contraria</span>
              </label>
              <input
                type="text"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#080b12] border border-emerald-900/60 rounded-lg px-3 py-2 text-sm text-emerald-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Results Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0a0e1a] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Riesgo Máximo ($)</span>
              <span className="text-lg font-bold font-mono text-rose-400">
                -${riskAmount.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">{riskPercent}% del balance</span>
            </div>

            <div className="bg-[#0a0e1a] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Beneficio Proyectado</span>
              <span className="text-lg font-bold font-mono text-emerald-400">
                +${rewardAmount.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Objetivo TP</span>
            </div>

            <div className="bg-[#0a0e1a] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Ratio Riesgo/Beneficio</span>
              <span className="text-lg font-bold font-mono text-blue-400">
                1 : {rrRatio}
              </span>
              <span className={`text-[10px] block font-mono ${parseFloat(rrRatio) >= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {parseFloat(rrRatio) >= 2 ? 'Aprobado (>= 1:2)' : 'Precaución (< 1:2)'}
              </span>
            </div>

            <div className="bg-[#0a0e1a] border border-slate-800 p-3 rounded-xl">
              <span className="text-[11px] font-mono text-slate-400 block">Lotes Sugeridos</span>
              <span className="text-lg font-bold font-mono text-amber-400">
                {standardLots} Lots
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">Forex Standard</span>
            </div>
          </div>

          {/* Institutional Psicotrading Checklist */}
          <div className="bg-[#080b14] border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Checklist de Ejecución & Psicotrading Institucional
                </h4>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                allChecksPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {allChecksPassed ? 'LISTO PARA EJECUTAR' : 'FALTAN CONFIRMACIONES'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'killzone', label: '1. ¿La operación está ocurriendo dentro de una Killzone autorizada (Londres o NY)?' },
                { key: 'sweep', label: '2. ¿Hubo toma previa de liquidez (Sweep de BSL o SSL) antes de la entrada?' },
                { key: 'fvgDisplacement', label: '3. ¿Existe un desplazamiento enérgico con velas de cuerpo y Fair Value Gap (FVG)?' },
                { key: 'rrValid', label: '4. ¿El Ratio R:R cumple con el mínimo requerido de 1:2 o superior?' },
                { key: 'acceptRisk', label: '5. ¿Acepto la pérdida total del 1% si el Stop Loss es tocado sin moverlo jamás?' },
                { key: 'maxDailyLoss', label: '6. Regla Anti-Revenge: Si esta operación falla, no tomaré más de 2 trades hoy.' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center space-x-2.5 p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 cursor-pointer border border-slate-800/60 transition"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={() => toggleCheck(item.key)}
                    className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0 focus:outline-none"
                  />
                  <span className={checklist[item.key] ? 'text-slate-200' : 'text-slate-400'}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0e1a] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 transition"
          >
            Cerrar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
          >
            Confirmar Parámetros de Riesgo
          </button>
        </div>
      </div>
    </div>
  );
};

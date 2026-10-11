import React from 'react';
import { AnalysisResult } from '../types/trading';
import { ArrowUpRight, ArrowDownRight, Minus, Target, ShieldAlert, Award, Sparkles, Brain, CheckSquare, Layers, BookPlus } from 'lucide-react';

interface ExecutionCardProps {
  analysis: AnalysisResult;
  onOpenRiskCalculator: () => void;
  onSaveToJournal?: () => void;
}

export const ExecutionCard: React.FC<ExecutionCardProps> = ({
  analysis,
  onOpenRiskCalculator,
  onSaveToJournal,
}) => {
  const { bias, confidenceScore, marketState, executionPlan, keyZones, structureAnalysis, psychologyRule, actionSteps } = analysis;

  const isBullish = bias === 'BULLISH';
  const isBearish = bias === 'BEARISH';

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-4 flex flex-col space-y-4 shadow-xl">
      {/* Top Header: Bias & Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`p-2 rounded-lg font-bold font-mono text-xs flex items-center space-x-1.5 border ${
              isBullish
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : isBearish
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isBullish ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : isBearish ? (
              <ArrowDownRight className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>BIAS: {bias}</span>
          </div>
          <span className="text-xs font-mono text-slate-300 font-semibold">{marketState}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-2.5 py-1 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 font-mono text-xs flex items-center space-x-1">
            <Award className="w-3.5 h-3.5" />
            <span>Score: {confidenceScore}%</span>
          </div>

          <button
            onClick={onOpenRiskCalculator}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-sm"
          >
            Calculadora R:R
          </button>

          {onSaveToJournal && (
            <button
              onClick={onSaveToJournal}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold transition"
              title="Guardar este análisis en el Diario de Operativa"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Guardar en Diario</span>
            </button>
          )}
        </div>
      </div>

      {/* Execution Matrix (Action, Entry, SL, TP, R:R) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#080b12] border border-slate-800/80 p-2.5 rounded-lg">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Acción sugerida</span>
          <span className={`text-xs font-bold font-mono ${isBullish ? 'text-emerald-400' : isBearish ? 'text-rose-400' : 'text-amber-400'}`}>
            {executionPlan.action}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">{executionPlan.killzoneTimeframe}</span>
        </div>

        <div className="bg-[#080b12] border border-slate-800/80 p-2.5 rounded-lg">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Zona de Entrada</span>
          <span className="text-xs font-bold font-mono text-white truncate block">
            {executionPlan.entryZone}
          </span>
          <span className="text-[10px] text-blue-400 block truncate">Mitigación Institucional</span>
        </div>

        <div className="bg-[#080b12] border border-slate-800/80 p-2.5 rounded-lg">
          <span className="text-[10px] font-mono text-rose-400 block uppercase">Stop Loss (Invalidación)</span>
          <span className="text-xs font-bold font-mono text-rose-300 truncate block">
            {executionPlan.stopLoss}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">Riesgo Fijo 1%</span>
        </div>

        <div className="bg-[#080b12] border border-slate-800/80 p-2.5 rounded-lg">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase">Ratio Riesgo/Beneficio</span>
          <span className="text-xs font-bold font-mono text-emerald-300 block">
            {executionPlan.riskRewardRatio}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">TP: {executionPlan.takeProfit1}</span>
        </div>
      </div>

      {/* Structure Analysis Mini Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <span className="text-slate-400 text-[10px] block">Tendencia Institucional:</span>
          <span className="text-slate-200 font-semibold">{structureAnalysis.trend}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Nivel MSS:</span>
          <span className="text-blue-300 font-semibold">{structureAnalysis.mssLevel}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Estado BOS:</span>
          <span className="text-slate-200 font-semibold">{structureAnalysis.bosStatus}</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] block">Matriz Prem/Disc:</span>
          <span className="text-cyan-300 font-semibold">{structureAnalysis.premiumDiscountZone}</span>
        </div>
      </div>

      {/* Key Institutional Zones Table */}
      {keyZones && keyZones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">ZONAS INSTITUCIONALES IDENTIFICADAS (POIs)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {keyZones.map((zone, idx) => (
              <div
                key={idx}
                className="bg-[#080b12] border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-white text-[11px]">{zone.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      zone.status === 'FRESH'
                        ? 'bg-blue-500/20 text-blue-300'
                        : zone.status === 'SWEPT'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400">{zone.priceRange}</div>
                <p className="text-[11px] text-slate-400 leading-tight">{zone.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Psicotrading Shield Banner */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 flex items-start space-x-2.5">
        <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-amber-300 font-mono block">REGLA DE PSICOTRADING INSTITUCIONAL:</strong>
          <p className="text-amber-200/90 text-[11px] leading-relaxed mt-0.5">{psychologyRule}</p>
        </div>
      </div>

      {/* Sequential Playbook Steps */}
      {actionSteps && actionSteps.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-300">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">PLAN DE EJECUCIÓN SECUENCIAL</span>
          </div>
          <div className="space-y-1">
            {actionSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 text-[11px] text-slate-300 bg-slate-900/40 p-2 rounded border border-slate-800/60"
              >
                <span className="w-4 h-4 rounded-full bg-blue-600/30 text-blue-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

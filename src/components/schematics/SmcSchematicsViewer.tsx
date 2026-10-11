import React from 'react';
import { SchematicType } from '../../types/trading';
import { MssFvgSchematic } from './MssFvgSchematic';
import { AmdPowerOfThreeSchematic } from './AmdPowerOfThreeSchematic';
import { LiquiditySweepInducementSchematic } from './LiquiditySweepInducementSchematic';
import { PremiumDiscountOteSchematic } from './PremiumDiscountOteSchematic';
import { OrderBlockBreakerSchematic } from './OrderBlockBreakerSchematic';
import { Activity, Clock, Layers, Crosshair, DollarSign } from 'lucide-react';

interface SmcSchematicsViewerProps {
  currentSchematic: SchematicType;
  onSelectSchematic: (type: SchematicType) => void;
}

export const SmcSchematicsViewer: React.FC<SmcSchematicsViewerProps> = ({
  currentSchematic,
  onSelectSchematic,
}) => {
  const tabs = [
    { id: 'MSS_FVG' as SchematicType, label: 'MSS + FVG', icon: Activity, tag: 'Estructura' },
    { id: 'AMD_POWER_OF_THREE' as SchematicType, label: 'AMD (PO3)', icon: Clock, tag: 'Sesiones' },
    { id: 'LIQUIDITY_SWEEP_INDUCEMENT' as SchematicType, label: 'Sweeps & IDM', icon: DollarSign, tag: 'Liquidez' },
    { id: 'PREMIUM_DISCOUNT_OTE' as SchematicType, label: 'Prem/Disc OTE', icon: Crosshair, tag: 'Fibonacci' },
    { id: 'BREAKER_BLOCK' as SchematicType, label: 'OB & Breaker', icon: Layers, tag: 'Bloques' },
  ];

  return (
    <div className="flex flex-col space-y-3">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentSchematic === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectSchematic(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-sm shadow-blue-500/10 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Schematic Container */}
      <div className="transition-all duration-300">
        {currentSchematic === 'MSS_FVG' && <MssFvgSchematic />}
        {currentSchematic === 'AMD_POWER_OF_THREE' && <AmdPowerOfThreeSchematic />}
        {currentSchematic === 'LIQUIDITY_SWEEP_INDUCEMENT' && <LiquiditySweepInducementSchematic />}
        {currentSchematic === 'PREMIUM_DISCOUNT_OTE' && <PremiumDiscountOteSchematic />}
        {currentSchematic === 'BREAKER_BLOCK' && <OrderBlockBreakerSchematic />}
      </div>
    </div>
  );
};

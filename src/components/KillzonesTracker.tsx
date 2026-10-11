import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, Compass } from 'lucide-react';

interface Killzone {
  name: string;
  code: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  color: string;
  description: string;
  strategy: string;
}

const KILLZONES: Killzone[] = [
  {
    name: 'London Open Killzone',
    code: 'LOKZ',
    startHour: 2,
    startMinute: 0,
    endHour: 5,
    endMinute: 0,
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400',
    description: 'Formación del High/Low del día. Judas Swing de manipulación.',
    strategy: 'Buscar falsos quiebres del Asian Range para reversión institucional.',
  },
  {
    name: 'New York Open Killzone',
    code: 'NYKZ',
    startHour: 7,
    startMinute: 0,
    endHour: 10,
    endMinute: 0,
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-400',
    description: 'Apertura de bonos y NYSE (09:30 EST). Silver Bullet de alta precisión.',
    strategy: 'Continuación del London Trend o reversión por sweep de London High/Low.',
  },
  {
    name: 'London Close Killzone',
    code: 'LCKZ',
    startHour: 10,
    startMinute: 0,
    endHour: 12,
    endMinute: 0,
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/40 text-purple-400',
    description: 'Toma de beneficios de los bancos europeos. Retrocesos contratendencia.',
    strategy: 'Cierre parcial de trades matutinos. Posibles retrocesos a Equilibrium.',
  },
  {
    name: 'New York PM Killzone',
    code: 'NYPM',
    startHour: 13,
    startMinute: 30,
    endHour: 16,
    endMinute: 0,
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-400',
    description: 'Cierre diario de Wall Street y rebalanceo de carteras institucionales.',
    strategy: 'Expansión final hacia el Draw on Liquidity restante.',
  },
  {
    name: 'Asian Range Session',
    code: 'ASIA',
    startHour: 20,
    startMinute: 0,
    endHour: 24, // 00:00
    endMinute: 0,
    color: 'from-slate-500/20 to-slate-600/10 border-slate-500/40 text-slate-300',
    description: 'Fase de Acumulación (A de AMD). Rango estrecho generador de liquidez.',
    strategy: 'No operar. Marcar Asian High y Asian Low como objetivos BSL y SSL.',
  },
];

export const KillzonesTracker: React.FC = () => {
  const [nyTime, setNyTime] = useState<Date>(new Date());

  useEffect(() => {
    const update = () => {
      // Calculate current New York Time (America/New_York)
      const now = new Date();
      const nyString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
      setNyTime(new Date(nyString));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const seconds = nyTime.getSeconds();
  const currentMinutesOfDay = hours * 60 + minutes;

  // Determine active killzone
  const activeZone = KILLZONES.find((z) => {
    const startMins = z.startHour * 60 + z.startMinute;
    const endMins = z.endHour * 60 + z.endMinute;
    return currentMinutesOfDay >= startMins && currentMinutesOfDay < endMins;
  });

  // Check for ICT Macro Time windows (e.g. 08:50-09:10, 09:50-10:10, 10:50-11:10 EST)
  const isMacroActive =
    (hours === 8 && minutes >= 50) ||
    (hours === 9 && minutes <= 10) ||
    (hours === 9 && minutes >= 50) ||
    (hours === 10 && minutes <= 10) ||
    (hours === 10 && minutes >= 50) ||
    (hours === 11 && minutes <= 10);

  const format2Digits = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-[#0e131f] border border-slate-800 rounded-xl p-3.5 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200 tracking-wider font-mono">
            RELOJ INSTITUCIONAL ICT (NEW YORK EST)
          </span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
          IPDA ALGO TIME
        </span>
      </div>

      {/* Main Clock & Active Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080b12] border border-slate-800/80 p-3 rounded-lg">
        <div>
          <div className="text-2xl font-bold font-mono text-white tracking-wider">
            {format2Digits(hours)}:{format2Digits(minutes)}:
            <span className="text-emerald-400 text-lg">{format2Digits(seconds)}</span>
            <span className="text-xs text-slate-400 ml-2 font-normal">EST</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {nyTime.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>

        {activeZone ? (
          <div className={`px-3 py-1.5 rounded-lg border bg-gradient-to-r ${activeZone.color}`}>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold font-mono tracking-wide">
                ACTIVA: {activeZone.code}
              </span>
            </div>
            <div className="text-[10px] text-slate-300 font-mono">
              {activeZone.name}
            </div>
          </div>
        ) : (
          <div className="px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-400">
            <span className="text-xs font-mono font-medium">Fuera de Killzone Oficial</span>
            <div className="text-[10px] text-slate-500 font-mono">Esperando próxima sesión</div>
          </div>
        )}
      </div>

      {/* ICT Macro Alert Banner */}
      {isMacroActive && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-2.5 flex items-start space-x-2 text-xs text-amber-200 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-mono">VENTANA MACRO ACTIVA (20 min window):</strong> El algoritmo interbancario ejecuta inyecciones de volatilidad para reequilibrar ineficiencias o tomar liquidez pendiente. Atento a desplazamientos rápidos.
          </div>
        </div>
      )}

      {/* Mini Killzones Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono">
        {KILLZONES.map((kz) => {
          const isThisActive = activeZone?.code === kz.code;
          return (
            <div
              key={kz.code}
              className={`p-2 rounded-lg border transition-all ${
                isThisActive
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-semibold shadow-sm'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{kz.code}</span>
                {isThisActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {format2Digits(kz.startHour)}:00-{format2Digits(kz.endHour)}:00
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

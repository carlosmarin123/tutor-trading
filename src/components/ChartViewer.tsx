import React, { useState } from 'react';
import { UploadedMedia, VisualOverlay } from '../types/trading';
import { ZoomIn, ZoomOut, Maximize2, Layers, Eye, EyeOff, FileText, Crosshair, DollarSign } from 'lucide-react';

interface ChartViewerProps {
  media: UploadedMedia | null;
  overlays?: VisualOverlay[];
  bias?: 'BULLISH' | 'BEARISH' | 'NEUTRAL_RANGING';
}

export const ChartViewer: React.FC<ChartViewerProps> = ({ media, overlays = [], bias = 'BULLISH' }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LIQUIDITY' | 'FVG' | 'ORDER_BLOCK' | 'STRUCTURE'>('ALL');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [hoveredOverlay, setHoveredOverlay] = useState<VisualOverlay | null>(null);

  const filteredOverlays = overlays.filter((o) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'LIQUIDITY') return o.type.includes('LIQ') || o.type.includes('BSL') || o.type.includes('SSL');
    if (activeFilter === 'FVG') return o.type.includes('FVG') || o.type.includes('IMBALANCE');
    if (activeFilter === 'ORDER_BLOCK') return o.type.includes('OB') || o.type.includes('ORDER') || o.type.includes('BREAKER');
    if (activeFilter === 'STRUCTURE') return o.type.includes('MSS') || o.type.includes('BOS');
    return true;
  });

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full shadow-xl">
      {/* Viewer Header / Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-[#0d1220] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                bias === 'BULLISH'
                  ? 'bg-emerald-400'
                  : bias === 'BEARISH'
                  ? 'bg-rose-400'
                  : 'bg-amber-400'
              }`}
            ></span>
            <span className="text-xs font-bold font-mono text-white tracking-wide">
              {media ? media.name : 'GRÁFICO INSTITUCIONAL (EUR/USD 15M)'}
            </span>
          </div>
          {media && (
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {media.type === 'pdf' ? 'MANUAL PDF' : 'SCREENSHOT'}
            </span>
          )}
        </div>

        {/* Controls: Filter & Zoom */}
        <div className="flex items-center space-x-2">
          {/* Overlay Filter Pills */}
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
            {(['ALL', 'LIQUIDITY', 'FVG', 'ORDER_BLOCK', 'STRUCTURE'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2 py-0.5 rounded transition ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'Todos' : filter === 'LIQUIDITY' ? 'Liquidez' : filter === 'ORDER_BLOCK' ? 'OBs' : filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showOverlays
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={showOverlays ? 'Ocultar etiquetas SMC' : 'Mostrar etiquetas SMC'}
          >
            {showOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center space-x-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Alejar"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Acercar"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative flex-1 min-h-[360px] overflow-auto bg-[#07090e] flex items-center justify-center p-4">
        <div
          className="relative transition-transform duration-150 origin-center max-w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {media?.type === 'pdf' ? (
            /* PDF Document Presentation */
            <div className="bg-[#101422] border border-slate-700 rounded-xl p-8 max-w-xl text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-mono">{media.name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manual de Análisis Técnico Institucional procesado por el modelo multimodal.
                </p>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 text-left font-mono">
                <span className="text-emerald-400 block font-bold mb-1">✓ Secciones Indexadas:</span>
                • Order Flow Institucional & Algoritmo IPDA<br />
                • Modelos de Silver Bullet (10:00 - 11:00 AM EST)<br />
                • Identificación de FVG y Mitigación de Breakers
              </div>
            </div>
          ) : media?.dataUrl ? (
            /* Uploaded Image with AI SMC Overlays */
            <div className="relative inline-block rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
              <img
                src={media.dataUrl}
                alt="Uploaded Chart"
                className="max-h-[520px] w-auto object-contain block"
              />

              {/* Dynamic Overlay Annotations */}
              {showOverlays && (
                <div className="absolute inset-0 pointer-events-none">
                  {filteredOverlays.map((item) => {
                    const isHovered = hoveredOverlay?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        className="absolute pointer-events-auto transition-transform hover:scale-105 cursor-pointer"
                        style={{
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          width: item.width ? `${item.width}%` : undefined,
                          height: item.height ? `${item.height}%` : undefined,
                        }}
                        onMouseEnter={() => setHoveredOverlay(item)}
                        onMouseLeave={() => setHoveredOverlay(null)}
                      >
                        {/* Box or Pin */}
                        <div
                          className="border-2 rounded px-2 py-0.5 text-[10px] font-mono font-bold shadow-lg flex items-center space-x-1"
                          style={{
                            borderColor: item.color || '#3b82f6',
                            backgroundColor: `${item.color || '#3b82f6'}33`,
                            color: '#ffffff',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: item.color || '#3b82f6' }}
                          ></span>
                          <span>{item.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Default Simulated Institutional Chart */
            <div className="relative bg-[#0a0e18] border border-slate-800 rounded-xl p-4 w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                <span className="text-white font-bold">EUR/USD • 15m • TradingView Pro Feed</span>
                <span className="text-emerald-400">O: 1.0820 H: 1.0895 L: 1.0805 C: 1.0882 (+0.57%)</span>
              </div>

              {/* Candlestick SVG Simulation */}
              <svg viewBox="0 0 650 320" className="w-full h-auto select-none">
                <defs>
                  <linearGradient id="defaultFvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Grid */}
                <line x1="20" y1="60" x2="630" y2="60" stroke="#172033" strokeDasharray="3 3" />
                <line x1="20" y1="120" x2="630" y2="120" stroke="#172033" strokeDasharray="3 3" />
                <line x1="20" y1="180" x2="630" y2="180" stroke="#172033" strokeDasharray="3 3" />
                <line x1="20" y1="240" x2="630" y2="240" stroke="#172033" strokeDasharray="3 3" />

                {/* Candles Series */}
                {/* 1 */}
                <line x1="50" y1="210" x2="50" y2="260" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="44" y="220" width="12" height="30" fill="#ef4444" rx="1" />

                {/* 2 */}
                <line x1="80" y1="230" x2="80" y2="280" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="74" y="240" width="12" height="30" fill="#ef4444" rx="1" />

                {/* Asian Range Sweep Low (3) */}
                <line x1="110" y1="250" x2="110" y2="305" stroke="#f59e0b" strokeWidth="2" />
                <rect x="104" y="260" width="12" height="25" fill="#ef4444" rx="1" />

                {/* SSL Sweep Tag */}
                <rect x="70" y="305" width="85" height="16" rx="2" fill="#78350f" stroke="#f59e0b" />
                <text x="112" y="316" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  SSL SWEEP
                </text>

                {/* Aggressive Bullish Reversal (4, 5, 6 Displacement) */}
                <line x1="140" y1="280" x2="140" y2="210" stroke="#10b981" strokeWidth="1.5" />
                <rect x="134" y="225" width="12" height="45" fill="#10b981" rx="1" />

                {/* Giant Candle 5 (FVG created) */}
                <line x1="170" y1="230" x2="170" y2="120" stroke="#10b981" strokeWidth="2" />
                <rect x="163" y="135" width="14" height="85" fill="#10b981" rx="1" />

                {/* Candle 6 */}
                <line x1="200" y1="140" x2="200" y2="85" stroke="#10b981" strokeWidth="1.5" />
                <rect x="194" y="95" width="12" height="40" fill="#10b981" rx="1" />

                {/* FVG Highlight between candle 4 high (y=210) and candle 6 low (y=140) */}
                {showOverlays && (
                  <>
                    <rect x="155" y="140" width="140" height="70" fill="url(#defaultFvg)" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3 2" rx="3" />
                    <text x="225" y="175" fill="#e9d5ff" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      BULLISH FVG (OTE)
                    </text>
                  </>
                )}

                {/* MSS Level Broken at 150 */}
                <line x1="60" y1="180" x2="320" y2="180" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />
                <rect x="230" y="170" width="65" height="18" rx="2" fill="#1e3a8a" />
                <text x="262" y="182" fill="#bfdbfe" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  MSS / CHoCH
                </text>

                {/* Retracement into FVG (7, 8) */}
                <line x1="230" y1="90" x2="230" y2="135" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="224" y="100" width="12" height="25" fill="#ef4444" rx="1" />

                <line x1="260" y1="120" x2="260" y2="175" stroke="#ef4444" strokeWidth="1.5" />
                <rect x="254" y="130" width="12" height="35" fill="#ef4444" rx="1" />

                {/* Entry marker */}
                <circle cx="260" cy="175" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <rect x="275" y="165" width="85" height="20" rx="3" fill="#065f46" stroke="#10b981" />
                <text x="317" y="179" fill="#a7f3d0" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  LONG ENTRY
                </text>

                {/* Expansion Leg Upwards (9, 10, 11) */}
                <line x1="290" y1="170" x2="290" y2="110" stroke="#10b981" strokeWidth="1.5" />
                <rect x="284" y="120" width="12" height="40" fill="#10b981" rx="1" />

                <line x1="320" y1="125" x2="320" y2="70" stroke="#10b981" strokeWidth="1.5" />
                <rect x="314" y="80" width="12" height="35" fill="#10b981" rx="1" />

                <line x1="350" y1="85" x2="350" y2="40" stroke="#10b981" strokeWidth="1.5" />
                <rect x="344" y="50" width="12" height="30" fill="#10b981" rx="1" />

                {/* Target BSL / Asian High at top */}
                <line x1="40" y1="40" x2="480" y2="40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                <rect x="370" y="25" width="120" height="22" rx="3" fill="#78350f" stroke="#f59e0b" />
                <text x="430" y="39" fill="#fef08a" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  TP: BSL (ASIAN HIGH)
                </text>
              </svg>

              <div className="text-[10px] text-slate-500 font-mono mt-2 text-right">
                Ejemplo precargado. Sube tu propia captura de TradingView para análisis en vivo.
              </div>
            </div>
          )}
        </div>

        {/* Hovered annotation tooltip */}
        {hoveredOverlay && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-blue-500/40 p-2.5 rounded-lg text-xs text-slate-200 shadow-2xl backdrop-blur-md">
            <span className="font-bold text-blue-400 font-mono mr-1">{hoveredOverlay.label}:</span>
            {hoveredOverlay.note || 'Zona institucional detectada con algoritmo SMC.'}
          </div>
        )}
      </div>
    </div>
  );
};

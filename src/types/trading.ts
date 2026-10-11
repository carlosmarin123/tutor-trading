export type SchematicType =
  | 'MSS_FVG'
  | 'AMD_POWER_OF_THREE'
  | 'LIQUIDITY_SWEEP_INDUCEMENT'
  | 'PREMIUM_DISCOUNT_OTE'
  | 'BREAKER_BLOCK';

export interface KeyZone {
  type: 'ORDER_BLOCK' | 'FVG' | 'BREAKER' | 'BSL' | 'SSL' | 'INDUCEMENT';
  label: string;
  priceRange: string;
  explanation: string;
  status: 'FRESH' | 'MITIGATED' | 'SWEPT';
}

export interface StructureAnalysis {
  trend: string;
  mssLevel: string;
  bosStatus: string;
  premiumDiscountZone: string;
}

export interface ExecutionPlan {
  action: string;
  entryZone: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2: string;
  riskRewardRatio: string;
  killzoneTimeframe: string;
  invalidationCriteria: string;
}

export interface VisualOverlay {
  id: string;
  type: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number;
  height?: number;
  label: string;
  color: string;
  note?: string;
}

export interface AnalysisResult {
  spokenExplanation: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL_RANGING';
  marketState: string;
  confidenceScore: number;
  identifiedConcepts: string[];
  structureAnalysis: StructureAnalysis;
  keyZones: KeyZone[];
  executionPlan: ExecutionPlan;
  psychologyRule: string;
  recommendedSchematic: SchematicType;
  actionSteps: string[];
  visualOverlays?: VisualOverlay[];
}

export interface UploadedMedia {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'pdf';
  mimeType: string;
  dataUrl: string;
  base64: string;
  previewUrl?: string;
}

export interface SampleStudyCase {
  id: string;
  title: string;
  pair: string;
  timeframe: string;
  category: 'Forex' | 'Índices' | 'Commodities' | 'Cripto' | 'Manual PDF';
  description: string;
  schematic: SchematicType;
  imageUrl?: string;
  pdfUrl?: string;
  defaultPrompt: string;
  mockResult: AnalysisResult;
}

export type TradeOutcome = 'PENDING' | 'WIN' | 'LOSS' | 'BREAKEVEN';

export interface VoiceNote {
  id: string;
  createdAt: string;
  audioBase64?: string; // audio/webm or audio/wav
  durationSeconds?: number;
  transcript?: string;
}

export interface JournalEntry {
  id: string;
  createdAt: string; // ISO string
  date: string; // YYYY-MM-DD
  pair: string; // e.g. 'EUR/USD', 'NQ100', 'XAU/USD'
  timeframe: string; // e.g. '15m', '5m', '1H'
  title: string;
  analysis: AnalysisResult;
  userNotes: string;
  voiceNotes: VoiceNote[];
  outcome: TradeOutcome;
  screenshotThumbnail?: string;
  tags: string[];
}


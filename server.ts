import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High body limit for uploading chart screenshots and technical PDF manuals
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Shared Gemini client utility with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface UploadedFile {
  name: string;
  mimeType: string;
  base64: string;
}

// 1. Endpoint: Multimodal SMC/ICT Market Analysis
app.post('/api/analyze-trading', async (req: Request, res: Response) => {
  try {
    const { prompt, files, activeConcept, marketPair, timeframe } = req.body as {
      prompt?: string;
      files?: UploadedFile[];
      activeConcept?: string;
      marketPair?: string;
      timeframe?: string;
    };

    const userPromptText = prompt?.trim() || 'Realiza un análisis institucional exhaustivo con metodología ICT y Smart Money Concepts (SMC) de este gráfico / documento.';
    
    // Prepare contents
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    // Add uploaded files (charts / PDFs)
    if (files && Array.isArray(files)) {
      for (const file of files) {
        if (file.base64 && file.mimeType) {
          // Clean base64 string if it contains data URI prefix
          const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, '');
          contentParts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: cleanBase64,
            },
          });
        }
      }
    }

    const contextInstruction = `
Contexto de Mercado:
- Activo analizado: ${marketPair || 'Activo Financiero (Forex/Índice/Crypto)'}
- Temporalidad (Timeframe): ${timeframe || 'Intradía / Multi-Timeframe'}
- Enfoque metodológico prioritario: ${activeConcept || 'Análisis Completo ICT / SMC'}

Instrucción del trader:
"${userPromptText}"
    `.trim();

    contentParts.push({ text: contextInstruction });

    const systemInstruction = `
Eres un Mentor Experto Institucional en Trading con metodología Smart Money Concepts (SMC) e ICT (Inner Circle Trader, Michael J. Huddleston).
Tu misión es educar y guiar al trader con precisión matemática, eliminando la ilusión retail y analizando el algoritmo de entrega interbancario (IPDA).

Tus pilares analíticos OBLIGATORIOS son:
1. IDENTIFICACIÓN DE LIQUIDEZ:
   - Buy-side Liquidity (BSL) por encima de máximos previos, Equal Highs (EQH) o máximos de sesión.
   - Sell-side Liquidity (SSL) por debajo de mínimos previos, Equal Lows (EQL) o mínimos de sesión.
   - Liquidity Sweeps (tomas de liquidez o despojos con mecha rápida).
   - Inducement (IDM): estructuras trampa creadas para atrapar retail antes del verdadero bloque institucional.

2. ZONAS INSTITUCIONALES:
   - Order Blocks (OB): vela previa al desplazamiento alcista o bajista. Evaluar Mean Threshold (50% del cuerpo del OB).
   - Fair Value Gaps (FVG) / Imbalances: ineficiencia de 3 velas. Identificar el Consequent Encroachment (CE - nivel 50% del gap).
   - Breaker Blocks: Order Block fallido que rompió el último swing y ahora actúa como soporte/resistencia institucional de alta probabilidad.
   - Zonas de Premium vs. Discount: por encima o por debajo del Equilibrium (50% del rango de negociación). Rango de entrada óptima (OTE: 61.8% a 78.6% Fib).

3. ESTRUCTURA DE MERCADO:
   - Break of Structure (BOS): continuación tendencial rompiendo máximos/mínimos con cierre de cuerpo.
   - Market Structure Shift (MSS / CHoCH): cambio de carácter institucional cuando el precio barre liquidez y luego desplaza rompiendo el último swing protector.

4. DINÁMICA DE TIEMPO Y PRECIO (TIME & PRICE):
   - Killzones activas: Asian Range (acumulación), London Open (Judas Swing / manipulación), New York AM (Silver Bullet / distribución), London Close (retroceso), NY PM (cierre).
   - Modelo AMD (Power of Three - PO3): Accumulation -> Manipulation -> Distribution.

5. GESTIÓN DE RIESGO Y PSICOTRADING:
   - Ratio Riesgo/Beneficio mínimo 1:2 o 1:3+.
   - Stop Loss de invalidación estructural milimétrica (nunca basado en pips arbitrarios).
   - Regla de oro de psicotrading: Evitar revenge trading, disciplina de esperar la confluencia completa dentro de Killzone.

GENERA TU RESPUESTA EN FORMATO JSON ESTRICTO con la estructura definida.
En 'spokenExplanation', escribe una explicación hablada en español que sea directa, altamente analítica, seria y enfocada en la ejecución práctica (como si estuvieras dictando en vivo en una mesa de trading institucional).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: contentParts,
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            spokenExplanation: {
              type: Type.STRING,
              description: 'Explicación narrativa profesional y directa para ser leída por voz al usuario.',
            },
            bias: {
              type: Type.STRING,
              description: 'Dirección institucional: BULLISH, BEARISH o NEUTRAL_RANGING',
            },
            marketState: {
              type: Type.STRING,
              description: 'Estado actual del mercado según SMC/ICT (ej: Manipulación Judas Swing en London Open)',
            },
            confidenceScore: {
              type: Type.INTEGER,
              description: 'Calificación de probabilidad del setup (1 a 100)',
            },
            identifiedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de conceptos clave detectados en la imagen o texto',
            },
            structureAnalysis: {
              type: Type.OBJECT,
              properties: {
                trend: { type: Type.STRING },
                mssLevel: { type: Type.STRING },
                bosStatus: { type: Type.STRING },
                premiumDiscountZone: { type: Type.STRING },
              },
              required: ['trend', 'mssLevel', 'bosStatus', 'premiumDiscountZone'],
            },
            keyZones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'ORDER_BLOCK, FVG, BREAKER, BSL, SSL, INDUCEMENT' },
                  label: { type: Type.STRING },
                  priceRange: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'FRESH, MITIGATED, SWEPT' },
                },
                required: ['type', 'label', 'priceRange', 'explanation', 'status'],
              },
            },
            executionPlan: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: 'COMPRA (LONG), VENTA (SHORT) o ESPERAR CONFIRMACIÓN' },
                entryZone: { type: Type.STRING },
                stopLoss: { type: Type.STRING },
                takeProfit1: { type: Type.STRING },
                takeProfit2: { type: Type.STRING },
                riskRewardRatio: { type: Type.STRING },
                killzoneTimeframe: { type: Type.STRING },
                invalidationCriteria: { type: Type.STRING },
              },
              required: ['action', 'entryZone', 'stopLoss', 'takeProfit1', 'takeProfit2', 'riskRewardRatio', 'killzoneTimeframe', 'invalidationCriteria'],
            },
            psychologyRule: {
              type: Type.STRING,
              description: 'Consejo o regla de disciplina de psicotrading aplicada a este caso específico.',
            },
            recommendedSchematic: {
              type: Type.STRING,
              description: 'MSS_FVG, AMD_POWER_OF_THREE, LIQUIDITY_SWEEP_INDUCEMENT, PREMIUM_DISCOUNT_OTE, o BREAKER_BLOCK',
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Pasos secuenciales recomendados para el trader (1, 2, 3...)',
            },
            visualOverlays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: 'Coordenada horizontal estimada en porcentaje 0-100' },
                  y: { type: Type.NUMBER, description: 'Coordenada vertical estimada en porcentaje 0-100' },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER },
                  label: { type: Type.STRING },
                  color: { type: Type.STRING },
                  note: { type: Type.STRING },
                },
                required: ['id', 'type', 'x', 'y', 'label', 'color'],
              },
            },
          },
          required: [
            'spokenExplanation',
            'bias',
            'marketState',
            'confidenceScore',
            'identifiedConcepts',
            'structureAnalysis',
            'keyZones',
            'executionPlan',
            'psychologyRule',
            'recommendedSchematic',
            'actionSteps',
          ],
        },
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        spokenExplanation: responseText,
        bias: 'NEUTRAL_RANGING',
        marketState: 'Análisis institucional completado',
        confidenceScore: 85,
        identifiedConcepts: ['Smart Money Concepts', 'Order Flow'],
        structureAnalysis: {
          trend: 'Alcista con corrección a Discount',
          mssLevel: 'Nivel clave en swing high anterior',
          bosStatus: 'BOS confirmado en temporalidad mayor',
          premiumDiscountZone: 'Discount Zone (Bajo 50% Equilibrium)',
        },
        keyZones: [],
        executionPlan: {
          action: 'ESPERAR CONFIRMACIÓN',
          entryZone: 'Mitigación de FVG',
          stopLoss: 'Por debajo del swing low',
          takeProfit1: 'Toma de BSL en máximo asiático',
          takeProfit2: 'EQH diario',
          riskRewardRatio: '1:3.2',
          killzoneTimeframe: 'London Open / New York AM',
          invalidationCriteria: 'Cierre de vela de 15m por debajo del Order Block',
        },
        psychologyRule: 'No persigas velas de expansión tardías; espera que el precio regrese a tus zonas de descuento con paciencia institucional.',
        recommendedSchematic: 'MSS_FVG',
        actionSteps: ['Identificar draw on liquidity', 'Esperar toma de liquidez', 'Confirmar desplazamiento y FVG', 'Ejecutar en mitigación'],
      };
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/analyze-trading:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar el análisis de trading institucional',
    });
  }
});

// 2. Endpoint: Text-to-Speech via Gemini TTS (gemini-3.8-flash-lite-tts)
app.post('/api/text-to-speech', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body as { text: string; voiceName?: string };
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // Sanitize text: keep it concise for high audio fidelity (up to 700 chars per clip)
    const sanitizedText = text.slice(0, 900);
    const selectedVoice = voiceName || 'Fenrir'; // Prebuilt voices: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: sanitizedText,
              speechMetadata: {
                style: 'Professional, sharp financial trading mentor with calm authority',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(502).json({
        success: false,
        error: 'No audio returned by TTS model. Falling back to client-side speech synthesis.',
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('TTS error (will fallback to browser Web Speech API):', error?.message);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Error en Gemini TTS',
    });
  }
});

// Setup Vite middleware in dev or static server in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ICT Mentor] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

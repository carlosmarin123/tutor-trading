import { JournalEntry, TradeOutcome, VoiceNote } from '../types/trading';
import { SAMPLE_STUDY_CASES } from '../data/samples';

const STORAGE_KEY = 'ict_smc_trading_journal_v1';

export const getJournalEntries = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = getInitialSeedEntries();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading journal entries from localStorage:', err);
    return [];
  }
};

export const saveJournalEntry = (entry: JournalEntry): boolean => {
  try {
    const current = getJournalEntries();
    const existingIndex = current.findIndex((e) => e.id === entry.id);
    let updated: JournalEntry[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (quotaError) {
      // If quota exceeded, strip screenshot thumbnails or older voice clips
      console.warn('LocalStorage quota warning, trimming image payloads...', quotaError);
      const pruned = updated.map((item, idx) => {
        if (idx > 2) {
          return { ...item, screenshotThumbnail: undefined };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      return true;
    }
  } catch (err) {
    console.error('Failed to save journal entry:', err);
    return false;
  }
};

export const deleteJournalEntry = (id: string): boolean => {
  try {
    const current = getJournalEntries();
    const filtered = current.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete journal entry:', err);
    return false;
  }
};

export const updateJournalEntryOutcome = (
  id: string,
  outcome: TradeOutcome,
  additionalNotes?: string
): boolean => {
  try {
    const current = getJournalEntries();
    const target = current.find((e) => e.id === id);
    if (!target) return false;

    target.outcome = outcome;
    if (additionalNotes) {
      target.userNotes = `${target.userNotes}\n[Actualización]: ${additionalNotes}`.trim();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (err) {
    console.error('Failed to update journal entry outcome:', err);
    return false;
  }
};

export const addVoiceNoteToEntry = (id: string, voiceNote: VoiceNote): boolean => {
  try {
    const current = getJournalEntries();
    const target = current.find((e) => e.id === id);
    if (!target) return false;

    target.voiceNotes = [voiceNote, ...(target.voiceNotes || [])];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return true;
  } catch (err) {
    console.error('Failed to add voice note:', err);
    return false;
  }
};

// Initial realistic institutional journal seeds
function getInitialSeedEntries(): JournalEntry[] {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const threeDaysAgoDate = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'entry-seed-1',
      createdAt: new Date().toISOString(),
      date: today,
      pair: 'EUR/USD',
      timeframe: '15m',
      title: 'London Open Judas Swing + Reversión Alcista',
      analysis: SAMPLE_STUDY_CASES[0].mockResult,
      userNotes: 'Ejecuté la orden límite en el 50% CE del FVG en 1.08270 tras confirmar el barrido del mínimo asiático. El stop loss de 10 pips se mantuvo intacto.',
      voiceNotes: [
        {
          id: 'vn-seed-1',
          createdAt: new Date().toISOString(),
          transcript: 'Nota de voz pre-mercado: El precio barre con mecha limpia el mínimo de Asia a las 02:30 EST. No entro en la mecha; espero el cierre del cuerpo de 15 minutos que confirma el MSS. Orden programada en el FVG.',
          durationSeconds: 12,
        },
      ],
      outcome: 'WIN',
      tags: ['London Killzone', 'Judas Swing', 'Bullish FVG', 'MSS'],
    },
    {
      id: 'entry-seed-2',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      date: yesterdayDate,
      pair: 'NQ100',
      timeframe: '5m',
      title: 'Silver Bullet NY 10:00 AM - Bearish Breaker',
      analysis: SAMPLE_STUDY_CASES[1].mockResult,
      userNotes: 'Venta agresiva tras sweep del máximo diario previo. TP1 alcanzado rápidamente en el mínimo del rango overnight.',
      voiceNotes: [
        {
          id: 'vn-seed-2',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          transcript: 'Nota de voz post-ejecución: Respeté la regla de esperar las 10:00 EST. El Silver Bullet entregó un Breaker Block perfecto. Tomé 60% de beneficio al 1:2 y moví a Breakeven.',
          durationSeconds: 15,
        },
      ],
      outcome: 'WIN',
      tags: ['NY AM', 'Silver Bullet', 'Breaker Block', 'PO3'],
    },
    {
      id: 'entry-seed-3',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      date: threeDaysAgoDate,
      pair: 'XAU/USD',
      timeframe: '1H',
      title: 'Mitigación en Discount Zone OTE 0.705',
      analysis: SAMPLE_STUDY_CASES[2].mockResult,
      userNotes: 'Reacumulación en oro en 2,632. Entrada swing con ratio 1:5 proyectada hacia nuevos máximos.',
      voiceNotes: [
        {
          id: 'vn-seed-3',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          transcript: 'Nota de voz de análisis: En gráfico de 1H el dealing range está en claro descuento bajo el Equilibrium. Paciencia institucional, trade de alta probabilidad.',
          durationSeconds: 10,
        },
      ],
      outcome: 'PENDING',
      tags: ['Swing', 'OTE', 'Discount Zone', 'Equilibrium'],
    },
  ];
}

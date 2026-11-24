import { mod, pitchClass, type Note } from '../theory/notes';
import type { ToneRole, Triad } from '../theory/triads';
import { DEFAULT_MAX_FRET, getString, STANDARD_TUNING, type GuitarString, type StringSet } from './tuning';

export interface VoicingNote {
  string: number;
  fret: number;
  midi: number;
  role: ToneRole;
  note: Note;
}

/** 0 = root position (R in bass), 1 = 1st inversion (3rd in bass), 2 = 2nd inversion (5th in bass). */
export type Inversion = 0 | 1 | 2;

export interface Voicing {
  /** Low string to high string. */
  notes: readonly [VoicingNote, VoicingNote, VoicingNote];
  inversion: Inversion;
  minFret: number;
  maxFret: number;
}

export const INVERSION_LABELS: Record<Inversion, string> = {
  0: 'root position',
  1: '1st inversion',
  2: '2nd inversion',
};

const INVERSION_BY_BASS: Record<ToneRole, Inversion> = { R: 0, '3': 1, '5': 2 };

export interface FindVoicingsOptions {
  maxFret?: number;
  /** Largest allowed distance between the lowest and highest fretted note. */
  maxStretch?: number;
  tuning?: readonly GuitarString[];
}

/**
 * Every close-voiced triad shape on the given three strings.
 *
 * This is brute force: it tries every fret combination (16³ ≈ 4k with the
 * defaults) and keeps those that hold each triad tone exactly once, rise in
 * pitch from low to high string and span less than an octave. That makes it
 * a close voicing without any special handling for the G→B string tuning.
 * The result is sorted by position up the neck.
 */
export function findVoicings(
  triad: Triad,
  stringSet: StringSet,
  { maxFret = DEFAULT_MAX_FRET, maxStretch = 4, tuning = STANDARD_TUNING }: FindVoicingsOptions = {},
): Voicing[] {
  const strings = stringSet.strings.map((n) => getString(n, tuning));
  const toneByPc = new Map(triad.tones.map((t) => [pitchClass(t.note), t]));
  const results: Voicing[] = [];

  for (let f0 = 0; f0 <= maxFret; f0++) {
    for (let f1 = 0; f1 <= maxFret; f1++) {
      for (let f2 = 0; f2 <= maxFret; f2++) {
        const frets = [f0, f1, f2];
        const lo = Math.min(f0, f1, f2);
        const hi = Math.max(f0, f1, f2);
        if (hi - lo > maxStretch) continue;

        const midis = frets.map((f, i) => strings[i]!.openMidi + f);
        const [m0, m1, m2] = midis as [number, number, number];
        if (!(m0 < m1 && m1 < m2 && m2 - m0 < 12)) continue;

        const tones = midis.map((m) => toneByPc.get(mod(m, 12)));
        if (tones.some((t) => t === undefined)) continue;
        if (new Set(tones.map((t) => t!.role)).size !== 3) continue;

        const notes = tones.map((t, i) => ({
          string: strings[i]!.number,
          fret: frets[i]!,
          midi: midis[i]!,
          role: t!.role,
          note: t!.note,
        })) as unknown as Voicing['notes'];

        results.push({
          notes,
          inversion: INVERSION_BY_BASS[notes[0].role],
          minFret: lo,
          maxFret: hi,
        });
      }
    }
  }

  return results.sort((a, b) => a.minFret - b.minFret || a.notes[0].fret - b.notes[0].fret);
}

/** Frets written low string to high, e.g. "9-8-8". */
export function fretString(v: Voicing): string {
  return v.notes.map((n) => n.fret).join('-');
}

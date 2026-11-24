import { displayName, spellAbove, type Note } from './notes';

export type Quality = 'maj' | 'min' | 'dim' | 'aug';

export const QUALITIES: readonly { id: Quality; label: string }[] = [
  { id: 'maj', label: 'major' },
  { id: 'min', label: 'minor' },
  { id: 'dim', label: 'diminished' },
  { id: 'aug', label: 'augmented' },
];

/** Semitones above the root for the 3rd and 5th of each quality. */
const INTERVALS: Record<Quality, { third: number; fifth: number }> = {
  maj: { third: 4, fifth: 7 },
  min: { third: 3, fifth: 7 },
  dim: { third: 3, fifth: 6 },
  aug: { third: 4, fifth: 8 },
};

export type ToneRole = 'R' | '3' | '5';

export interface TriadTone {
  role: ToneRole;
  note: Note;
  /** Semitones above the root. */
  interval: number;
}

export interface Triad {
  root: Note;
  quality: Quality;
  tones: readonly [TriadTone, TriadTone, TriadTone];
}

export function buildTriad(root: Note, quality: Quality): Triad {
  const { third, fifth } = INTERVALS[quality];
  return {
    root,
    quality,
    tones: [
      { role: 'R', note: root, interval: 0 },
      { role: '3', note: spellAbove(root, 2, third), interval: third },
      { role: '5', note: spellAbove(root, 4, fifth), interval: fifth },
    ],
  };
}

export function qualityLabel(quality: Quality): string {
  return QUALITIES.find((q) => q.id === quality)!.label;
}

/** e.g. "B♭ minor" */
export function triadName(triad: Triad): string {
  return `${displayName(triad.root)} ${qualityLabel(triad.quality)}`;
}

/** A guitar string, numbered the usual way: 1 = high E, 6 = low E. */
export interface GuitarString {
  number: number;
  name: string;
  /** MIDI pitch of the open string, so octaves can be compared. */
  openMidi: number;
}

/** Standard tuning, low to high. */
export const STANDARD_TUNING: readonly GuitarString[] = [
  { number: 6, name: 'E', openMidi: 40 },
  { number: 5, name: 'A', openMidi: 45 },
  { number: 4, name: 'D', openMidi: 50 },
  { number: 3, name: 'G', openMidi: 55 },
  { number: 2, name: 'B', openMidi: 59 },
  { number: 1, name: 'E', openMidi: 64 },
];

export type StringSetId = '654' | '543' | '432' | '321';

export interface StringSet {
  id: StringSetId;
  label: string;
  /** String numbers from low to high pitch. */
  strings: readonly [number, number, number];
}

export const STRING_SETS: readonly StringSet[] = [
  { id: '654', label: '6-5-4', strings: [6, 5, 4] },
  { id: '543', label: '5-4-3', strings: [5, 4, 3] },
  { id: '432', label: '4-3-2', strings: [4, 3, 2] },
  { id: '321', label: '3-2-1', strings: [3, 2, 1] },
];

export const DEFAULT_MAX_FRET = 15;

export function getString(number: number, tuning: readonly GuitarString[] = STANDARD_TUNING): GuitarString {
  const s = tuning.find((g) => g.number === number);
  if (!s) throw new RangeError(`No string ${number} in tuning`);
  return s;
}

export function getStringSet(id: StringSetId): StringSet {
  return STRING_SETS.find((s) => s.id === id)!;
}

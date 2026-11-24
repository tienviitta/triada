/**
 * Spelled notes: a letter plus an accidental, so F♯ and G♭ stay distinct
 * even though they share a pitch class.
 */

export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export const LETTERS: readonly Letter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const LETTER_PITCH_CLASS: Record<Letter, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export interface Note {
  letter: Letter;
  /** Semitones relative to the natural letter: -2 = 𝄫, -1 = ♭, 0 = ♮, 1 = ♯, 2 = 𝄪. */
  accidental: number;
}

/** Mathematical modulo (always non-negative). */
export function mod(a: number, n: number): number {
  return ((a % n) + n) % n;
}

export function pitchClass(note: Note): number {
  return mod(LETTER_PITCH_CLASS[note.letter] + note.accidental, 12);
}

/** ASCII name, e.g. "C", "F#", "Bb", "Fbb". Used for parsing and URLs. */
export function noteName(note: Note): string {
  const acc =
    note.accidental >= 0 ? '#'.repeat(note.accidental) : 'b'.repeat(-note.accidental);
  return note.letter + acc;
}

/** Display name with proper symbols, e.g. "F♯", "B♭", "C𝄪". */
export function displayName(note: Note): string {
  const symbols: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' };
  const acc = symbols[note.accidental];
  if (acc === undefined) {
    throw new RangeError(`Unsupported accidental ${note.accidental} on ${note.letter}`);
  }
  return note.letter + acc;
}

/** Parse an ASCII note name such as "C", "F#", "Bb", "C##", "Fbb". */
export function parseNote(name: string): Note | null {
  const match = /^([A-G])(#{1,2}|b{1,2})?$/.exec(name);
  if (!match) return null;
  const letter = match[1] as Letter;
  const acc = match[2] ?? '';
  const accidental = acc.startsWith('#') ? acc.length : -acc.length;
  return { letter, accidental };
}

/**
 * Spell the note `letterSteps` letters above `from` that sits `semitones`
 * above it. This is how a 3rd (2 letters) or a 5th (4 letters) gets the
 * right letter, whatever its accidental turns out to be.
 */
export function spellAbove(from: Note, letterSteps: number, semitones: number): Note {
  const letter = LETTERS[mod(LETTERS.indexOf(from.letter) + letterSteps, 7)]!;
  const target = mod(pitchClass(from) + semitones, 12);
  let accidental = mod(target - LETTER_PITCH_CLASS[letter], 12);
  if (accidental > 6) accidental -= 12;
  return { letter, accidental };
}

/** The roots offered in the UI: naturals plus the common sharp/flat spellings. */
export const ROOT_NAMES: readonly string[] = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
];

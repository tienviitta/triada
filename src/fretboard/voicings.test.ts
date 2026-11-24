import { describe, expect, it } from 'vitest';
import { mod, parseNote, pitchClass, ROOT_NAMES } from '../theory/notes';
import { buildTriad, QUALITIES, type Quality } from '../theory/triads';
import { getStringSet, STRING_SETS, type StringSetId } from './tuning';
import { findVoicings, fretString, type Voicing } from './voicings';

function voicings(root: string, quality: Quality, set: StringSetId): Voicing[] {
  return findVoicings(buildTriad(parseNote(root)!, quality), getStringSet(set));
}

function shapesByInversion(vs: Voicing[]): Record<number, string[]> {
  const out: Record<number, string[]> = { 0: [], 1: [], 2: [] };
  for (const v of vs) out[v.inversion]!.push(fretString(v));
  return out;
}

describe('findVoicings: known shapes', () => {
  it('C major on 3-2-1', () => {
    expect(shapesByInversion(voicings('C', 'maj', '321'))).toEqual({
      0: ['5-5-3'],
      1: ['9-8-8'],
      2: ['0-1-0', '12-13-12'],
    });
  });

  it('C major on 6-5-4', () => {
    expect(shapesByInversion(voicings('C', 'maj', '654'))).toEqual({
      0: ['8-7-5'],
      1: ['12-10-10'],
      2: ['3-3-2', '15-15-14'],
    });
  });

  it('A minor on 4-3-2', () => {
    expect(shapesByInversion(voicings('A', 'min', '432'))).toEqual({
      0: ['7-5-5'],
      1: ['10-9-10'],
      2: ['2-2-1', '14-14-13'],
    });
  });

  it('labels the notes of each shape', () => {
    const [root] = voicings('C', 'maj', '321').filter((v) => v.inversion === 0);
    expect(root!.notes.map((n) => [n.string, n.fret, n.role])).toEqual([
      [3, 5, 'R'],
      [2, 5, '3'],
      [1, 3, '5'],
    ]);
  });
});

describe('findVoicings: augmented', () => {
  it('keeps all three inversions, which are one shape moved by 4 frets', () => {
    const vs = voicings('C', 'aug', '321');
    expect(new Set(vs.map((v) => v.inversion))).toEqual(new Set([0, 1, 2]));
    const shapeOf = (v: Voicing) => v.notes.map((n) => n.fret - v.notes[0].fret).join(',');
    expect(new Set(vs.map(shapeOf)).size).toBe(1);
    const bassFrets = vs.map((v) => v.notes[0].fret);
    for (let i = 1; i < bassFrets.length; i++) expect(bassFrets[i]! - bassFrets[i - 1]!).toBe(4);
  });
});

describe('findVoicings: properties for every root × quality × string set', () => {
  for (const { id: quality } of QUALITIES) {
    for (const set of STRING_SETS) {
      it(`${quality} on ${set.label}`, () => {
        for (const root of ROOT_NAMES) {
          const triad = buildTriad(parseNote(root)!, quality);
          const pcs = triad.tones.map((t) => pitchClass(t.note)).sort();
          const vs = findVoicings(triad, set);

          for (const v of vs) {
            // Exactly the triad tones, one each.
            expect(v.notes.map((n) => mod(n.midi, 12)).sort()).toEqual(pcs);
            expect(new Set(v.notes.map((n) => n.role)).size).toBe(3);
            // Close voicing: rising pitch within an octave, on the right strings.
            const [a, b, c] = v.notes;
            expect(a.midi < b.midi && b.midi < c.midi && c.midi - a.midi < 12).toBe(true);
            expect(v.notes.map((n) => n.string)).toEqual([...set.strings]);
            expect(v.maxFret - v.minFret).toBeLessThanOrEqual(4);
            // The inversion follows the bass note.
            expect(v.inversion).toBe({ R: 0, '3': 1, '5': 2 }[a.role]);
          }

          // Every inversion appears within the first 12 frets.
          for (const inv of [0, 1, 2]) {
            expect(vs.some((v) => v.inversion === inv && v.minFret < 12)).toBe(true);
          }

          // Shapes repeat 12 frets up when they fit on the neck.
          const keys = new Set(vs.map(fretString));
          for (const v of vs.filter((v) => v.maxFret + 12 <= 15)) {
            expect(keys.has(v.notes.map((n) => n.fret + 12).join('-'))).toBe(true);
          }
        }
      });
    }
  }
});

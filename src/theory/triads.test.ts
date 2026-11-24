import { describe, expect, it } from 'vitest';
import { LETTERS, mod, noteName, parseNote, pitchClass, ROOT_NAMES } from './notes';
import { buildTriad, QUALITIES, triadName, type Quality } from './triads';

function spell(root: string, quality: Quality): string[] {
  return buildTriad(parseNote(root)!, quality).tones.map((t) => noteName(t.note));
}

describe('buildTriad', () => {
  it.each([
    ['C', 'maj', ['C', 'E', 'G']],
    ['Bb', 'min', ['Bb', 'Db', 'F']],
    ['F#', 'dim', ['F#', 'A', 'C']],
    ['Ab', 'aug', ['Ab', 'C', 'E']],
    ['B', 'dim', ['B', 'D', 'F']],
    ['Bb', 'dim', ['Bb', 'Db', 'Fb']],
    ['D#', 'maj', ['D#', 'F##', 'A#']],
    ['E', 'aug', ['E', 'G#', 'B#']],
  ] as const)('%s %s = %j', (root, quality, expected) => {
    expect(spell(root, quality)).toEqual(expected);
  });

  it('stacks letters in thirds with the right intervals for every root and quality', () => {
    const expected = { maj: [4, 7], min: [3, 7], dim: [3, 6], aug: [4, 8] } as const;
    for (const name of ROOT_NAMES) {
      for (const { id } of QUALITIES) {
        const [r, t, f] = buildTriad(parseNote(name)!, id).tones;
        const li = (l: string) => LETTERS.indexOf(l as never);
        expect(mod(li(t.note.letter) - li(r.note.letter), 7)).toBe(2);
        expect(mod(li(f.note.letter) - li(r.note.letter), 7)).toBe(4);
        expect(mod(pitchClass(t.note) - pitchClass(r.note), 12)).toBe(expected[id][0]);
        expect(mod(pitchClass(f.note) - pitchClass(r.note), 12)).toBe(expected[id][1]);
      }
    }
  });

  it('names the triad', () => {
    expect(triadName(buildTriad(parseNote('Bb')!, 'min'))).toBe('B♭ minor');
  });
});

import { describe, expect, it } from 'vitest';
import { displayName, LETTERS, noteName, parseNote, pitchClass, ROOT_NAMES, spellAbove } from './notes';

describe('parseNote / noteName', () => {
  it('round-trips every letter with every accidental', () => {
    for (const letter of LETTERS) {
      for (const acc of ['', '#', '##', 'b', 'bb']) {
        const name = letter + acc;
        expect(noteName(parseNote(name)!)).toBe(name);
      }
    }
  });

  it('rejects junk', () => {
    for (const bad of ['', 'H', 'c', 'C###', 'C#b', 'Cs', ' C']) {
      expect(parseNote(bad)).toBeNull();
    }
  });

  it('parses every UI root', () => {
    for (const name of ROOT_NAMES) expect(parseNote(name)).not.toBeNull();
  });
});

describe('pitchClass', () => {
  it('handles enharmonics and wrap-around', () => {
    expect(pitchClass(parseNote('F#')!)).toBe(pitchClass(parseNote('Gb')!));
    expect(pitchClass(parseNote('Cb')!)).toBe(11);
    expect(pitchClass(parseNote('B#')!)).toBe(0);
    expect(pitchClass(parseNote('Fbb')!)).toBe(3);
  });
});

describe('displayName', () => {
  it('uses musical symbols', () => {
    expect(displayName(parseNote('Bb')!)).toBe('B♭');
    expect(displayName(parseNote('F#')!)).toBe('F♯');
    expect(displayName(parseNote('C##')!)).toBe('C𝄪');
    expect(displayName(parseNote('E')!)).toBe('E');
  });
});

describe('spellAbove', () => {
  it('picks the letter first, then the accidental', () => {
    // A major third above F# is A#, not Bb.
    expect(noteName(spellAbove(parseNote('F#')!, 2, 4))).toBe('A#');
    // A minor third above Bb is Db, not C#.
    expect(noteName(spellAbove(parseNote('Bb')!, 2, 3))).toBe('Db');
    // A diminished fifth above Bb is Fb.
    expect(noteName(spellAbove(parseNote('Bb')!, 4, 6))).toBe('Fb');
  });
});

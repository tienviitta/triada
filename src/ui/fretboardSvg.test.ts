// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { parseNote } from '../theory/notes';
import { buildTriad, triadName } from '../theory/triads';
import { getStringSet } from '../fretboard/tuning';
import { findVoicings } from '../fretboard/voicings';
import { renderFretboard } from './fretboardSvg';

const triad = buildTriad(parseNote('C')!, 'maj');
const voicings = findVoicings(triad, getStringSet('321'));
const base = { maxFret: 15, triadName: triadName(triad) };

describe('renderFretboard', () => {
  it('draws one group per voicing and three dots in each', () => {
    const svg = renderFretboard(voicings, { ...base, labels: 'role' });
    const groups = svg.querySelectorAll('.voicing');
    expect(groups).toHaveLength(voicings.length);
    expect(svg.querySelectorAll('.voicing .dot')).toHaveLength(voicings.length * 3);
    expect(svg.querySelectorAll('.string')).toHaveLength(6);
    expect(svg.querySelectorAll('.fret')).toHaveLength(15);
  });

  it('labels dots with R/3/5 or note names', () => {
    const roles = renderFretboard(voicings, { ...base, labels: 'role' });
    const notes = renderFretboard(voicings, { ...base, labels: 'note' });
    const texts = (svg: SVGSVGElement) =>
      new Set([...svg.querySelectorAll('.dot text')].map((t) => t.textContent));
    expect(texts(roles)).toEqual(new Set(['R', '3', '5']));
    expect(texts(notes)).toEqual(new Set(['C', 'E', 'G']));
  });

  it('describes each shape for hover and screen readers', () => {
    const svg = renderFretboard(voicings, { ...base, labels: 'role' });
    const descriptions = [...svg.querySelectorAll('.voicing')].map((g) => g.getAttribute('data-description'));
    expect(descriptions).toContain('C major, 1st inversion, frets 9-8-8');
    expect(descriptions).toContain('C major, root position, frets 5-5-3');
  });

  it('marks the inversion on each group', () => {
    const svg = renderFretboard(voicings, { ...base, labels: 'role' });
    const invs = [...svg.querySelectorAll('.voicing')].map((g) => g.getAttribute('data-inversion'));
    expect(invs).toEqual(voicings.map((v) => String(v.inversion)));
  });
});

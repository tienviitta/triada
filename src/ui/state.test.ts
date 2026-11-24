import { describe, expect, it } from 'vitest';
import { DEFAULT_STATE, parseState, serializeState, type AppState } from './state';

describe('URL hash state', () => {
  it('uses the short format', () => {
    expect(serializeState(DEFAULT_STATE)).toBe('C-maj-321');
    expect(serializeState({ ...DEFAULT_STATE, root: 'F#', quality: 'dim', stringSet: '432' })).toBe('Fs-dim-432');
    expect(serializeState({ ...DEFAULT_STATE, labels: 'note', inversion: 1 })).toBe('C-maj-321-notes-inv1');
  });

  it('round-trips', () => {
    const states: AppState[] = [
      DEFAULT_STATE,
      { root: 'Bb', quality: 'min', stringSet: '654', labels: 'note', inversion: 2 },
      { root: 'C#', quality: 'aug', stringSet: '543', labels: 'role', inversion: 0 },
    ];
    for (const s of states) expect(parseState(`#${serializeState(s)}`)).toEqual(s);
  });

  it('falls back to defaults for missing or bad parts', () => {
    expect(parseState('')).toEqual(DEFAULT_STATE);
    expect(parseState('#H-xyz-999')).toEqual(DEFAULT_STATE);
    expect(parseState('#Eb')).toEqual({ ...DEFAULT_STATE, root: 'Eb' });
  });
});

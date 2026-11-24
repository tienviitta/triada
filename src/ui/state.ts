import { parseNote, ROOT_NAMES } from '../theory/notes';
import { QUALITIES, type Quality } from '../theory/triads';
import { STRING_SETS, type StringSetId } from '../fretboard/tuning';
import type { Inversion } from '../fretboard/voicings';

export type LabelMode = 'role' | 'note';
export type InversionFilter = 'all' | Inversion;

export interface AppState {
  /** ASCII root name, one of ROOT_NAMES. */
  root: string;
  quality: Quality;
  stringSet: StringSetId;
  labels: LabelMode;
  inversion: InversionFilter;
}

export const DEFAULT_STATE: AppState = {
  root: 'C',
  quality: 'maj',
  stringSet: '321',
  labels: 'role',
  inversion: 'all',
};

/*
 * Hash format: "#C-maj-321", with optional "-notes" and "-inv0|1|2" suffixes.
 * A sharp is written "s" ("#Fs-dim-432") so the hash never holds a second "#".
 */

export function serializeState(s: AppState): string {
  const parts = [s.root.replace(/#/g, 's'), s.quality, s.stringSet];
  if (s.labels === 'note') parts.push('notes');
  if (s.inversion !== 'all') parts.push(`inv${s.inversion}`);
  return parts.join('-');
}

export function parseState(hash: string): AppState {
  const [rawRoot, quality, set, ...extras] = hash.replace(/^#/, '').split('-');
  const root = (rawRoot ?? '').replace(/s/g, '#');
  const inv = extras.find((e) => /^inv[012]$/.test(e));

  return {
    root: ROOT_NAMES.includes(root) && parseNote(root) ? root : DEFAULT_STATE.root,
    quality: QUALITIES.some((q) => q.id === quality) ? (quality as Quality) : DEFAULT_STATE.quality,
    stringSet: STRING_SETS.some((s) => s.id === set) ? (set as StringSetId) : DEFAULT_STATE.stringSet,
    labels: extras.includes('notes') ? 'note' : 'role',
    inversion: inv ? (Number(inv.slice(3)) as Inversion) : 'all',
  };
}

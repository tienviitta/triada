import { displayName, parseNote, ROOT_NAMES } from '../theory/notes';
import { QUALITIES } from '../theory/triads';
import { STRING_SETS } from '../fretboard/tuning';
import { INVERSION_LABELS } from '../fretboard/voicings';
import type { AppState } from './state';

type Field = keyof AppState;

interface Option {
  value: string;
  label: string;
}

const FIELDS: { field: Field; label: string; options: Option[] }[] = [
  {
    field: 'root',
    label: 'Root',
    options: ROOT_NAMES.map((n) => ({ value: n, label: displayName(parseNote(n)!) })),
  },
  {
    field: 'quality',
    label: 'Quality',
    options: QUALITIES.map((q) => ({ value: q.id, label: q.label })),
  },
  {
    field: 'stringSet',
    label: 'Strings',
    options: STRING_SETS.map((s) => ({ value: s.id, label: s.label })),
  },
  {
    field: 'inversion',
    label: 'Show',
    options: [
      { value: 'all', label: 'all inversions' },
      ...([0, 1, 2] as const).map((i) => ({ value: String(i), label: INVERSION_LABELS[i] })),
    ],
  },
  {
    field: 'labels',
    label: 'Labels',
    options: [
      { value: 'role', label: 'R / 3 / 5' },
      { value: 'note', label: 'note names' },
    ],
  },
];

export interface Controls {
  element: HTMLElement;
  /** Update the selects to match a state (e.g. after a hash change). */
  set(state: AppState): void;
}

export function createControls(initial: AppState, onChange: (next: AppState) => void): Controls {
  const form = document.createElement('form');
  form.className = 'controls';
  form.addEventListener('submit', (e) => e.preventDefault());

  const selects = new Map<Field, HTMLSelectElement>();
  let current = initial;

  for (const { field, label, options } of FIELDS) {
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    const caption = document.createElement('span');
    caption.textContent = label;
    const select = document.createElement('select');
    select.name = field;
    for (const o of options) select.add(new Option(o.label, o.value));
    select.addEventListener('change', () => {
      const raw = select.value;
      const value = field === 'inversion' && raw !== 'all' ? Number(raw) : raw;
      current = { ...current, [field]: value } as AppState;
      onChange(current);
    });
    wrapper.append(caption, select);
    form.append(wrapper);
    selects.set(field, select);
  }

  const set = (state: AppState) => {
    current = state;
    for (const [field, select] of selects) select.value = String(state[field]);
  };
  set(initial);

  return { element: form, set };
}

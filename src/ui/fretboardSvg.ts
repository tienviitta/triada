import { displayName } from '../theory/notes';
import { STANDARD_TUNING, type GuitarString } from '../fretboard/tuning';
import { fretString, INVERSION_LABELS, type Voicing } from '../fretboard/voicings';
import type { LabelMode } from './state';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Layout (SVG user units).
const FRET_W = 60;
const STRING_GAP = 30;
const NUT_X = 56; // x of the nut; open-string notes sit to its left
const OPEN_X = 26;
const TOP = 26;
const DOT_R = 12;
const INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

export interface FretboardOptions {
  maxFret: number;
  labels: LabelMode;
  /** Prefix for shape descriptions, e.g. "C major". */
  triadName: string;
  tuning?: readonly GuitarString[];
}

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number> = {},
  text?: string,
): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

export function fretX(fret: number): number {
  return fret === 0 ? OPEN_X : NUT_X + (fret - 0.5) * FRET_W;
}

export function describeVoicing(v: Voicing, triadName: string): string {
  return `${triadName}, ${INVERSION_LABELS[v.inversion]}, frets ${fretString(v)}`;
}

/** Draw the neck with every voicing marked. High E is at the top, like tab. */
export function renderFretboard(voicings: readonly Voicing[], opts: FretboardOptions): SVGSVGElement {
  const tuning = opts.tuning ?? STANDARD_TUNING;
  const highToLow = [...tuning].sort((a, b) => a.number - b.number);
  const stringY = new Map(highToLow.map((s, i) => [s.number, TOP + i * STRING_GAP]));
  const bottom = TOP + (highToLow.length - 1) * STRING_GAP;
  const right = NUT_X + opts.maxFret * FRET_W;
  const width = right + 16;
  const height = bottom + 44;

  const svg = el('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    class: 'fretboard',
    role: 'img',
    'aria-label': `${opts.triadName} triads on the fretboard`,
  });

  // Neck background, inlays, frets, nut, strings.
  const neck = el('g', { class: 'neck' });
  neck.append(el('rect', { class: 'wood', x: NUT_X, y: TOP - 12, width: right - NUT_X, height: bottom - TOP + 24 }));
  const midY = (TOP + bottom) / 2;
  for (let f = 1; f <= opts.maxFret; f++) {
    const x = fretX(f);
    if (INLAYS.includes(f)) neck.append(el('circle', { class: 'inlay', cx: x, cy: midY, r: 6 }));
    if (DOUBLE_INLAYS.includes(f)) {
      neck.append(el('circle', { class: 'inlay', cx: x, cy: TOP + STRING_GAP * 1.5, r: 6 }));
      neck.append(el('circle', { class: 'inlay', cx: x, cy: bottom - STRING_GAP * 1.5, r: 6 }));
    }
    const wireX = NUT_X + f * FRET_W;
    neck.append(el('line', { class: 'fret', x1: wireX, x2: wireX, y1: TOP - 12, y2: bottom + 12 }));
    neck.append(el('text', { class: 'fret-number', x, y: bottom + 34 }, String(f)));
  }
  neck.append(el('line', { class: 'nut', x1: NUT_X, x2: NUT_X, y1: TOP - 12, y2: bottom + 12 }));
  for (const s of highToLow) {
    const y = stringY.get(s.number)!;
    neck.append(
      el('line', { class: 'string', x1: NUT_X - 40, x2: right, y1: y, y2: y, 'stroke-width': 0.8 + (s.number - 1) * 0.3 }),
    );
  }
  svg.append(neck);

  // One group per voicing: a faint outline joining its notes, then the dots.
  const shapes = el('g', { class: 'shapes' });
  voicings.forEach((v, index) => {
    const description = describeVoicing(v, opts.triadName);
    const g = el('g', {
      class: `voicing inv-${v.inversion}`,
      'data-inversion': v.inversion,
      'data-index': index,
      'data-description': description,
      tabindex: 0,
      role: 'img',
      'aria-label': description,
    });
    g.append(el('title', {}, description));
    const points = v.notes.map((n) => `${fretX(n.fret)},${stringY.get(n.string)!}`).join(' ');
    g.append(el('polyline', { class: 'outline', points }));
    for (const n of v.notes) {
      const cx = fretX(n.fret);
      const cy = stringY.get(n.string)!;
      const label = opts.labels === 'role' ? n.role : displayName(n.note);
      const dot = el('g', { class: `dot role-${n.role === 'R' ? 'root' : n.role}` });
      dot.append(el('circle', { cx, cy, r: DOT_R }));
      dot.append(el('text', { x: cx, y: cy }, label));
      g.append(dot);
    }
    shapes.append(g);
  });
  svg.append(shapes);

  return svg;
}

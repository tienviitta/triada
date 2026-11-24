import './styles.css';
import { parseNote } from './theory/notes';
import { buildTriad, triadName } from './theory/triads';
import { DEFAULT_MAX_FRET, getStringSet } from './fretboard/tuning';
import { findVoicings } from './fretboard/voicings';
import { createControls } from './ui/controls';
import { renderFretboard } from './ui/fretboardSvg';
import { parseState, serializeState, type AppState } from './ui/state';

const app = document.querySelector<HTMLElement>('#app')!;
const title = document.querySelector<HTMLElement>('#title')!;
const board = document.querySelector<HTMLElement>('#board')!;
const readout = document.querySelector<HTMLElement>('#readout')!;
const IDLE_READOUT = 'Hover or tab to a shape to see its name.';

let state: AppState = parseState(location.hash);

const controls = createControls(state, (next) => {
  state = next;
  history.replaceState(null, '', `#${serializeState(state)}`);
  render();
});
app.prepend(controls.element);

window.addEventListener('hashchange', () => {
  state = parseState(location.hash);
  controls.set(state);
  render();
});

function render(): void {
  const triad = buildTriad(parseNote(state.root)!, state.quality);
  const set = getStringSet(state.stringSet);
  const name = triadName(triad);
  const voicings = findVoicings(triad, set, { maxFret: DEFAULT_MAX_FRET }).filter(
    (v) => state.inversion === 'all' || v.inversion === state.inversion,
  );

  title.textContent = `${name} triads on strings ${set.label}`;
  board.replaceChildren(
    renderFretboard(voicings, { maxFret: DEFAULT_MAX_FRET, labels: state.labels, triadName: name }),
  );
  readout.textContent = IDLE_READOUT;
}

// Shape readout on hover / keyboard focus (event delegation, survives re-renders).
function showShape(e: Event): void {
  const shape = (e.target as Element).closest?.('.voicing');
  readout.textContent = shape?.getAttribute('data-description') ?? IDLE_READOUT;
}
board.addEventListener('mouseover', showShape);
board.addEventListener('focusin', showShape);
board.addEventListener('mouseleave', () => (readout.textContent = IDLE_READOUT));
board.addEventListener('focusout', () => (readout.textContent = IDLE_READOUT));

render();

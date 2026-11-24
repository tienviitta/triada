# Triada

An interactive fretboard explorer for guitar triads. Pick a root, a quality and a string set, and Triada draws every close-voiced triad shape on that set up to the 15th fret, colour-coded by inversion.

**Live:** https://triada-explorer.netlify.app

## Features

- **Every triad shape** for 12 roots × 4 qualities (major, minor, diminished, augmented) on the four adjacent string sets (6-5-4, 5-4-3, 4-3-2, 3-2-1), in standard tuning.
- **Inversions:** root position, 1st and 2nd inversion, shown all together or filtered to one.
- **Labels:** show each dot as its chord role (R / 3 / 5) or as its note name, with correct enharmonic spelling (e.g. B♭ minor is B♭–D♭–F, not A♯–C♯–F).
- **Shareable URLs:** the current view is kept in the URL hash, e.g. `#Fs-dim-432-notes-inv1` (a sharp is written `s`).
- **Accessible:** shapes can be reached with the keyboard, and a live readout names the shape under the pointer or focus. Light and dark themes follow the system setting.

## Getting started

Requires Node.js 24 (the version Netlify builds with, see `netlify.toml`).

```sh
npm install
npm run dev        # dev server at http://localhost:5173
```

## Scripts

| Command              | What it does                                      |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server with hot reload         |
| `npm run build`      | Type-check, then build the production site to `dist/` |
| `npm run preview`    | Serve the built `dist/` locally                   |
| `npm test`           | Run the unit tests once (Vitest)                  |
| `npm run test:watch` | Run the tests in watch mode                       |
| `npm run typecheck`  | Type-check without building                       |

## Project structure

```
src/
├── theory/      Music theory with no DOM: notes, spelling, triad construction
│   ├── notes.ts
│   └── triads.ts
├── fretboard/   Mapping theory onto the guitar
│   ├── tuning.ts      Standard tuning and string sets
│   └── voicings.ts    Finds every playable voicing and its inversion
├── ui/          Browser layer
│   ├── state.ts         App state and URL-hash (de)serialisation
│   ├── controls.ts      Selector controls
│   └── fretboardSvg.ts  SVG fretboard renderer
├── main.ts      Wires state, controls and rendering together
└── styles.css
```

Dependencies only point downwards: `theory` knows nothing about the guitar, and `fretboard` knows nothing about the DOM. That keeps the core logic easy to unit test. Tests sit next to the code they cover (`*.test.ts`).

The app is plain TypeScript on [Vite](https://vite.dev), with no UI framework and no runtime dependencies.

## Deployment

The site is hosted on Netlify (project `triada-explorer`). The build settings are in `netlify.toml`.

Deploys are manual: pushing to GitHub does **not** publish the site. To publish the current working tree:

```sh
netlify deploy --prod      # builds, then deploys dist/ to production
netlify deploy             # draft deploy with a preview URL, for checking first
```

Run `npm test` before deploying. The CLI must be logged in (`netlify login`) and the folder linked to the project (`netlify link`).

## License

[MIT](LICENSE) © 2026 Petri Väisänen

# REA project page

Project page for **REA: A Routed Embodied Agent Runtime for Asynchronous Brain-Cerebellum Control**.

Live at <https://mikeeeeeeeeeeeeee.github.io/REA/>.

React 19 + Vite + Tailwind CSS v4, with effects from [React Bits](https://reactbits.dev) (TS + Tailwind variants, vendored in `src/components/reactbits/`). Light and dark themes; the visitor's choice is remembered.

## Run and build

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # dist/: static site, relative paths, works under any sub-path
npm run build:single   # dist-single/index.html: one self-contained file, opens by double-click
```

## Publish on GitHub Pages

This repository publishes itself: every push to `main` runs `.github/workflows/deploy.yml`, which builds the site
and deploys `dist/` to GitHub Pages (Settings → Pages → Source is set to **GitHub Actions**). Edit, commit, push, and
the page updates a minute later.

To publish a copy elsewhere, push this folder to another repository's `main` branch and set its Pages source to
GitHub Actions; the page appears at `https://<user>.github.io/<repo>/`. The canonical and link-preview URLs in
`index.html` point at the address above, so change them too.

Any static host works as well: run `npm run build` and upload the contents of `dist/`.

Asset paths are relative (`base: './'`), so the same build works at a sub-path or on a custom domain.

## Where the content lives

| What | File |
| --- | --- |
| Title, authors, affiliations, abstract, BibTeX, **links** | `src/data/paper.ts` |
| Most numbers on the page (Tables 1, 3–6, 9–14, 17 and 18 of the arXiv version; a few are written in the sections) | `src/data/results.ts` |
| Test episodes, RoboTwin decisions, G1 and BEHAVIOR frames | `src/data/gen/*.ts` (generated) |
| Colours (three lines: S2 brain, S1 router, S0 skills) | `src/index.css` and `src/theme/tokens.ts` |
| The film: player, chapters, file names | `src/components/film/FilmPlayer.tsx`, `src/data/film.ts` |
| The film's videos and posters | `public/film/rea-intro-*.mp4`, `src/assets/film/intro-*poster-*.webp` (made in `../intro_video`) |
| CG clips in the four termini, and their posters | `public/cg/*` (cut from the Blender renders in `../intro_video/renders` by `../film/scripts/cg.py`), played by `src/components/cg/CgVideo.tsx` |
| The ALOHA real-robot study: trials, outcomes, captions | `src/data/aloha.ts`, rendered by `src/sections/Aloha.tsx` |
| ALOHA keyframes and re-encoded clips | `public/aloha/*` (made from `../Aloha真机实验`; the originals are not in this repository) |

Links that are not public yet (`arxiv`, `pdf`, `code`, `video` in `src/data/paper.ts`) are empty; the page then
shows the button with a "soon" badge. Fill them in and push.

`src/data/gen/` and `src/assets/` were generated from the raw run records (test episodes of the judge-gated
router on LIBERO-Pro, RoboTwin 2.0 decisions, BEHAVIOR-1K and Unitree G1 frames) by a script that lives with those
records, outside this repository; edit the generated files only by regenerating them.

## The film

The section after the hero plays a narrated introduction to the paper, made in `../intro_video` (see its README), in
two cuts: the full explainer (4 min 35 s, `rea-intro-*.mp4`, the one the player opens with) and a short one (1 min
32 s, `rea-intro-short-*.mp4`). The poster and the player's bar choose between them; another cut starts from its
beginning. Its robots are CG animation re-staging the paper's experiments; the narration's subtitles are burned in.
Each cut comes in a light and a dark version that follow the page theme; the switch in the player's bar overrides it,
and switching keeps the place. Each version is one H.264 file at 24 fps; nothing downloads until play is pressed. The
single-file build cannot carry the videos, so it streams them from the published site.

## Notes

- No `StrictMode`: several WebGL effects release their context on unmount, and the dev-only double mount
  would hand them a lost context.
- Heavy effects mount only near the viewport (`src/components/ui/LazyMount.tsx`) and pause off screen.
- `prefers-reduced-motion` is respected: replays jump to their final state and loops stop.

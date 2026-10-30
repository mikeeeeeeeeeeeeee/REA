import posterLight from '@/assets/film/intro-poster-light.webp';
import posterDark from '@/assets/film/intro-poster-dark.webp';
import shortPosterLight from '@/assets/film/intro-short-poster-light.webp';
import shortPosterDark from '@/assets/film/intro-short-poster-dark.webp';

/**
 * The film (made in ../intro_video): a narrated introduction to the paper in two cuts, a short one and the full
 * explainer. Each cut is one timeline in two versions that match the page's themes, and each version is one H.264
 * file at 24 fps with the narration's subtitles burned in. The files live in public/film/; the single-file build has
 * no folder next to it, so it streams them from the published site.
 */
export type FilmVersion = 'light' | 'dark';
export type FilmCut = 'short' | 'full';

export interface Film {
  name: string;
  duration: number;
  src: (v: FilmVersion, hevc: boolean) => string;
  poster: Record<FilmVersion, string>;
  /** chapter starts in seconds, as cut in the film */
  chapters: { t: number; title: string }[];
}

const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';

// H.264 plays everywhere, so the HEVC flag the player passes is not needed
export const FILMS: Record<FilmCut, Film> = {
  short: {
    name: 'Short',
    duration: 92.75,
    src: (v) => `${BASE}film/rea-intro-short-${v}.mp4`,
    poster: { light: shortPosterLight, dark: shortPosterDark },
    chapters: [
      { t: 0, title: 'A silent failure' },
      { t: 13.7, title: 'Brain and reflexes' },
      { t: 22.3, title: 'Three ways to couple' },
      { t: 36.3, title: 'The router' },
      { t: 46.3, title: 'One episode' },
      { t: 61.0, title: 'Results' },
      { t: 74.3, title: 'New bodies' },
      { t: 81.0, title: 'The insight' },
    ],
  },
  full: {
    name: 'Full',
    duration: 275.6,
    src: (v) => `${BASE}film/rea-intro-${v}.mp4`,
    poster: { light: posterLight, dark: posterDark },
    chapters: [
      { t: 0, title: 'A silent failure' },
      { t: 19.8, title: 'Brain and cerebellum' },
      { t: 65.8, title: 'Three ways to couple' },
      { t: 96.5, title: 'The runtime' },
      { t: 135.1, title: 'The router' },
      { t: 161.8, title: 'One episode' },
      { t: 196.5, title: 'Results' },
      { t: 226.5, title: 'New bodies' },
      { t: 252.5, title: 'The insight' },
    ],
  },
};

/** the cut the player opens with: the full explainer; the short cut is one click away */
export const FIRST_CUT: FilmCut = 'full';

/** a cut's length as the player writes it, e.g. "4 min 35 s" */
export const lengthOf = (f: Film) => `${Math.floor(f.duration / 60)} min ${Math.floor(f.duration % 60)} s`;

export const chapterAt = (f: Film, t: number) => [...f.chapters].reverse().find((c) => t >= c.t) ?? f.chapters[0];

/**
 * The robot demo (made in ../demo_film): REA on the real robots and the simulators, one H.264 file at 60 fps with
 * English and Chinese subtitles burned in. Shown in its own section near the end of the page, apart from the film.
 */
export const DEMO = {
  src: `${BASE}film/rea-robot-demo.mp4`,
  poster: `${BASE}film/rea-robot-demo.webp`,
  duration: 107.4,
  length: '1 min 47 s',
};

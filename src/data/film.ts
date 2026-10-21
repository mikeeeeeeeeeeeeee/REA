import posterLight from '@/assets/film/poster-light.webp';
import posterDark from '@/assets/film/poster-dark.webp';

/**
 * The film (made in ../film): one timeline in two versions that match the page's themes. Each version comes as HEVC
 * at 60 fps and as H.264 at 30 fps for browsers that cannot play HEVC. The files live in public/film/; the
 * single-file build has no folder next to it, so it streams them from the published site.
 */
export type FilmVersion = 'light' | 'dark';

const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';

export const FILM = {
  duration: 108,
  src: (v: FilmVersion, hevc: boolean) => `${BASE}film/rea-film-${v}${hevc ? '' : '-h264'}.mp4`,
  poster: { light: posterLight, dark: posterDark } as Record<FilmVersion, string>,
  /** chapter starts in seconds, as cut in the film */
  chapters: [
    { t: 0, title: 'The problem' },
    { t: 22.5, title: 'REA' },
    { t: 32.5, title: 'One episode' },
    { t: 57.5, title: 'Results' },
    { t: 80, title: 'Beyond one simulator' },
    { t: 95, title: 'The rule' },
  ],
};

export const chapterAt = (t: number) => [...FILM.chapters].reverse().find((c) => t >= c.t) ?? FILM.chapters[0];

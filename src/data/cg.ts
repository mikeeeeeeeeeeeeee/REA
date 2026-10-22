/**
 * CG clips: short runs of the Blender renders made for the narrated intro (../intro_video), cut and encoded by
 * ../film/scripts/cg.py. Each clip comes in the page's two themes, with its first frame as poster. They illustrate;
 * the photos and frames elsewhere on the page come from the paper's runs. The files live in public/cg/; the
 * single-file build has no folder next to it, so it streams them from the published site.
 */
import type { Theme } from '@/theme/ThemeProvider';

export type CgClip = 'bowl' | 'behavior' | 'robotwin' | 'g1';

const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';

export const cgSrc = (clip: CgClip, theme: Theme) => `${BASE}cg/${clip}-${theme}.mp4`;
export const cgPoster = (clip: CgClip, theme: Theme) => `${BASE}cg/${clip}-${theme}.webp`;

/** what the chip on every clip says, and its tooltip */
export const CG_LABEL = 'CG illustration';
export const CG_NOTE = 'Rendered in Blender for the narrated intro. The photos and frames elsewhere on this page come from the paper’s runs.';

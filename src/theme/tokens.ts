/**
 * The palette, mirrored from the CSS custom properties in index.css for components that need
 * literal colors (WebGL effects, canvas, SVG gradients). Keep the two in sync.
 *
 * Colour means one thing everywhere on the page:
 *   s2 = System 2, the brain (an agent; orange, as in the paper's figures)
 *   s1 = System 1, the embodied router, i.e. REA itself (purple)
 *   s0 = System 0, the policies / cerebellum (blue)
 *   done / fail = the judge's verdicts (always shown with an icon and a word)
 *   base1..3 = baselines and single-policy arms in charts
 * The *-glow steps are brighter, decorative light for effects only, never data marks.
 */
export const TOKENS = {
  light: {
    paper: '#ffffff',
    paper2: '#f4f5f7',
    surface: '#ffffff',
    surface2: '#f6f7f9',
    ink: '#0f1218',
    ink2: '#3b424f',
    ink3: '#6a7180',
    ink4: '#9ca2ae',
    rule: '#e2e5ea',
    rule2: '#cdd2da',
    s2: '#ee6a2c',
    s1: '#9a37c3',
    s0: '#3b8ff0',
    s2g: '#ff8a4d',
    s1g: '#b45ce6',
    s0g: '#5aa6ff',
    s2w: '#fdeee6',
    s1w: '#f4eafa',
    s0w: '#e8f1fe',
    accent: '#9a37c3',
    accentInk: '#7d2aa1',
    accentWash: '#f4eafa',
    done: '#12a37b',
    fail: '#d8344f',
    base1: '#c8cdd5',
    base2: '#98a0ad',
    base3: '#5c6472',
    station: '#ffffff',
  },
  dark: {
    paper: '#0e1116',
    paper2: '#12161d',
    surface: '#151a22',
    surface2: '#1a2029',
    ink: '#eef0f4',
    ink2: '#aab1bf',
    ink3: '#737b8c',
    ink4: '#4e5564',
    rule: '#232a35',
    rule2: '#2f3744',
    s2: '#e46a2f',
    s1: '#9240cc',
    s0: '#3f97ee',
    s2g: '#ff8f55',
    s1g: '#b773ff',
    s0g: '#62b0ff',
    s2w: '#2a170e',
    s1w: '#22142f',
    s0w: '#0f1e33',
    accent: '#b06ae6',
    accentInk: '#cc9df3',
    accentWash: '#22142f',
    done: '#2bb889',
    fail: '#ef5a6f',
    base1: '#333a47',
    base2: '#566070',
    base3: '#8d95a5',
    station: '#0e1116',
  },
} as const;

export type Tokens = { [K in keyof (typeof TOKENS)['light']]: string };

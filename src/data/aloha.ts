/**
 * The ALOHA real-robot study, archived 2026-10-27 (../Aloha真机实验). Every number here comes from
 * 真机实验汇总_20261027.md and the per-case 案例说明.txt; successes and failures are the original
 * human labels, nothing re-scored. The videos are made from the raw files (tools/page_videos.py, the clips by hand).
 *
 * Two studies, reported apart because their setups and clocks differ:
 *   ALOHA_RUNS  four agents on the same arm, ten valid trials each, up to three grasps, no time limit
 *   PI05_RUNS   π0.5 alone and π0.5 inside REA (π0.5 + Code), ten trials each
 */

/** the keyframes and clips live in public/aloha, beside the CG clips; the single-file build streams them from the site */
const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';
const file = (name: string): string => `${BASE}aloha/${name}`;

export type MethodKey = 'codex' | 'agents' | 'aspire' | 'rea';

export const METHODS: Record<MethodKey, { label: string }> = {
  codex: { label: 'Codex' },
  agents: { label: 'Agents SDK' },
  aspire: { label: 'ASPIRE' },
  rea: { label: 'REA' },
};

/** trials 01–10 of the four-agent study, in order */
export const TRIALS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const;

export type Run = {
  key: MethodKey;
  /** per trial, in TRIALS order: did the block end up in the box and stay there */
  wins: boolean[];
  success: number;
  /** the summary's means over all ten trials: run time in seconds, model calls */
  meanTime: number;
  meanCalls: number;
};

export const ALOHA_RUNS: Run[] = [
  { key: 'codex', wins: [1, 0, 1, 0, 0, 1, 0, 0, 1, 1].map(Boolean), success: 5, meanTime: 1118.2, meanCalls: 32.1 },
  { key: 'agents', wins: [0, 0, 0, 1, 1, 1, 0, 0, 0, 1].map(Boolean), success: 4, meanTime: 1079.5, meanCalls: 38.1 },
  { key: 'aspire', wins: [0, 1, 0, 1, 1, 1, 1, 1, 1, 1].map(Boolean), success: 8, meanTime: 1314.9, meanCalls: 35.7 },
  { key: 'rea', wins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(Boolean), success: 10, meanTime: 1618.0, meanCalls: 41.1 },
];

/** what one success costs: everything the ten trials spent, divided by the trials that succeeded */
export const perSuccess = (mean: number, success: number) => (mean * TRIALS.length) / success;

export type Verdict = 'success' | 'grasp' | 'place';

export const VERDICT: Record<Verdict, string> = {
  success: 'in the box',
  grasp: 'grasp failed',
  place: 'not placed',
};

export type Ending = { id: string; method: MethodKey; trial: string; verdict: Verdict };

const ending = (id: string, verdict: Verdict): Ending => {
  const [method, trial] = id.split('-') as [MethodKey, string];
  return { id, method, trial, verdict };
};

/**
 * The archive's failed trial for each baseline, beside REA's trial 09: all four start with the blue block
 * next to the box. Codex 04 and Agents SDK 09 never get a grip on it; ASPIRE 03 lifts it but does not place it.
 * Their photos are sped up into public/aloha/endings.mp4 (tools/page_videos.py), in this order.
 */
export const ENDINGS: Ending[] = [ending('codex-04', 'grasp'), ending('agents-09', 'grasp'), ending('aspire-03', 'place'), ending('rea-09', 'success')];

/** the π0.5 study, trial by trial; π0.5 keeps its original numbers after two invalid records were dropped */
export const PI05_RUNS: { key: 'pi05' | 'rea'; label: string; detail: string; trials: [string, Verdict][] }[] = [
  {
    key: 'pi05',
    label: 'π0.5',
    detail: 'step 5000',
    trials: [
      ['01', 'place'],
      ['02', 'place'],
      ['03', 'place'],
      ['04', 'grasp'],
      ['05', 'grasp'],
      ['06', 'place'],
      ['07', 'success'],
      ['08', 'success'],
      ['09', 'success'],
      ['11', 'place'],
    ],
  },
  {
    key: 'rea',
    label: 'REA',
    detail: 'π0.5 + Code',
    trials: [
      ['01', 'success'],
      ['02', 'success'],
      ['03', 'success'],
      ['04', 'success'],
      ['05', 'success'],
      ['06', 'grasp'],
      ['07', 'success'],
      ['08', 'success'],
      ['09', 'grasp'],
      ['10', 'success'],
    ],
  },
];

/**
 * Trial 03 of each group on the right-wrist camera, cut to 9.4 s so that the gripper opens 6.5 s in on both:
 * π0.5's block lands on the table beside the box, REA's inside it. Real time, nothing else edited.
 */
export const RELEASE = {
  trial: '03',
  duration: 9.4,
  opens: 6.5,
  clips: [
    { key: 'pi05', label: 'π0.5', verdict: 'place' as Verdict, src: file('pi05-03-release.mp4'), poster: file('pi05-03-release.webp') },
    { key: 'rea', label: 'REA', verdict: 'success' as Verdict, src: file('rea-03-release.mp4'), poster: file('rea-03-release.webp') },
  ],
};

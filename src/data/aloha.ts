/**
 * The ALOHA real-robot study, archived 2026-10-27 (../Aloha真机实验). Every number here comes from
 * 真机实验汇总_20261027.md and the per-case 案例说明.txt; successes and failures are the original
 * human labels, nothing re-scored. The photos and videos are the raw files, resized here for the web.
 *
 * Two protocols, reported apart because their clocks differ:
 *   alohaTable  four methods, up to three grasps per trial, no time limit
 *   pi05Table   π0.5 against REA (π0.5 + Code), both under the same recorded protocol
 */

/** the keyframes and clips live in public/aloha, beside the CG clips; the single-file build streams them from the site */
const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';
const img = (name: string): string => `${BASE}aloha/${name}`;

/** the four methods of the head-to-head, in the order the summary lists them */
export type MethodKey = 'codex' | 'agents' | 'aspire' | 'rea';

export const METHODS: Record<MethodKey, { label: string; short: string; code: string }> = {
  codex: { label: 'Codex', short: 'Codex', code: 'Codex' },
  agents: { label: 'Agents SDK', short: 'Agents', code: 'Agents SDK' },
  aspire: { label: 'ASPIRE', short: 'ASPIRE', code: 'ASPIRE' },
  rea: { label: 'REA', short: 'REA', code: 'REA' },
};

/** trials 01–10 in order; true = the run placed the block and it stayed put */
export const TRIALS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] as const;

export type Run = {
  key: MethodKey;
  wins: boolean[];
  success: number;
  /** mean over all ten trials, seconds */
  mean: number;
  /** mean over the successful trials only, seconds */
  meanWin: number;
  actions: number;
  calls: number;
};

export const ALOHA_TABLE: Run[] = [
  { key: 'codex', wins: [1, 0, 1, 0, 0, 1, 0, 0, 1, 1].map(Boolean), success: 5, mean: 1118.2, meanWin: 1699.2, actions: 13.6, calls: 32.1 },
  { key: 'agents', wins: [0, 0, 0, 1, 1, 1, 0, 0, 0, 1].map(Boolean), success: 4, mean: 1079.5, meanWin: 1205.4, actions: 24.5, calls: 38.1 },
  { key: 'aspire', wins: [0, 1, 0, 1, 1, 1, 1, 1, 1, 1].map(Boolean), success: 8, mean: 1314.9, meanWin: 1222.2, actions: 30.1, calls: 35.7 },
  { key: 'rea', wins: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(Boolean), success: 10, mean: 1618.0, meanWin: 1618.0, actions: 34.1, calls: 41.1 },
];

/** the same ten trials under π0.5 and under REA, each run once by the operator */
export const PI05_TABLE = {
  arms: [
    { key: 'pi05', label: 'π0.5', detail: 'step 5000', success: 3, n: 10, activeMean: 16.57, activeMedian: 16.34, fullMean: 29.36, grab: 2, place: 5 },
    { key: 'rea', label: 'REA', detail: 'π0.5 + Code', success: 8, n: 10, activeMean: 128.89, activeMedian: 46.29, fullMean: 132.7, grab: 2, place: 0 },
  ],
  wins: true,
};

export type PhotoCase = {
  id: string;
  method: MethodKey;
  trial: string;
  outcome: 'success' | 'failure';
  /** four observations of the trial, each with the three cameras on the rig */
  stages: { obs: string; external: string; head: string; wrist: string }[];
};

const photo = (id: string, stages: string[]): PhotoCase => {
  const [method, trial] = id.split('-') as [MethodKey, string];
  return {
    id,
    method,
    trial,
    outcome: id === 'codex-04' || id === 'agents-09' || id === 'aspire-03' ? 'failure' : 'success',
    stages: stages.map((obs, i) => ({
      obs,
      external: img(`${id}-${i}-external.webp`),
      head: img(`${id}-${i}-head.webp`),
      wrist: img(`${id}-${i}-right_wrist.webp`),
    })),
  };
};

/** the seven trials photographed end to end; stages are start, two during, and the end state */
export const PHOTO_CASES: PhotoCase[] = [
  photo('codex-09', ['00001', '00024', '00031', '00040']),
  photo('codex-04', ['00001', '00006', '00011', '00016']),
  photo('agents-05', ['00001', '00013', '00018', '00026']),
  photo('agents-09', ['00001', '00015', '00028', '00042']),
  photo('aspire-07', ['00001', '00019', '00025', '00036']),
  photo('aspire-03', ['00001', '00009', '00017', '00019']),
  photo('rea-09', ['00001', '00025', '00034', '00044']),
];

/** which trial has evidence behind it, so the dot matrix can say so */

export type VideoCase = {
  id: string;
  arm: 'π0.5' | 'REA';
  trial: string;
  outcome: 'success' | 'failure';
  /** seconds of the original recording */
  duration: number;
  /** playback multiplier applied when encoding, so the page states it */
  speed: number;
  src: string;
  poster: string;
  note: string;
};

export const VIDEO_CASES: VideoCase[] = [
  { id: 'pi05-07', arm: 'π0.5', trial: '07', outcome: 'success', duration: 20.5, speed: 1, src: `${BASE}aloha/pi05-07.mp4`, poster: img('pi05-07-poster.webp'), note: 'Placement succeeds; the whole trial runs in 20.5 s.' },
  { id: 'rea-03', arm: 'REA', trial: '03', outcome: 'success', duration: 75.52, speed: 1, src: `${BASE}aloha/rea-03.mp4`, poster: img('rea-03-poster.webp'), note: 'Placement succeeds; the router calls Code five times.' },
  { id: 'pi05-03', arm: 'π0.5', trial: '03', outcome: 'failure', duration: 33.57, speed: 1, src: `${BASE}aloha/pi05-03.mp4`, poster: img('pi05-03-poster.webp'), note: 'Placement fails; the trial stops at 33.6 s.' },
  { id: 'rea-09', arm: 'REA', trial: '09', outcome: 'failure', duration: 551.53, speed: 16, src: `${BASE}aloha/rea-09.mp4`, poster: img('rea-09-poster.webp'), note: 'Grasp fails; 58 Code calls over 551 s, played at 16×.' },
];

export const VIDEO_PAIRS: { a: string; b: string; label: string }[] = [
  { a: 'pi05-07', b: 'rea-03', label: 'Both succeed' },
  { a: 'pi05-03', b: 'rea-09', label: 'Both fail' },
];

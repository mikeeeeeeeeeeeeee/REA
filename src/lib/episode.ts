import type { Episode, Verdict } from '@/data/types';

/**
 * Turns one logged episode into a replayable timeline.
 *
 * Episode time is real wall-clock seconds from the log: skill runs and judge calls back to back
 * (their sum is the episode's `wall`). Replay time is what the visitor watches: skill runs are
 * sped up, judge calls play at about real speed, and short holds let the verdicts be read.
 */
export type Phase = 'dispatch' | 'run' | 'judge' | 'verdict' | 'stop';

export type Key = {
  phase: Phase;
  /** replay seconds */
  r0: number;
  r1: number;
  /** episode seconds */
  e0: number;
  e1: number;
  run: number; // index of the run this key belongs to (or the run just finished)
};

export type RunSpan = { i: number; which: string; e0: number; e1: number; from: number; to: number; steps: number };
export type JudgeSpan = { i: number; e0: number; e1: number; verdict: Verdict; rationale: string; confidence: number | null; latency: number };

export type Timeline = {
  ep: Episode;
  keys: Key[];
  runs: RunSpan[];
  judges: JudgeSpan[];
  /** total replay seconds, including the end hold */
  total: number;
  /** episode seconds */
  wall: number;
};

export type ReplayState = {
  r: number;
  e: number;
  phase: Phase;
  /** run in progress, or the last run that finished */
  run: number;
  /** 0..1 within the current key */
  k: number;
  steps: number;
  /** index into ep.frames of the latest available camera frame */
  frame: number;
  /** verdicts already returned */
  verdicts: number;
  done: boolean;
};

export function buildTimeline(
  ep: Episode,
  opts: { runSpeed?: number; minRun?: number; judgeSpeed?: number; dispatchHold?: number; verdictHold?: number; endHold?: number } = {}
): Timeline {
  const { runSpeed = 9, minRun = 1.8, judgeSpeed = 1, dispatchHold = 1.5, verdictHold = 1.6, endHold = 3.2 } = opts;
  const keys: Key[] = [];
  const runs: RunSpan[] = [];
  const judges: JudgeSpan[] = [];
  let r = 0;
  let e = 0;
  keys.push({ phase: 'dispatch', r0: 0, r1: dispatchHold, e0: 0, e1: 0, run: 0 });
  r = dispatchHold;
  ep.runs.forEach((run, i) => {
    const rd = Math.max(minRun, run.wall / runSpeed);
    keys.push({ phase: 'run', r0: r, r1: r + rd, e0: e, e1: e + run.wall, run: i });
    runs.push({ i, which: run.which, e0: e, e1: e + run.wall, from: run.from, to: run.to, steps: run.steps });
    r += rd;
    e += run.wall;
    const j = ep.judges.find((x) => x.after === i);
    if (j) {
      const jd = Math.max(0.9, j.latency / judgeSpeed);
      keys.push({ phase: 'judge', r0: r, r1: r + jd, e0: e, e1: e + j.latency, run: i });
      judges.push({ i, e0: e, e1: e + j.latency, verdict: j.verdict, rationale: j.rationale ?? '', confidence: j.confidence, latency: j.latency });
      r += jd;
      e += j.latency;
      const last = i === ep.runs.length - 1;
      keys.push({ phase: last ? 'stop' : 'verdict', r0: r, r1: r + (last ? endHold : verdictHold), e0: e, e1: e, run: i });
      r += last ? endHold : verdictHold;
    }
  });
  if (keys[keys.length - 1].phase !== 'stop') {
    keys.push({ phase: 'stop', r0: r, r1: r + endHold, e0: e, e1: e, run: ep.runs.length - 1 });
    r += endHold;
  }
  return { ep, keys, runs, judges, total: r, wall: e };
}

export function stateAt(tl: Timeline, r: number): ReplayState {
  const keys = tl.keys;
  const rr = Math.max(0, Math.min(r, tl.total - 1e-6));
  let key = keys[0];
  for (const k of keys) {
    if (rr >= k.r0) key = k;
    else break;
  }
  const k = key.r1 > key.r0 ? (rr - key.r0) / (key.r1 - key.r0) : 1;
  const e = key.e0 + (key.e1 - key.e0) * k;
  const run = tl.ep.runs[key.run];
  let steps: number;
  let frame: number;
  let verdicts = tl.judges.filter((j) => j.e1 <= e + 1e-6 && (j.i < key.run || key.phase !== 'judge')).length;
  if (key.phase === 'dispatch') {
    steps = tl.ep.runs[0]?.from ?? 0;
    frame = 0;
    verdicts = 0;
  } else if (key.phase === 'run') {
    steps = Math.round(run.from + (run.to - run.from) * k);
    frame = key.run; // the frame the run started from
  } else {
    steps = run.to;
    frame = key.run + 1; // the frame after this run
  }
  if (key.phase === 'judge') verdicts = key.run;
  if (key.phase === 'verdict' || key.phase === 'stop') verdicts = key.run + 1;
  return { r: rr, e, phase: key.phase, run: key.run, k, steps, frame, verdicts, done: key.phase === 'stop' };
}

export const nameOf = (which: string) => (which === 'evo' ? 'Evo' : which === 'fix' ? 'Fix' : which);

export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

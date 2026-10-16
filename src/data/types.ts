export type Verdict = 'done' | 'not_done';

/** One held-out LIBERO-Pro episode, exactly as the judge-gated router logged it. */
export type Episode = {
  id: string;
  suite: string;
  task: string;
  seed: number;
  instruction: string;
  blurb: string;
  success: boolean;
  /** control steps used, of `horizon` */
  steps: number;
  horizon: number;
  /** wall-clock seconds used, of `budget` (includes judge latency) */
  wall: number;
  budget: number;
  judgeLatency: number;
  route: {
    choice: string;
    other: string | null;
    ladder: string[];
    reason: string;
    evidence: Record<string, { successes: number; n: number; stepsPerSuccess: number | null }>;
  };
  runs: { which: string; steps: number; from: number; to: number; wall: number; exception: string | null; truncated: boolean }[];
  judges: { after: number; verdict: Verdict; confidence: number | null; rationale: string | null; latency: number }[];
  /** initial frame, then the frame after each run (800×512 agent view) */
  frames: string[];
};

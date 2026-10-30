/**
 * The numbers the page charts, copied from the paper (arXiv version of 2026-10-30; tables and figures
 * cited per block). Success intervals are Wilson 95% intervals, computed from the counts as in the paper.
 */

export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - m) / d, (c + m) / d];
}

/** Figure 7 (BEHAVIOR-1K: Table 15; RoboTwin 2.0: Appendix C.2; Unitree G1: Table 18): portability. Successes per method. */
export const PORTABILITY = [
  {
    key: 'behavior',
    bench: 'BEHAVIOR-1K',
    detail: '50 test episodes, R1Pro in Isaac Sim; vs the Agents SDK agent 7:5, not significant',
    n: 50,
    rows: [
      { key: 'show', label: 'Show-Harness', k: 3 },
      { key: 'codex', label: 'Codex', k: 18 },
      { key: 'aspire', label: 'ASPIRE', k: 18 },
      { key: 'sdk', label: 'Agents SDK', k: 25 },
      { key: 'rea', label: 'REA', k: 27 },
    ],
  },
  {
    key: 'robotwin',
    bench: 'RoboTwin 2.0',
    detail: '200 bimanual test scenes; REA from a later night, Codex from the night they ran side by side, when REA solved 97 vs 75',
    n: 200,
    rows: [
      { key: 'show', label: 'Show-Harness', k: 12 },
      { key: 'codex', label: 'Codex', k: 75 },
      { key: 'aspire', label: 'ASPIRE', k: 105 },
      { key: 'sdk', label: 'Agents SDK', k: 103 },
      { key: 'rea', label: 'REA', k: 133 },
    ],
  },
  {
    key: 'g1',
    bench: 'Unitree G1',
    detail: '10 real walk-and-push-chair trials each, operator-judged; vs ASPIRE p = 0.023',
    n: 10,
    rows: [
      { key: 'show', label: 'Show-Harness', k: null as number | null },
      { key: 'codex', label: 'Codex', k: 4 },
      { key: 'aspire', label: 'ASPIRE', k: 2 },
      { key: 'sdk', label: 'Agents SDK', k: 5 },
      { key: 'rea', label: 'REA', k: 8 },
    ],
  },
];

/** Table 15: BEHAVIOR-1K per task (successes of 10). */
export const BEHAVIOR_TASKS = {
  tasks: ['trash', 'radio', 'teddy', 'drill', 'camera'],
  rows: [
    { label: 'Codex + GPT-6 (frozen program)', values: [6, 6, 5, 1, 0], seconds: 994 },
    { label: 'ASPIRE-style Fix (frozen program)', values: [7, 6, 4, 1, 0], seconds: 853 },
    { label: 'Show-Harness (online)', values: [0, 2, 1, 0, 0], seconds: 1492 },
    { label: 'Agents SDK agent (online)', values: [9, 8, 7, 0, 1], seconds: 1049 },
    { label: 'REA (routed runtime)', values: [9, 7, 5, 1, 5], seconds: 1122 },
  ],
};

/** Table 19: G1 request latency (medians over 5–8 trials on the robot's Jetson). */
export const G1_LATENCY = [
  { stage: 'Original bridge', latency: '≈5 s', value: 5 },
  { stage: 'Fast harness', latency: '1.17–1.9 s', value: 1.5 },
  { stage: 'Service, single-shot', latency: '0.95 s', value: 0.95 },
  { stage: 'Service, pipeline', latency: '1.0–3.6 ms', value: 0.0023 },
];

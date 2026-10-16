/**
 * Every number on the page, copied from the paper (tables and figures cited per block).
 * Success intervals are Wilson 95% intervals, computed from the counts as in the paper.
 */

export function wilson(k: number, n: number, z = 1.96): [number, number] {
  if (!n) return [0, 0];
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - m) / d, (c + m) / d];
}

/** Headline numbers (abstract, Sections 4.2–4.6). */
export const HEADLINE = {
  success: 95.9,
  bestAuthor: 94.7,
  heldOut: 3000,
  tasks: 60,
  fewerSteps: 25,
  lessTime: 17,
  judgeGain: 3.1,
  judgeCost: 2.1,
  stressGain: 15.3,
  studyEpisodes: 30000,
};

export type Arm = {
  key: string;
  label: string;
  group: 'single' | 'routed' | 'ceiling' | 'online';
  calls: number | null;
  all60: number;
  aligned37: number;
  stepsPerSucc: number | null;
  atLeast?: boolean;
  note?: string;
};

/** Table 1: LIBERO-Pro full set, 60 tasks × 50 held-out seeds (3,000 episodes per arm). */
export const TABLE1: Arm[] = [
  { key: 'codex', label: 'Codex + GPT-6', group: 'single', calls: 0, all60: 74.4, aligned37: 81.2, stepsPerSucc: 1470 },
  { key: 'aspire', label: 'ASPIRE Fix', group: 'single', calls: 0, all60: 65.1, aligned37: 71.9, stepsPerSucc: 1566, note: '59 / 36 tasks' },
  { key: 'sdk', label: 'Agents SDK + GPT-6', group: 'single', calls: 0, all60: 94.7, aligned37: 93.7, stepsPerSucc: 1343, note: 'best on development seeds' },
  { key: 'random', label: 'Random author per task', group: 'single', calls: 0, all60: 78.2, aligned37: 82.5, stepsPerSucc: null },
  { key: 'k0', label: 'Route memory only (K = 0)', group: 'routed', calls: 0, all60: 95.7, aligned37: 95.1, stepsPerSucc: null, atLeast: true },
  { key: 'rea-m', label: 'REA-M (memory + ladder)', group: 'routed', calls: 0, all60: 95.9, aligned37: 95.3, stepsPerSucc: 1003 },
  { key: 'rea-a', label: 'REA-A (agent at dispatch)', group: 'routed', calls: 1.0, all60: 95.9, aligned37: 95.5, stepsPerSucc: 1110 },
  { key: 'oracle', label: 'Hindsight per-task oracle', group: 'ceiling', calls: null, all60: 96.9, aligned37: 96.3, stepsPerSucc: null },
  { key: 'show', label: 'Show-Harness + GPT-6 (zero-shot)', group: 'online', calls: 34.4, all60: 2.6, aligned37: 1.8, stepsPerSucc: 31875 },
];

/** Table 3 / Figure 4: speed on the full set, one host. Control time excludes the 2.6–2.7 s reset. */
export const SPEED = [
  { key: 'sdk', label: 'Agents SDK + GPT-6', where: 'offline', calls: 0, success: 94.7, k: 2841, control: 12.04, wait: 0, delta: -10 },
  { key: 'advisor', label: 'Blocking advisor', where: 'in the loop', calls: 1.71, success: 94.1, k: 2823, control: 13.33, wait: 2.62, delta: 0 },
  { key: 'rea-a', label: 'REA-A', where: 'at dispatch', calls: 1.0, success: 95.9, k: 2876, control: 11.36, wait: 0.73, delta: -15 },
  { key: 'rea-m', label: 'REA-M', where: 'offline', calls: 0, success: 95.9, k: 2876, control: 9.96, wait: 0, delta: -25 },
] as const;

/** Table 4 / Figure 6: where should System 2 sit? Seeds 1–10, 600 episodes per arm, legacy library. */
export const PLACEMENT = [
  { key: 'offline', where: 'Offline', config: 'REA-M: route memory', calls: 0, s2: 0, success: 91.0, bc: '', kind: 'offline' },
  { key: 'dispatch', where: 'At dispatch', config: 'Agent picks the first skill', calls: 0.98, s2: 0.63, success: 91.3, bc: '6:4', kind: 'boundary' },
  { key: 'recovery', where: 'At recovery', config: 'Agent picks escalations', calls: 0.01, s2: 0.01, success: 91.3, bc: '4:2', kind: 'boundary' },
  { key: 'both', where: 'Dispatch + recovery', config: 'REA-A', calls: 0.99, s2: 0.64, success: 91.5, bc: '6:3', kind: 'boundary' },
  { key: 'completion', where: '+ completion judge', config: 'REA-A + agent judge', calls: 4.18, s2: 7.18, success: 91.3, bc: '12:10', kind: 'boundary' },
  { key: 'cap-text', where: 'Caption judge', config: 'Text model reads scene captions', calls: 3.13, s2: 9.57, success: 89.7, bc: '11:19', kind: 'caption' },
  { key: 'cap-agent', where: 'Caption judge', config: 'Agent reads scene captions', calls: 3.23, s2: 7.94, success: 88.8, bc: '9:22', kind: 'caption' },
  { key: 'policy-agent', where: 'In the control loop', config: 'Agent as a Cartesian policy', calls: 52.9, s2: 121.8, success: 0.0, bc: '0:546', kind: 'loop' },
  { key: 'policy-text', where: 'In the control loop', config: 'Text model as a Cartesian policy', calls: 90.1, s2: 228.7, success: 0.0, bc: '0:546', kind: 'loop' },
] as const;

/** Table 6 / Figure 9: REA on skills from two very different System 2 authors (seeds 1–10). */
export const AUTHORS_STUDY = [
  {
    key: 'zero',
    author: 'GPT-6 zero-shot skills',
    n: 600,
    arms: [
      { label: 'Skills only', k: 116, steps: 4299 },
      { label: '+ REA-V', k: 158, steps: 6023, bc: '50:8' },
    ],
  },
  {
    key: 'aspire',
    author: 'ASPIRE Fix-loop skills',
    n: 590,
    arms: [
      { label: 'Skills only', k: 391, steps: 1557 },
      { label: '+ REA-M', k: 424, steps: 1467, bc: '49:16' },
      { label: '+ REA-V', k: 442, steps: 2513, bc: '73:22' },
    ],
  },
] as const;

/** Table 11 / Figure 5: router ablation on the matched hard subset (6 tasks × 12 seeds = 72 episodes per arm). */
export const ABLATION = [
  { key: 'fix', label: 'Single skill (Fix)', memory: false, gate: '–', k: 21, steps: 4569 },
  { key: 'evo', label: 'Single skill (Evo)', memory: false, gate: '–', k: 40, steps: 2369, best: true },
  { key: 'retry', label: 'Blind retry', memory: false, gate: 'always', k: 24, steps: 6812 },
  { key: 'nomem', label: 'REA-V w/o route memory', memory: false, gate: 'judge', k: 39, steps: 4432 },
  { key: 'rea-m', label: 'REA-M (exception gate)', memory: true, gate: 'exception', k: 37, steps: 2657 },
  { key: 'rea-v', label: 'REA-V (full)', memory: true, gate: 'judge', k: 48, steps: 3510 },
] as const;

/** Figure 11 / Table 10: successes out of 12 per task on the matched subset. */
export const PER_TASK = {
  tasks: [
    { key: 'GS-drawer', name: 'Open drawer, put bowl', first: 'Evo' },
    { key: 'GT-drawer', name: 'Open drawer, put cream cheese', first: 'Fix' },
    { key: 'OT-butter', name: 'Butter into basket', first: 'Evo' },
    { key: 'SS-between', name: 'Bowl between plate and ramekin', first: 'Evo' },
    { key: 'SS-center', name: 'Bowl from table center', first: 'Fix*' },
    { key: 'SS-ramekin', name: 'Bowl on ramekin', first: 'Fix' },
  ],
  arms: [
    { key: 'fix', label: 'Single skill (Fix)', values: [3, 4, 2, 4, 3, 5] },
    { key: 'evo', label: 'Single skill (Evo)', values: [11, 5, 2, 12, 7, 3] },
    { key: 'rea-m', label: 'REA-M (exception gate)', values: [11, 5, 2, 12, 4, 3] },
    { key: 'rea-v', label: 'REA-V (full)', values: [12, 5, 4, 12, 9, 6] },
  ],
};

/** Table 14: what the judge gate did, episode by episode (proxy for the first run: REA-M). */
export const ATTRIBUTION = {
  matched: { rescued: 7, notRescued: 22, survived: 20, harmed: 1, forfeited: 1, kept: 16, variance: 5, n: 72, paired: '+12 / −1', p: '0.003' },
  libero: { rescued: 28, notRescued: 117, survived: 198, harmed: 19, forfeited: 12, kept: 207, variance: 9, n: 590, paired: '+37 / −19', p: '0.022' },
};

/** Judge calibration (Table 13) and held-out confusion of the final verdict (Appendix B.6). */
export const JUDGE = {
  calibration: [
    { prompt: 'default', initial: false, acc: 0.671, prec: 0.105, rec: 0.036, latency: 1.6 },
    { prompt: 'default', initial: true, acc: 0.792, prec: 0.587, rec: 0.661, latency: 1.6, frozen: true },
    { prompt: 'evidence', initial: false, acc: 0.699, prec: 0.345, rec: 0.179, latency: 1.93 },
    { prompt: 'evidence', initial: true, acc: 0.694, prec: 0.447, rec: 0.75, latency: 2.01 },
  ],
  majority: 0.741,
  labels: 216,
  confusion: {
    matched: { tp: 35, fp: 7, fn: 13, tn: 17, precision: 0.83 },
    libero: { tp: 276, fp: 29, fn: 166, tn: 119, precision: 0.905 },
  },
};

/** Figure 7 / Tables 15 and 18: portability. Successes per method. */
export const PORTABILITY = [
  {
    key: 'behavior',
    bench: 'BEHAVIOR-1K',
    detail: '50 held-out episodes, R1Pro in Isaac Sim; vs the Agents SDK agent 7:5, not significant',
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
    detail: '200 held-out bimanual scenes, later-night run; side by side with Codex the same night, REA solved 97 vs 75',
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

/** Table 5: development budgets. */
export const DEV_BUDGET = [
  { label: 'Codex + GPT-6 authoring', episodes: 1328, tokens: '89.0M', result: '75.0%' },
  { label: 'Agents SDK + GPT-6 authoring', episodes: 1249, tokens: '28.8M', result: '95.3%' },
  { label: 'REA route memory (all 179 programs)', episodes: 1790, tokens: '0', result: 'lookup' },
];

/** Section 1 / Appendix C.3: what goes wrong when the brain drives directly. */
export const BRAIN_AS_CONTROLLER = {
  oneToken: { solved: 1, of: 1987 },
  cartesian: { solved: 0, of: 600 },
  showHarness: { solved: 78, of: 3000, budgetHit: 2806, callsPerEpisode: 34 },
  aspireMinutes: 43,
  codexTokens: '89M',
};

/** Section 1 / 4.3: the two coordination failure modes, measured. */
export const COORDINATION = {
  advisorIdle: 2.62,
  advisorIdleShare: 20,
  advisorFirstActionDelay: 1.5,
  exceptionEscalations: 6,
  exceptionEpisodes: 590,
  exceptionFailed: 166,
};

/**
 * Paper metadata. Links that are not public yet stay empty: the page then shows the button
 * as "soon" instead of a dead link. Fill them in and rebuild.
 */
export const LINKS = {
  arxiv: '', // e.g. 'https://arxiv.org/abs/26xx.xxxxx'
  pdf: '', // e.g. 'https://arxiv.org/pdf/26xx.xxxxx'
  code: '', // e.g. 'https://github.com/<org>/rea'
  video: '', // e.g. a YouTube / Bilibili link for the real-robot video
};

export const PAPER = {
  title: 'REA: A Routed Embodied Agent Runtime for Asynchronous Brain-Cerebellum Control',
  name: 'REA',
  expansion: 'Routed Embodied Agent',
  subtitle: 'A Routed Embodied Agent Runtime for Asynchronous Brain–Cerebellum Control',
  date: 'October 2026',
  rule: 'No running policy waits on the brain.',
};

export const AUTHORS: { name: string; aff: number[]; corresponding?: boolean }[] = [
  { name: 'Pengfei Zhou', aff: [1, 2] },
  { name: 'Yixing Ma', aff: [2, 3] },
  { name: 'Zhengfeiyang Zhang', aff: [2, 4] },
  { name: 'Haoyuan Chen', aff: [2, 5] },
  { name: 'Zhenglin Wan', aff: [1] },
  { name: 'Hexin Wang', aff: [2], corresponding: true },
  { name: 'Wangbo Zhao', aff: [6], corresponding: true },
  { name: 'Yang You', aff: [1], corresponding: true },
];

export const AFFILIATIONS = [
  'National University of Singapore, HPC-AI Lab',
  'InfRec, Cardinal AI Lab',
  'University of California, Berkeley',
  'The University of Tokyo',
  'Shenzhen Institutes of Advanced Technology, Chinese Academy of Sciences',
  'Hong Kong University of Science and Technology',
];

export const CONTACT = ['wanghexin@infrec.tech', 'wangbo.zhao96@gmail.com', 'yangyou@nus.edu.sg'];

/** the abstract of the arXiv version of 2026-10-30 */
export const ABSTRACT = [
  'Foundation models are becoming remarkably reliable at high-level reasoning, yet they remain too slow and costly to serve as fine-grained controllers. Conversely, fast policies like VLAs and whole-body controllers offer more efficient reflexes, but struggle to generalize. While pairing a deliberative brain (foundation models) with a reactive cerebellum (fast policies) seems natural for embodied systems, two obstacles remain: methods are built and scored on incompatible stacks, and their asynchronous coordination is difficult. For example, an agent that calls the VLA in the agentic loop can stall the fast execution, while a VLA that calls the agent on errors tends to re-trigger fallbacks repeatedly or completely miss silent failures.',
  'To address this, we propose REA (Routed Embodied Agent), a unified runtime where a deliberative System 2, an embodied router System 1 and reactive System 0 policies cooperate under a single golden rule: no running policy waits on the brain. Instead of querying the brain at each failure, REA employs a route memory that stores each policy’s measured success ahead of time, a boundary-triggered judge gate that consults the brain on policy execution, and a shared-budget escalation ladder for bounded recovery.',
  'Evaluated on 3,000 test episodes across 60 LIBERO-Pro tasks, REA reaches 95.9% success and beats the best single-agent baseline in its own policy pool (94.7%) while reducing control steps by 25% and control time by 17%. In a separate 100-episode RoboTwin 2.0 study, REA achieves 84% success with VLA policies and 86% with VLA+code, compared with 80% for the strongest single VLA baseline MEDex. These results demonstrate learned and programmatic policies operating within the same runtime. REA also transfers to BEHAVIOR-1K and a real Unitree G1 humanoid, achieving the highest observed success among the compared methods.',
];

export const BIBTEX = `@article{zhou2026rea,
  title   = {{REA}: A Routed Embodied Agent Runtime for Asynchronous
             Brain-Cerebellum Control},
  author  = {Zhou, Pengfei and Ma, Yixing and Zhang, Zhengfeiyang and
             Chen, Haoyuan and Wan, Zhenglin and Wang, Hexin and
             Zhao, Wangbo and You, Yang},
  journal = {arXiv preprint},
  year    = {2026}
}`;

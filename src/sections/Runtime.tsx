import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import BrainCalls from '@/components/viz/BrainCalls';
import RouteSwitch from '@/components/viz/RouteSwitch';
import LogoLoop from '@/components/reactbits/LogoLoop/LogoLoop';
import SpotlightCard from '@/components/reactbits/SpotlightCard/SpotlightCard';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LINES, LineBadge, type LineId } from '@/components/ui/Line';
import { ROBOTWIN } from '@/data/gen/robotwin';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';

type Guide = {
  line: LineId;
  role: string;
  what: string;
  runs: string;
  calls: { sig: string; note: string }[];
  never: string;
};

const GUIDE: Guide[] = [
  {
    line: 's2',
    role: 'The brain',
    what: 'An agent. Offline it generates the policies; online it only answers questions between policies.',
    runs: 'offline, then once per policy return',
    calls: [
      { sig: 'Generate(t) → Pₜ', note: 'candidate policies for task t' },
      { sig: 'Judge(f₀, fₖ, ℓₜ) → done | not_done', note: 'first frame, current frame, instruction' },
      { sig: 'Advise(o) → p', note: 'optional: recommend a policy from text' },
    ],
    never: 'emits an action, or reads simulator state, rewards or object poses',
  },
  {
    line: 's1',
    role: 'The router',
    what: 'REA itself. It owns every control-flow decision and emits no actions of its own.',
    runs: 'at every boundary: dispatch, escalate, stop',
    calls: [
      { sig: 'first(t) = argmaxₚ r̂ₜ,ₚ', note: 'route memory; ties go to fewer steps' },
      { sig: 'Lₜ = [first, other, first]', note: 'the escalation ladder' },
      { sig: 'Score()', note: 'read once, after the last run' },
    ],
    never: 'makes a running policy wait, or reads the success predicate before the end',
  },
  {
    line: 's0',
    role: 'The policies',
    what: 'The cerebellum: frozen programs, VLA policies or whole-body controllers, each running its own closed loop at native rate.',
    runs: 'end to end, at their own rate',
    calls: [{ sig: 'Run(p; H − u, W − w) → (Δ, δ, e, τ)', note: 'steps and seconds used, exception, truncation' }],
    never: 'waits for the brain while it runs',
  },
];

export default function Runtime() {
  const { t, theme } = useTheme();
  return (
    <section id="runtime" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Three lines, one contract</SectionTitle>
          <p className="lede">
            Every method in the paper, REA and the baselines alike, is a configuration of one runtime with three levels that meet only at
            boundaries.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {GUIDE.map((g, i) => (
            <motion.div
              key={g.line}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <SpotlightCard
                theme={theme}
                spotlightColor={`${g.line === 's2' ? t.s2 : g.line === 's1' ? t.s1 : t.s0}40`}
                className="flex h-full flex-col overflow-hidden rounded-[18px] !p-0"
                style={{ '--spotlight-card-surface': t.surface } as React.CSSProperties}
              >
                <div className="h-[10px]" style={{ background: LINES[g.line].color }} />
                <div className="relative aspect-[16/10] overflow-hidden border-b border-rule bg-[#0b0e14]">
                  <GuideVisual line={g.line} />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <LineBadge line={g.line} size={17} />
                    <div>
                      <p className="title-card leading-none text-ink">{g.role}</p>
                      <p className="mt-1 text-[13px] font-[600] text-ink-3">{LINES[g.line].system}, runs {g.runs}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[15.5px] leading-[1.55] text-ink-2">{g.what}</p>
                  <ul className="mt-4 space-y-2.5">
                    {g.calls.map((c) => (
                      <li key={c.sig} className="rounded-lg border border-rule bg-surface-2 px-3 py-2">
                        <code className="code block text-[13.5px] font-[560] text-ink">{c.sig}</code>
                        <span className="mt-0.5 block text-[12.5px] text-ink-3">{c.note}</span>
                      </li>
                    ))}
                  </ul>
                  {/* the rule each level keeps, level along the bottom of the three cards */}
                  <div className="mt-auto pt-5">
                    <p className="border-t border-rule pt-4 text-[14px] leading-[1.5] text-ink-2">
                      <span className="font-[700] text-ink">Never </span>
                      {g.never}.
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* every backend implements the same contract */}
        <div className="mt-14 border-y border-rule py-5">
          <p className="label mb-3 text-center">Backends and tools behind the one contract</p>
          <LogoLoop
            logos={BACKENDS.map((b) => ({
              node: (
                <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3.5 py-1.5 text-[14px] font-[640] text-ink [font-stretch:92%]">
                  <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                  {b.name}
                  <span className="font-[520] text-ink-3">{b.role}</span>
                </span>
              ),
              title: `${b.name}: ${b.role}`,
            }))}
            speed={38}
            gap={14}
            logoHeight={34}
            pauseOnHover
            fadeOut
            fadeOutColor={t.paper}
            ariaLabel="Backends and tools"
          />
        </div>
      </Container>
    </section>
  );
}

// simulators and robots are backends (neutral); tools run inside the policies (S0); policy-generation methods write them (S2)
const BACKENDS: { name: string; role: string; color: string }[] = [
  { name: 'LIBERO-Pro', role: 'MuJoCo, robosuite', color: 'var(--ink-3)' },
  { name: 'BEHAVIOR-1K', role: 'OmniGibson, Isaac Sim', color: 'var(--ink-3)' },
  { name: 'RoboTwin 2.0', role: 'SAPIEN', color: 'var(--ink-3)' },
  { name: 'Unitree G1', role: 'real humanoid', color: 'var(--ink-3)' },
  { name: 'SAM 3', role: 'segmentation, inside policies', color: 'var(--s0)' },
  { name: 'ContactGraspNet', role: 'grasps, inside policies', color: 'var(--s0)' },
  { name: 'PyRoki', role: 'inverse kinematics, inside policies', color: 'var(--s0)' },
  { name: 'Codex CLI', role: 'writes policies', color: 'var(--s2)' },
  { name: 'Agents SDK', role: 'writes policies', color: 'var(--s2)' },
  { name: 'ASPIRE', role: 'Fix loop, Evo search', color: 'var(--s2)' },
];

function GuideVisual({ line }: { line: LineId }) {
  if (line === 's0') return <PolicyFeed />;
  return (
    <div className="absolute inset-0">
      {line === 's2' ? <BrainCalls /> : <RouteSwitch />}
      <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11.5px] font-[650] text-white/90 backdrop-blur-sm">
        {line === 's2' ? 'slow, general, asked rarely' : 'throws the points before the train arrives'}
      </span>
    </div>
  );
}

/** a real policy at work: RoboTwin 2.0 head camera, one frame per decision */
function PolicyFeed() {
  const scene = ROBOTWIN[0];
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!near || reduce) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % scene.steps.length), 520);
    return () => window.clearInterval(id);
  }, [near, reduce, scene.steps.length]);
  const step = scene.steps[i];
  return (
    <div ref={ref} className="absolute inset-0">
      {scene.steps.map((s, k) => (
        <img key={s.image} src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ opacity: k === i ? 1 : 0, transition: 'opacity 260ms linear' }} draggable={false} />
      ))}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.12)_0_1px,transparent_1px_3px)] mix-blend-multiply" />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-[650] text-white backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full bg-[#ff4d5e]" style={{ animation: 'rea-blink 1.2s ease-in-out infinite' }} />
        RoboTwin 2.0, test scene
      </div>
      <div className="tabular absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-[650] text-white/90 backdrop-blur-sm">
        decision {step.step + 1} / {scene.decisions}
      </div>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[11.5px] font-[650] text-white/90 backdrop-blur-sm">
        {scene.title.toLowerCase()}, {step.arm || 'both'} arm
      </span>
    </div>
  );
}

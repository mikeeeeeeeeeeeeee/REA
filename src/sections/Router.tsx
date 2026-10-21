import { useState } from 'react';
import { motion } from 'motion/react';
import DepartureBoard, { ROUTES } from '@/components/viz/DepartureBoard';
import JudgeCheckpoint from '@/components/viz/JudgeCheckpoint';
import LadderBudget from '@/components/viz/LadderBudget';
import CountUp from '@/components/reactbits/CountUp/CountUp';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { JUDGE } from '@/data/results';

function ModuleHead({ n, name, title, children }: { n: number; name: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2.5 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
        <LineBadge line="s1" size={13} />
        Module {n}: {name}
      </p>
      <h3 className="sign-lg mt-3 text-[clamp(2rem,3.6vw,3.2rem)] text-ink">{title}</h3>
      <div className="mt-5 space-y-4 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">{children}</div>
    </div>
  );
}

function Fact({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="border-l-[3px] border-s1 pl-3">
      <div className="text-[26px] font-[760] leading-none text-ink [font-stretch:86%]">{value}</div>
      <div className="mt-1 text-[13px] leading-snug text-ink-3">{label}</div>
    </div>
  );
}

export default function Router() {
  const [row, setRow] = useState(0);
  const r = ROUTES[row];
  const frozen = JUDGE.calibration.find((c) => c.frozen)!;
  const noInitial = JUDGE.calibration[0];

  return (
    <section id="router" className="relative scroll-mt-20 bg-paper-2 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>One router, three modules</SectionTitle>
          <p className="lede">
            System 1 owns every control-flow decision: which skill runs, when to ask the brain, when to stop. Each of its modules answers one of
            the coordination problems above, and none of them makes a running skill wait.
          </p>
        </div>

        {/* 1. route memory */}
        <div className="mt-20 grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ModuleHead n={1} name="route memory" title="Dispatch without asking the brain">
            <p>
              Before any test episode, the router replays each candidate skill on development episodes, with seeds disjoint from the test
              seeds, and stores its success rate and mean steps. At test time the first skill is a lookup: <b>highest success, ties broken by
              fewer steps</b>.
            </p>
            <div className="grid grid-cols-2 gap-5 pt-2">
              <Fact value="0" label="model tokens to build it" />
              <Fact value={<CountUp to={1790} separator="," duration={1.6} />} label="development episodes, for all 179 programs" />
            </div>
          </ModuleHead>
          <div>
            <DepartureBoard selected={row} onSelect={setRow} />
            <div className="mt-4 grid gap-4 rounded-2xl border border-rule bg-surface p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="space-y-2.5">
                <EvidenceBar label="Fix" k={r.fix[0]} n={r.fix[1]} win={r.first === 'FIX'} />
                {r.evo ? <EvidenceBar label="Evo" k={r.evo[0]} n={r.evo[1]} win={r.first === 'EVO'} /> : <p className="text-[13.5px] text-ink-3">Evo: byte-identical to Fix on this task, so both count as Fix evidence.</p>}
              </div>
              <p className="max-w-[24ch] text-[14.5px] leading-snug text-ink-2">
                <b className="font-[720] text-ink">{r.first === 'EVO' ? 'Evo' : 'Fix'} goes first</b>: {r.why}. Ladder {r.ladder.toLowerCase().split(' ').map((w) => (w === 'evo' ? 'Evo' : 'Fix')).join(', ')}.
              </p>
            </div>
          </div>
        </div>

        {/* 2. judge gate */}
        <div className="mt-28 grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="order-2 lg:order-1">
            <JudgeCheckpoint />
          </div>
          <div className="order-1 lg:order-2">
            <ModuleHead n={2} name="judge gate" title="Ask the brain when a skill returns">
              <p>
                Most failures are silent: the skill returns with no error and the task unfinished, so an exception never fires. REA asks the
                visual judge <b>once per skill return</b>, with the episode's first frame, the current frame and the instruction.
              </p>
              <p>
                <b>Done</b> stops the episode and protects finished work. <b>Not done</b> escalates. The judge never sees simulator state, and its
                verdict is never used as the score.
              </p>
            </ModuleHead>
            <div className="mt-7 space-y-3 rounded-2xl border border-rule bg-surface p-5">
              <p className="text-[13.5px] font-[700] text-ink [font-stretch:92%]">Why it helps even though it is noisy</p>
              <CalRow label="accuracy, with the first frame" v={frozen.acc} />
              <CalRow label="accuracy, current frame only" v={noInitial.acc} muted />
              <CalRow label="done precision, LIBERO-Pro test episodes" v={JUDGE.confusion.libero.precision} digits={3} />
              <p className="pt-1 text-[13px] leading-snug text-ink-3">
                Calibrated on {JUDGE.labels} development labels before any test run. Its done is reliable, and re-running a finished task
                rarely undoes it: by a proxy attribution, re-runs rescue about 24% of failed first runs and undo 5% of successes on the matched subset.
              </p>
            </div>
          </div>
        </div>

        {/* 3. escalation ladder */}
        <div className="mt-28 grid items-start gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <ModuleHead n={3} name="escalation ladder" title="Recover from where the last skill stopped">
            <p>
              The ladder is <b>first, other, first</b> in route-memory order. Each escalation starts from the current scene instead of a reset,
              and every run and judge call draws on <b>one shared budget</b> of 4,000 steps and 900 s.
            </p>
            <p>
              Recovering blindly does not help: re-running a skill without asking turned 4 of 12 successes into 1 of 12 on one task, where a
              second grasp disturbs an object the first had already placed.
            </p>
          </ModuleHead>
          <LadderBudget />
        </div>

        {/* the whole loop, as in the paper */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-28 overflow-hidden rounded-[18px] border border-rule bg-surface"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-6 py-4">
            <p className="text-[16px] font-[740] text-ink [font-stretch:88%]">One REA episode, the paper's Algorithm 1</p>
            <p className="label">nothing before the last line reads the success predicate, rewards or object poses</p>
          </div>
          <EpisodeLoop />
        </motion.div>
      </Container>
    </section>
  );
}

function EvidenceBar({ label, k, n, win }: { label: string; k: number; n: number; win: boolean }) {
  return (
    <div className="grid grid-cols-[38px_minmax(0,1fr)_58px] items-center gap-3">
      <span className={`text-[14px] ${win ? 'font-[760] text-ink' : 'font-[600] text-ink-3'}`}>{label}</span>
      <div className="h-[10px] rounded-full bg-surface-2">
        <motion.div
          key={`${label}-${k}-${n}`}
          className="h-full rounded-full"
          style={{ background: win ? 'var(--s0)' : 'var(--base-2)' }}
          initial={{ width: 0 }}
          animate={{ width: `${(k / n) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="tabular text-right text-[13.5px] font-[650] text-ink">
        {k}/{n}
      </span>
    </div>
  );
}

function CalRow({ label, v, muted = false, digits = 2 }: { label: string; v: number; muted?: boolean; digits?: number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_120px_44px] items-center gap-3">
      <span className="text-[13.5px] text-ink-2">{label}</span>
      <div className="h-[8px] rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: muted ? 'var(--base-2)' : 'var(--s2)' }}
          initial={{ width: 0 }}
          whileInView={{ width: `${v * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="tabular text-right text-[13.5px] font-[700] text-ink">{v.toFixed(digits)}</span>
    </div>
  );
}

const ALGO: { code: React.ReactNode; line?: 's0' | 's1' | 's2'; note?: string; indent?: number }[] = [
  { code: <>L ← M.ladder(t); Reset(s); f₀ ← Render(); u, w ← 0</>, line: 's1', note: 'lookup' },
  { code: <>for k ← 0 to K do</> },
  { code: <>(Δ, δ, e, τ) ← Run(L[min(k, |L| − 1)]; H − u, W − w); u += Δ; w += δ</>, line: 's0', note: 'runs to its boundary', indent: 1 },
  { code: <>if g = judge then (v, δ_J) ← J(f₀, Render(), ℓₜ); w += δ_J</>, line: 's2', note: 'only now', indent: 1 },
  { code: <>if k = K or u ≥ H or w ≥ W then break</>, indent: 1 },
  { code: <>if (g = judge and v = done) or (g = exception and e = ⊥ and not τ) then break</>, indent: 1 },
  { code: <>end</> },
  { code: <>return Score()</>, note: 'read once, evaluation only' },
];

function EpisodeLoop() {
  return (
    <ol className="overflow-x-auto py-3 text-[14.5px]">
      {ALGO.map((a, i) => (
        <li key={i} className="grid min-w-[760px] grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 px-6 py-[5px] hover:bg-surface-2">
          <span className="tabular text-right text-[12.5px] text-ink-4">{i + 1}</span>
          <code className="code whitespace-pre text-ink" style={{ paddingLeft: (a.indent ?? 0) * 28 }}>
            {a.code}
          </code>
          <span className="flex items-center justify-end gap-2 text-[12.5px] text-ink-3">
            {a.note}
            {a.line && <LineBadge line={a.line} size={11} />}
          </span>
        </li>
      ))}
    </ol>
  );
}

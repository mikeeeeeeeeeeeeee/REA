import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import RubberSegment from '@/components/reactbits/RubberSegment/RubberSegment';
import { ChartFrame, HBars, Legend, type BarRow } from '@/components/viz/charts';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ABLATION, ATTRIBUTION, AUTHORS_STUDY, PLACEMENT, PORTABILITY, SPEED, TABLE1, wilson } from '@/data/results';
import { useTheme } from '@/theme/ThemeProvider';
import { useSeenOnce } from '@/lib/hooks';

const QS = [
  { id: 'q1', q: 'Q1', title: 'Routing beats every skill author in its own pool' },
  { id: 'q2', q: 'Q2', title: 'The brain stays off the critical path' },
  { id: 'q3', q: 'Q3', title: 'It lifts skills from very different authors' },
  { id: 'q4', q: 'Q4', title: 'Where the gains come from' },
  { id: 'q5', q: 'Q5', title: 'Other simulators and a real robot' },
];

const pct = (k: number, n: number) => (100 * k) / n;
const ci = (k: number, n: number): [number, number] => {
  const [a, b] = wilson(k, n);
  return [100 * a, 100 * b];
};

function useActiveQ() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let cur = 0;
      QS.forEach((q, i) => {
        const el = document.getElementById(q.id);
        if (el && el.getBoundingClientRect().top <= line) cur = i;
      });
      setActive(cur);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      window.removeEventListener('scroll', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return active;
}

export default function Results() {
  const active = useActiveQ();
  return (
    <section id="results" className="relative scroll-mt-20 bg-paper-2 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Five questions, 30,000 episodes</SectionTitle>
          <p className="lede">
            Every simulated comparison runs on identical episodes: the same tasks, seeds, initial states and budgets, the same frozen skills, and
            one read of the success predicate after the last run.
          </p>
        </div>

        <div className="mt-16 grid gap-x-12 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* the line of questions */}
          <nav aria-label="Questions" className="hidden lg:block">
            <ol className="sticky top-28 ml-3 border-l-[5px] border-rule py-1">
              {QS.map((q, i) => {
                const here = i === active;
                const passed = i < active;
                return (
                  <li key={q.id} className="relative pb-7 last:pb-0">
                    <span
                      className="absolute -left-[13px] top-0.5 rounded-full border-[3px] transition-all duration-300"
                      style={{
                        width: here ? 21 : 15,
                        height: here ? 21 : 15,
                        left: here ? -13 : -10,
                        borderColor: here ? 'var(--ink)' : passed ? 'var(--s1)' : 'var(--rule-2)',
                        background: passed ? 'var(--s1)' : 'var(--station)',
                      }}
                    />
                    <a
                      href={`#${q.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(q.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`block pl-6 text-[14px] leading-snug transition-colors [font-stretch:90%] ${here ? 'font-[760] text-ink' : 'font-[580] text-ink-3 hover:text-ink'}`}
                    >
                      <span className="mr-1.5 text-ink-4">{q.q}</span>
                      {q.title}
                    </a>
                  </li>
                );
              })}
              <motion.span
                className="absolute -left-[5px] top-0 w-[5px] rounded-full bg-s1"
                animate={{ height: `${(active / (QS.length - 1)) * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </ol>
          </nav>

          <div className="space-y-24">
            <Q1 />
            <Q2 />
            <Q3 />
            <Q4 />
            <Q5 />
          </div>
        </div>
      </Container>
    </section>
  );
}

function QHead({ id, q, title, children }: { id: string; q: string; title: string; children: React.ReactNode }) {
  return (
    <header id={id} className="scroll-mt-28">
      <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
        <LineBadge line="s1" size={12} />
        {q}
      </p>
      <h3 className="sign-lg title-part mt-2.5 text-ink">{title}</h3>
      <div className="mt-4 max-w-[68ch] space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">{children}</div>
    </header>
  );
}

/* --------------------------------------------------------------- Q1 */
function Q1() {
  const [set, setSet] = useState<'all' | 'aligned'>('all');
  const { t, theme } = useTheme();
  const n = set === 'all' ? 3000 : 1850;
  const rows: BarRow[] = TABLE1.map((a) => {
    const v = set === 'all' ? a.all60 : a.aligned37;
    const kind = a.group === 'routed' ? 'ours' : a.group === 'ceiling' ? 'ceiling' : a.group === 'online' ? 'loop' : a.key === 'random' ? 'muted' : 'base';
    const k = Math.round((v / 100) * n);
    return {
      label: a.label.replace(' (memory + ladder)', '').replace(' (agent at dispatch)', ', agent at dispatch'),
      value: v,
      kind,
      atLeast: a.atLeast,
      // the oracle is a ceiling and the random author an expectation: neither is a count with an interval
      ci: a.group === 'ceiling' || a.key === 'random' ? undefined : ci(k, n),
      note: a.note ?? (a.key === 'rea-m' ? (set === 'all' ? '+1.2 pp over the best author, 86:51 paired, p = 0.004' : '+1.6 pp, 54:25 paired, p = 0.001') : a.group === 'online' ? `${a.calls} model calls per episode` : undefined),
    } satisfies BarRow;
  });
  const steps: BarRow[] = TABLE1.filter((a) => a.stepsPerSucc).map((a) => ({
    label: a.label.replace(' (memory + ladder)', '').replace(' (agent at dispatch)', ', agent at dispatch'),
    value: Math.min(a.stepsPerSucc!, 1750),
    display: a.stepsPerSucc!.toLocaleString('en-US'),
    kind: a.group === 'routed' ? 'ours' : a.group === 'online' ? 'loop' : 'base',
    broken: a.stepsPerSucc! > 1750,
  }));
  return (
    <div>
      <QHead id="q1" q="Q1" title="Routing beats every skill author in its own pool">
        <p>
          The best single author solves 94.7%. Route memory chooses <b>per task</b> and reaches <b>95.9%</b>, within 1 pp of a hindsight
          oracle, with <b>25% fewer steps per success</b>.
        </p>
      </QHead>
      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <ChartFrame
          title="Success on LIBERO-Pro test episodes"
          sub={`${set === 'all' ? '60 tasks × 50 seeds, 3,000 episodes per arm' : '37 tasks whose pool is exactly these authors’ programs'}; Wilson 95% intervals`}
          legend={<Legend items={[{ kind: 'ours', label: 'REA' }, { kind: 'base', label: 'one skill author alone' }, { kind: 'loop', label: 'brain in the control loop' }, { kind: 'ceiling', label: 'hindsight oracle' }]} />}
          actions={
              <RubberSegment
                items={[
                  { value: 'all', label: 'All 60' },
                  { value: 'aligned', label: 'Aligned 37' },
                ]}
                value={set}
                onChange={(v) => setSet(v as 'all' | 'aligned')}
                trackColor={theme === 'dark' ? t.surface2 : t.paper2}
                thumbColor={t.ink}
                textColor={t.ink2}
                activeTextColor={t.paper}
                size="sm"
                radius={999}
                aria-label="Task set"
              />
          }
          table={{ head: ['Arm', 'All 60 (%)', 'Aligned 37 (%)', 'Steps / success', 'Calls / ep'], rows: TABLE1.map((a) => [a.label, `${a.atLeast ? '≥' : ''}${a.all60}`, `${a.atLeast ? '≥' : ''}${a.aligned37}`, a.stepsPerSucc?.toLocaleString('en-US') ?? '–', a.calls ?? '–']) }}
        >
          <HBars rows={rows} max={100} unit="%" ticks={[0, 25, 50, 75, 100]} labelWidth={220} ariaLabel="Success per arm on LIBERO-Pro test episodes" />
        </ChartFrame>
        <ChartFrame title="Steps per success" sub="lower is better; the zero-shot harness bar is cut" table={{ head: ['Arm', 'Steps / success'], rows: steps.map((r) => [r.label, r.display ?? r.value]) }}>
          <HBars rows={steps} max={1750} decimals={0} ticks={[0, 500, 1000, 1500]} labelWidth={150} ariaLabel="Control steps per success" />
        </ChartFrame>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Q2 */
function Q2() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const max = 19; // leaves room after each bar for its labels
  return (
    <div>
      <QHead id="q2" q="Q2" title="The brain stays off the critical path">
        <p>
          An advisor the router waits for leaves the control path idle <b>2.62 s per episode</b> and wins nothing. <b>REA-M is the fastest
          timed arm</b>: 25% faster than the advisor and 17% faster than the best author alone.
        </p>
      </QHead>
      <ChartFrame
        className="mt-8"
        title="Control time per episode, LIBERO-Pro full set"
        sub="3,000 episodes per arm on one host; the hatched end is time the control path spent blocked on System 2"
        table={{ head: ['Arm', 'System 2 runs', 'Success (%)', 'Control (s)', 'Waiting (s)', 'vs advisor'], rows: SPEED.map((s) => [s.label, s.where, s.success, s.control, s.wait, s.delta ? `${s.delta}%` : '–']) }}
      >
        <div ref={ref} className="space-y-4">
          {SPEED.map((s, i) => {
            const ours = s.key.startsWith('rea');
            const color = ours ? 'var(--s1)' : s.key === 'advisor' ? 'var(--s2)' : 'var(--base-2)';
            const run = s.control - s.wait;
            return (
              <div key={s.key} className="grid grid-cols-[150px_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
                <div className="text-right">
                  <p className={`text-[14px] leading-tight ${ours ? 'font-[740] text-ink' : 'font-[600] text-ink-2'}`}>{s.label}</p>
                  <p className="text-[12px] text-ink-3">brain {s.where}</p>
                </div>
                <div className="relative h-[22px]">
                  <motion.div
                    className="absolute left-0 top-0 flex h-full origin-left overflow-hidden rounded-r-[4px]"
                    style={{ width: `${(s.control / max) * 100}%` }}
                    initial={{ scaleX: 0 }}
                    animate={seen ? { scaleX: 1 } : {}}
                    transition={{ duration: 1, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="h-full" style={{ width: `${(run / s.control) * 100}%`, background: color }} />
                    {s.wait > 0 && <span className="hatch-wait h-full border-l-2 border-surface" style={{ width: `${(s.wait / s.control) * 100}%`, boxShadow: 'inset 0 0 0 1.5px var(--s2)' }} />}
                  </motion.div>
                  <motion.span
                    className="tabular absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2.5 text-[13px] text-ink-2"
                    style={{ left: `${(s.control / max) * 100}%` }}
                    initial={{ opacity: 0 }}
                    animate={seen ? { opacity: 1 } : {}}
                    transition={{ delay: 0.7 + 0.08 * i }}
                  >
                    <b className={ours ? 'font-[760] text-ink' : 'font-[650] text-ink'}>{s.control.toFixed(2)} s</b>
                    {s.wait > 0 && <span className="hidden text-ink-3 sm:inline">, {s.wait.toFixed(2)} s waiting</span>}
                    {s.delta < 0 && <span className="ml-1.5 font-[700] text-ink">{s.delta}%</span>}
                    <span className="ml-2 hidden text-ink-3 md:inline">{s.success}% success</span>
                  </motion.span>
                </div>
              </div>
            );
          })}
          <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 sm:grid-cols-[190px_minmax(0,1fr)]">
            <span />
            <div className="relative h-5 border-t border-rule">
              {[0, 5, 10, 15].map((tk) => (
                <span key={tk} className="tabular absolute top-1 -translate-x-1/2 text-[11.5px] text-ink-4" style={{ left: `${(tk / max) * 100}%` }}>
                  {tk} s
                </span>
              ))}
            </div>
          </div>
        </div>
      </ChartFrame>
    </div>
  );
}

/* --------------------------------------------------------------- Q3 */
function Q3() {
  return (
    <div>
      <QHead id="q3" q="Q3" title="It lifts skills from very different authors">
        <p>
          On ASPIRE's Fix-loop programs, route memory alone adds <b>+5.6 pp</b> and the judge gate a further <b>+3.1 pp</b>, at 2.1× the
          wall time per success. On zero-shot GPT-6 skills, a library three times weaker, REA-V adds <b>+7.0 pp</b>.
        </p>
      </QHead>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {AUTHORS_STUDY.map((g) => (
          <ChartFrame
            key={g.key}
            title={g.author}
            sub={`LIBERO-Pro seeds 1-10, ${g.n} episodes; Wilson 95% intervals`}
            table={{ head: ['Arm', 'Solved', 'Success (%)', 'Steps / success', 'b : c'], rows: g.arms.map((a) => [a.label, `${a.k}/${g.n}`, pct(a.k, g.n).toFixed(1), a.steps.toLocaleString('en-US'), 'bc' in a ? a.bc : '–']) }}
          >
            <HBars
              rows={g.arms.map((a) => ({
                label: a.label,
                value: pct(a.k, g.n),
                kind: a.label === 'Skills only' ? 'base' : 'ours',
                ci: ci(a.k, g.n),
                note: 'bc' in a ? `${a.bc} paired against skills only, p < 10⁻⁴` : undefined,
              }))}
              max={100}
              unit="%"
              ticks={[0, 25, 50, 75, 100]}
              labelWidth={110}
              barH={22}
              ariaLabel={`Success with ${g.author}`}
            />
          </ChartFrame>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Q4 */
function Q4() {
  const n = 72;
  const rows: BarRow[] = ABLATION.map((a) => ({
    label: a.label,
    value: pct(a.k, n),
    kind: a.key === 'rea-v' || a.key === 'rea-m' ? 'ours' : a.key === 'nomem' ? 'muted' : 'base',
    ci: ci(a.k, n),
    note: `${a.k} of ${n}, ${a.steps.toLocaleString('en-US')} steps per success`,
  }));
  return (
    <div>
      <QHead id="q4" q="Q4" title="Where the gains come from">
        <p>
          On a hard subset chosen for failures of the reference skill, only the full router beats the best single skill. Both modules
          contribute: without route memory the judge must find the better skill by trial and error, and an exception gate instead of the
          judge costs <b>15.3 pp</b>.
        </p>
      </QHead>
      <ChartFrame
        className="mt-8"
        title="Router ablation, matched hard subset"
        sub="6 tasks × 12 seeds = 72 episodes per arm, identical initial states, GPU lanes and skill bytes; Wilson 95% intervals"
        legend={<Legend items={[{ kind: 'ours', label: 'REA with route memory' }, { kind: 'muted', label: 'judge ladder without route memory' }, { kind: 'base', label: 'single skill or blind retry' }]} />}
        table={{ head: ['Arm', 'Memory', 'Gate', 'Solved', 'Success (%)', 'Steps / success'], rows: ABLATION.map((a) => [a.label, a.memory ? 'yes' : '–', a.gate, `${a.k}/72`, pct(a.k, 72).toFixed(1), a.steps.toLocaleString('en-US')]) }}
      >
        <HBars rows={rows} max={100} unit="%" ticks={[0, 25, 50, 75, 100]} labelWidth={200} ariaLabel="Router ablation on the matched hard subset" />
      </ChartFrame>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <PlacementExplorer />
        <Attribution />
      </div>
    </div>
  );
}

function PlacementExplorer() {
  const { t } = useTheme();
  const [i, setI] = useState(0);
  const p = PLACEMENT[i];
  const base = PLACEMENT[0];
  const color = p.kind === 'offline' ? 'var(--s1)' : p.kind === 'boundary' ? 'var(--s1-glow)' : p.kind === 'caption' ? 'var(--base-2)' : 'var(--s2)';
  const log = (v: number) => (v <= 0 ? 0 : Math.max(0.04, (Math.log10(v) + 2) / (Math.log10(300) + 2)));
  return (
    <ChartFrame
      title="Move the brain closer to the control loop"
      sub="LIBERO-Pro seeds 1-10, 600 episodes per arm, one host and one library"
      table={{ head: ['Where System 2 sits', 'Configuration', 'Calls / ep', 'S2 s / ep', 'Success (%)', 'b : c vs REA-M'], rows: PLACEMENT.map((x) => [x.where, x.config, x.calls, x.s2, x.success, x.bc || '–']) }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="title-card text-ink">{p.where}</p>
        <p className="text-right text-[13px] text-ink-3">{p.config}</p>
      </div>
      <div className="mt-4">
        <ElasticSlider
          value={i}
          defaultValue={0}
          maxValue={PLACEMENT.length - 1}
          isStepped
          stepSize={1}
          onChange={(v) => setI(Math.round(v))}
          valuePosition="none"
          ticks
          trackColor={t.rule}
          rangeColor={color}
          thumbColor={t.ink}
          thickness={8}
          activeThickness={12}
          className="!w-full"
          ariaLabel="Where System 2 sits"
          leftIcon={<span className="text-[12px] font-[650] text-ink-3">offline</span>}
          rightIcon={<span className="text-[12px] font-[650] text-ink-3">in the loop</span>}
        />
      </div>
      <div className="mt-6 space-y-4">
        <Meter label="Success" value={p.success} max={100} display={`${p.success.toFixed(1)}%`} color={color} delta={p.key === 'offline' ? '' : `${(p.success - base.success >= 0 ? '+' : '')}${(p.success - base.success).toFixed(1)} pp vs REA-M`} />
        <Meter label="Seconds per episode in System 2 calls (log scale)" value={log(p.s2)} max={1} display={`${p.s2} s`} color={color} delta={`${p.calls} calls per episode`} />
      </div>
      <p className="mt-5 text-[13.5px] leading-[1.55] text-ink-3">
        {p.kind === 'loop'
          ? 'As a direct Cartesian policy the brain solves none of the 600 episodes.'
          : p.kind === 'caption'
            ? 'A completion judge that reads scene captions costs 1.3 to 2.2 points and 7.9 to 9.6 s per episode: on this strong library the exception gate suffices.'
            : p.key === 'completion'
              ? 'The agent as a completion judge as well changes success by +0.3 points (12:10) and spends 7.2 s per episode in System 2 calls.'
              : p.kind === 'boundary'
                ? 'Asking the agent to pick the skills at dispatch and recovery changes success by +0.5 points (6:3, p = 0.51) and adds a selection call.'
                : 'Route memory: no System 2 call while the episode runs.'}
      </p>
    </ChartFrame>
  );
}

function Meter({ label, value, max, display, color, delta }: { label: string; value: number; max: number; display: string; color: string; delta: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-ink-2">{label}</span>
        <span className="tabular text-[13px] text-ink-3">{delta}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <div className="relative h-[18px] flex-1 rounded-r-[4px] bg-surface-2">
          <motion.div className="h-full rounded-r-[4px]" style={{ background: color }} animate={{ width: `${(value / max) * 100}%` }} transition={{ type: 'spring', stiffness: 160, damping: 22 }} />
        </div>
        <span className="tabular w-[64px] text-right text-[15px] font-[760] text-ink">{display}</span>
      </div>
    </div>
  );
}

function Attribution() {
  const a = ATTRIBUTION.libero;
  const parts = useMemo(
    () => [
      { key: 'kept', label: 'kept: succeeded, judged done', v: a.kept, color: 'var(--base-1)' },
      { key: 'survived', label: 'survived a re-run', v: a.survived, color: 'var(--base-2)' },
      { key: 'rescued', label: 'rescued by escalation', v: a.rescued, color: 'var(--done)' },
      { key: 'notRescued', label: 'failed, still failed', v: a.notRescued, color: 'var(--base-3)' },
      { key: 'harmed', label: 'undone by a re-run', v: a.harmed, color: 'var(--fail)' },
      { key: 'forfeited', label: 'failed, judged done', v: a.forfeited, color: 'var(--s2)' },
      { key: 'variance', label: 'replay variance', v: a.variance, color: 'var(--rule-2)' },
    ],
    [a]
  );
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  return (
    <ChartFrame
      title="What the judge gate did, episode by episode"
      sub="590 LIBERO-Pro episodes, ASPIRE skills; REA-M's run stands in for the first run, so the split is approximate"
      table={{ head: ['Outcome', 'Episodes'], rows: parts.map((p) => [p.label, p.v]).concat([['paired result vs REA-M', `${a.paired}, p = ${a.p}`]]) }}
    >
      <div ref={ref}>
        <div className="flex h-[30px] overflow-hidden rounded-[6px]">
          {parts.map((p, i) => (
            <motion.span
              key={p.key}
              className="h-full border-r-2 border-surface last:border-r-0"
              style={{ background: p.color }}
              initial={{ width: 0 }}
              animate={seen ? { width: `${(p.v / a.n) * 100}%` } : {}}
              transition={{ duration: 0.8, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              title={`${p.label}: ${p.v}`}
            />
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {parts.map((p) => (
            <li key={p.key} className="flex items-center gap-2 text-[13px] text-ink-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: p.color }} />
              <span className="tabular w-[30px] font-[700] text-ink">{p.v}</span>
              {p.label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13.5px] leading-[1.55] text-ink-3">
          Re-runs convert 19% of failed first runs and undo 9% of successes. Net: <b className="font-[700] text-ink">{a.paired}</b> episodes, p = {a.p}.
        </p>
      </div>
    </ChartFrame>
  );
}

/* --------------------------------------------------------------- Q5 */
function Q5() {
  return (
    <div>
      <QHead id="q5" q="Q5" title="Other simulators and a real robot">
        <p>
          It solves the most episodes on BEHAVIOR-1K, RoboTwin 2.0 and a real Unitree G1. On RoboTwin, run side by side with the Codex CLI
          on the same night, it solved <b>97 against 75</b> scenes (p = 0.007).
        </p>
      </QHead>
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {PORTABILITY.map((b) => (
          <ChartFrame
            key={b.key}
            title={b.bench}
            sub={b.detail}
            table={{ head: ['Method', 'Solved'], rows: b.rows.map((r) => [r.label, r.k === null ? 'not run' : `${r.k}/${b.n}`]) }}
          >
            <HBars
              rows={b.rows
                .filter((r) => r.k !== null)
                .map((r) => ({
                  label: r.label,
                  value: pct(r.k as number, b.n),
                  display: `${r.k}/${b.n}`,
                  kind: r.key === 'rea' ? 'ours' : r.key === 'show' ? 'loop' : 'base',
                  ci: ci(r.k as number, b.n),
                }))}
              max={100}
              unit="%"
              ticks={[0, 50, 100]}
              labelWidth={96}
              barH={18}
              ariaLabel={`Solved episodes on ${b.bench}`}
            />
          </ChartFrame>
        ))}
      </div>
    </div>
  );
}

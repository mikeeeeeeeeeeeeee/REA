import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PauseIcon, PlayIcon, PlayCircleIcon } from '@hugeicons/core-free-icons';
import ChromaGrid from '@/components/reactbits/ChromaGrid/ChromaGrid';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import JellyRadio from '@/components/reactbits/JellyRadio/JellyRadio';
import TextType from '@/components/reactbits/TextType/TextType';
import LazyMount from '@/components/ui/LazyMount';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ChartFrame } from '@/components/viz/charts';
import { BEHAVIOR_TASKS, G1_LATENCY } from '@/data/results';
import { LINKS } from '@/data/paper';
import { EPISODES } from '@/data/gen/episodes';
import { BEHAVIOR } from '@/data/gen/behavior';
import { ROBOTWIN } from '@/data/gen/robotwin';
import { G1_FRONT, G1_SIDE } from '@/data/gen/g1';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion, useSeenOnce } from '@/lib/hooks';

export default function Embodiments() {
  const { t, theme } = useTheme();
  const termini = [
    { image: EPISODES[0].frames[3], title: 'LIBERO-Pro', subtitle: '2,876 of 3,000 held-out episodes, MuJoCo', accent: t.s1, alt: 'LIBERO-Pro: the bowl on the stove' },
    { image: BEHAVIOR[0].image, title: 'BEHAVIOR-1K', subtitle: '27 of 50, the most of five methods, Isaac Sim', accent: t.s1, alt: 'BEHAVIOR-1K: R1Pro picking up a radio' },
    { image: ROBOTWIN[0].steps[ROBOTWIN[0].steps.length - 1].image, title: 'RoboTwin 2.0', subtitle: '133 of 200 bimanual scenes, SAPIEN', accent: t.s1, alt: 'RoboTwin 2.0: burger and fries on the tray' },
    { image: G1_FRONT[7].image, title: 'Unitree G1', subtitle: '8 of 10 real trials, operator-judged', accent: t.s1, alt: 'Unitree G1 pushing a chair' },
  ];
  return (
    <section id="embodiments" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Four termini, one runtime</SectionTitle>
          <p className="lede">
            Because every backend implements the same contract, moving REA is a matter of a new backend and new skills. Three simulators and a
            real humanoid, with the router unchanged, and the most episodes solved on each.
          </p>
        </div>

        {/* the termini, on one line */}
        <div className="relative mt-14">
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[-22px] hidden h-[8px] rounded-full bg-s1 md:block" aria-hidden />
          <div className="pointer-events-none absolute left-0 right-0 top-[-31px] hidden md:block" aria-hidden>
            <div className="grid grid-cols-4">
              {termini.map((tm) => (
                <span key={tm.title} className="mx-auto block h-[26px] w-[26px] rounded-full border-[5px] border-ink bg-[var(--station)]" />
              ))}
            </div>
          </div>
          <LazyMount margin="300px" className="min-h-[340px]">
            <ChromaGrid items={termini} columns={4} radius={320} damping={0.45} fadeOut={0.6} grayscale={0.65} dim={0.06} theme={theme} aspectRatio="4 / 5" cardRadius={18} showInfo frame />
          </LazyMount>
        </div>

        <div className="mt-24 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Real robot
            </p>
            <h3 className="sign-lg mt-2.5 text-[clamp(1.9rem,3.2vw,2.9rem)] text-ink">A Unitree G1 walks to a chair and pushes it</h3>
            <div className="mt-4 space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
              <p>
                Every method gets the same robot, the same model and the same four skills: walk forward, the native two-arm push, release, stop.
                REA dispatches each skill at a boundary from the head and wrist cameras. It succeeded in <b>8 of 10</b> trials, against 5 for an
                Agents SDK agent, 4 for Codex and 2 for ASPIRE's code-as-policy.
              </p>
              <p>
                The robot's own service pipelines its brain decisions ahead of the request, so a skill request returns in <b>1.0 to 3.6 ms</b>{' '}
                instead of about 5 s.
              </p>
            </div>
            <LatencyChart />
          </div>
          <G1Player />
        </div>

        <div className="mt-24 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <RoboTwinReplay />
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Simulators
            </p>
            <h3 className="sign-lg mt-2.5 text-[clamp(1.9rem,3.2vw,2.9rem)] text-ink">The same runtime on two more simulators</h3>
            <div className="mt-4 space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
              <p>
                RoboTwin 2.0 has no skill library, so a fast reflex model is the System 0 skill and the router hands single decisions to a
                deliberate model. Left: one held-out scene, decision by decision, with the reflex model's own reasoning.
              </p>
              <p>
                On BEHAVIOR-1K, a mobile R1Pro has to find and pick up objects in a house; REA ran with the same tools, model and 1,500 s
                budget as an online agent.
              </p>
            </div>
            <BehaviorGrid />
          </div>
        </div>
      </Container>
    </section>
  );
}

function LatencyChart() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  const log = (v: number) => (Math.log10(v) + 3) / (Math.log10(5) + 3); // 1 ms .. 5 s
  return (
    <div ref={ref} className="mt-7 rounded-2xl border border-rule bg-surface p-5">
      <p className="text-[13.5px] font-[700] text-ink [font-stretch:92%]">G1 request latency, medians over 5-8 trials (log scale)</p>
      <ul className="mt-4 space-y-3">
        {G1_LATENCY.map((g, i) => (
          <li key={g.stage} className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
            <span className={`text-right text-[13px] ${i === 3 ? 'font-[720] text-ink' : 'text-ink-2'}`}>{g.stage}</span>
            <div className="flex items-center gap-2">
              <motion.span
                className="block h-[14px] origin-left rounded-r-[4px]"
                style={{ width: `${log(g.value) * 78}%`, background: i === 3 ? 'var(--s1)' : 'var(--base-2)' }}
                initial={{ scaleX: 0 }}
                animate={seen ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className={`tabular whitespace-nowrap text-[13px] ${i === 3 ? 'font-[760] text-ink' : 'text-ink-2'}`}>{g.latency}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** the paper's Figure 13 frames as a flipbook, front and side cameras on the same video clock */
function G1Player() {
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!near || !playing || reduce) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % G1_FRONT.length), 1100);
    return () => window.clearInterval(id);
  }, [near, playing, reduce]);
  const f = G1_FRONT[i];
  const s = G1_SIDE[i];
  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="grid gap-px bg-rule sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative aspect-[430/767] overflow-hidden bg-[#0b0e14]">
          {G1_FRONT.map((fr, k) => (
            <img key={fr.image} src={fr.image} alt={k === i ? `Front camera, ${fr.t} s` : ''} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0 }} draggable={false} />
          ))}
          <span className="tabular absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-[650] text-white backdrop-blur-sm">front, {f.t.toFixed(1)} s</span>
        </div>
        <div className="flex flex-col bg-surface">
          <div className="relative aspect-[440/247] overflow-hidden bg-[#0b0e14]">
            {G1_SIDE.map((fr, k) => (
              <img key={fr.image} src={fr.image} alt={k === i ? `Side camera, ${fr.t} s` : ''} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0 }} draggable={false} />
            ))}
            <span className="tabular absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-[650] text-white backdrop-blur-sm">side, {s.t.toFixed(1)} s</span>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-5 p-5">
            <div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper"
                  aria-label={playing ? 'Pause' : 'Play'}
                >
                  <Icon icon={playing ? PauseIcon : PlayIcon} size={17} />
                </button>
                <div className="flex-1">
                  <ElasticSlider
                    value={i}
                    maxValue={G1_FRONT.length - 1}
                    isStepped
                    stepSize={1}
                    onChange={(v) => {
                      setPlaying(false);
                      setI(Math.round(v));
                    }}
                    valuePosition="none"
                    ticks
                    thickness={8}
                    activeThickness={12}
                    className="!w-full"
                    leftIcon={<span className="tabular text-[12px] font-[600] text-ink-3">{G1_FRONT[0].t} s</span>}
                    rightIcon={<span className="tabular text-[12px] font-[600] text-ink-3">{G1_FRONT[G1_FRONT.length - 1].t} s</span>}
                    ariaLabel="Video time"
                  />
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-ink-3">
                Frames of one of REA's successful trials from two external cameras, at the video times printed in the paper's Figure 13.
              </p>
            </div>
            <a
              href={LINKS.video || undefined}
              target={LINKS.video ? '_blank' : undefined}
              rel="noreferrer"
              aria-disabled={!LINKS.video || undefined}
              className="flex items-center gap-3 rounded-xl border border-dashed border-rule-2 px-4 py-3 text-[14px] font-[620] text-ink-2 aria-disabled:cursor-default"
            >
              <Icon icon={PlayCircleIcon} size={20} />
              {LINKS.video ? 'Watch the full trial video' : 'Full trial video: coming soon'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoboTwinReplay() {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  const sc = ROBOTWIN[scene];
  const [k, setK] = useState(0);
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const timer = useRef(0);
  useEffect(() => setK(0), [scene]);
  useEffect(() => {
    if (!near || reduce) return;
    const step = sc.steps[k];
    const dwell = Math.min(5200, 1600 + step.thought.length * 16);
    timer.current = window.setTimeout(() => setK((x) => (x + 1) % sc.steps.length), dwell);
    return () => window.clearTimeout(timer.current);
  }, [k, near, reduce, sc]);
  const st = sc.steps[k];
  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="border-b border-rule px-5 py-4">
        <JellyRadio
          items={ROBOTWIN.map((r, i) => ({ value: String(i), label: r.title.replace(' (randomized scene)', '') }))}
          value={String(scene)}
          onChange={(v) => setScene(Number(v))}
          chipColor={theme === 'dark' ? t.surface2 : t.paper2}
          activeColor={t.ink}
          textColor={t.ink2}
          activeTextColor={t.paper}
          size="sm"
          ariaLabel="RoboTwin scene"
        />
      </div>
      <div className="grid gap-0 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0e14]">
          {sc.steps.map((s, i) => (
            <img key={s.image} src={s.image} alt={i === k ? `Head camera at decision ${s.step + 1}` : ''} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" style={{ opacity: i === k ? 1 : 0 }} draggable={false} />
          ))}
          <span className="tabular absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-[650] text-white backdrop-blur-sm">
            decision {st.step + 1} of {sc.decisions}
          </span>
          <div className="absolute inset-x-3 bottom-3 flex gap-[3px]">
            {sc.steps.map((s, i) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setK(i)}
                className="h-[5px] flex-1 rounded-full transition-colors"
                style={{ background: i <= k ? 'var(--s0-glow)' : 'rgba(255,255,255,0.3)' }}
                aria-label={`Decision ${s.step + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge text-[12px]" style={{ background: st.route === 'deliberate' ? 'var(--s2)' : 'var(--s0)' }}>
              {st.route === 'deliberate' ? 'S2' : 'S0'}
            </span>
            <span className="text-[13.5px] font-[700] text-ink [font-stretch:90%]">{st.route === 'deliberate' ? 'deliberate model' : 'reflex model'}</span>
            {st.arm && <span className="text-[13px] text-ink-3">{st.arm} arm</span>}
          </div>
          <div className="mt-3 min-h-[150px] text-[15px] leading-[1.6] text-ink-2">
            <AnimatePresence mode="wait">
              <motion.div key={`${scene}-${k}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {reduce ? (
                  <p>“{st.thought}”</p>
                ) : (
                  <TextType text={`“${st.thought}”`} typingSpeed={9} showCursor cursorCharacter="▍" cursorColor={t.s0} loop={false} initialDelay={120} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-auto border-t border-rule pt-3 text-[12.5px] leading-snug text-ink-3">
            Held-out scene {sc.scene.replace('rt500-', '').replace(/-/g, ' ')}, solved in {sc.decisions} decisions. Text is the model's own reasoning from the run log.
          </p>
        </div>
      </div>
    </div>
  );
}

function BehaviorGrid() {
  const max = 10;
  return (
    <ChartFrame
      className="mt-7"
      title="BEHAVIOR-1K, successes out of 10 per task"
      sub="held-out instances 1-10, R1Pro, the same model for every method"
      table={{ head: ['Method', ...BEHAVIOR_TASKS.tasks, 'Total'], rows: BEHAVIOR_TASKS.rows.map((r) => [r.label, ...r.values, `${r.values.reduce((a, b) => a + b, 0)}/50`]) }}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-separate border-spacing-[3px] text-[13px]">
          <thead>
            <tr>
              <th />
              {BEHAVIOR_TASKS.tasks.map((tk) => (
                <th key={tk} className="pb-1 text-center font-[650] text-ink-3">
                  {tk}
                </th>
              ))}
              <th className="pb-1 text-right font-[650] text-ink-3">total</th>
            </tr>
          </thead>
          <tbody>
            {BEHAVIOR_TASKS.rows.map((r) => {
              const ours = r.label.startsWith('REA');
              return (
                <tr key={r.label}>
                  <td className={`pr-2 text-right ${ours ? 'font-[740] text-ink' : 'text-ink-2'}`}>{r.label.replace(/ \(.*\)/, '')}</td>
                  {r.values.map((v, j) => (
                    <td
                      key={j}
                      className="tabular h-8 w-12 rounded-[5px] text-center font-[680]"
                      style={{
                        background: `color-mix(in srgb, ${ours ? 'var(--s1)' : 'var(--base-3)'} ${Math.round((v / max) * 85)}%, var(--surface-2))`,
                        color: v / max > 0.5 ? '#ffffff' : 'var(--ink)',
                      }}
                    >
                      {v}
                    </td>
                  ))}
                  <td className={`tabular pl-2 text-right ${ours ? 'font-[760] text-ink' : 'text-ink-2'}`}>{r.values.reduce((a, b) => a + b, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {BEHAVIOR.map((b) => (
          <figure key={b.id} className="overflow-hidden rounded-lg">
            <img src={b.image} alt={b.title} className="aspect-square w-full object-cover" />
          </figure>
        ))}
      </div>
    </ChartFrame>
  );
}

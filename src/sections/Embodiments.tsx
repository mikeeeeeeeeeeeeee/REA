import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PauseIcon, PlayIcon, PlayCircleIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import JellyRadio from '@/components/reactbits/JellyRadio/JellyRadio';
import TextType from '@/components/reactbits/TextType/TextType';
import CgVideo, { CgChip } from '@/components/cg/CgVideo';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ChartFrame } from '@/components/viz/charts';
import { BEHAVIOR_TASKS, G1_LATENCY } from '@/data/results';
import { LINKS } from '@/data/paper';
import { BEHAVIOR } from '@/data/gen/behavior';
import { ROBOTWIN } from '@/data/gen/robotwin';
import { G1_FRONT, G1_SIDE } from '@/data/gen/g1';
import { useTheme } from '@/theme/ThemeProvider';
import type { CgClip } from '@/data/cg';
import { useInView, useNearViewport, useReducedMotion, useSeenOnce } from '@/lib/hooks';

/** the four termini: where REA ran, what it solved there, and the CG clip that stands for it */
const TERMINI: { clip: CgClip; bench: string; score: string; unit: string; task: string }[] = [
  { clip: 'bowl', bench: 'LIBERO-Pro', score: '2,876 / 3,000', unit: 'test episodes, MuJoCo', task: 'Put the bowl on the stove' },
  { clip: 'behavior', bench: 'BEHAVIOR-1K', score: '27 / 50', unit: 'test episodes, Isaac Sim', task: 'A mobile R1Pro picks things up' },
  { clip: 'robotwin', bench: 'RoboTwin 2.0', score: '133 / 200', unit: 'bimanual scenes, SAPIEN', task: 'Lift the pot with both arms' },
  { clip: 'g1', bench: 'Unitree G1', score: '8 / 10', unit: 'real trials, operator-judged', task: 'Walk to a chair and push it' },
];

export default function Embodiments() {
  return (
    <section id="embodiments" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Four termini, one runtime</SectionTitle>
          <p className="lede">
            The same three-level contract on three simulators and a real humanoid; on each, REA solves the most episodes of the compared methods.
          </p>
        </div>

        <TerminiStage />

        <div className="mt-24 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Real robot
            </p>
            <h3 className="sign-lg title-part mt-2.5 text-ink">A Unitree G1 walks to a chair and pushes it</h3>
            <div className="mt-4 space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
              <p>
                Every method gets the same robot, model and four skills: walk forward, the native two-arm push, release, stop. REA succeeded in{' '}
                <b>8 of 10</b> trials, against 5 for an Agents SDK agent, 4 for Codex and 2 for ASPIRE's code-as-policy.
              </p>
              <p>
                A separate service on the robot, without the router, computes brain decisions ahead of the request: one returns in <b>1.0 to 3.6 ms</b>{' '}
                instead of about 5 s.
              </p>
            </div>
            <LatencyChart />
          </div>
          <G1Player />
        </div>

        {/* the two simulators: a heading row, then the RoboTwin replay and the BEHAVIOR-1K table side by side, one height */}
        <div className="mt-24 grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Simulators
            </p>
            <h3 className="sign-lg title-part mt-2.5 text-ink">The same runtime on two more simulators</h3>
          </div>
          <div className="space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
            <p>
              RoboTwin 2.0 has no skill library, so a fast reflex model is the System 0 skill and the router hands single decisions to a
              deliberate model.
            </p>
            <p>
              On BEHAVIOR-1K, a mobile R1Pro starts metres from the object it has to find and pick up; REA ran with the same tools, model and 1,500 s
              budget as an online agent.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <RoboTwinReplay />
          <BehaviorGrid />
        </div>
      </Container>
    </section>
  );
}

const RING = 2 * Math.PI * 19;

/**
 * The four termini as stations on REA's line, above a stage that plays each one's CG clip in turn: a ring round the
 * station shows how far its clip has got, and when the clip ends the line runs on to the next. A click on a station
 * goes there. Nothing downloads until the stage is near; with reduced motion it shows each clip's first frame.
 */
function TerminiStage() {
  const reduce = useReducedMotion();
  const [nearRef, near] = useNearViewport<HTMLDivElement>('500px');
  const [viewRef, inView] = useInView<HTMLDivElement>(0.4);
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const ring = useRef<SVGCircleElement | null>(null);
  const hold = useRef(0);
  const play = inView && !paused && !reduce;
  const n = TERMINI.length;

  // the current clip and the next may download; a clip that has loaded stays loaded
  useEffect(() => {
    if (!near || reduce) return;
    setLoaded((s) => (s.has(cur) && s.has((cur + 1) % n) ? s : new Set([...s, cur, (cur + 1) % n])));
  }, [near, reduce, cur, n]);

  // the ring round the current station follows its clip
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const v = videos.current[cur];
      if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - (v && v.duration ? v.currentTime / v.duration : 0)));
      if (play) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [play, cur]);

  useEffect(() => () => window.clearTimeout(hold.current), []);

  const go = (k: number) => {
    window.clearTimeout(hold.current);
    const v = videos.current[k];
    if (v && v.readyState > 0) v.currentTime = 0;
    setCur(k);
  };
  // a clip that has ended holds its last frame for a moment, then the line runs on
  const ended = (k: number) => {
    if (k === cur) hold.current = window.setTimeout(() => go((k + 1) % n), 900);
  };
  const tm = TERMINI[cur];

  return (
    <div ref={nearRef} className="mt-14 grid gap-x-12 gap-y-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,10fr)]">
      {/* the line and its termini: across the top on small screens, down the side on large ones */}
      <ol className="grid grid-cols-4 xl:flex xl:flex-col xl:py-1" aria-label="Termini">
        {TERMINI.map((x, k) => {
          const here = k === cur;
          return (
            <li key={x.clip} className="relative xl:flex-1">
              {k < n - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[13px] h-[8px] w-full rounded-full transition-colors duration-500 xl:left-[13px] xl:top-[17px] xl:h-full xl:w-[8px]"
                  style={{ background: k < cur ? 'var(--s1)' : 'var(--rule-2)' }}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setPaused(false);
                  go(k);
                }}
                aria-pressed={here}
                aria-label={`${x.bench}: ${x.score}, ${x.unit}`}
                className="group relative flex w-full flex-col items-center px-1 text-center xl:flex-row xl:items-start xl:gap-5 xl:px-0 xl:text-left"
              >
                <span className="relative grid h-[34px] w-[34px] shrink-0 place-items-center">
                  {here && !reduce && (
                    <svg className="absolute -inset-[6px] -rotate-90" viewBox="0 0 46 46" aria-hidden>
                      <circle ref={ring} cx="23" cy="23" r="19" fill="none" stroke="var(--s1)" strokeWidth="3" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
                    </svg>
                  )}
                  <span
                    className="h-[26px] w-[26px] rounded-full border-[5px] border-ink transition-[background-color,transform] duration-300 group-hover:scale-110"
                    style={{ background: k <= cur ? 'var(--s1)' : 'var(--station)' }}
                  />
                </span>
                <span className="mt-3 flex flex-col items-center xl:mt-0 xl:items-start xl:pt-[5px]">
                  <span className={`text-[14px] font-[760] leading-tight transition-colors [font-stretch:86%] sm:text-[17px] ${here ? 'text-ink' : 'text-ink-3 group-hover:text-ink'}`}>
                    {x.bench}
                  </span>
                  <span className={`tabular mt-1 whitespace-nowrap text-[13px] font-[780] leading-none transition-colors [font-stretch:84%] sm:mt-1.5 sm:text-[clamp(1.25rem,2vw,1.75rem)] ${here ? 'text-ink' : 'text-ink-3'}`}>
                    {x.score}
                  </span>
                  <span className="mt-1.5 hidden max-w-[24ch] text-[13px] leading-snug text-ink-3 sm:block">{x.unit}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div ref={viewRef} className="figure-frame relative aspect-video overflow-hidden !rounded-[22px]">
        {TERMINI.map((x, k) => (
          <CgVideo
            key={x.clip}
            ref={(el) => {
              videos.current[k] = el;
            }}
            clip={x.clip}
            play={play && k === cur}
            load={loaded.has(k)}
            label={`${x.task} (CG illustration)`}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
            style={{ opacity: k === cur ? 1 : 0 }}
            onEnded={() => ended(k)}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 sm:p-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={tm.clip}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="rounded-full bg-black/45 px-3.5 py-1.5 text-[13px] font-[680] text-white backdrop-blur-md [font-stretch:92%] sm:text-[15px]"
            >
              {tm.task}
            </motion.p>
          </AnimatePresence>
          <div className="pointer-events-auto flex shrink-0 items-center gap-2">
            <CgChip />
            {!reduce && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Play the clips' : 'Pause the clips'}
                title={paused ? 'Play the clips' : 'Pause the clips'}
                className="grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <Icon icon={paused ? PlayIcon : PauseIcon} size={13} stroke={2.2} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
      {/* the two cameras side by side at one height: the columns are in the ratio of the frames' aspect ratios */}
      <div className="grid grid-cols-[minmax(0,5606fr)_minmax(0,17814fr)] gap-px bg-rule">
        <div className="relative aspect-[430/767] overflow-hidden bg-[#0b0e14]">
          {G1_FRONT.map((fr, k) => (
            <img key={fr.image} src={fr.image} alt={k === i ? `Front camera, ${fr.t} s` : ''} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0 }} draggable={false} />
          ))}
          <span className="tabular absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[650] text-white backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[12px]">front, {f.t.toFixed(1)} s</span>
        </div>
        <div className="relative aspect-[440/247] overflow-hidden bg-[#0b0e14]">
          {G1_SIDE.map((fr, k) => (
            <img key={fr.image} src={fr.image} alt={k === i ? `Side camera, ${fr.t} s` : ''} className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: k === i ? 1 : 0 }} draggable={false} />
          ))}
          <span className="tabular absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[650] text-white backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[12px]">side, {s.t.toFixed(1)} s</span>
        </div>
      </div>
      <div className="border-t border-rule px-5 pb-5 pt-4">
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
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="max-w-[52ch] text-[13px] leading-snug text-ink-3">One of REA's successful trials, two external cameras, at the times in the paper's Figure 13.</p>
          <a
            href={LINKS.video || undefined}
            target={LINKS.video ? '_blank' : undefined}
            rel="noreferrer"
            aria-disabled={!LINKS.video || undefined}
            className="flex shrink-0 items-center gap-2 rounded-full border border-dashed border-rule-2 px-3.5 py-2 text-[13.5px] font-[620] text-ink-2 aria-disabled:cursor-default"
          >
            <Icon icon={PlayCircleIcon} size={18} />
            {LINKS.video ? 'Watch the full trial video' : 'Full trial video: coming soon'}
          </a>
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
    <div ref={ref} className="figure-frame flex flex-col overflow-hidden">
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
      <div className="grid flex-1 gap-0 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0e14] xl:aspect-auto xl:min-h-[300px]">
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
            Test scene {sc.scene.replace('rt500-', '').replace(/-/g, ' ')}, solved in {sc.decisions} decisions; the text is the model's own reasoning.
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
      title="BEHAVIOR-1K, successes out of 10 per task"
      sub="test instances 1–10, R1Pro, the same model for every method"
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

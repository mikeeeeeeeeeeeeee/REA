import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PauseIcon, PlayIcon, ReloadIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import RubberSegment from '@/components/reactbits/RubberSegment/RubberSegment';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { ChartFrame, HBars, type BarRow } from '@/components/viz/charts';
import {
  ALOHA_RUNS,
  ENDINGS,
  METHODS,
  PI05_RUNS,
  RELEASE,
  TRIALS,
  VERDICT,
  perSuccess,
  type Camera,
  type Verdict,
} from '@/data/aloha';
import { wilson } from '@/data/results';
import { useTheme } from '@/theme/ThemeProvider';
import { useInView, useMediaQuery, useNearViewport, useReducedMotion, useSeenOnce } from '@/lib/hooks';

/**
 * The ALOHA studies: four agents on one arm, ten trials each, and π0.5 with and without REA. The scoreboard
 * holds every outcome; beside it, the trials where the others failed and REA did not, end state against end state.
 */
export default function Aloha() {
  // a trial hovered in the scoreboard lights up in the endings, and the other way round
  const [hot, setHot] = useState<string | null>(null);
  return (
    <section id="aloha" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Out of simulation, onto a real arm</SectionTitle>
          <p className="lede">
            On an AlohaMini2 arm, REA solved all ten trials where the other agents solved four to eight, and it needed the least time and the
            fewest model calls per success.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-x-12 gap-y-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
          <div className="grid gap-5">
            <Scoreboard hot={hot} onHot={setHot} />
            <AlohaMetrics />
          </div>
          <Endings hot={hot} onHot={setHot} />
        </div>

        <Pi05Study />
      </Container>
    </section>
  );
}

const FAIL_FILL = 'color-mix(in srgb, var(--fail) 12%, var(--surface-2))';
const FAIL_EDGE = 'inset 0 0 0 1px color-mix(in srgb, var(--fail) 40%, transparent)';
/** a ring round the tile marks a trial that is shown elsewhere on the page; it reads on a pale tile and a dark one */
const SHOWN = '1.5px solid var(--ink-3)';

/** a failure's mark inside its tile: a bar for a missed grasp, a cross for a block that was not placed */
function FailMark({ kind }: { kind: 'grasp' | 'place' }) {
  if (kind === 'grasp') return <span className="h-[2px] w-[38%] rounded-full bg-fail" />;
  return (
    <span className="relative h-[40%] w-[40%]">
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 rotate-45 rounded-full bg-fail" />
      <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 -rotate-45 rounded-full bg-fail" />
    </span>
  );
}

function Tile({
  win,
  fill,
  fail = 'grasp',
  shown,
  hot,
  delay,
  seen,
  title,
  onHover,
}: {
  win: boolean;
  fill: string;
  fail?: 'grasp' | 'place';
  shown?: boolean;
  hot?: boolean;
  delay: number;
  seen: boolean;
  title: string;
  onHover?: (on: boolean) => void;
}) {
  return (
    <span
      className="relative grid aspect-square w-full place-items-center rounded-[5px]"
      style={{
        background: win ? fill : FAIL_FILL,
        boxShadow: win ? undefined : FAIL_EDGE,
        outline: hot ? '2px solid var(--ink)' : shown ? SHOWN : undefined,
        outlineOffset: 1.5,
        transform: seen ? undefined : 'scale(0.6)',
        opacity: seen ? 1 : 0,
        transition: `transform 420ms cubic-bezier(.2,.9,.3,1.3) ${delay}ms, opacity 300ms ${delay}ms`,
      }}
      title={title}
      onMouseEnter={onHover && (() => onHover(true))}
      onMouseLeave={onHover && (() => onHover(false))}
    >
      {!win && <FailMark kind={fail} />}
    </span>
  );
}

/** ten trials across, one row per agent; the four trials compared in the endings carry a hairline */
function Scoreboard({ hot, onHot }: { hot: string | null; onHot: (id: string | null) => void }) {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.2);
  const shown = new Set(ENDINGS.map((e) => e.id));
  const grid = 'grid grid-cols-[minmax(88px,auto)_repeat(10,minmax(0,1fr))] gap-[3px] sm:gap-1.5';
  return (
    <div ref={ref} className="figure-frame overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[15px] font-[740] text-ink [font-stretch:88%]">Ten trials per agent, block into the box</p>
        <p className="text-[12.5px] text-ink-3">AlohaMini2 right arm · operator-judged</p>
      </div>

      <div className={`${grid} mt-5 items-center`}>
        <span />
        {TRIALS.map((tr) => (
          <span key={tr} className="tabular pb-1 text-center text-[11px] font-[600] text-ink-4 sm:text-[12px]">
            {tr}
          </span>
        ))}
      </div>

      <ul className="mt-1 space-y-[3px] sm:space-y-1.5">
        {ALOHA_RUNS.map((run, ri) => {
          const ours = run.key === 'rea';
          return (
            <li key={run.key} className={grid}>
              <span className={`flex items-baseline gap-2 pr-2 ${ours ? 'text-ink' : 'text-ink-2'}`}>
                <span className={`truncate text-[13px] ${ours ? 'font-[760]' : 'font-[600]'} [font-stretch:90%] sm:text-[14px]`}>{METHODS[run.key].label}</span>
                <span className="tabular hidden text-[12px] font-[700] text-ink-3 sm:inline">{run.success}/10</span>
              </span>
              {run.wins.map((win, ci) => {
                const id = `${run.key}-${TRIALS[ci]}`;
                const compared = shown.has(id);
                return (
                  <Tile
                    key={id}
                    win={win}
                    fill={ours ? 'var(--s1)' : 'var(--ink-2)'}
                    shown={compared}
                    hot={hot === id}
                    delay={ri * 40 + ci * 26}
                    seen={seen}
                    title={`${METHODS[run.key].label}, trial ${TRIALS[ci]}: ${win ? 'success' : 'failure'}${compared ? ' (in the endings)' : ''}`}
                    onHover={compared ? (on) => onHot(on ? id : null) : undefined}
                  />
                );
              })}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-4 text-[12.5px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-s1" /> success
        </span>
        <span className="flex items-center gap-1.5">
          <span className="grid h-3 w-3 place-items-center rounded-[3px]" style={{ background: FAIL_FILL, boxShadow: FAIL_EDGE }}>
            <span className="h-px w-1.5 bg-fail" />
          </span>
          failure
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: 'var(--ink-2)', outline: SHOWN, outlineOffset: 1.5 }} /> compared in the endings
        </span>
      </div>
    </div>
  );
}

type MetricKey = 'solved' | 'time' | 'calls';

/** `short` is the tab on a phone, where the subtitle says "per success" instead */
const METRICS: Record<MetricKey, { tab: string; short: string; note: string }> = {
  solved: { tab: 'Solved', short: 'Solved', note: 'REA solves all ten trials; the next best, ASPIRE, solves eight.' },
  time: { tab: 'Time / success', short: 'Time', note: 'Run time of all ten trials divided by the trials that succeeded: what one success costs. Lower is better.' },
  calls: { tab: 'Calls / success', short: 'Calls', note: 'Model calls over all ten trials divided by the trials that succeeded. Lower is better.' },
};

/** the four agents on three measures, each of which REA leads */
function AlohaMetrics() {
  const { t, theme } = useTheme();
  const [m, setM] = useState<MetricKey>('solved');
  const roomy = useMediaQuery('(min-width: 640px)');
  const rows: BarRow[] = ALOHA_RUNS.map((r) => {
    const kind = r.key === 'rea' ? 'ours' : 'base';
    const label = METHODS[r.key].label;
    if (m === 'solved') {
      const [a, b] = wilson(r.success, 10);
      return { label, kind, value: r.success * 10, display: `${r.success}/10`, ci: [100 * a, 100 * b] };
    }
    const v = perSuccess(m === 'time' ? r.meanTime : r.meanCalls, r.success);
    return { label, kind, value: v, display: m === 'time' ? `${Math.round(v).toLocaleString('en-US')} s` : `${Math.round(v)}` };
  });
  const scale = { solved: { max: 100, ticks: [0, 50, 100], unit: '%' }, time: { max: 3000, ticks: [0, 1000, 2000, 3000], unit: '' }, calls: { max: 100, ticks: [0, 50, 100], unit: '' } }[m];
  return (
    <ChartFrame
      title="Four agents on the same arm"
      sub={m === 'time' ? 'seconds per success' : m === 'calls' ? 'model calls per success' : 'trials solved out of 10, with 95% intervals'}
      actions={
        <RubberSegment
          items={(Object.keys(METRICS) as MetricKey[]).map((k) => ({ value: k, label: roomy ? METRICS[k].tab : METRICS[k].short }))}
          value={m}
          onChange={(v) => setM(v as MetricKey)}
          trackColor={theme === 'dark' ? t.surface2 : t.paper2}
          thumbColor={t.ink}
          textColor={t.ink2}
          activeTextColor={t.paper}
          size="sm"
          radius={999}
          aria-label="Measure"
        />
      }
      table={{
        head: ['Agent', 'Solved', 'Seconds per success', 'Model calls per success'],
        rows: ALOHA_RUNS.map((r) => [
          METHODS[r.key].label,
          `${r.success}/10`,
          Math.round(perSuccess(r.meanTime, r.success)).toLocaleString('en-US'),
          Math.round(perSuccess(r.meanCalls, r.success)),
        ]),
      }}
    >
      {/* keyed by the measure, so the bars grow again on every switch */}
      <HBars key={m} rows={rows} max={scale.max} unit={scale.unit} ticks={scale.ticks} decimals={0} labelWidth={92} barH={20} ariaLabel={`${METRICS[m].tab}, four agents on ALOHA`} />
      <p className="mt-6 border-t border-rule pt-3 text-[12.5px] leading-snug text-ink-3">{METRICS[m].note}</p>
    </ChartFrame>
  );
}

const CAMS: { value: Camera; label: string }[] = [
  { value: 'right_wrist', label: 'Wrist' },
  { value: 'head', label: 'Head' },
  { value: 'external', label: 'External' },
];

/**
 * Four trials with the blue block, played start to end together: the three baselines' failures and REA's trial 09.
 * The first time the panel is seen it plays once and stops on the end states; the slider scrubs.
 */
function Endings({ hot, onHot }: { hot: string | null; onHot: (id: string | null) => void }) {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const [nearRef, near] = useNearViewport<HTMLDivElement>('400px');
  const [seenRef, seen] = useSeenOnce<HTMLDivElement>(0.35);
  const [cam, setCam] = useState<Camera>('right_wrist');
  const [i, setI] = useState(3);
  const [playing, setPlaying] = useState(false);
  const last = 3;

  useEffect(() => {
    if (!seen || reduce) return;
    setI(0);
    setPlaying(true);
  }, [seen, reduce]);

  useEffect(() => {
    if (!playing) return;
    if (i >= last) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setI((x) => x + 1), 1300);
    return () => window.clearTimeout(id);
  }, [playing, i]);

  const toggle = () => {
    if (playing) return setPlaying(false);
    if (i >= last) setI(0);
    setPlaying(true);
  };

  return (
    <div ref={nearRef} className="figure-frame overflow-hidden">
      <div ref={seenRef} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-rule px-5 py-4">
        <div className="min-w-0">
          <p className="text-[15px] font-[740] text-ink [font-stretch:88%]">The same block, four endings</p>
          <p className="mt-0.5 text-[12.5px] text-ink-3">three baselines fail where REA succeeds</p>
        </div>
        <RubberSegment
          items={CAMS}
          value={cam}
          onChange={(v) => setCam(v as Camera)}
          trackColor={theme === 'dark' ? t.surface2 : t.paper2}
          thumbColor={t.ink}
          textColor={t.ink2}
          activeTextColor={t.paper}
          size="sm"
          radius={999}
          aria-label="Camera"
        />
      </div>

      <div className="grid grid-cols-2 gap-px bg-rule">
        {ENDINGS.map((e) => {
          const end = i === last;
          const ok = e.verdict === 'success';
          return (
            <div
              key={e.id}
              className={`relative overflow-hidden bg-[#0b0e14] ${cam === 'external' ? 'aspect-video' : 'aspect-[4/3]'}`}
              style={{ outline: hot === e.id ? '2px solid var(--ink)' : undefined, outlineOffset: -2, zIndex: hot === e.id ? 1 : undefined }}
              onMouseEnter={() => onHot(e.id)}
              onMouseLeave={() => onHot(null)}
            >
              {near &&
                e.stages.map((s, k) => (
                  <img
                    key={s[cam]}
                    src={s[cam]}
                    alt={k === i ? `${METHODS[e.method].label} trial ${e.trial}, ${cam.replace('_', ' ')} camera, ${k === 0 ? 'start' : k === last ? 'end' : 'during the trial'}` : ''}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                    style={{ opacity: k === i ? 1 : 0 }}
                    draggable={false}
                  />
                ))}
              {end && ok && <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--done)]" />}
              <span className="pointer-events-none absolute left-2 top-2 whitespace-nowrap rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[680] text-white backdrop-blur-sm [font-stretch:92%] sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[12px]">
                {METHODS[e.method].label} <span className="tabular font-[560] text-white/70">{e.trial}</span>
              </span>
              <AnimatePresence>
                {end && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: ok ? 0.25 : 0 }}
                    className="pointer-events-none absolute bottom-2 left-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-[700] text-white sm:bottom-2.5 sm:left-2.5 sm:px-2.5 sm:text-[12px]"
                    style={{ background: ok ? 'var(--done)' : 'var(--fail)' }}
                  >
                    {VERDICT[e.verdict]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="border-t border-rule px-5 pb-4 pt-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
            aria-label={playing ? 'Pause' : i >= last ? 'Play the four trials again' : 'Play the four trials'}
          >
            <Icon icon={playing ? PauseIcon : i >= last ? ReloadIcon : PlayIcon} size={15} />
          </button>
          <div className="flex-1">
            <ElasticSlider
              value={i}
              maxValue={last}
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
              leftIcon={<span className="text-[11.5px] font-[600] text-ink-3">start</span>}
              rightIcon={<span className="text-[11.5px] font-[600] text-ink-3">end</span>}
              ariaLabel="Moment in the trials"
            />
          </div>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-ink-3">
          The archive's failed trial for each baseline, beside REA's trial 09; all four start with the blue block next to the box.
        </p>
      </div>
    </div>
  );
}

function Pi05Study() {
  return (
    <div className="mt-24">
      <div className="grid gap-x-16 gap-y-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
        <div>
          <p className="text-[14px] font-[700] text-ink-3 [font-stretch:92%]">Real robot · with π0.5</p>
          <h3 className="sign-lg title-part mt-2.5 text-ink">π0.5 alone, and π0.5 inside REA</h3>
        </div>
        <p className="text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
          Same arm, same task, ten trials each. Inside REA the policy solves <b>8</b> instead of <b>3</b>, and placement failures fall from five
          to none.
        </p>
      </div>
      <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <ReleasePair />
        <Pi05Tiles />
      </div>
    </div>
  );
}

/** trial 03 of both groups, the two clips locked together on the moment the gripper opens */
function ReleasePair() {
  const reduce = useReducedMotion();
  const [nearRef, near] = useNearViewport<HTMLDivElement>('400px');
  const [viewRef, inView] = useInView<HTMLDivElement>(0.5);
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const autoplayed = useRef(false);
  const { duration, opens } = RELEASE;
  const landed = time >= opens + 0.8;
  const ended = time >= duration - 0.06;

  const play = () => {
    const vs = vids.current.filter((v): v is HTMLVideoElement => !!v);
    if (!vs.length) return;
    const from = vs[0].ended || vs[0].currentTime >= duration - 0.06 ? 0 : vs[0].currentTime;
    vs.forEach((v) => {
      v.currentTime = from;
      v.play().catch(() => setPlaying(false));
    });
    setTime(from);
    setPlaying(true);
  };
  const pause = () => {
    vids.current.forEach((v) => v?.pause());
    setPlaying(false);
  };

  // plays once by itself the first time it is in view; scrolled away, it pauses
  useEffect(() => {
    if (!near || reduce) return;
    if (inView && !autoplayed.current) {
      autoplayed.current = true;
      play();
    } else if (!inView && playing) pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, near, reduce]);

  // the first clip is the clock for the progress bar and the verdicts
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = vids.current[0];
      if (v) setTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div ref={nearRef} className="figure-frame overflow-hidden">
      <div ref={viewRef} className="grid grid-cols-2 gap-px bg-rule">
        {RELEASE.clips.map((c, k) => {
          const ok = c.verdict === 'success';
          return (
            <div key={c.key} className="relative aspect-[4/3] overflow-hidden bg-[#0b0e14]">
              <video
                ref={(el) => {
                  vids.current[k] = el;
                }}
                src={near ? c.src : undefined}
                poster={c.poster}
                muted
                playsInline
                preload={near ? 'auto' : 'none'}
                onEnded={
                  k === 0
                    ? () => {
                        setPlaying(false);
                        setTime(duration);
                      }
                    : undefined
                }
                className="absolute inset-0 h-full w-full object-cover"
              />
              {landed && ok && <span className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_3px_var(--done)]" />}
              <span className="pointer-events-none absolute left-2 top-2 whitespace-nowrap rounded-full bg-black/55 px-2.5 py-0.5 text-[12px] font-[700] text-white backdrop-blur-sm [font-stretch:92%] sm:left-2.5 sm:top-2.5 sm:text-[13px]">
                {c.label} <span className="tabular font-[560] text-white/70">{RELEASE.trial}</span>
              </span>
              <AnimatePresence>
                {landed && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute bottom-2 left-2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-[700] text-white sm:bottom-2.5 sm:left-2.5 sm:text-[12px]"
                    style={{ background: ok ? 'var(--done)' : 'var(--fail)' }}
                  >
                    {ok ? 'in the box' : 'outside the box'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="border-t border-rule px-5 pb-4 pt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? pause() : play())}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
            aria-label={playing ? 'Pause both clips' : ended ? 'Play both clips again' : 'Play both clips'}
          >
            <Icon icon={playing ? PauseIcon : ended ? ReloadIcon : PlayIcon} size={15} />
          </button>
          {/* one bar for both clips, with the moment the grippers open marked on it */}
          <div className="relative h-[26px] flex-1">
            <div className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-rule-2">
              <div className="h-full rounded-full bg-ink" style={{ width: `${Math.min(100, (time / duration) * 100)}%` }} />
            </div>
            <span className="absolute top-1/2 h-[14px] w-[2px] -translate-y-1/2 rounded-full bg-s1" style={{ left: `${(opens / duration) * 100}%` }} />
            <span
              className="absolute -top-[13px] -translate-x-1/2 whitespace-nowrap text-[11px] font-[650] text-ink-3"
              style={{ left: `${(opens / duration) * 100}%` }}
            >
              gripper opens
            </span>
          </div>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-ink-3">
          Right-wrist camera, trial 03 of each group, the 9.4&nbsp;s around the release in real time.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, from, to, of }: { label: string; from: number; to: number; of?: number }) {
  return (
    <>
      <dt className="text-[13.5px] font-[600] text-ink-2">{label}</dt>
      <dd className="tabular flex items-baseline justify-end gap-2 whitespace-nowrap">
        <span className="text-[22px] font-[700] text-ink-3 [font-stretch:86%]">{from}</span>
        <span className="text-[15px] text-ink-4">→</span>
        <span className="text-[30px] font-[800] leading-none text-s1 [font-stretch:84%]">{to}</span>
        {of && <span className="text-[13px] font-[600] text-ink-3">/ {of}</span>}
      </dd>
    </>
  );
}

/** both groups trial by trial, failures marked by the stage where they happened */
function Pi05Tiles() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const count = (r: (typeof PI05_RUNS)[number], v: Verdict) => r.trials.filter(([, x]) => x === v).length;
  const [pi, rea] = PI05_RUNS;
  const legend: [ReactNode, string][] = [
    [<span key="s" className="h-3 w-3 rounded-[3px] bg-s1" />, 'solved'],
    [
      <span key="g" className="grid h-3 w-3 place-items-center rounded-[3px]" style={{ background: FAIL_FILL, boxShadow: FAIL_EDGE }}>
        <span className="h-px w-1.5 bg-fail" />
      </span>,
      'failed at grasp',
    ],
    [
      <span key="p" className="grid h-3 w-3 place-items-center rounded-[3px] text-[9px] font-[800] leading-none text-fail" style={{ background: FAIL_FILL, boxShadow: FAIL_EDGE }}>
        ×
      </span>,
      'failed at placement',
    ],
  ];
  return (
    <ChartFrame
      title="Ten trials each"
      sub="operator-judged; π0.5 at step 5000"
      table={{
        head: ['Arm', 'Solved', 'Failed at grasp', 'Failed at placement'],
        rows: PI05_RUNS.map((r) => [`${r.label} (${r.detail})`, `${count(r, 'success')}/10`, count(r, 'grasp'), count(r, 'place')]),
      }}
    >
      <div ref={ref}>
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2.5">
          <Stat label="Solved" from={count(pi, 'success')} to={count(rea, 'success')} of={10} />
          <Stat label="Failed at placement" from={count(pi, 'place')} to={count(rea, 'place')} />
        </dl>

        <ul className="mt-6 space-y-1.5">
          {PI05_RUNS.map((r, ri) => (
            <li key={r.key} className="grid grid-cols-[52px_repeat(10,minmax(0,1fr))] items-center gap-[3px] sm:gap-1.5">
              <span className={`text-[13.5px] [font-stretch:90%] ${r.key === 'rea' ? 'font-[760] text-ink' : 'font-[600] text-ink-2'}`}>{r.label}</span>
              {r.trials.map(([trial, v], ci) => (
                <Tile
                  key={trial}
                  win={v === 'success'}
                  fill={r.key === 'rea' ? 'var(--s1)' : 'var(--ink-2)'}
                  fail={v === 'place' ? 'place' : 'grasp'}
                  shown={trial === RELEASE.trial}
                  delay={ri * 60 + ci * 30}
                  seen={seen}
                  title={`${r.label}, trial ${trial}: ${v === 'success' ? 'success' : v === 'grasp' ? 'failed at grasp' : 'failed at placement'}${trial === RELEASE.trial ? ' (in the clips)' : ''}`}
                />
              ))}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-rule pt-3.5 text-[12.5px] text-ink-3">
          {legend.map(([swatch, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              {swatch}
              {label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-[3px]" style={{ background: 'var(--ink-2)', outline: SHOWN, outlineOffset: 1.5 }} /> trial 03, in the clips
          </span>
        </div>
      </div>
    </ChartFrame>
  );
}

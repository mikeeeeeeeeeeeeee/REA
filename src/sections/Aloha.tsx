import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PauseIcon, PlayIcon, ReloadIcon } from '@hugeicons/core-free-icons';
import RubberSegment from '@/components/reactbits/RubberSegment/RubberSegment';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { ChartFrame, HBars, type BarRow } from '@/components/viz/charts';
import { ALOHA_RUNS, ENDINGS, METHODS, PI05_RUNS, RELEASE, VERDICT, perSuccess, type Verdict } from '@/data/aloha';
import CLOCKS from '@/data/gen/page-videos.json';
import { wilson } from '@/data/results';
import { useTheme } from '@/theme/ThemeProvider';
import { useInView, useMediaQuery, useNearViewport, useReducedMotion } from '@/lib/hooks';

/**
 * The ALOHA studies (October 2026, not yet in the paper): four agents on one real arm, ten trials each,
 * and π0.5 with and without REA. Both lead with video: the trials where the others failed and REA did
 * not, sped up to their end states, and the moment π0.5's block lands outside the box and REA's inside.
 */
const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';

export default function Aloha() {
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

        <div className="mt-14 grid items-start gap-x-12 gap-y-6 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <EndingsVideo />
          <AlohaMetrics />
        </div>

        <Pi05Study />
      </Container>
    </section>
  );
}

type EndClock = { lapse: number; reveal: number[]; duration: number; tile: number[]; gap: number; order: string[] };

/**
 * The archive's failed trial for each baseline beside REA's trial 09, all four with the blue block next to
 * the box, as one sped-up video: the head camera's photos as a time-lapse, then the wrist camera's last
 * photo. The page writes the names and the operator's verdicts on top, on the video's clock.
 */
function EndingsVideo() {
  const reduce = useReducedMotion();
  const clock = (CLOCKS as unknown as Record<string, EndClock>)['aloha-endings'];
  const [ref, near] = useNearViewport<HTMLDivElement>('200px');
  const video = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(reduce ? clock.duration : 0);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (near && !reduce) el.play().catch(() => undefined);
    else el.pause();
  }, [near, reduce]);

  useEffect(() => {
    if (!near || reduce) return;
    let raf = 0;
    const tick = () => {
      const el = video.current;
      if (el) setTime(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, reduce]);

  const [tw, th] = clock.tile;
  const W = tw * 2 + clock.gap;
  const H = th * 2 + clock.gap;
  const lapsing = time < clock.lapse;
  return (
    <figure ref={ref} className="figure-frame overflow-hidden">
      <div className="relative bg-[#0b0e14]" style={{ aspectRatio: `${W} / ${H}` }}>
        <video
          ref={video}
          src={near ? `${BASE}aloha/endings.mp4` : undefined}
          poster={`${BASE}aloha/endings.webp`}
          muted
          playsInline
          loop
          autoPlay={!reduce}
          preload={near ? 'auto' : 'none'}
          className="absolute inset-0 h-full w-full"
        />
        {ENDINGS.map((e, j) => {
          const left = ((j % 2) * (tw + clock.gap) * 100) / W;
          const top = (Math.floor(j / 2) * (th + clock.gap) * 100) / H;
          const shown = time >= clock.reveal[j] + 0.15;
          const ok = e.verdict === 'success';
          return (
            <div key={e.id} className="pointer-events-none absolute" style={{ left: `${left}%`, top: `${top}%`, width: `${(tw * 100) / W}%`, height: `${(th * 100) / H}%` }}>
              {ok && shown && <span className="absolute inset-0 shadow-[inset_0_0_0_3px_var(--done)]" />}
              <span className="absolute left-2 top-2 whitespace-nowrap rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[680] text-white backdrop-blur-sm [font-stretch:92%] sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[12px]">
                {METHODS[e.method].label} <span className="tabular font-[560] text-white/70">{e.trial}</span>
              </span>
              <AnimatePresence>
                {shown && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-2 left-2 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-[700] text-white sm:bottom-2.5 sm:left-2.5 sm:px-2.5 sm:text-[12px]"
                    style={{ background: ok ? 'var(--done)' : 'var(--fail)' }}
                  >
                    {VERDICT[e.verdict]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {/* the seams between the four trials, in the page's own surface colour */}
        <span className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-surface" />
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-surface" />
        <span className="pointer-events-none absolute right-2.5 top-2.5 hidden rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-[650] text-ink-2 transition-opacity sm:inline-block" style={{ opacity: lapsing ? 1 : 0 }}>
          head camera, time-lapse
        </span>
      </div>
      <figcaption className="border-t border-rule px-5 py-3.5 text-[12.5px] leading-snug text-ink-3">
        The archive's failed trial for each baseline beside REA's trial 09, all four starting with the blue block next to the box: the head camera as a
        time-lapse, then the wrist camera's last photo with the operator's verdict.
      </figcaption>
    </figure>
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
        <Pi05Card />
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

/** both groups' ten trials, in two numbers each: solved, and failed at placement */
function Pi05Card() {
  const count = (r: (typeof PI05_RUNS)[number], v: Verdict) => r.trials.filter(([, x]) => x === v).length;
  const [pi, rea] = PI05_RUNS;
  const rows: BarRow[] = PI05_RUNS.map((r) => {
    const k = count(r, 'success');
    const [a, b] = wilson(k, 10);
    return { label: r.key === 'rea' ? 'REA' : 'π0.5 alone', value: k * 10, display: `${k}/10`, kind: r.key === 'rea' ? 'ours' : 'base', ci: [100 * a, 100 * b] };
  });
  return (
    <ChartFrame
      title="Ten trials each"
      sub="operator-judged; π0.5 at step 5000, REA with π0.5 and a code policy"
      table={{
        head: ['Arm', 'Solved', 'Failed at grasp', 'Failed at placement'],
        rows: PI05_RUNS.map((r) => [`${r.label} (${r.detail})`, `${count(r, 'success')}/10`, count(r, 'grasp'), count(r, 'place')]),
      }}
    >
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-2.5">
        <Stat label="Solved" from={count(pi, 'success')} to={count(rea, 'success')} of={10} />
        <Stat label="Failed at placement" from={count(pi, 'place')} to={count(rea, 'place')} />
      </dl>
      <div className="mt-6 border-t border-rule pt-5">
        <HBars rows={rows} max={100} unit="%" ticks={[0, 50, 100]} labelWidth={96} barH={20} ariaLabel="Trials solved, π0.5 alone and inside REA" />
      </div>
    </ChartFrame>
  );
}

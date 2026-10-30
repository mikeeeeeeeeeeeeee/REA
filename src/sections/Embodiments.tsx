import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import JellyRadio from '@/components/reactbits/JellyRadio/JellyRadio';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ChartFrame } from '@/components/viz/charts';
import { BEHAVIOR_TASKS, G1_LATENCY } from '@/data/results';
import { BEHAVIOR } from '@/data/gen/behavior';
import { ROBOTWIN } from '@/data/gen/robotwin';
import CLOCKS from '@/data/gen/page-videos.json';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion, useSeenOnce } from '@/lib/hooks';

/** the sped-up videos live in public/; the single-file build streams them from the published site */
const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';

export default function Embodiments() {
  return (
    <section id="embodiments" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>One runtime, real and simulated</SectionTitle>
          <p className="lede">The same three-level contract drives a real Unitree G1 humanoid and two more simulators.</p>
        </div>

        {/* the real robot, laid out like the simulators below: a heading row, then the video and the latency chart side by side, one height */}
        <div className="mt-14 grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Real robot
            </p>
            <h3 className="sign-lg title-part mt-2.5 text-ink">A Unitree G1 walks to a chair and pushes it</h3>
          </div>
          <div className="space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
            <p>
              Every method gets the same robot, model and four policies: walk forward, the native two-arm push, release, stop. REA succeeded in{' '}
              <b>8 of 10</b> trials, against 5 for an Agents SDK agent, 4 for Codex and 2 for ASPIRE's code-as-policy.
            </p>
            <p>
              A separate service on the robot, without the router, computes brain decisions ahead of the request: one returns in <b>1.0 to 3.6 ms</b>{' '}
              instead of about 5 s.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <G1Player />
          <LatencyChart />
        </div>

        {/* the two simulators: a heading row, then the RoboTwin video and the BEHAVIOR-1K table side by side */}
        <div className="mt-24 grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Simulators
            </p>
            <h3 className="sign-lg title-part mt-2.5 text-ink">The same runtime on two more simulators</h3>
          </div>
          <div className="space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
            <p>
              On RoboTwin 2.0 a fast reflex model is the System 0 policy, and the router hands single decisions to a deliberate model.
            </p>
            <p>
              On BEHAVIOR-1K, a mobile R1Pro starts metres from the object it has to find and pick up; REA ran with the same tools, model and 1,500 s
              budget as an online agent.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <RoboTwinVideo />
          <BehaviorGrid />
        </div>
      </Container>
    </section>
  );
}

/** decades of the log axis, 1 ms .. 5 s */
const LAT_TICKS = [
  { v: 0.001, label: '1 ms' },
  { v: 0.01, label: '10 ms' },
  { v: 0.1, label: '100 ms' },
  { v: 1, label: '1 s' },
];
const LAT_LABEL = 132; // the stage column
const LAT_VALUE = 72; // room right of the longest bar for its value

function LatencyChart() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  const at = (v: number) => (Math.log10(v) + 3) / (Math.log10(5) + 3); // 1 ms .. 5 s on 0..1
  const track = { left: LAT_LABEL + 12, right: LAT_VALUE } as const;
  return (
    <ChartFrame
      fill
      title="G1 request latency"
      sub="medians over 5–8 trials on the robot's Jetson, log scale"
      table={{ head: ['Stage', 'Median latency'], rows: G1_LATENCY.map((g) => [g.stage, g.latency]) }}
    >
      <div ref={ref} className="relative flex flex-1 flex-col">
        {/* decade grid, behind the bars */}
        <div className="pointer-events-none absolute bottom-[26px] top-0" style={track}>
          {LAT_TICKS.map((t) => (
            <span key={t.label} className="absolute bottom-0 top-0 w-px bg-rule" style={{ left: `${at(t.v) * 100}%` }} />
          ))}
        </div>
        <ul className="relative flex flex-1 flex-col justify-around gap-4 py-1">
          {G1_LATENCY.map((g, i) => {
            const w = at(g.value);
            const ours = i === G1_LATENCY.length - 1;
            return (
              <li key={g.stage} className="grid items-center gap-3" style={{ gridTemplateColumns: `${LAT_LABEL}px minmax(0,1fr)` }}>
                <span className={`text-right text-[13.5px] leading-tight ${ours ? 'font-[720] text-ink' : 'text-ink-2'}`}>{g.stage}</span>
                <div className="relative h-[20px]" style={{ marginRight: LAT_VALUE }}>
                  <motion.span
                    className="absolute inset-y-0 left-0 block origin-left rounded-r-[4px]"
                    style={{ width: `${w * 100}%`, background: ours ? 'var(--s1)' : 'var(--base-2)' }}
                    initial={{ scaleX: 0 }}
                    animate={seen ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.span
                    className={`tabular absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-[13px] ${ours ? 'font-[760] text-ink' : 'font-[600] text-ink-2'}`}
                    style={{ left: `${w * 100}%` }}
                    initial={{ opacity: 0 }}
                    animate={seen ? { opacity: 1 } : {}}
                    transition={{ delay: 0.5 + 0.08 * i }}
                  >
                    {g.latency}
                  </motion.span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="relative mt-2 h-[18px]" style={track}>
          {LAT_TICKS.map((t, i) => (
            <span
              key={t.label}
              className={`tabular absolute top-0 whitespace-nowrap text-[11.5px] text-ink-4 ${i === 0 ? '' : '-translate-x-1/2'}`}
              style={{ left: `${at(t.v) * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </ChartFrame>
  );
}

export type G1Clock = { duration: number; push: number; cut: Record<string, number>; front: number[]; side: number[] };
/** the trial plays sped up: in real time its two small steps and the push are slow to watch */
export const G1_SPEED = 2;

/**
 * REA on the Unitree G1, from a front and a side camera (the videos behind the paper's Figure 13), both at 2x speed.
 * Each clip is cut around its own push (tools/page_videos.py), so the two pushes land at the same moment; they share
 * one clock, and the slider seeks both.
 */
function G1Player() {
  const reduce = useReducedMotion();
  const clock = (CLOCKS as unknown as Record<string, G1Clock>)['g1'];
  const [ref, near] = useNearViewport<HTMLDivElement>('200px');
  const front = useRef<HTMLVideoElement>(null);
  const side = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(!reduce);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const vs = [front.current, side.current].filter((v): v is HTMLVideoElement => !!v);
    vs.forEach((v) => {
      v.defaultPlaybackRate = G1_SPEED;
      v.playbackRate = G1_SPEED;
    });
    if (near && playing) vs.forEach((v) => v.play().catch(() => setPlaying(false)));
    else vs.forEach((v) => v.pause());
  }, [near, playing]);

  // the front clip is the clock; the side one is pulled back whenever it drifts
  useEffect(() => {
    if (!near) return;
    let raf = 0;
    const tick = () => {
      const f = front.current;
      const sd = side.current;
      if (f) {
        setTime(f.currentTime);
        if (sd && sd.readyState > 1 && Math.abs(sd.currentTime - f.currentTime) > 0.1) sd.currentTime = f.currentTime;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near]);

  const seek = (v: number) => {
    setPlaying(false);
    [front.current, side.current].forEach((x) => {
      if (x) x.currentTime = v;
    });
    setTime(v);
  };
  const [fw, fh] = clock.front;
  const [sw, sh] = clock.side;
  const vid = (cam: 'front' | 'side', r: React.RefObject<HTMLVideoElement | null>) => (
    <video
      ref={r}
      src={near ? `${BASE}g1/${cam}.mp4` : undefined}
      poster={`${BASE}g1/${cam}.webp`}
      muted
      playsInline
      loop
      autoPlay={!reduce}
      preload={near ? 'auto' : 'none'}
      onLoadedMetadata={(e) => {
        e.currentTarget.defaultPlaybackRate = G1_SPEED;
        e.currentTarget.playbackRate = G1_SPEED;
      }}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
  return (
    <div ref={ref} className="figure-frame flex flex-col overflow-hidden">
      {/* the two cameras side by side at one height: the columns are in the ratio of the videos' aspect ratios */}
      <div className="grid gap-px bg-rule" style={{ gridTemplateColumns: `minmax(0, ${fw / fh}fr) minmax(0, ${sw / sh}fr)` }}>
        <div className="relative overflow-hidden bg-[#0b0e14]" style={{ aspectRatio: `${fw} / ${fh}` }}>
          {vid('front', front)}
          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[650] text-white backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[12px]">front</span>
        </div>
        <div className="relative overflow-hidden bg-[#0b0e14]" style={{ aspectRatio: `${sw} / ${sh}` }}>
          {vid('side', side)}
          <span className="absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-[650] text-white backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[12px]">side</span>
          <span className="tabular absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-[650] text-[#3b424f] sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[12px]">
            {G1_SPEED}× speed · {time.toFixed(1)} s
          </span>
        </div>
      </div>
      <div className="mt-auto border-t border-rule px-5 pb-5 pt-4">
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
              value={time}
              maxValue={clock.duration}
              isStepped
              stepSize={0.1}
              onChange={seek}
              valuePosition="none"
              thickness={8}
              activeThickness={12}
              className="!w-full"
              leftIcon={<span className="tabular text-[12px] font-[600] text-ink-3">0 s</span>}
              rightIcon={<span className="tabular text-[12px] font-[600] text-ink-3">{clock.duration.toFixed(1)} s</span>}
              ariaLabel="Video time"
            />
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-snug text-ink-3">REA on the G1, seen by a front and a side camera. Each clip is cut around the two-arm push and plays at {G1_SPEED}× speed.</p>
      </div>
    </div>
  );
}

type Clock = { per: number; hold: number; n: number; duration: number; routes: string[]; arms: (string | null)[] };

/**
 * A RoboTwin 2.0 test scene as a sped-up video: the front camera, one frame per decision. Under it a
 * ticker of the decisions, coloured by who made each one (the fast reflex model, System 0, or the
 * deliberate model, System 2), follows the video's clock.
 */
export function RoboTwinVideo() {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(2);
  const sc = ROBOTWIN[scene];
  const clock = (CLOCKS as unknown as Record<string, Clock>)[`robotwin-${sc.id}`];
  const [ref, near] = useNearViewport<HTMLDivElement>('200px');
  const video = useRef<HTMLVideoElement>(null);
  const chips = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0);

  // on a narrow screen the scene chips scroll sideways: start with the chosen one in view (sideways only)
  useEffect(() => {
    const row = chips.current;
    const on = row?.querySelector<HTMLElement>('[data-on="true"]');
    if (row && on && row.scrollWidth > row.clientWidth) row.scrollLeft = Math.max(0, on.offsetLeft - 20);
  }, []);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (near && !reduce) el.play().catch(() => undefined);
    else el.pause();
  }, [near, reduce, scene]);

  // the decision on screen, from the video's own clock
  useEffect(() => {
    if (!near) return;
    let raf = 0;
    const tick = () => {
      const el = video.current;
      if (el) setK(Math.min(clock.n - 1, Math.floor(el.currentTime / clock.per)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, clock]);

  const route = clock.routes[k];
  const deliberate = route === 'deliberate';
  return (
    <div ref={ref} className="figure-frame flex flex-col overflow-hidden">
      <div ref={chips} className="relative overflow-x-auto border-b border-rule px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <JellyRadio
          items={ROBOTWIN.map((r, i) => ({ value: String(i), label: r.title.replace(' (randomized scene)', '') }))}
          value={String(scene)}
          onChange={(v) => {
            setK(0);
            setScene(Number(v));
          }}
          chipColor={theme === 'dark' ? t.surface2 : t.paper2}
          activeColor={t.ink}
          textColor={t.ink2}
          activeTextColor={t.paper}
          size="sm"
          ariaLabel="RoboTwin scene"
        />
      </div>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0b0e14]">
        <video
          ref={video}
          key={sc.id}
          src={near ? `${BASE}robotwin/${sc.id}.mp4` : undefined}
          poster={`${BASE}robotwin/${sc.id}.webp`}
          muted
          playsInline
          loop
          autoPlay={!reduce}
          preload={near ? 'auto' : 'none'}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="tabular absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-[650] text-white backdrop-blur-sm">
          decision {k + 1} of {clock.n}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-[650] text-[#3b424f]">one frame per decision, sped up</span>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-2.5 py-1 text-[12.5px] font-[650] text-white backdrop-blur-sm">
          <span className="badge text-[10.5px]" style={{ background: deliberate ? 'var(--s2)' : 'var(--s0)' }}>
            {deliberate ? 'S2' : 'S0'}
          </span>
          {deliberate ? 'deliberate model' : 'reflex model'}
          {clock.arms[k] ? <span className="text-white/65">· {clock.arms[k]} arm</span> : null}
        </span>
      </div>
      <div className="px-5 pb-4 pt-3.5">
        <div className="flex gap-[3px]" aria-hidden>
          {clock.routes.map((r, i) => (
            <span
              key={i}
              className="h-[7px] flex-1 rounded-full transition-opacity duration-150"
              style={{ background: r === 'deliberate' ? 'var(--s2)' : 'var(--s0)', opacity: i <= k ? 1 : 0.22 }}
            />
          ))}
        </div>
        <p className="mt-3 text-[12.5px] leading-snug text-ink-3">
          Test scene {sc.scene.replace('rt500-', '').replace(/-/g, ' ')}, solved in {clock.n} decisions. Blue: the reflex model; orange: a single decision
          handed to the deliberate model.
        </p>
      </div>
    </div>
  );
}

function BehaviorGrid() {
  const max = 10;
  return (
    <ChartFrame
      fill
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
      {/* the four tasks' pictures share whatever height the card has left beside the RoboTwin video */}
      <div className="mt-4 grid min-h-[260px] flex-1 grid-cols-2 grid-rows-2 gap-2">
        {BEHAVIOR.map((b) => (
          <figure key={b.id} className="relative overflow-hidden rounded-lg bg-[#0b0e14]">
            <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
            <figcaption className="absolute bottom-2 left-2 max-w-[calc(100%-16px)] truncate rounded-full bg-black/55 px-2.5 py-0.5 text-[11.5px] font-[650] text-white backdrop-blur-sm">
              {b.title.replace(/^Pick up the /, '')}
            </figcaption>
          </figure>
        ))}
      </div>
    </ChartFrame>
  );
}

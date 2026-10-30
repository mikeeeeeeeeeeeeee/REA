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

        <div className="mt-14 grid items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">
              <LineBadge line="s0" size={12} /> Real robot
            </p>
            <h3 className="sign-lg title-part mt-2.5 text-ink">A Unitree G1 walks to a chair and pushes it</h3>
            <div className="mt-4 space-y-3 text-[17px] leading-[1.65] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
              <p>
                Every method gets the same robot, model and four policies: walk forward, the native two-arm push, release, stop. REA succeeded in{' '}
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

type G1Clock = { duration: number; push: number; front: number[]; side: number[] };

/**
 * REA's Unitree G1 trial, filmed by two external cameras (the videos behind the paper's Figure 13), both in real
 * time: the side camera follows the front one's clock, so the push lands in both at once. The slider seeks both.
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
    if (near && playing) vs.forEach((v) => v.play().catch(() => setPlaying(false)));
    else vs.forEach((v) => v.pause());
  }, [near, playing]);

  // the front camera is the clock; the side one is pulled back into step whenever it drifts
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
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
  return (
    <div ref={ref} className="figure-frame overflow-hidden">
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
            real time · {time.toFixed(1)} s
          </span>
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
        <p className="mt-3 text-[13px] leading-snug text-ink-3">One of REA's successful trials, filmed by two external cameras; both play in real time and in step.</p>
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
function RoboTwinVideo() {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(2);
  const sc = ROBOTWIN[scene];
  const clock = (CLOCKS as unknown as Record<string, Clock>)[`robotwin-${sc.id}`];
  const [ref, near] = useNearViewport<HTMLDivElement>('200px');
  const video = useRef<HTMLVideoElement>(null);
  const [k, setK] = useState(0);

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
      <div className="border-b border-rule px-5 py-4">
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

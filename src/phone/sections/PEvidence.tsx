import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { LineBadge } from '@/components/ui/Line';
import { ChartFrame, Legend } from '@/components/viz/charts';
import { CARDS, ci, pct, type Card } from '@/sections/Results';
import { G1_SPEED, RoboTwinVideo, type G1Clock } from '@/sections/Embodiments';
import { BEHAVIOR_TASKS, G1_LATENCY } from '@/data/results';
import { BEHAVIOR } from '@/data/gen/behavior';
import CLOCKS from '@/data/gen/page-videos.json';
import { useNearViewport, useReducedMotion, useSeenOnce } from '@/lib/hooks';
import { PartSign, StopSign } from '../ui/Sign';
import Seg from '../ui/Seg';
import Snap from '../ui/Snap';
import PBars from '../ui/PBars';

const BASE = import.meta.env.MODE === 'single' ? 'https://mikeeeeeeeeeeeeee.github.io/REA/' : './';
const SHORT: Record<string, string> = { behavior: 'BEHAVIOR', robotwin: 'RoboTwin', g1: 'G1', aloha: 'ALOHA' };

export function PResults() {
  const [i, setI] = useState(0);
  return (
    <section id="results" className="relative bg-paper-2 pb-12">
      <StopSign
        id="results"
        lede={
          <>
            On LIBERO-Pro REA reaches <b>95.9%</b> of 3,000 test episodes; with VLA and code policies together it reaches <b>86%</b> on RoboTwin 2.0. Beyond
            that, two simulators and two real robots:
          </>
        }
      />
      <div className="mt-7 px-5">
        <Seg raised equal={false} label="Platform" value={String(i)} onChange={(v) => setI(Number(v))} items={CARDS.map((c, k) => ({ value: String(k), label: SHORT[c.key] ?? c.bench }))} />
      </div>
      <div className="mt-4 px-5">
        <Snap index={i} onIndex={setI} label="Results per platform">
          {CARDS.map((b) => (
            <ResultCard key={b.key} b={b} />
          ))}
        </Snap>
      </div>
      <div className="mt-5 px-5">
        <Legend
          items={[
            { kind: 'ours', label: 'REA' },
            { kind: 'base', label: 'single method' },
            { kind: 'loop', label: 'brain in the loop' },
          ]}
        />
        <p className="mt-2 text-[12px] text-ink-3">Thin lines: 95% intervals.</p>
      </div>
    </section>
  );
}

function ResultCard({ b }: { b: Card }) {
  return (
    <ChartFrame
      fill
      className="w-full"
      title={
        <span className="inline-flex items-center gap-2">
          {b.bench}
          {b.real && <span className="rounded-full border border-rule-2 px-2 py-px text-[11px] font-[700] text-ink-3 [font-stretch:92%]">real robot</span>}
        </span>
      }
      sub={b.detail}
      table={{ head: ['Method', 'Solved'], rows: b.rows.map((r) => [r.label, r.k === null ? 'not run' : `${r.k}/${b.n}`]) }}
    >
      <div className="mt-auto pt-1">
        <PBars
          rows={b.rows
            .filter((r) => r.k !== null)
            .map((r) => ({
              label: r.label,
              value: pct(r.k as number, b.n),
              display: `${r.k}/${b.n}`,
              kind: r.key === 'rea' ? 'ours' : r.key === 'show' ? 'loop' : 'base',
              ci: ci(r.k as number, b.n),
            }))}
          label={`Solved episodes on ${b.bench}, with 95% intervals`}
        />
      </div>
    </ChartFrame>
  );
}

export function PRobots() {
  return (
    <section id="embodiments" className="relative pb-12">
      <StopSign id="embodiments" lede="The same three-level contract drives a real Unitree G1 humanoid and two more simulators." />

      <div className="mt-9 px-5">
        <PartSign kicker={<><LineBadge line="s0" size={11} /> Real robot</>} title="A Unitree G1 walks to a chair and pushes it" />
        <p className="mt-3 text-[16px] leading-[1.6] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
          Every method gets the same robot, model and four policies: walk forward, the native two-arm push, release, stop. REA succeeded in <b>8 of 10</b>{' '}
          trials, against 5 for an Agents SDK agent, 4 for Codex and 2 for ASPIRE's code-as-policy.
        </p>
        <div className="mt-5">
          <G1Pair />
        </div>
        <div className="mt-4">
          <Latency />
        </div>
      </div>

      <div className="mt-14 px-5">
        <PartSign kicker={<><LineBadge line="s0" size={11} /> Simulators</>} title="The same runtime on two more simulators" />
        <p className="mt-3 text-[16px] leading-[1.6] text-ink-2">
          On RoboTwin 2.0 a fast reflex model is the System 0 policy, and the router hands single decisions to a deliberate model.
        </p>
        <div className="mt-5">
          <RoboTwinVideo />
        </div>
        <p className="mt-8 text-[16px] leading-[1.6] text-ink-2">
          On BEHAVIOR-1K, a mobile R1Pro starts metres from the object it has to find and pick up; REA ran with the same tools, model and 1,500 s budget as an
          online agent.
        </p>
        <div className="mt-5">
          <Behavior />
        </div>
      </div>
    </section>
  );
}

/**
 * The two G1 cameras for a phone: the upright front camera beside the side camera, the controls under the side one,
 * both at 2x speed on one clock (each clip is cut around its own push, so the pushes land together).
 */
function G1Pair() {
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
    [front.current, side.current].forEach((x) => {
      if (x) x.currentTime = v;
    });
    setTime(v);
  };
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
  const chip = 'absolute left-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-[650] text-white backdrop-blur-sm';
  const k = Math.min(1, time / clock.duration);
  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,5fr)] gap-px bg-rule">
        <div className="relative overflow-hidden bg-[#0b0e14]" style={{ aspectRatio: '9 / 16' }}>
          {vid('front', front)}
          <span className={chip}>front</span>
        </div>
        <div className="flex min-w-0 flex-col bg-surface">
          <div className="relative overflow-hidden bg-[#0b0e14]" style={{ aspectRatio: '16 / 9' }}>
            {vid('side', side)}
            <span className={chip}>side</span>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-2 p-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="p-press grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                <Icon icon={playing ? PauseIcon : PlayIcon} size={15} />
              </button>
              {/* one bar for both clips; the push is marked */}
              <div
                className="relative h-9 flex-1 touch-none"
                onPointerDown={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  seek(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * clock.duration);
                }}
                role="slider"
                aria-label="Video time"
                aria-valuemin={0}
                aria-valuemax={clock.duration}
                aria-valuenow={Number(time.toFixed(1))}
              >
                <span className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-rule-2">
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${k * 100}%` }} />
                </span>
                <span className="absolute top-1/2 h-[14px] w-[2px] -translate-y-1/2 rounded-full bg-s1" style={{ left: `${(clock.push / clock.duration) * 100}%` }} />
                <span className="absolute -top-[3px] -translate-x-1/2 text-[10.5px] font-[650] text-ink-3" style={{ left: `${(clock.push / clock.duration) * 100}%` }}>
                  push
                </span>
              </div>
            </div>
            <p className="text-[11.5px] leading-snug text-ink-3">
              <span className="tabular font-[700] text-ink-2">{G1_SPEED}× speed</span> · each clip cut around the two-arm push.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** decades of the log axis */
const at = (v: number) => (Math.log10(v) + 3) / (Math.log10(5) + 3); // 1 ms .. 5 s on 0..1

function Latency() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className="figure-frame p-4">
      <p className="text-[15px] font-[740] leading-snug text-ink [font-stretch:88%]">G1 request latency</p>
      <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">medians over 5–8 trials on the robot's Jetson, log scale</p>
      <ul className="mt-4 space-y-3">
        {G1_LATENCY.map((g, i) => {
          const ours = i === G1_LATENCY.length - 1;
          return (
            <li key={g.stage}>
              <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                <span className={ours ? 'font-[720] text-ink' : 'text-ink-2'}>{g.stage}</span>
                <span className={`tabular whitespace-nowrap ${ours ? 'font-[780] text-ink' : 'font-[620] text-ink-2'}`}>{g.latency}</span>
              </div>
              <div className="mt-1.5 h-[10px] overflow-hidden rounded-full bg-paper-2">
                <motion.span
                  className="block h-full origin-left rounded-full"
                  style={{ width: `${Math.max(3, at(g.value) * 100)}%`, background: ours ? 'var(--s1)' : 'var(--base-2)' }}
                  initial={{ scaleX: 0 }}
                  animate={seen ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.9, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 border-t border-rule pt-3 text-[13px] leading-[1.5] text-ink-3 [&_b]:font-[700] [&_b]:text-ink">
        A separate service on the robot, without the router, computes brain decisions ahead of the request: one returns in <b>1.0 to 3.6 ms</b> instead of
        about 5 s.
      </p>
    </div>
  );
}

const METHOD_SHORT = ['Codex', 'ASPIRE', 'Show', 'SDK', 'REA'];

/** BEHAVIOR-1K per task, turned on its side for a phone: tasks down, methods across, REA last */
function Behavior() {
  const max = 10;
  const rows = BEHAVIOR_TASKS.rows;
  const totals = rows.map((r) => r.values.reduce((a, b) => a + b, 0));
  const cell = (v: number, ours: boolean) => ({
    background: `color-mix(in srgb, ${ours ? 'var(--s1)' : 'var(--base-3)'} ${Math.round((v / max) * 85)}%, var(--surface-2))`,
    color: v / max > 0.5 ? '#ffffff' : 'var(--ink)',
  });
  return (
    <ChartFrame
      title="BEHAVIOR-1K, successes out of 10 per task"
      sub="test instances 1–10, R1Pro, the same model for every method"
      table={{ head: ['Method', ...BEHAVIOR_TASKS.tasks, 'Total'], rows: rows.map((r, i) => [r.label, ...r.values, `${totals[i]}/50`]) }}
    >
      <table className="w-full table-fixed border-separate border-spacing-[3px] text-[12.5px]">
        <thead>
          <tr>
            <th className="w-[64px]" />
            {METHOD_SHORT.map((m, j) => (
              <th key={m} className={`pb-1 text-center text-[11.5px] ${j === 4 ? 'font-[780] text-ink' : 'font-[650] text-ink-3'}`}>
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BEHAVIOR_TASKS.tasks.map((tk, ti) => (
            <tr key={tk}>
              <td className="pr-1 text-right text-ink-2">{tk}</td>
              {rows.map((r, j) => (
                <td key={j} className="tabular h-8 rounded-[5px] text-center font-[680]" style={cell(r.values[ti], j === 4)}>
                  {r.values[ti]}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="pr-1 pt-1 text-right font-[650] text-ink-3">total</td>
            {totals.map((v, j) => (
              <td key={j} className={`tabular pt-1 text-center ${j === 4 ? 'font-[800] text-ink' : 'font-[620] text-ink-2'}`}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {BEHAVIOR.map((b) => (
          <figure key={b.id} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#0b0e14]">
            <img src={b.image} alt={b.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
            <figcaption className="absolute bottom-1.5 left-1.5 max-w-[calc(100%-12px)] truncate rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-[650] text-white backdrop-blur-sm">
              {b.title.replace(/^Pick up the /, '')}
            </figcaption>
          </figure>
        ))}
      </div>
    </ChartFrame>
  );
}

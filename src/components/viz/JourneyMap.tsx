import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Brain02Icon, DatabaseIcon, File02Icon, Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { buildTimeline, fmtInt, nameOf, stateAt } from '@/lib/episode';
import { useMediaQuery, useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import type { Episode } from '@/data/types';

/**
 * The hero figure: one real held-out episode drawn as a transit map.
 *   S2 (orange) the brain, S1 (purple) the router, S0 (blue) the skills.
 * Stations on S0 are the camera frames at each skill boundary. The skill train runs every
 * segment end to end; the brain only calls at interchanges, after a skill has returned.
 * Frames, verdicts, rationales, steps and times come from the episode's run log.
 */

const W = 1360;
const H = 452;
const Y = { s2: 112, s1: 200, s0: 322 };
const XL = 86;
/** station x positions: the start plus one station per skill run, spread over the same span */
const stationsFor = (runs: number) => Array.from({ length: runs + 1 }, (_, i) => 236 + (runs ? (948 * i) / runs : 0));
const R = 60;
const XEND = 1296;
const TRAIN = { w: 54, h: 22 };

export default function JourneyMap({ episode }: { episode: Episode }) {
  const narrow = useMediaQuery('(max-width: 819px)');
  const tl = useMemo(() => buildTimeline(episode, { runSpeed: 11, minRun: 2, judgeSpeed: 0.9, dispatchHold: 1.6, verdictHold: 1.7, endHold: 3.4 }), [episode]);
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [r, setR] = useState(0);
  const rRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      setR(tl.total - 0.01);
      return;
    }
    if (!near) return;
    let raf = 0;
    let last = performance.now();
    const loop = tl.total + 0.9; // a short blank before the replay starts again
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      rRef.current = (rRef.current + dt) % loop;
      setR(rRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, reduce, tl.total]);

  const s = stateAt(tl, Math.min(r, tl.total - 0.01));
  const resetting = r > tl.total;

  return (
    <div ref={ref} className="relative" style={{ opacity: resetting ? 0.35 : 1, transition: 'opacity .45s ease' }}>
      {narrow ? <VerticalJourney episode={episode} s={s} /> : <MapSvg episode={episode} s={s} />}
    </div>
  );
}

type S = ReturnType<typeof stateAt>;

function MapSvg({ episode, s }: { episode: Episode; s: S }) {
  const { t, theme } = useTheme();
  const XS = stationsFor(episode.runs.length);
  const last = XS.length - 1;
  const uid = useId().replace(/:/g, '');
  const dark = theme === 'dark';
  const ink = t.ink;
  const station = dark ? t.paper : '#ffffff';
  const glow = (c: string) => (dark ? `drop-shadow(0 0 7px ${c})` : 'none');

  // which stations have been reached (station 0 = start; station i = after run i-1)
  const reached = (i: number) => (i === 0 ? true : s.phase === 'dispatch' ? false : s.run > i - 1 || (s.run === i - 1 && s.phase !== 'run'));
  const verdictShown = (j: number) => s.verdicts >= j; // j = 1..3
  const judging = s.phase === 'judge' ? s.run + 1 : -1;

  // the skill train: runs between stations, passes behind a station during the verdict hold
  let trainX = XS[0] + R + 14;
  if (s.phase === 'run') trainX = XS[s.run] + R + 14 + (XS[s.run + 1] - R - 14 - (XS[s.run] + R + 14)) * s.k;
  else if (s.phase === 'judge') trainX = XS[s.run + 1] - R - 14;
  else if (s.phase === 'verdict') trainX = XS[s.run + 1] - R - 14 + 2 * (R + 14) * easeInOut(s.k);
  else if (s.phase === 'stop') trainX = XS[last] - R - 14;
  const trainActive = s.phase === 'run';

  const routerEvents = [
    { x: XS[0], label: `dispatch ${nameOf(episode.route.choice)}`, on: true },
    ...episode.runs.slice(1).map((run, k) => ({ x: XS[k + 1], label: `escalate to ${nameOf(run.which)}`, on: verdictShown(k + 1) })),
    { x: XS[last], label: 'stop', on: verdictShown(last) },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={`Held-out episode “${episode.instruction}” as a line map: ${episode.runs.map((x) => nameOf(x.which)).join(', ')}; the judge answered ${episode.judges.map((j) => j.verdict).join(', ')}`}>
      <defs>
        {XS.map((_, i) => (
          <clipPath key={i} id={`jm-clip-${uid}-${i}`}>
            <circle cx={XS[i]} cy={Y.s0} r={R - 5} />
          </clipPath>
        ))}
        <filter id={`jm-gray-${uid}`}>
          <feColorMatrix type="saturate" values="0.05" />
        </filter>
      </defs>

      {/* the three lines */}
      <path d={`M ${XL} ${Y.s2} H ${XS[last] + 52}`} stroke={t.s2} strokeWidth={12} strokeLinecap="round" fill="none" style={{ filter: glow(t.s2g) }} className="jm-draw" />
      <path d={`M ${XL} ${Y.s1} H ${XEND}`} stroke={t.s1} strokeWidth={12} strokeLinecap="round" fill="none" style={{ filter: glow(t.s1g), animationDelay: '0.12s' }} className="jm-draw" />
      <path d={`M ${XL} ${Y.s0} H ${XS[last]}`} stroke={t.s0} strokeWidth={12} strokeLinecap="round" fill="none" style={{ filter: glow(t.s0g), animationDelay: '0.24s' }} className="jm-draw" />
      {/* offline: the brain wrote the skill library before the episode */}
      <path
        d={`M ${XL - 30} ${Y.s2 + 18} C ${XL - 64} ${Y.s2 + 90}, ${XL - 64} ${Y.s0 - 90}, ${XL - 30} ${Y.s0 - 18}`}
        stroke={t.s2}
        strokeWidth={3}
        strokeDasharray="2 7"
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />
      <text x={XL - 62} y={(Y.s2 + Y.s0) / 2} textAnchor="middle" fill={t.ink3} transform={`rotate(-90 ${XL - 62} ${(Y.s2 + Y.s0) / 2})`} dy={-8} style={{ fontSize: 13, fontWeight: 600, fontStretch: '88%' }}>
        skills written offline
      </text>

      {/* segment labels on the skill line */}
      {episode.runs.map((run, i) => {
        const x = (XS[i] + XS[i + 1]) / 2;
        const done = s.run > i || (s.run === i && s.phase !== 'run' && s.phase !== 'dispatch');
        const active = s.run === i && s.phase === 'run';
        return (
          <g key={i} style={{ opacity: done || active ? 1 : 0.38, transition: 'opacity .4s' }}>
            <text x={x} y={Y.s0 - 30} textAnchor="middle" fill={ink} style={{ fontSize: 17, fontWeight: 720, fontStretch: '86%' }}>
              {nameOf(run.which)}
              <tspan fill={t.ink3} style={{ fontWeight: 560 }}>
                {'  '}
                {fmtInt(run.steps)} steps
              </tspan>
            </text>
            <text x={x} y={Y.s0 + 38} textAnchor="middle" fill={t.ink3} style={{ fontSize: 14, fontWeight: 560, fontStretch: '90%' }}>
              {run.wall.toFixed(1)} s, no brain call
            </text>
          </g>
        );
      })}

      {/* interchanges: where the lines meet, only at skill boundaries */}
      {XS.map((x, i) => {
        const top = i === 0 ? Y.s1 - 18 : Y.s2 - 18;
        const hot = judging === i;
        return (
          <rect
            key={i}
            x={x - 17}
            y={top}
            width={34}
            height={Y.s0 - top}
            rx={17}
            fill={station}
            stroke={hot ? t.s2 : ink}
            strokeWidth={hot ? 4 : 3}
            style={{ filter: hot ? `drop-shadow(0 0 10px ${t.s2g})` : 'none', transition: 'stroke .25s' }}
          />
        );
      })}

      {/* the judge looking: two frames go up, a verdict comes down */}
      {judging > 0 && (
        <circle cx={XS[judging]} cy={Y.s2 + (Y.s0 - R - 8 - Y.s2) * (1 - Math.abs(1 - 2 * s.k))} r={8} fill={t.s2} style={{ filter: `drop-shadow(0 0 8px ${t.s2g})` }} />
      )}

      {/* the skill train */}
      <g transform={`translate(${trainX} ${Y.s0})`} style={{ filter: trainActive ? `drop-shadow(0 0 10px ${t.s0g})` : 'none' }}>
        <rect x={-TRAIN.w / 2} y={-TRAIN.h / 2} width={TRAIN.w} height={TRAIN.h} rx={TRAIN.h / 2} fill={t.s0} stroke={station} strokeWidth={3} />
        {[-14, 0, 14].map((dx) => (
          <rect key={dx} x={dx - 4} y={-4} width={8} height={8} rx={2} fill="#ffffff" opacity={0.92} />
        ))}
      </g>

      {/* stations: the camera frame at each boundary */}
      {XS.map((x, i) => {
        const on = reached(i);
        return (
          <g key={i} className="jm-pop" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
            <circle cx={x} cy={Y.s0} r={R} fill={station} stroke={on ? (i === 0 ? ink : t.s0) : t.rule2} strokeWidth={4} style={{ transition: 'stroke .4s' }} />
            <image
              href={episode.frames[i]}
              x={x - R * 3.5 * 0.38}
              y={Y.s0 - R * 2.24 * 0.56}
              width={R * 3.5}
              height={R * 2.24}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#jm-clip-${uid}-${i})`}
              style={{ opacity: on ? 1 : 0.35, filter: on ? 'none' : `url(#jm-gray-${uid})`, transition: 'opacity .6s' }}
            />
            <text x={x} y={Y.s0 + R + 30} textAnchor="middle" fill={ink} style={{ fontSize: 16, fontWeight: 700, fontStretch: '88%', opacity: on ? 1 : 0.45 }}>
              {i === 0 ? 'Start' : `${nameOf(episode.runs[i - 1].which)} returns`}
            </text>
            <text x={x} y={Y.s0 + R + 50} textAnchor="middle" fill={t.ink3} className="tabular" style={{ fontSize: 13.5, fontWeight: 560, opacity: on ? 1 : 0.45 }}>
              step {fmtInt(i === 0 ? episode.runs[0].from : episode.runs[i - 1].to)}
            </text>
          </g>
        );
      })}

      {/* router events on S1 */}
      {routerEvents.map((ev, i) => (
        <g key={i} transform={`translate(${ev.x} ${Y.s1})`} style={{ opacity: ev.on ? 1 : 0.0, transition: 'opacity .35s' }}>
          <text x={26} y={36} fill={ink} style={{ fontSize: 14.5, fontWeight: 680, fontStretch: '88%' }}>
            {ev.label}
          </text>
        </g>
      ))}

      {/* verdicts above S2 */}
      {episode.judges.map((j, idx) => {
        const st = idx + 1;
        const on = verdictShown(st);
        const ok = j.verdict === 'done';
        const label = ok ? 'done' : 'not done';
        const pw = label.length * 8.6 + 40;
        return (
          <g key={idx} transform={`translate(${XS[st]} 0)`} style={{ opacity: on ? 1 : 0, transition: 'opacity .35s, transform .35s' }}>
            <g transform={`translate(${-pw / 2} ${on ? 16 : 24})`} style={{ transition: 'transform .35s' }}>
              <rect width={pw} height={28} rx={14} fill={ok ? t.done : t.fail} />
              <g transform="translate(10 6)">
                <HugeiconsIcon icon={ok ? Tick02Icon : Cancel01Icon} size={16} color="#ffffff" strokeWidth={2.6} />
              </g>
              <text x={30} y={19.5} fill="#ffffff" style={{ fontSize: 14.5, fontWeight: 720, fontStretch: '90%' }}>
                {label}
              </text>
            </g>
            <text x={0} y={72} textAnchor="middle" fill={t.ink2} style={{ fontSize: 14.5, fontStyle: 'italic', fontWeight: 480 }}>
              “{j.rationale}”
            </text>
          </g>
        );
      })}

      {/* termini */}
      <Terminus x={XL} y={Y.s2} color={t.s2} station={station} icon={Brain02Icon} label="Brain" sub="System 2" above dark={dark} />
      <Terminus x={XL} y={Y.s1} color={t.s1} station={station} icon={DatabaseIcon} label="Route memory" sub="System 1" dark={dark} />
      <Terminus x={XL} y={Y.s0} color={t.s0} station={station} icon={File02Icon} label="Skill library" sub="System 0" dark={dark} />
      <g transform={`translate(${XEND} ${Y.s1})`}>
        <circle r={26} fill={s.done ? t.done : station} stroke={s.done ? t.done : ink} strokeWidth={3} style={{ transition: 'fill .4s, stroke .4s' }} />
        <g transform="translate(-11 -11)" style={{ opacity: s.done ? 1 : 0.35 }}>
          <HugeiconsIcon icon={Tick02Icon} size={22} color={s.done ? '#ffffff' : ink} strokeWidth={2.4} />
        </g>
        <text y={-40} textAnchor="middle" fill={ink} style={{ fontSize: 15, fontWeight: 700, fontStretch: '88%' }}>
          Score once
        </text>
        <text y={50} textAnchor="middle" fill={s.done ? t.done : t.ink3} style={{ fontSize: 14, fontWeight: 650, fontStretch: '90%' }}>
          {s.done ? 'success' : 'after the stop'}
        </text>
      </g>
    </svg>
  );
}

function Terminus({ x, y, color, station, icon, label, sub, above = false, dark }: { x: number; y: number; color: string; station: string; icon: typeof Brain02Icon; label: string; sub: string; above?: boolean; dark: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="jm-pop">
      <circle r={28} fill={station} stroke={color} strokeWidth={5} style={{ filter: dark ? `drop-shadow(0 0 6px ${color})` : 'none' }} />
      <g transform="translate(-11 -11)">
        <HugeiconsIcon icon={icon} size={22} color={color} strokeWidth={1.9} />
      </g>
      <text y={above ? -58 : 50} textAnchor="middle" fill="var(--ink)" style={{ fontSize: 15, fontWeight: 720, fontStretch: '88%' }}>
        {label}
      </text>
      <text y={above ? -40 : 67} textAnchor="middle" fill="var(--ink-3)" style={{ fontSize: 12.5, fontWeight: 600, fontStretch: '92%' }}>
        {sub}
      </text>
      </g>
    </g>
  );
}

/** phones: the same journey, top to bottom */
function VerticalJourney({ episode, s }: { episode: Episode; s: S }) {
  const reached = (i: number) => (i === 0 ? true : s.phase === 'dispatch' ? false : s.run > i - 1 || (s.run === i - 1 && s.phase !== 'run'));
  return (
    <ol className="relative ml-2 border-l-[6px] border-s0 pl-6">
      {episode.frames.map((src, i) => {
        const j = i > 0 ? episode.judges[i - 1] : null;
        const on = reached(i);
        return (
          <li key={i} className="relative pb-7 last:pb-0">
            <span className="absolute -left-[46px] top-2 grid h-9 w-9 place-items-center rounded-full border-[3px] border-ink bg-surface text-[13px] font-[800]">{i + 1}</span>
            {i > 0 && (
              <p className="mb-2 text-[14px] font-[650] text-ink-2">
                {nameOf(episode.runs[i - 1].which)} ran {fmtInt(episode.runs[i - 1].steps)} steps, {episode.runs[i - 1].wall.toFixed(1)} s, no brain call
              </p>
            )}
            <img src={src} alt="" className="w-full rounded-xl object-cover transition-opacity duration-500" style={{ opacity: on ? 1 : 0.4, aspectRatio: '25 / 16' }} />
            {j && (
              <p className="mt-2 flex items-start gap-2 text-[14px] leading-snug" style={{ opacity: s.verdicts >= i ? 1 : 0.3 }}>
                <span className={`badge shrink-0 text-[12px] ${j.verdict === 'done' ? 'bg-done' : 'bg-fail'}`}>{j.verdict === 'done' ? 'done' : 'not done'}</span>
                <span className="italic text-ink-2">“{j.rationale}”</span>
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function easeInOut(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

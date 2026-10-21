import { useEffect, useRef, useState } from 'react';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { EPISODES } from '@/data/gen/episodes';

/**
 * The router as a set of points (a railway switch). For each task, route memory's development
 * evidence throws the switch to Fix or Evo before the skill train arrives; nothing waits.
 * Evidence: the route records of test episodes on this page.
 */
const CASES = ['stove-23', 'butter-21', 'bowl-stove-18'].map((id) => {
  const e = EPISODES.find((x) => x.id === id)!;
  const ev = e.route.evidence;
  return {
    task: e.instruction,
    first: e.route.choice as 'fix' | 'evo',
    fix: ev.fix ? `${ev.fix.successes}/${ev.fix.n}` : '–',
    evo: ev.evo ? `${ev.evo.successes}/${ev.evo.n}` : '–',
    why: e.route.reason === 'higher_dev_success_rate' ? 'higher success' : 'tie, fewer steps',
  };
});

const W = 400;
const H = 250;
const J = { x: 150, y: 125 }; // junction
const TOP = 70;
const BOT = 180;
const CYCLE = 4.2; // seconds per task

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function RouteSwitch() {
  const { t } = useTheme();
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [clock, setClock] = useState(reduce ? CYCLE * 0.6 : 0);
  const cRef = useRef(0);

  useEffect(() => {
    if (!near || reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      cRef.current += Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      setClock(cRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, reduce]);

  const idx = Math.floor(clock / CYCLE) % CASES.length;
  const c = CASES[idx];
  const k = (clock % CYCLE) / CYCLE; // 0..1 within this task
  const up = c.first === 'fix';
  // 0-0.25: evidence appears and the switch throws; 0.25-0.9: the train runs through
  const thrown = ease(clamp01(k / 0.22));
  const blade = up ? -thrown : thrown; // -1 = top track, +1 = bottom track
  const trainK = clamp01((k - 0.26) / 0.62);
  const branchY = up ? TOP : BOT;

  // train position along: incoming line, then the curve, then the branch
  let tx: number;
  let ty: number;
  if (trainK < 0.35) {
    tx = lerp(18, J.x, trainK / 0.35);
    ty = J.y;
  } else if (trainK < 0.6) {
    const u = (trainK - 0.35) / 0.25;
    tx = lerp(J.x, J.x + 70, u);
    ty = lerp(J.y, branchY, ease(u));
  } else {
    tx = lerp(J.x + 70, W - 18, (trainK - 0.6) / 0.4);
    ty = branchY;
  }
  const trainOn = k > 0.24 && k < 0.92;

  const track = (y: number) => `M ${J.x} ${J.y} C ${J.x + 40} ${J.y}, ${J.x + 30} ${y}, ${J.x + 70} ${y} L ${W - 10} ${y}`;
  const chosen = (which: 'fix' | 'evo') => (which === c.first ? thrown : 0);

  return (
    <div ref={ref} className="absolute inset-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <pattern id="rs-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#rs-grid)" />

        {/* the two skill tracks */}
        {(['fix', 'evo'] as const).map((which) => {
          const y = which === 'fix' ? TOP : BOT;
          const on = chosen(which);
          return (
            <g key={which}>
              <path d={track(y)} fill="none" stroke={t.s0} strokeOpacity={0.25 + 0.75 * on} strokeWidth={9} strokeLinecap="round" />
              <text x={W - 14} y={y - 14} textAnchor="end" fill="#ffffff" fillOpacity={0.45 + 0.55 * on} style={{ fontSize: 14, fontWeight: 760, fontStretch: '86%' }}>
                {which === 'fix' ? 'Fix' : 'Evo'}
              </text>
              <text x={W - 14} y={y + 26} textAnchor="end" fill="#ffffff" fillOpacity={0.4 + 0.4 * on} className="tabular" style={{ fontSize: 12, fontWeight: 600 }}>
                dev {which === 'fix' ? c.fix : c.evo}
              </text>
            </g>
          );
        })}

        {/* the router line, into the points */}
        <path d={`M 10 ${J.y} L ${J.x} ${J.y}`} stroke={t.s1g} strokeWidth={9} strokeLinecap="round" />
        {/* the switch blade */}
        <g transform={`translate(${J.x} ${J.y}) rotate(${blade * 22})`}>
          <rect x={-4} y={-5} width={46} height={10} rx={5} fill="#ffffff" />
        </g>
        <circle cx={J.x} cy={J.y} r={10} fill="#0b0e14" stroke="#ffffff" strokeWidth={3} />

        {/* the skill train */}
        {trainOn && (
          <g transform={`translate(${tx} ${ty})`} style={{ filter: `drop-shadow(0 0 8px ${t.s0g})` }}>
            <rect x={-20} y={-9} width={40} height={18} rx={9} fill={t.s0} stroke="#ffffff" strokeWidth={2.5} />
            {[-9, 0, 9].map((dx) => (
              <rect key={dx} x={dx - 3} y={-3} width={6} height={6} rx={1.5} fill="#ffffff" />
            ))}
          </g>
        )}

        {/* the decision */}
        <text x={14} y={30} fill="#ffffff" style={{ fontSize: 14.5, fontWeight: 720, fontStretch: '86%' }}>
          {c.task}
        </text>
        <text x={14} y={50} fill="#ffffff" fillOpacity={0.6} style={{ fontSize: 12.5, fontWeight: 600, opacity: thrown }}>
          route memory: {c.first === 'fix' ? 'Fix' : 'Evo'}, {c.why}
        </text>
      </svg>
    </div>
  );
}

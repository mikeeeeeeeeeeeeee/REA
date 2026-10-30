import { useEffect, useId, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';
import { EPISODES } from '@/data/gen/episodes';
import { buildTimeline, fmtInt, nameOf, stateAt } from '@/lib/episode';

/**
 * The brain as a line with almost no service. The policy train runs its own closed loop (one tick
 * per hundred control steps, the line being the episode's step budget) and meets the brain only
 * where a policy returns: one interchange per run, where the brain looks and answers.
 * Steps, policies and verdicts are the run logs of test episodes shown elsewhere on this page.
 */
const W = 400;
const H = 250;
const YB = 104; // brain line
const YS = 168; // policy line
const XL = 44; // both lines start right of their badges
const XA = 62; // step 0
const XE = 364; // the end of the step budget
const PANEL = '#0b0e14';

const TLS = ['stove-23', 'wine-rack-25', 'bowl-stove-18'].map((id) => {
  const ep = EPISODES.find((e) => e.id === id)!;
  const tl = buildTimeline(ep, { runSpeed: 26, minRun: 0.9, judgeSpeed: 1.8, dispatchHold: 0.8, verdictHold: 0.8, endHold: 2.4 });
  const xOf = (steps: number) => XA + ((XE - XA) * steps) / ep.horizon;
  // verdict pills sit above their interchange; push them apart, keep them inside the panel
  const pills = ep.judges.map((j) => {
    const ok = j.verdict === 'done';
    const label = ok ? 'done' : 'not done';
    const w = label.length * 6.1 + 28;
    return { after: j.after, ok, label, w, x: xOf(ep.runs[j.after].to) - w / 2 };
  });
  let edge = -Infinity;
  for (const p of pills) {
    p.x = Math.max(p.x, edge + 6);
    edge = p.x + p.w;
  }
  let right = W - 6;
  for (let k = pills.length - 1; k >= 0; k--) {
    pills[k].x = Math.min(pills[k].x, right - pills[k].w);
    right = pills[k].x - 6;
  }
  return { tl, xOf, pills };
});
const CYCLE = TLS.reduce((a, x) => a + x.tl.total, 0);
const TICKS = Array.from({ length: 40 }, (_, i) => (i + 1) * 100);

export default function BrainCalls() {
  const { t } = useTheme();
  const uid = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [clock, setClock] = useState(0);
  const cRef = useRef(0);

  useEffect(() => {
    if (!near || reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      cRef.current = (cRef.current + Math.max(0, Math.min(0.1, (now - last) / 1000))) % CYCLE;
      last = now;
      setClock(cRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, reduce]);

  // which episode, and where in it; reduced motion shows the end of the longest one
  let idx = 0;
  let r = clock;
  if (reduce) {
    idx = TLS.length - 1;
    r = TLS[idx].tl.total - 1.2;
  } else {
    while (idx < TLS.length - 1 && r >= TLS[idx].tl.total) {
      r -= TLS[idx].tl.total;
      idx++;
    }
  }
  const { tl, xOf, pills } = TLS[idx];
  const ep = tl.ep;
  const s = stateAt(tl, r);
  const fade = reduce ? 1 : Math.max(0, Math.min(1, r / 0.35, (tl.total - r) / 0.45));
  const trainX = xOf(s.steps);
  const judging = s.phase === 'judge' ? s.run : -1;
  const returned = (i: number) => s.run > i || (s.run === i && s.phase !== 'run' && s.phase !== 'dispatch');
  const calls = judging >= 0 ? judging + 1 : s.verdicts;

  return (
    <div ref={ref} className="absolute inset-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`“${ep.instruction}”: ${fmtInt(ep.steps)} control steps, and the brain was asked ${ep.judges.length} ${ep.judges.length === 1 ? 'time' : 'times'}, once per returning policy`}
      >
        <defs>
          <pattern id={`bc-grid-${uid}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#bc-grid-${uid})`} />

        {/* the two lines, dim where nothing happens */}
        <path d={`M ${XL} ${YB} L ${W - 14} ${YB}`} stroke={t.s2} strokeOpacity={0.34} strokeWidth={9} strokeLinecap="round" />
        <path d={`M ${XL} ${YS} L ${XE} ${YS}`} stroke={t.s0} strokeOpacity={0.25} strokeWidth={9} strokeLinecap="round" />
        <path d={`M ${XL} ${YS} L ${trainX} ${YS}`} stroke={t.s0} strokeWidth={9} strokeLinecap="round" opacity={fade} />

        {/* the policy's own loop: a tick per hundred control steps */}
        {TICKS.map((st) => {
          const on = st <= s.steps;
          return <rect key={st} x={xOf(st) - 0.8} y={YS + 5} width={1.6} height={6} rx={0.8} fill={on ? t.s0g : '#ffffff'} opacity={on ? 0.9 * fade + 0.14 * (1 - fade) : 0.14} />;
        })}
        {/* buffer stop: the step budget */}
        <rect x={XE + 12} y={YS - 11} width={4} height={22} rx={2} fill="#ffffff" opacity={0.5} />
        <text x={XE + 14} y={YS + 30} textAnchor="middle" fill="#ffffff" fillOpacity={0.45} className="tabular" style={{ fontSize: 11.5, fontWeight: 600 }}>
          {fmtInt(ep.horizon)}
        </text>

        <g opacity={fade}>
          {/* start */}
          <circle cx={XA} cy={YS} r={6} fill={PANEL} stroke="#ffffff" strokeWidth={2.5} />

          {/* interchanges: only where a policy returned */}
          {ep.runs.map((run, i) => {
            if (!returned(i)) return null;
            const x = xOf(run.to);
            const hot = judging === i;
            const answered = s.verdicts > i;
            return (
              <g key={i}>
                <rect
                  x={x - 8}
                  y={YB - 8}
                  width={16}
                  height={YS - YB + 16}
                  rx={8}
                  fill={PANEL}
                  stroke={hot ? t.s2g : '#ffffff'}
                  strokeWidth={hot ? 3 : 2.5}
                  style={{ filter: hot ? `drop-shadow(0 0 8px ${t.s2g})` : 'none', transition: 'stroke .25s' }}
                />
                {answered && <circle cx={x} cy={YB} r={4} fill={t.s2g} />}
              </g>
            );
          })}

          {/* the call: the frames go up, the answer comes down */}
          {judging >= 0 && (
            <>
              <circle cx={xOf(ep.runs[judging].to)} cy={YB} r={6 + 14 * s.k} fill="none" stroke={t.s2g} strokeWidth={2} opacity={0.7 * (1 - s.k)} />
              <circle
                cx={xOf(ep.runs[judging].to)}
                cy={YS - 2 - (YS - YB - 4) * (1 - Math.abs(1 - 2 * s.k))}
                r={4.5}
                fill={t.s2g}
                style={{ filter: `drop-shadow(0 0 6px ${t.s2g})` }}
              />
            </>
          )}

          {/* the answers */}
          {pills.map((p) => {
            const on = s.verdicts > p.after;
            return (
              <g key={p.after} transform={`translate(${p.x} ${on ? YB - 34 : YB - 28})`} style={{ opacity: on ? 1 : 0, transition: 'opacity .3s, transform .3s' }}>
                <rect width={p.w} height={20} rx={10} fill={p.ok ? t.done : t.fail} />
                <g transform="translate(8 4)">
                  <HugeiconsIcon icon={p.ok ? Tick02Icon : Cancel01Icon} size={12} color="#ffffff" strokeWidth={2.8} />
                </g>
                <text x={24} y={14} fill="#ffffff" style={{ fontSize: 11.5, fontWeight: 720, fontStretch: '90%' }}>
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* which policy ran where */}
          {ep.runs.map((run, i) => {
            const started = s.run > i || (s.run === i && s.phase !== 'dispatch');
            const running = s.run === i && s.phase === 'run';
            return (
              <text
                key={i}
                x={xOf((run.from + run.to) / 2)}
                y={YS + 30}
                textAnchor="middle"
                fill="#ffffff"
                fillOpacity={running ? 1 : 0.6}
                style={{ fontSize: 13, fontWeight: 720, fontStretch: '86%', opacity: started ? 1 : 0, transition: 'opacity .3s' }}
              >
                {nameOf(run.which)}
              </text>
            );
          })}

          {/* the policy train */}
          <g transform={`translate(${trainX} ${YS})`} style={{ filter: `drop-shadow(0 0 8px ${t.s0g})` }}>
            <rect x={-20} y={-9} width={40} height={18} rx={9} fill={t.s0} stroke="#ffffff" strokeWidth={2.5} />
            {[-9, 0, 9].map((dx) => (
              <rect key={dx} x={dx - 3} y={-3} width={6} height={6} rx={1.5} fill="#ffffff" />
            ))}
          </g>

          {/* the episode */}
          <text x={14} y={30} fill="#ffffff" style={{ fontSize: 14.5, fontWeight: 720, fontStretch: '86%' }}>
            {ep.instruction}
          </text>
          <text x={14} y={50} fill="#ffffff" fillOpacity={0.6} className="tabular" style={{ fontSize: 12.5, fontWeight: 600 }}>
            {fmtInt(s.steps)} control steps, {calls} brain call{calls === 1 ? '' : 's'}
          </text>
        </g>

        {/* line badges, as on the signs */}
        {(
          [
            ['S2', YB, t.s2],
            ['S0', YS, t.s0],
          ] as const
        ).map(([code, y, color]) => (
          <g key={code} transform={`translate(12 ${y - 8.5})`}>
            <rect width={24} height={17} rx={4} fill={color} />
            <text x={12} y={12.6} textAnchor="middle" fill="#ffffff" style={{ fontSize: 11, fontWeight: 800, fontStretch: '92%' }}>
              {code}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

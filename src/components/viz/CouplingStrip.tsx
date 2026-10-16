import { useId } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { seg, useLoopClock } from '@/lib/anim';

/**
 * One row of the service-status board: how a coupling design schedules the brain (S2), the
 * router (S1) and the robot's skills (S0) over time. Schematic time, after the paper's Figure 3.
 */
export type CouplingMode = 'agent' | 'skill' | 'rea';

type Lane = 's2' | 's1' | 's0';
type Block = { lane: Lane; t0: number; t1: number; kind: 'agent' | 'skill' | 'wait' | 'judge' | 'missing'; label?: string };
type Mark = { lane: Lane; t: number; kind: 'error' | 'silent' | 'done' | 'not_done' | 'route' | 'escalate' | 'stop'; label: string };

const T = 12;
const VW = 760;
const X0 = 70;
const X1 = 748;

const DESIGNS: Record<CouplingMode, { lanes: Lane[]; blocks: Block[]; marks: Mark[] }> = {
  agent: {
    lanes: ['s2', 's0'],
    blocks: [
      { lane: 's2', t0: 0, t1: 1.6, kind: 'agent', label: 'agent' },
      { lane: 's2', t0: 3.2, t1: 4.8, kind: 'agent', label: 'agent' },
      { lane: 's2', t0: 6.4, t1: 8.0, kind: 'agent', label: 'agent' },
      { lane: 's2', t0: 9.6, t1: 11.2, kind: 'agent', label: 'agent' },
      { lane: 's0', t0: 0, t1: 1.6, kind: 'wait' },
      { lane: 's0', t0: 1.6, t1: 3.2, kind: 'skill', label: 'act' },
      { lane: 's0', t0: 3.2, t1: 4.8, kind: 'wait' },
      { lane: 's0', t0: 4.8, t1: 6.4, kind: 'skill', label: 'act' },
      { lane: 's0', t0: 6.4, t1: 8.0, kind: 'wait' },
      { lane: 's0', t0: 8.0, t1: 9.6, kind: 'skill', label: 'act' },
      { lane: 's0', t0: 9.6, t1: 11.2, kind: 'wait' },
      { lane: 's0', t0: 11.2, t1: 12, kind: 'skill' },
    ],
    marks: [],
  },
  skill: {
    lanes: ['s2', 's0'],
    blocks: [
      { lane: 's0', t0: 0, t1: 3.3, kind: 'skill', label: 'fast policy' },
      { lane: 's0', t0: 3.3, t1: 4.6, kind: 'wait' },
      { lane: 's2', t0: 3.3, t1: 4.6, kind: 'agent', label: 'agent' },
      { lane: 's0', t0: 4.6, t1: 7.4, kind: 'skill', label: 'fast policy' },
      { lane: 's0', t0: 7.4, t1: 8.7, kind: 'wait' },
      { lane: 's2', t0: 7.4, t1: 8.7, kind: 'agent', label: 'agent' },
      { lane: 's0', t0: 8.7, t1: 11.3, kind: 'skill', label: 'fast policy' },
      { lane: 's2', t0: 11.3, t1: 12, kind: 'missing' },
    ],
    marks: [
      { lane: 's0', t: 3.3, kind: 'error', label: 'error' },
      { lane: 's0', t: 7.4, kind: 'error', label: 'same error' },
      { lane: 's0', t: 11.3, kind: 'silent', label: 'silent failure' },
    ],
  },
  rea: {
    lanes: ['s2', 's1', 's0'],
    blocks: [
      { lane: 's0', t0: 0.3, t1: 5.4, kind: 'skill', label: 'skill 1, end to end' },
      { lane: 's2', t0: 5.4, t1: 6.3, kind: 'judge' },
      { lane: 's0', t0: 6.3, t1: 11.0, kind: 'skill', label: 'skill 2, from the current state' },
      { lane: 's2', t0: 11.0, t1: 11.9, kind: 'judge' },
    ],
    marks: [
      { lane: 's1', t: 0.15, kind: 'route', label: 'route memory' },
      { lane: 's2', t: 6.3, kind: 'not_done', label: 'not done' },
      { lane: 's1', t: 6.3, kind: 'escalate', label: 'escalate' },
      { lane: 's2', t: 11.9, kind: 'done', label: 'done' },
      { lane: 's1', t: 11.95, kind: 'stop', label: 'stop' },
    ],
  },
};

export default function CouplingStrip({ mode }: { mode: CouplingMode }) {
  const { t, theme } = useTheme();
  const dark = theme === 'dark';
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [p] = useLoopClock(10, near && !reduce, reduce ? 0.99 : 0);
  const now = p * (T + 1.8);
  const uid = useId().replace(/:/g, '');
  const d = DESIGNS[mode];
  const laneY: Record<Lane, number> = d.lanes.length === 3 ? { s2: 30, s1: 74, s0: 118 } : { s2: 38, s1: 0, s0: 104 };
  const VH = d.lanes.length === 3 ? 150 : 142;
  const tx = (v: number) => X0 + ((X1 - X0) * v) / T;
  const color: Record<Lane, string> = { s2: t.s2, s1: t.s1, s0: t.s0 };
  const station = dark ? t.paper : '#ffffff';

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full overflow-visible" aria-hidden>
        <defs>
          <pattern id={`cs-hatch-${uid}`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="7" height="7" fill={t.s2w} />
            <line x1="0" y1="0" x2="0" y2="7" stroke={t.s2} strokeWidth="2" strokeOpacity="0.85" />
          </pattern>
        </defs>

        {d.lanes.map((lane) => (
          <g key={lane}>
            <rect x={X0} y={laneY[lane] - 2} width={X1 - X0} height={4} rx={2} fill={dark ? '#232a35' : '#eceef2'} />
            <g transform={`translate(4 ${laneY[lane] - 12})`}>
              <rect width={40} height={24} rx={6} fill={color[lane]} />
              <text x={20} y={16.5} textAnchor="middle" fill="#fff" style={{ fontSize: 13, fontWeight: 800, fontStretch: '92%' }}>
                {lane.toUpperCase()}
              </text>
            </g>
          </g>
        ))}

        {d.blocks.map((b, i) => {
          const k = seg(now, b.t0, b.t1);
          if (k <= 0) return null;
          const x = tx(b.t0);
          const full = tx(b.t1) - x;
          const w = full * k;
          const y = laneY[b.lane];
          const h = b.kind === 'skill' || b.kind === 'wait' ? 26 : 20;
          if (b.kind === 'missing') {
            return (
              <g key={i}>
                <rect x={x} y={y - h / 2} width={full} height={h} rx={h / 2} fill="none" stroke={t.ink3} strokeDasharray="4 4" strokeWidth={1.5} />
                <text x={x + full / 2} y={y + 4.5} textAnchor="middle" fill={t.ink3} style={{ fontSize: 12, fontWeight: 650, fontStretch: '88%' }}>
                  no call
                </text>
              </g>
            );
          }
          const fill = b.kind === 'wait' ? `url(#cs-hatch-${uid})` : b.kind === 'skill' ? t.s0 : t.s2;
          const active = k < 1;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y - h / 2}
                width={Math.max(0.1, w)}
                height={h}
                rx={h / 2}
                fill={fill}
                stroke={b.kind === 'wait' ? t.s2 : 'none'}
                strokeOpacity={0.6}
                style={{ filter: active && b.kind !== 'wait' ? `drop-shadow(0 0 8px ${b.kind === 'skill' ? t.s0g : t.s2g})` : 'none' }}
              />
              {b.label && k > 0.85 && full > 70 && (
                <text x={x + full / 2} y={y + 4.5} textAnchor="middle" fill="#ffffff" style={{ fontSize: 12.5, fontWeight: 700, fontStretch: '86%' }}>
                  {b.label}
                </text>
              )}
              {b.kind === 'wait' && k > 0.6 && (
                <text x={x + full / 2} y={y + h / 2 + 15} textAnchor="middle" fill={t.ink2} style={{ fontSize: 12, fontWeight: 650, fontStretch: '88%' }}>
                  robot waits
                </text>
              )}
            </g>
          );
        })}

        {d.marks.map((m, i) => {
          const on = now >= m.t;
          const y = laneY[m.lane];
          if (m.kind === 'route' || m.kind === 'escalate' || m.kind === 'stop') {
            return (
              <g key={i} transform={`translate(${tx(m.t)} ${y})`} style={{ opacity: on ? 1 : 0.15, transition: 'opacity .3s' }}>
                <rect x={-8} y={-11} width={16} height={22} rx={8} fill={station} stroke={t.ink} strokeWidth={2.5} />
                <text x={m.kind === 'stop' ? -14 : 14} y={5} textAnchor={m.kind === 'stop' ? 'end' : 'start'} fill={t.ink} style={{ fontSize: 12.5, fontWeight: 700, fontStretch: '86%' }}>
                  {m.label}
                </text>
              </g>
            );
          }
          if (!on) return null;
          const bg = m.kind === 'done' ? t.done : m.kind === 'not_done' ? t.fail : m.kind === 'error' ? t.s2 : 'none';
          const w = m.label.length * 6.6 + 18;
          const yy = m.lane === 's0' ? y - 34 : y - 30;
          return (
            <g key={i} transform={`translate(${tx(m.t) - w / 2} ${m.kind === 'silent' ? y + 18 : yy})`}>
              <rect width={w} height={20} rx={10} fill={m.kind === 'silent' ? station : bg} stroke={m.kind === 'silent' ? t.ink3 : 'none'} strokeDasharray={m.kind === 'silent' ? '3 3' : undefined} />
              <text x={w / 2} y={14} textAnchor="middle" fill={m.kind === 'silent' ? t.ink2 : '#ffffff'} style={{ fontSize: 12, fontWeight: 700, fontStretch: '88%' }}>
                {m.label}
              </text>
            </g>
          );
        })}

        {/* playhead */}
        <line x1={tx(Math.min(T, now))} x2={tx(Math.min(T, now))} y1={8} y2={VH - 8} stroke={t.ink} strokeOpacity={0.35} strokeWidth={1.2} />
      </svg>
    </div>
  );
}

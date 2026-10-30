import { useId } from 'react';
import { DESIGNS, T, type CouplingMode, type Lane } from '@/components/viz/CouplingStrip';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { seg, useLoopClock } from '@/lib/anim';

/**
 * The service-status timelines (after the paper's Figure 3) drawn for a phone: the same designs as the desktop
 * strips (CouplingStrip's DESIGNS), on a narrower drawing with shorter labels, every label kept inside the frame.
 */
const VW = 340;
const X0 = 36;
const X1 = 336;
const SHORT: Record<string, string> = {
  'policy 1, end to end': 'policy 1',
  'policy 2, from the current state': 'policy 2',
  'next request…': 'next…',
};
const charW = 5.5;

export default function PStrip({ mode }: { mode: CouplingMode }) {
  const { t, theme } = useTheme();
  const dark = theme === 'dark';
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [p] = useLoopClock(10, near && !reduce, reduce ? 0.99 : 0);
  const now = p * (T + 1.8);
  const uid = useId().replace(/:/g, '');
  const d = DESIGNS[mode];
  const three = d.lanes.length === 3;
  const laneY: Record<Lane, number> = three ? { s2: 32, s1: 74, s0: 116 } : { s2: 34, s1: 0, s0: 90 };
  const VH = three ? 146 : 128;
  const tx = (v: number) => X0 + ((X1 - X0) * v) / T;
  const color: Record<Lane, string> = { s2: t.s2, s1: t.s1, s0: t.s0 };
  const station = dark ? t.paper : '#ffffff';
  const clampX = (x: number, w: number) => Math.max(2, Math.min(VW - 2 - w, x));
  const text = (size: number, weight: number) => ({ fontSize: size, fontWeight: weight, fontStretch: '88%' });

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${VW} ${VH}`} className="block h-auto w-full overflow-visible" aria-hidden>
        <defs>
          <pattern id={`ps-hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={t.s2w} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={t.s2} strokeWidth="1.8" strokeOpacity="0.85" />
          </pattern>
        </defs>

        {d.lanes.map((lane) => (
          <g key={lane}>
            <rect x={X0} y={laneY[lane] - 1.5} width={X1 - X0} height={3} rx={1.5} fill={dark ? '#232a35' : '#eceef2'} />
            <g transform={`translate(0 ${laneY[lane] - 9})`}>
              <rect width={28} height={18} rx={5} fill={color[lane]} />
              <text x={14} y={13} textAnchor="middle" fill="#fff" style={text(10.5, 800)}>
                {lane.toUpperCase()}
              </text>
            </g>
          </g>
        ))}

        {d.blocks.map((b, i) => {
          const k = seg(now, b.t0, b.t1);
          if (k <= 0 && b.kind !== 'missing') return null;
          const x = tx(b.t0);
          const full = tx(b.t1) - x;
          const w = full * k;
          const y = laneY[b.lane];
          const h = b.kind === 'policy' || b.kind === 'wait' ? 16 : 14;
          const label = b.label ? SHORT[b.label] ?? b.label : '';
          const fits = label && full > label.length * charW + 8;
          if (b.kind === 'missing') {
            if (now < b.t0) return null;
            return (
              <g key={i}>
                <rect x={x} y={y - h / 2} width={full} height={h} rx={h / 2} fill="none" stroke={t.ink3} strokeDasharray="3 3" strokeWidth={1.3} />
                <text x={X1} y={y - h / 2 - 5} textAnchor="end" fill={t.ink3} style={text(10, 650)}>
                  no call
                </text>
              </g>
            );
          }
          if (b.kind === 'next') {
            return (
              <g key={i}>
                <rect x={x} y={y - h / 2} width={Math.max(0.1, w)} height={h} rx={h / 2} fill={t.s2w} stroke={t.s2} strokeOpacity={0.6} strokeDasharray="3 3" strokeWidth={1.3} />
                {k > 0.85 && fits && (
                  <text x={x + full / 2} y={y + 3.5} textAnchor="middle" fill={t.ink2} style={text(9.5, 650)}>
                    {label}
                  </text>
                )}
              </g>
            );
          }
          const fill = b.kind === 'wait' ? `url(#ps-hatch-${uid})` : b.kind === 'policy' ? t.s0 : t.s2;
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
                style={{ filter: k < 1 && b.kind !== 'wait' ? `drop-shadow(0 0 6px ${b.kind === 'policy' ? t.s0g : t.s2g})` : 'none' }}
              />
              {fits && k > 0.85 && (
                <text x={x + full / 2} y={y + 3.5} textAnchor="middle" fill="#ffffff" style={text(b.kind === 'policy' ? 10 : 9.5, 700)}>
                  {label}
                </text>
              )}
              {b.kind === 'wait' && k > 0.6 && (
                <text x={x + full / 2} y={y + h / 2 + 12} textAnchor="middle" fill={t.ink2} style={text(9.5, 650)}>
                  robot waits
                </text>
              )}
            </g>
          );
        })}

        {d.marks.map((m, i) => {
          const on = now >= m.t;
          const y = laneY[m.lane];
          const x = tx(m.t);
          if (m.kind === 'route' || m.kind === 'escalate' || m.kind === 'stop' || m.kind === 'tick' || m.kind === 'switch' || m.kind === 'keep') {
            // route memory's label sits under its lane, clear of the first boundary
            const below = m.kind === 'route';
            return (
              <g key={i} transform={`translate(${x} ${y})`} style={{ opacity: on ? 1 : 0.15, transition: 'opacity .3s' }}>
                <rect x={-5.5} y={-8.5} width={11} height={17} rx={5.5} fill={station} stroke={t.ink} strokeWidth={2} />
                {m.label && (
                  <text
                    x={below ? -3 : m.kind === 'stop' ? -9 : 9}
                    y={below ? 22 : 4}
                    textAnchor={m.kind === 'stop' ? 'end' : 'start'}
                    fill={t.ink}
                    style={text(10.5, 700)}
                  >
                    {m.label}
                  </text>
                )}
              </g>
            );
          }
          if (m.kind === 'advice') {
            if (!on) return null;
            const x1 = tx(m.to ?? m.t) - 7;
            const w = m.label.length * charW + 12;
            return (
              <g key={i}>
                <path d={`M ${x} ${laneY.s2 + 8} V ${laneY.s1} H ${x1}`} fill="none" stroke={t.ink3} strokeWidth={1.2} strokeDasharray="3 3" />
                <path d={`M ${x1 - 4} ${laneY.s1 - 3.5} L ${x1} ${laneY.s1} L ${x1 - 4} ${laneY.s1 + 3.5}`} fill="none" stroke={t.ink3} strokeWidth={1.2} />
                <g transform={`translate(${clampX(x - w / 2, w)} ${laneY.s2 - 28})`}>
                  <rect width={w} height={17} rx={8.5} fill={station} stroke={t.ink3} strokeWidth={1} />
                  <text x={w / 2} y={12} textAnchor="middle" fill={t.ink} style={text(9.5, 700)}>
                    {m.label}
                  </text>
                </g>
              </g>
            );
          }
          if (!on) return null;
          const silent = m.kind === 'silent';
          const bg = m.kind === 'done' ? t.done : m.kind === 'not_done' ? t.fail : m.kind === 'error' ? t.s2 : 'none';
          const w = m.label.length * charW + 12;
          return (
            <g key={i} transform={`translate(${clampX(x - w / 2, w)} ${silent ? y + 12 : y - 28})`}>
              <rect width={w} height={17} rx={8.5} fill={silent ? station : bg} stroke={silent ? t.ink3 : 'none'} strokeDasharray={silent ? '3 3' : undefined} />
              <text x={w / 2} y={12} textAnchor="middle" fill={silent ? t.ink2 : '#ffffff'} style={text(9.5, 700)}>
                {m.label}
              </text>
            </g>
          );
        })}

        {/* playhead */}
        <line x1={tx(Math.min(T, now))} x2={tx(Math.min(T, now))} y1={6} y2={VH - 6} stroke={t.ink} strokeOpacity={0.3} strokeWidth={1} />
      </svg>
    </div>
  );
}

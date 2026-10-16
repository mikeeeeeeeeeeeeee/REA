import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { TableIcon, ChartBarLineIcon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { useSeenOnce } from '@/lib/hooks';

/**
 * Small, honest charts: zero-based bars, value at the tip, recessive grid, colour by role
 * (REA = S1 purple, baselines = gray, brain in the control loop = S2 orange), a tooltip on
 * hover or focus, and a table view of every number.
 */
export type Kind = 'ours' | 'base' | 'loop' | 'ceiling' | 'muted';

export const KIND_COLOR: Record<Kind, string> = {
  ours: 'var(--s1)',
  base: 'var(--base-2)',
  loop: 'var(--s2)',
  ceiling: 'transparent',
  muted: 'var(--base-1)',
};

export function Legend({ items }: { items: { kind: Kind; label: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
          <span
            className="h-2.5 w-4 rounded-r-[3px]"
            style={{ background: KIND_COLOR[it.kind], boxShadow: it.kind === 'ceiling' ? 'inset 0 0 0 1.5px var(--ink-3)' : undefined }}
          />
          {it.label}
        </li>
      ))}
    </ul>
  );
}

/** A figure card with a title, an optional legend and a chart/table switch. */
export function ChartFrame({
  title,
  sub,
  legend,
  table,
  actions,
  children,
  className = '',
}: {
  title: ReactNode;
  sub?: ReactNode;
  legend?: ReactNode;
  table?: { head: string[]; rows: (string | number)[][] };
  /** extra controls for the header, left of the table switch */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  return (
    <figure className={`figure-frame overflow-hidden ${className}`}>
      <figcaption className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-rule px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[16px] font-[740] leading-snug text-ink [font-stretch:88%]">{title}</p>
          {sub && <p className="mt-0.5 text-[13px] leading-snug text-ink-3">{sub}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
        {actions}
        {table && (
          <button
            type="button"
            onClick={() => setAsTable((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rule px-2.5 py-1 text-[12.5px] font-[620] text-ink-2 transition-colors hover:border-rule-2 hover:text-ink"
            aria-pressed={asTable}
          >
            <Icon icon={asTable ? ChartBarLineIcon : TableIcon} size={14} />
            {asTable ? 'Chart' : 'Table'}
          </button>
        )}
        </div>
      </figcaption>
      <div className="px-5 py-5 sm:px-6">
        {asTable && table ? <DataTable head={table.head} rows={table.rows} /> : children}
        {legend && !asTable && <div className="mt-4 border-t border-rule pt-3">{legend}</div>}
      </div>
    </figure>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-[13.5px]">
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} className={`border-b border-rule pb-2 font-[680] text-ink-2 ${i === 0 ? 'text-left' : 'text-right'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-rule/70 last:border-b-0">
              {r.map((c, j) => (
                <td key={j} className={`tabular py-2 ${j === 0 ? 'text-left font-[600] text-ink' : 'text-right text-ink-2'}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type BarRow = {
  label: string;
  value: number;
  display?: string;
  kind: Kind;
  ci?: [number, number];
  note?: string;
  /** a dashed extension: the value is a lower bound */
  atLeast?: boolean;
  /** the bar is cut: draw a break and print the true value */
  broken?: boolean;
};

/** Horizontal bars from zero, one row per arm. */
export function HBars({
  rows,
  max,
  unit = '',
  ticks,
  labelWidth = 210,
  barH = 20,
  rowGap = 12,
  decimals = 1,
  ariaLabel,
}: {
  rows: BarRow[];
  max: number;
  unit?: string;
  ticks?: number[];
  labelWidth?: number;
  barH?: number;
  rowGap?: number;
  decimals?: number;
  ariaLabel: string;
}) {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.25);
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const boxRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (boxW > 0) labelWidth = Math.min(labelWidth, Math.max(84, Math.round(boxW * 0.4)));
  const tickList = ticks ?? [0, max / 2, max];
  const fmt = (v: number) => `${v.toFixed(decimals)}${unit}`;
  return (
    <div ref={ref} className="relative" role="img" aria-label={ariaLabel}>
      <div ref={boxRef} className="relative" style={{ paddingLeft: labelWidth }}>
        {/* grid */}
        <div className="pointer-events-none absolute bottom-0 top-0" style={{ left: labelWidth, right: 56 }}>
          {tickList.map((tk) => (
            <div key={tk} className="absolute bottom-[-22px] top-0 w-px bg-rule" style={{ left: `${(tk / max) * 100}%` }}>
              <span className="tabular absolute bottom-0 left-1/2 -translate-x-1/2 text-[11.5px] text-ink-4">
                {tk}
                {unit}
              </span>
            </div>
          ))}
        </div>
        <ul className="relative" style={{ marginRight: 56 }}>
          {rows.map((r, i) => {
            const w = Math.min(1, r.value / max);
            const on = hover === i;
            const dim = hover !== null && !on;
            return (
              <li
                key={r.label}
                className="relative"
                style={{ height: barH, marginBottom: i < rows.length - 1 ? rowGap : 0 }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${r.label}: ${r.display ?? fmt(r.value)}${r.note ? `, ${r.note}` : ''}`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 truncate pr-3 text-right text-[13.5px] transition-opacity ${r.kind === 'ours' ? 'font-[720] text-ink' : 'font-[560] text-ink-2'}`}
                  style={{ right: '100%', width: labelWidth, opacity: dim ? 0.55 : 1 }}
                >
                  {r.label}
                </span>
                <motion.span
                  className="absolute left-0 top-0 block h-full origin-left rounded-r-[4px]"
                  style={{
                    width: `${w * 100}%`,
                    background: r.kind === 'ceiling' ? `repeating-linear-gradient(-45deg, var(--rule-2) 0 1px, transparent 1px 5px)` : KIND_COLOR[r.kind],
                    boxShadow: r.kind === 'ceiling' ? 'inset 0 0 0 1.5px var(--ink-3)' : on ? '0 0 0 2px var(--surface), 0 0 0 3.5px currentColor' : undefined,
                    color: KIND_COLOR[r.kind],
                    opacity: dim ? 0.5 : 1,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={seen ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                />
                {r.broken && (
                  <span className="absolute top-[-3px] h-[calc(100%+6px)] w-[7px] -skew-x-[20deg] bg-surface" style={{ left: `calc(${w * 100}% - 22px)` }} />
                )}
                {r.ci && (
                  <motion.span
                    className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink/60"
                    style={{ left: `${(r.ci[0] / max) * 100}%`, width: `${((r.ci[1] - r.ci[0]) / max) * 100}%` }}
                    initial={{ opacity: 0 }}
                    animate={seen ? { opacity: 1 } : {}}
                    transition={{ delay: 0.6 + 0.05 * i }}
                  >
                    <span className="absolute -top-[5px] left-0 h-[12px] w-[2px] bg-ink/60" />
                    <span className="absolute -top-[5px] right-0 h-[12px] w-[2px] bg-ink/60" />
                  </motion.span>
                )}
                <motion.span
                  className={`tabular absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-[13px] ${r.kind === 'ours' ? 'font-[760] text-ink' : 'font-[600] text-ink-2'}`}
                  style={{ left: `${Math.max(w, r.ci ? r.ci[1] / max : 0) * 100}%` }}
                  initial={{ opacity: 0 }}
                  animate={seen ? { opacity: dim ? 0.55 : 1 } : {}}
                  transition={{ delay: 0.5 + 0.05 * i }}
                >
                  {r.atLeast ? '≥ ' : ''}
                  {r.display ?? fmt(r.value)}
                </motion.span>
                {on && r.note && (
                  <span
                    id={`tip-${uid}-${i}`}
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[calc(100%+8px)] z-10 w-max max-w-[300px] rounded-lg bg-ink px-2.5 py-1.5 text-[12.5px] leading-snug text-paper shadow-lg"
                    style={{ left: `${Math.min(70, w * 100)}%` }}
                  >
                    <b className="font-[720]">{r.display ?? fmt(r.value)}</b> {r.note}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="h-[26px]" />
      </div>
    </div>
  );
}

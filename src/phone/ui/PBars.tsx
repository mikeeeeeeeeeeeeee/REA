import { motion } from 'motion/react';
import { KIND_COLOR, type BarRow } from '@/components/viz/charts';
import { useSeenOnce } from '@/lib/hooks';

/**
 * Bars for a phone: the name and the value on one line, the bar under them across the whole card, so no name is
 * ever cut short. Zero-based, the 95% interval as a thin line with end caps, REA in purple.
 */
export default function PBars({ rows, max = 100, label }: { rows: BarRow[]; max?: number; label: string }) {
  const [ref, seen] = useSeenOnce<HTMLUListElement>(0.3);
  return (
    <ul ref={ref} className="space-y-3" role="img" aria-label={label}>
      {rows.map((r, i) => {
        const ours = r.kind === 'ours';
        return (
          <li key={r.label}>
            <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
              <span className={ours ? 'font-[740] text-ink' : 'text-ink-2'}>{r.label}</span>
              <span className={`tabular whitespace-nowrap ${ours ? 'font-[800] text-ink' : 'font-[620] text-ink-2'}`}>{r.display ?? r.value}</span>
            </div>
            <div className="relative mt-1.5 h-[10px] rounded-full bg-paper-2">
              <motion.span
                className="absolute inset-y-0 left-0 block origin-left rounded-full"
                style={{ width: `${Math.max(1.5, Math.min(100, (r.value / max) * 100))}%`, background: KIND_COLOR[r.kind] }}
                initial={{ scaleX: 0 }}
                animate={seen ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              {r.ci && (
                <motion.span
                  className="absolute top-1/2 h-[2px] -translate-y-1/2 bg-ink/55"
                  style={{ left: `${(r.ci[0] / max) * 100}%`, width: `${((r.ci[1] - r.ci[0]) / max) * 100}%` }}
                  initial={{ opacity: 0 }}
                  animate={seen ? { opacity: 1 } : {}}
                  transition={{ delay: 0.6 + 0.06 * i }}
                >
                  <span className="absolute -top-[4px] left-0 h-[10px] w-[2px] bg-ink/55" />
                  <span className="absolute -top-[4px] right-0 h-[10px] w-[2px] bg-ink/55" />
                </motion.span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

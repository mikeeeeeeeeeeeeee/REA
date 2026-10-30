import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { SectionTitle } from '@/components/ui/Layout';
import { LINES } from '@/components/ui/Line';
import { P_STOPS } from '../stops';

/**
 * A stop's sign: the station on its line (the line runs on to the screen's edge), the stop's number and name, the
 * title, and one or two sentences.
 */
export function StopSign({ id, lede, className = '' }: { id: string; lede?: ReactNode; className?: string }) {
  const k = P_STOPS.findIndex((s) => s.id === id);
  const stop = P_STOPS[k];
  const color = LINES[stop.line].color;
  return (
    <header className={`px-5 pt-14 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="block h-[18px] w-[18px] shrink-0 rounded-full border-[3.5px] bg-[var(--station)]" style={{ borderColor: color }} />
        <span className="tabular shrink-0 text-[12.5px] font-[720] tracking-[0.02em] text-ink-3 [font-stretch:92%]">
          Stop {String(k).padStart(2, '0')} · {stop.name}
        </span>
        <span className="h-[4px] flex-1 rounded-full" style={{ background: `color-mix(in srgb, ${color} 55%, transparent)` }} />
      </div>
      <SectionTitle className="mt-3.5">{stop.title}</SectionTitle>
      {lede && <p className="mt-4 text-[16.5px] leading-[1.6] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">{lede}</p>}
    </header>
  );
}

/** a part of a stop: a small line badge and a heading */
export function PartSign({ kicker, title, className = '' }: { kicker: ReactNode; title: string; className?: string }) {
  return (
    <div className={className}>
      <p className="flex items-center gap-2 text-[13px] font-[700] text-ink-3 [font-stretch:92%]">{kicker}</p>
      <h3 className="sign-lg mt-2 text-[29px] text-ink">{title}</h3>
    </div>
  );
}

/** text beyond the first sentence or two, folded */
export function More({ children, label = 'More' }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="p-press mt-2.5 inline-flex h-8 items-center gap-1 rounded-full border border-rule px-3 text-[13px] font-[680] text-ink-2"
      >
        {open ? 'Less' : label}
        <Icon icon={ArrowDown01Icon} size={14} stroke={2} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

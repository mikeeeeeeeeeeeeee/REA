import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Cancel01Icon, ComputerIcon, Moon02Icon, Route01Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { BrandMark, LINES } from '@/components/ui/Line';
import { useTheme } from '@/theme/ThemeProvider';
import { switchView } from '../mode';
import { P_STOPS, goTo } from '../stops';
import Seg from './Seg';
import Sheet from './Sheet';

const BAR = 56;

/** the stop under the bar, how far down the page the reader is, and where each stop starts on that scale */
function useReading() {
  const [state, setState] = useState({ id: 'top', progress: 0, scrolled: false, stations: [] as number[] });
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      let id = 'top';
      const stations = P_STOPS.map((s) => {
        if (s.id === 'top') return 0;
        const el = document.getElementById(s.id);
        if (!el) return 1;
        const top = el.getBoundingClientRect().top;
        if (top <= BAR + 24) id = s.id;
        return Math.min(1, Math.max(0, (top + window.scrollY - BAR) / max));
      });
      const progress = Math.min(1, window.scrollY / max);
      const scrolled = window.scrollY > 8;
      setState((s) =>
        s.id === id && Math.abs(s.progress - progress) < 0.001 && s.scrolled === scrolled && s.stations.every((v, i) => Math.abs(v - stations[i]) < 0.002) && s.stations.length === stations.length
          ? s
          : { id, progress, scrolled, stations }
      );
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    // pictures and videos settle the page's height after load
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return state;
}

/** the top bar: the mark, the stop being read (it opens the stops), and the whole page as a line along its foot */
export default function PBar() {
  const { id, progress, scrolled, stations } = useReading();
  const [open, setOpen] = useState(false);
  const k = Math.max(0, P_STOPS.findIndex((s) => s.id === id));
  const stop = P_STOPS[k];

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
        <div
          className={`pointer-events-auto relative flex items-center gap-3 px-4 transition-[background-color,box-shadow] duration-300 ${
            scrolled ? 'bg-[color-mix(in_srgb,var(--paper)_84%,transparent)] shadow-[0_1px_0_var(--rule)] backdrop-blur-xl backdrop-saturate-150' : ''
          }`}
          style={{ height: BAR }}
        >
          <button type="button" onClick={() => goTo('top')} className="p-press flex shrink-0 items-center gap-2" aria-label="REA, back to the top">
            <BrandMark size={24} />
            <span className="text-[20px] font-[800] tracking-[-0.01em] text-ink [font-stretch:84%]">REA</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-press ml-auto flex h-10 min-w-0 items-center gap-2 rounded-full border border-rule bg-surface pl-3 pr-2 shadow-[0_6px_18px_-12px_hsl(var(--shadow-color)/0.5)]"
            aria-label={`Stops: now at ${stop.name}. Open the list of stops`}
            aria-haspopup="dialog"
          >
            <span className="block h-[11px] w-[11px] shrink-0 rounded-full border-[2.5px] bg-[var(--station)]" style={{ borderColor: LINES[stop.line].color }} />
            <span className="relative min-w-0 overflow-hidden text-[14.5px] font-[700] text-ink [font-stretch:90%]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={stop.id}
                  className="block truncate"
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                >
                  {stop.name}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-paper">
              <Icon icon={Route01Icon} size={15} stroke={2} />
            </span>
          </button>
        </div>

        {/* the page as a line: the part read is blue, one station per stop */}
        <div
          className="pointer-events-none absolute inset-x-4 top-full h-3 -translate-y-1/2 transition-opacity duration-300"
          style={{ opacity: scrolled ? 1 : 0 }}
          aria-hidden
        >
          <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-rule" />
          <span className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-s0" style={{ width: `${progress * 100}%` }} />
          {stations.map((x, i) => {
            const passed = progress >= x - 0.0005;
            const here = i === k;
            return (
              <span
                key={P_STOPS[i].id}
                className="absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-[width,height,background-color,border-color] duration-300"
                style={{
                  left: `${x * 100}%`,
                  width: here ? 11 : 7,
                  height: here ? 11 : 7,
                  borderColor: here ? 'var(--ink)' : passed ? 'var(--s0)' : 'var(--rule-2)',
                  background: here ? 'var(--station)' : passed ? 'var(--s0)' : 'var(--station)',
                }}
              />
            );
          })}
        </div>
      </header>

      <StopsSheet open={open} onClose={() => setOpen(false)} current={k} />
    </>
  );
}

function StopsSheet({ open, onClose, current }: { open: boolean; onClose: () => void; current: number }) {
  const { theme, setTheme } = useTheme();
  const go = (id: string) => {
    onClose();
    // after the sheet has given the page its scroll back
    window.setTimeout(() => goTo(id), 240);
  };
  return (
    <Sheet open={open} onClose={onClose} label="Stops">
      <div className="flex items-center justify-between px-5 pb-1 pt-1">
        <p className="text-[21px] font-[800] tracking-[-0.01em] text-ink [font-stretch:84%]">Stops</p>
        <button type="button" onClick={onClose} className="p-press grid h-9 w-9 place-items-center rounded-full bg-paper-2 text-ink-2" aria-label="Close">
          <Icon icon={Cancel01Icon} size={16} stroke={2} />
        </button>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2" aria-label="Stops">
        <ol className="relative py-1">
          {/* the line itself, read up to the current stop */}
          <span className="absolute bottom-7 left-[25px] top-7 w-[4px] rounded-full bg-rule" aria-hidden />
          <span
            className="absolute left-[25px] top-7 w-[4px] rounded-full bg-s0 transition-[height] duration-500"
            style={{ height: `calc((100% - 56px) * ${current / (P_STOPS.length - 1)})` }}
            aria-hidden
          />
          {P_STOPS.map((s, i) => {
            const here = i === current;
            const passed = i < current;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={here ? 'location' : undefined}
                  className={`p-press relative flex w-full items-center gap-3.5 rounded-2xl py-2.5 pl-2 pr-3 text-left ${here ? 'bg-paper-2' : ''}`}
                >
                  <span className="relative grid h-[26px] w-[26px] shrink-0 place-items-center">
                    {here && <span className="absolute inset-0 rounded-full bg-s0" style={{ animation: 'p-ping 1.6s ease-out infinite' }} />}
                    <span
                      className="relative block rounded-full border-[3px]"
                      style={{
                        width: here ? 22 : 16,
                        height: here ? 22 : 16,
                        borderColor: here ? 'var(--ink)' : passed ? 'var(--s0)' : 'var(--rule-2)',
                        background: passed ? 'var(--s0)' : 'var(--station)',
                      }}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[16.5px] font-[740] leading-tight text-ink [font-stretch:90%]">{s.name}</span>
                      {i > 0 && <span className="tabular text-[11.5px] font-[650] text-ink-4">{String(i).padStart(2, '0')}</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] text-ink-3">{s.note}</span>
                  </span>
                  <span className="h-[18px] w-[4px] shrink-0 rounded-full" style={{ background: LINES[s.line].color }} aria-hidden />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="space-y-3 border-t border-rule px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[14.5px] font-[680] text-ink-2">Map</span>
          <div className="w-[190px]">
            <Seg
              label="Day or night map"
              value={theme}
              onChange={setTheme}
              items={[
                { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Icon icon={Sun03Icon} size={15} stroke={2} /> Day</span> },
                { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Icon icon={Moon02Icon} size={15} stroke={2} /> Night</span> },
              ]}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => switchView('desktop', P_STOPS[current]?.id === 'top' ? '' : P_STOPS[current]?.id)}
          className="p-press flex h-11 w-full items-center justify-center gap-2 rounded-full border border-rule bg-surface text-[14.5px] font-[700] text-ink"
        >
          <Icon icon={ComputerIcon} size={17} stroke={1.9} />
          Open the desktop page
        </button>
      </div>
    </Sheet>
  );
}

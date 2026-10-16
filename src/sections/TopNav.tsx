import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import RubberSegment from '@/components/reactbits/RubberSegment/RubberSegment';
import Icon from '@/components/ui/Icon';
import { BrandMark } from '@/components/ui/Line';
import { Menu01Icon, Cancel01Icon, Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '@/theme/ThemeProvider';
import { scrollToId, useMediaQuery } from '@/lib/hooks';

/**
 * Navigation as a line strip, like the route diagram above a train door: one station per
 * section, the line filled up to where the reader is.
 */
export const STOPS = [
  { id: 'overview', label: 'Overview' },
  { id: 'problem', label: 'Problem' },
  { id: 'runtime', label: 'Runtime' },
  { id: 'router', label: 'Router' },
  { id: 'episodes', label: 'Episodes' },
  { id: 'results', label: 'Results' },
  { id: 'embodiments', label: 'Embodiments' },
  { id: 'cite', label: 'Cite' },
];

/** continuous position along the stops: 2.5 = halfway from the third stop to the fourth */
function useStripProgress() {
  const [p, setP] = useState(-1);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.3;
      const tops = STOPS.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top - line : Number.POSITIVE_INFINITY;
      });
      let v = -1;
      for (let i = 0; i < tops.length; i++) {
        if (tops[i] <= 0) {
          const next = tops[i + 1];
          const span = Number.isFinite(next) ? next - tops[i] : 1;
          v = i + (Number.isFinite(next) ? Math.min(1, -tops[i] / span) : 0);
        }
      }
      if (v < 0 && Number.isFinite(tops[0])) {
        // before the first stop: approach it while the hero scrolls away
        v = Math.max(-1, -Math.min(1, tops[0] / (window.innerHeight * 0.9)));
      }
      setP(v);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    const id = window.setInterval(update, 1000); // sections load lazily; re-measure now and then
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      window.clearInterval(id);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return p;
}

export default function TopNav() {
  const { theme, t, setTheme } = useTheme();
  const wide = useMediaQuery('(min-width: 1100px)');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const p = useStripProgress();
  const current = Math.floor(p + 0.02);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };
  const n = STOPS.length;
  const fill = Math.max(0, Math.min(1, p / (n - 1)));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div
        className={`pointer-events-auto transition-[background-color,box-shadow] duration-300 ${
          scrolled ? 'bg-[color-mix(in_srgb,var(--paper)_82%,transparent)] shadow-[0_1px_0_var(--rule)] backdrop-blur-xl backdrop-saturate-150' : ''
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:px-10">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="REA, back to top"
          >
            <BrandMark size={26} />
            <span className="text-[21px] font-[800] tracking-[-0.01em] [font-stretch:84%]">REA</span>
          </a>

          {wide ? (
            <nav aria-label="Sections" className="relative mx-auto h-[46px] flex-1 max-w-[880px]">
              {/* the line */}
              <div className="absolute left-[calc(100%/16)] right-[calc(100%/16)] top-[12px] h-[5px] rounded-full bg-rule" />
              <div
                className="absolute left-[calc(100%/16)] top-[12px] h-[5px] rounded-full bg-s0 transition-[width] duration-150"
                style={{ width: `calc((100% - 100% / 8) * ${fill})` }}
              />
              <ol className="relative grid h-full grid-cols-8">
                {STOPS.map((s, i) => {
                  const passed = i < p - 0.02;
                  const here = i === current;
                  return (
                    <li key={s.id} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => go(s.id)}
                        className="group flex flex-col items-center gap-[7px] outline-none"
                        aria-current={here ? 'location' : undefined}
                      >
                        <span
                          className="relative mt-[5px] block rounded-full border-[3px] transition-all duration-300"
                          style={{
                            width: here ? 19 : 13,
                            height: here ? 19 : 13,
                            marginTop: here ? 2 : 5,
                            borderColor: here ? 'var(--ink)' : passed ? 'var(--s0)' : 'var(--rule-2)',
                            background: here ? 'var(--station)' : passed ? 'var(--s0)' : 'var(--station)',
                            boxShadow: here ? '0 0 0 4px color-mix(in srgb, var(--s0) 25%, transparent)' : 'none',
                          }}
                        />
                        <span
                          className={`whitespace-nowrap text-[12.5px] leading-none transition-colors [font-stretch:90%] ${
                            here ? 'font-[760] text-ink' : 'font-[580] text-ink-3 group-hover:text-ink'
                          }`}
                        >
                          {s.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </nav>
          ) : (
            <div className="min-w-0 flex-1 truncate text-[14px] font-[620] text-ink-3 [font-stretch:90%]">
              {current >= 0 && (
                <>
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-2 border-ink align-[-1px]" />
                  {STOPS[current]?.label}
                </>
              )}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-2">
            <RubberSegment
              items={[
                { value: 'light', label: <Icon icon={Sun03Icon} size={16} />, icon: undefined },
                { value: 'dark', label: <Icon icon={Moon02Icon} size={16} />, icon: undefined },
              ]}
              value={theme}
              onChange={(v) => setTheme(v as 'light' | 'dark')}
              trackColor={theme === 'dark' ? t.surface2 : t.paper2}
              thumbColor={theme === 'dark' ? t.ink : t.ink}
              textColor={t.ink3}
              activeTextColor={t.paper}
              size="sm"
              radius={999}
              aria-label="Day or night map"
            />
            {!wide && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="grid h-10 w-10 place-items-center rounded-full border border-rule bg-surface"
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
              >
                <Icon icon={open ? Cancel01Icon : Menu01Icon} size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && !wide && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto mx-4 mt-1 rounded-2xl border border-rule bg-surface p-4 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.4)]"
            aria-label="Sections"
          >
            <ol className="relative ml-2 border-l-[5px] border-rule">
              {STOPS.map((s, i) => {
                const passed = i <= current;
                return (
                  <li key={s.id} className="relative">
                    <span
                      className="absolute -left-[12px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 rounded-full border-[3px]"
                      style={{ borderColor: i === current ? 'var(--ink)' : passed ? 'var(--s0)' : 'var(--rule-2)', background: i < current ? 'var(--s0)' : 'var(--station)' }}
                    />
                    <button type="button" onClick={() => go(s.id)} className={`w-full py-2.5 pl-6 text-left text-[16px] [font-stretch:90%] ${i === current ? 'font-[760] text-ink' : 'font-[600] text-ink-2'}`}>
                      {s.label}
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

import { Children, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

/**
 * A rail of cards that snaps card by card, edge to edge across the screen, the next card peeking in. It reports the
 * card in the middle (`onIndex`) and scrolls to `index` when that is changed from outside (a segmented control).
 */
export default function Snap({
  index,
  onIndex,
  children,
  label,
  peek = 20,
  gap = 8,
}: {
  index: number;
  onIndex: (i: number) => void;
  children: ReactNode;
  label: string;
  /** visible page margin on each side of the card in the middle */
  peek?: number;
  gap?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const at = useRef(index);
  const lock = useRef<number | null>(null);
  const items = Children.toArray(children);

  // start on the card asked for, without a glide
  useLayoutEffect(() => {
    const el = ref.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (el && card && index > 0) el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the user swipes: report the card nearest the middle
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      if (lock.current !== null) return;
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bd = Infinity;
      Array.from(el.children).forEach((k, i) => {
        const c = (k as HTMLElement).offsetLeft + (k as HTMLElement).offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best !== at.current) {
        at.current = best;
        onIndex(best);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const onEnd = () => {
      lock.current = null;
      measure();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('scrollend', onEnd);
    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('scrollend', onEnd);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [onIndex]);

  // the index was changed from outside: glide there, without reporting the cards passed on the way
  useEffect(() => {
    const el = ref.current;
    if (!el || index === at.current) return;
    const card = el.children[index] as HTMLElement | undefined;
    if (!card) return;
    at.current = index;
    lock.current = index;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
    const id = window.setTimeout(() => (lock.current = null), 700); // where scrollend is not supported
    return () => window.clearTimeout(id);
  }, [index]);

  return (
    <div
      ref={ref}
      className="p-snap -mx-5"
      style={{ gap, paddingInline: peek, scrollPaddingInline: peek }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {items.map((child, i) => (
        // 100% of the rail's content box: the card lines up with the page's text, the next one peeks in by peek − gap
        <div key={i} style={{ width: '100%' }} aria-hidden={i !== index || undefined} className="flex">
          {child}
        </div>
      ))}
    </div>
  );
}

/** the place in a rail, as stations on a short line */
export function Dots({ n, index, onPick, label }: { n: number; index: number; onPick: (i: number) => void; label: string }) {
  return (
    <div className="mt-4 flex items-center justify-center" role="tablist" aria-label={label}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="flex items-center">
          {i > 0 && <span className="h-[3px] w-5 rounded-full" style={{ background: i <= index ? 'var(--s0)' : 'var(--rule-2)' }} />}
          <button
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`${i + 1} of ${n}`}
            onClick={() => onPick(i)}
            className="grid h-7 w-7 place-items-center"
          >
            <span
              className="block rounded-full border-[2.5px] transition-all duration-300"
              style={{
                width: i === index ? 15 : 10,
                height: i === index ? 15 : 10,
                borderColor: i === index ? 'var(--ink)' : i < index ? 'var(--s0)' : 'var(--rule-2)',
                background: i < index ? 'var(--s0)' : 'var(--station)',
              }}
            />
          </button>
        </span>
      ))}
    </div>
  );
}

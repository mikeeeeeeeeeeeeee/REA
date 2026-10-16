import type { ReactNode } from 'react';
import SplitText from '@/components/reactbits/SplitText/SplitText';

export function Section({
  id,
  children,
  className = '',
  tone = 'bg',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'bg' | 'bg2' | 'none';
}) {
  const bg = tone === 'bg2' ? 'bg-paper-2' : tone === 'bg' ? 'bg-paper' : '';
  return (
    <section id={id} className={`relative ${bg} ${className}`}>
      {children}
    </section>
  );
}

export function Container({ children, className = '', wide = false }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={`mx-auto w-full px-5 sm:px-8 lg:px-10 ${wide ? 'max-w-[1440px]' : 'max-w-[1240px]'} ${className}`}>{children}</div>;
}

/**
 * Section opener. `index` is the section's place in the paper's argument (problem, runtime,
 * router, ...), shown as a lane label in the timing-diagram style of the page.
 */
export function SectionHead({
  lane,
  laneColor = 'var(--ink-3)',
  title,
  lede,
  className = '',
  align = 'left',
}: {
  lane?: ReactNode;
  laneColor?: string;
  title: ReactNode;
  lede?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <header className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-[64rem] ${className}`}>
      {lane && (
        <div className={`mb-5 flex items-center gap-3 text-[13.5px] font-[560] text-ink-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="relative flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
            <span className="absolute h-2.5 w-2.5 rounded-full" style={{ background: laneColor }} />
          </span>
          <span>{lane}</span>
          <span className="h-px w-16 bg-rule-2" aria-hidden />
        </div>
      )}
      <h2 className="display text-[clamp(2.3rem,5.2vw,4.6rem)] text-ink">{title}</h2>
      {lede && <div className={`prose-serif mt-6 max-w-[44rem] ${align === 'center' ? 'mx-auto' : ''}`}>{lede}</div>}
    </header>
  );
}

/** A code-like token, as the paper sets `done`, `not_done`, `fix`, `evo`. */
export function Tok({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 's2' | 's1' | 's0' | 'done' | 'fail'; className?: string }) {
  const tones: Record<string, string> = {
    neutral: 'bg-surface-2 text-ink-2 border-rule',
    s2: 'bg-s2-wash text-ink border-[color-mix(in_srgb,var(--s2)_35%,transparent)]',
    s1: 'bg-s1-wash text-ink border-[color-mix(in_srgb,var(--s1)_35%,transparent)]',
    s0: 'bg-s0-wash text-ink border-[color-mix(in_srgb,var(--s0)_35%,transparent)]',
    done: 'bg-done-wash text-ink border-[color-mix(in_srgb,var(--done)_40%,transparent)]',
    fail: 'bg-fail-wash text-ink border-[color-mix(in_srgb,var(--fail)_40%,transparent)]',
  };
  return <code className={`code inline-flex items-center rounded-md border px-1.5 py-[1px] leading-[1.35] ${tones[tone]} ${className}`}>{children}</code>;
}

/** Marks something that is not public yet (a link, the robot video). */
export function Soon({ children = 'soon' }: { children?: ReactNode }) {
  return <span className="ph-chip ml-1.5 rounded-full border border-rule px-1.5 py-px text-[11px] font-[600] text-ink-3">{children}</span>;
}

/** A section title in station-sign type; its words rise into place the first time it is seen. */
export function SectionTitle({ children, className = '' }: { children: string; className?: string }) {
  return (
    <h2 className={`sign-xl text-[clamp(2.8rem,6vw,5.6rem)] text-ink ${className}`}>
      <SplitText text={children} tag="span" splitType="words" effect="rise" delay={55} duration={0.75} threshold={0.2} textAlign="left" className="block" />
    </h2>
  );
}

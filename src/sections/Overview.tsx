import { motion } from 'motion/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import Counter from '@/components/reactbits/Counter/Counter';
import Icon from '@/components/ui/Icon';
import { Container } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ABSTRACT } from '@/data/paper';
import { useSeenOnce } from '@/lib/hooks';

/** the headline results, as stations along REA's own line (S1) */
const STOPS = [
  { value: 95.9, decimals: 1, suffix: '%', label: 'success on 3,000 LIBERO-Pro test episodes', vs: 'best skill author alone: 94.7%' },
  { value: 25, decimals: 0, prefix: '−', suffix: '%', label: 'control steps per success', vs: '1,003 against 1,343' },
  { value: 17, decimals: 0, prefix: '−', suffix: '%', label: 'control time per episode', vs: '9.96 s against 12.04 s' },
  { value: 3.1, decimals: 1, prefix: '+', suffix: ' pp', label: 'from the judge gate where skills fail silently', vs: '+15.3 pp on a failure-heavy subset' },
  { value: 4, decimals: 0, suffix: ' / 4', label: 'embodiments where REA solves the most episodes', vs: 'LIBERO-Pro, BEHAVIOR-1K, RoboTwin 2.0, Unitree G1' },
];

const CONTRIBUTIONS = [
  { line: 's0' as const, title: 'One contract for brains and skills', body: 'A three-level runtime that unifies agents, VLAs and program skills under one contract and one evaluation protocol.' },
  { line: 's1' as const, title: 'A router that never blocks a skill', body: 'Route memory for dispatch, a judge gate for silent failures, an escalation ladder with a shared budget for recovery.' },
  { line: 's2' as const, title: 'An aligned study of where the brain should sit', body: 'More than 30,000 test episodes on identical tasks, seeds, initial states and budgets.' },
];

export default function Overview() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  return (
    <section id="overview" className="relative scroll-mt-20 pb-24 pt-10 sm:pb-32 sm:pt-14">
      <Container wide>
        {/* results along REA's line */}
        <div ref={ref} className="relative">
          <div className="relative hidden lg:block" aria-hidden>
            <motion.div
              className="absolute left-[10%] right-[10%] top-[148px] h-[10px] origin-left rounded-full bg-s1"
              initial={{ scaleX: 0 }}
              animate={seen ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
            />
          </div>
          <ol className="relative grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-5">
            {STOPS.map((s, i) => (
              <li key={s.label} className={`relative flex flex-col items-start px-1 lg:items-center lg:px-4 lg:text-center ${i === STOPS.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                <div className="flex items-end lg:h-[124px]">
                  <span className="sign-xl tabular-nums text-[clamp(2.7rem,5.4vw,5.2rem)] text-ink">
                    {s.prefix}
                    <Counter value={s.value} decimals={s.decimals} fontSize="1em" fontWeight="inherit" duration={1.1} stagger={0.08} bounce={0.18} intro tabular={false} />
                    <span className="text-[0.5em] font-[720]">{s.suffix}</span>
                  </span>
                </div>
                <motion.span
                  className="relative z-10 mt-[14px] hidden h-[26px] w-[26px] rounded-full border-[5px] border-ink bg-[var(--station)] lg:block"
                  initial={{ scale: 0 }}
                  animate={seen ? { scale: 1 } : {}}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.35 + 0.18 * i }}
                />
                <p className="mt-3 max-w-[22ch] text-[15px] font-[650] leading-snug text-ink [font-stretch:92%] lg:mt-5 lg:text-[16px]">{s.label}</p>
                <p className="mt-1.5 max-w-[26ch] text-[14px] leading-snug text-ink-3">{s.vs}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <Container wide className="mt-20 sm:mt-24">
        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {CONTRIBUTIONS.map((c, i) => (
            <li key={c.title} className="border-t-[3px] pt-5" style={{ borderColor: `var(--${c.line})` }}>
              <p className="title-card flex items-start gap-2.5 text-ink">
                <LineBadge line={c.line} size={13} className="mt-[2px] shrink-0" />
                <span>
                  <span className="mr-1.5 text-ink-4">{i + 1}</span>
                  {c.title}
                </span>
              </p>
              <p className="mt-2 max-w-[46ch] text-[15.5px] leading-[1.6] text-ink-2">{c.body}</p>
            </li>
          ))}
        </ol>

        {/* the paper's abstract, one click away; the hero's "Read the abstract" opens it */}
        <details id="abstract" className="group mt-14 scroll-mt-28 border-y border-rule">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="flex min-w-0 items-baseline gap-5">
              <span className="text-[17px] font-[740] text-ink [font-stretch:88%]">Abstract</span>
              <span className="hidden truncate text-[15px] text-ink-3 sm:block group-open:invisible">{ABSTRACT[0]}</span>
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule-2 text-ink transition-transform duration-300 group-open:rotate-45">
              <Icon icon={Add01Icon} size={17} />
            </span>
          </summary>
          <div className="max-w-[72ch] space-y-5 pb-9 text-[17px] leading-[1.7] text-ink-2">
            {ABSTRACT.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </details>
      </Container>
    </section>
  );
}

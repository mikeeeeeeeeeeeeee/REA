import { motion } from 'motion/react';
import Counter from '@/components/reactbits/Counter/Counter';
import ScrollReveal from '@/components/reactbits/ScrollReveal/ScrollReveal';
import { Container } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { ABSTRACT } from '@/data/paper';
import { useSeenOnce } from '@/lib/hooks';

/** the headline results, as stations along REA's own line (S1) */
const STOPS = [
  { value: 95.9, decimals: 1, suffix: '%', label: 'success on 3,000 held-out LIBERO-Pro episodes', vs: 'best skill author alone: 94.7%' },
  { value: 25, decimals: 0, prefix: '−', suffix: '%', label: 'control steps per success', vs: '1,003 against 1,343' },
  { value: 17, decimals: 0, prefix: '−', suffix: '%', label: 'control time per episode', vs: '9.96 s against 12.04 s' },
  { value: 3.1, decimals: 1, prefix: '+', suffix: ' pp', label: 'from the judge gate where skills fail silently', vs: '+15.3 pp on a failure-heavy subset' },
  { value: 4, decimals: 0, suffix: ' / 4', label: 'embodiments where REA solves the most episodes', vs: 'LIBERO-Pro, BEHAVIOR-1K, RoboTwin 2.0, Unitree G1' },
];

const CONTRIBUTIONS = [
  {
    line: 's0' as const,
    title: 'One contract for brains and skills',
    body: 'A three-level runtime whose contract admits agent-written programs, VLA policies and whole-body controllers under one evaluation protocol, from simulators to a real humanoid.',
  },
  {
    line: 's1' as const,
    title: 'A router that never blocks a skill',
    body: 'Three modules, one per coordination problem: route memory for dispatch, a boundary-triggered judge gate for silent failures, an escalation ladder with a shared budget for recovery.',
  },
  {
    line: 's2' as const,
    title: 'An aligned study of where the brain should sit',
    body: 'More than 30,000 held-out episodes on identical tasks, seeds, initial states and budgets: ahead of time and at skill returns, the brain helps; inside the control loop, it only adds waiting.',
  },
];

export default function Overview() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  return (
    <section id="overview" className="relative scroll-mt-20 py-24 sm:py-32">
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

      <Container className="mt-28 sm:mt-36">
        <ScrollReveal
          baseOpacity={0.12}
          enableBlur
          baseRotation={1.2}
          blurStrength={5}
          containerClassName="!my-0"
          textClassName="sign-lg !text-[clamp(2.1rem,4.4vw,3.9rem)] !leading-[1.04] text-ink"
        >
          The brain is worth most when it decides ahead of time and is asked only at natural boundaries, never wedged into the control path.
        </ScrollReveal>

        <div id="abstract" className="mt-16 grid scroll-mt-28 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="space-y-5 text-[17.5px] leading-[1.7] text-ink-2">
            <p className="label !text-[14px] !text-ink">Abstract</p>
            {ABSTRACT.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <div className="lg:pt-10">
            <p className="label !text-[14px] !text-ink">Contributions</p>
            <ol className="relative mt-5 border-l-[5px] border-rule pl-7">
              {CONTRIBUTIONS.map((c, i) => (
                <li key={c.title} className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[45px] top-0">
                    <LineBadge line={c.line} size={14} />
                  </span>
                  <p className="text-[18px] font-[720] leading-snug text-ink [font-stretch:90%]">
                    <span className="mr-2 text-ink-4">{i + 1}</span>
                    {c.title}
                  </p>
                  <p className="mt-1.5 text-[15.5px] leading-[1.6] text-ink-2">{c.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}

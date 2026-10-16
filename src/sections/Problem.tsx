import { motion } from 'motion/react';
import { Alert02Icon, Tick02Icon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import ElectricBorder from '@/components/reactbits/ElectricBorder/ElectricBorder';
import GlitchText from '@/components/reactbits/GlitchText/GlitchText';
import CouplingStrip, { type CouplingMode } from '@/components/viz/CouplingStrip';
import Icon, { type IconSvg } from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { useTheme } from '@/theme/ThemeProvider';

type Row = {
  mode: CouplingMode;
  code: string;
  title: string;
  status: string;
  tone: 'bad' | 'warn' | 'good';
  icon: IconSvg;
  stat: React.ReactNode;
};

const ROWS: Row[] = [
  {
    mode: 'agent',
    code: 'A',
    title: 'The agent calls the skills',
    status: 'Delays on every step',
    tone: 'bad',
    icon: Alert02Icon,
    stat: (
      <>
        Every decision sits on the control path. An advisor the robot waits for, asked only 1.7 times per episode, still leaves it idle{' '}
        <b>2.62 s per episode, 20% of its control time</b>, and starts the first action 1.5 s late.
      </>
    ),
  },
  {
    mode: 'skill',
    code: 'B',
    title: 'The skills call the agent on errors',
    status: 'Silent failures missed',
    tone: 'warn',
    icon: ViewOffSlashIcon,
    stat: (
      <>
        A persistent error calls the agent again and again, while most failures raise no error at all. An exception gate escalated{' '}
        <b>6 times in 590 episodes, although 166 failed</b>.
      </>
    ),
  },
  {
    mode: 'rea',
    code: 'C',
    title: 'REA: a router in between',
    status: 'Good service',
    tone: 'good',
    icon: Tick02Icon,
    stat: (
      <>
        Dispatch is a lookup, every skill runs end to end, and the judge is asked only when a skill returns.{' '}
        <b>No running skill waits on the brain</b>; where skills fail silently, the judge gate adds <b>3.1 points</b>.
      </>
    ),
  },
];

export default function Problem() {
  const { t, theme } = useTheme();
  return (
    <section id="problem" className="relative scroll-mt-20 bg-paper-2 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Where should the brain sit?</SectionTitle>
          <p className="lede">
            A foundation model is a capable brain but a poor controller: emitting actions itself, it solved <b>1 of 1,987</b> LIBERO-Pro
            episodes. Fast skills act at their own rate but cannot tell when they have quietly failed. How the two are coupled decides whether
            the robot waits, or whether failures go unnoticed.
          </p>
        </div>

        <div className="figure-frame mt-14 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-6 py-4">
            <p className="text-[17px] font-[760] text-ink [font-stretch:88%]">Service status: three ways to couple a slow brain with fast skills</p>
            <p className="label">Measured on LIBERO-Pro, schematic timelines after the paper's Figure 3</p>
          </div>
          {ROWS.map((r, i) => {
            const body = (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={`grid items-center gap-x-10 gap-y-5 px-6 py-7 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] ${i > 0 ? 'border-t border-rule' : ''} ${
                  r.tone === 'good' ? 'bg-surface' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-[3px] border-ink text-[15px] font-[800] text-ink">{r.code}</span>
                    <p className="text-[21px] font-[740] leading-tight text-ink [font-stretch:86%]">{r.title}</p>
                  </div>
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13.5px] font-[700] [font-stretch:92%]"
                    style={{
                      color: '#fff',
                      background: r.tone === 'good' ? t.done : r.tone === 'bad' ? t.fail : t.s2,
                    }}
                  >
                    <Icon icon={r.icon} size={15} stroke={2.2} />
                    {r.mode === 'skill' ? (
                      <GlitchText mode="rgb" intensity={0.3} speed={0.6} enableShadows enableOnHover={false} color="#ffffff" shadowColors={['#ffd25e', '#62b0ff']} className="!inline !text-[13.5px] !font-[700]">
                        {r.status}
                      </GlitchText>
                    ) : (
                      r.status
                    )}
                  </div>
                  <p className="mt-3 text-[15.5px] leading-[1.6] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">{r.stat}</p>
                </div>
                <div className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:overflow-visible lg:px-0">
                  <div className="min-w-[600px] lg:min-w-0">
                    <CouplingStrip mode={r.mode} />
                  </div>
                </div>
              </motion.div>
            );
            return r.tone === 'good' ? (
              <ElectricBorder key={r.code} color={t.done} theme={theme} borderRadius={0} thickness={1.2} chaos={0.3} speed={0.6} glow={theme === 'dark' ? 0.6 : 0.3}>
                {body}
              </ElectricBorder>
            ) : (
              <div key={r.code}>{body}</div>
            );
          })}
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-rule px-6 py-3.5 text-[13px] text-ink-3">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded-full bg-s0" /> skill running
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-6 rounded-full bg-s2" /> brain thinking
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="hatch-wait h-3 w-6 rounded-full border border-s2/60" /> robot waiting on the brain
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-2.5 rounded-full border-2 border-ink bg-[var(--station)]" /> router decision at a boundary
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}

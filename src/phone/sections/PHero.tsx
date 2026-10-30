import { Fragment } from 'react';
import { File02Icon, FilmRoll01Icon, GithubIcon, PlayCircleIcon, QuoteDownIcon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { LineBadge } from '@/components/ui/Line';
import { AFFILIATIONS, AUTHORS, CONTACT, LINKS, PAPER } from '@/data/paper';
import { useTheme } from '@/theme/ThemeProvider';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useLoopClock } from '@/lib/anim';
import logoLight from '@/assets/brand/infrec.webp';
import logoDark from '@/assets/brand/infrec-dark.webp';
import { goTo } from '../stops';
import { More } from '../ui/Sign';

export default function PHero() {
  const { theme } = useTheme();
  return (
    <header id="top" className="relative px-5 pb-14 pt-[84px]">
      <div className="rise-in flex items-center gap-1.5" style={{ animationDelay: '0.05s' }}>
        <LineBadge line="s2" size={13} />
        <LineBadge line="s1" size={13} />
        <LineBadge line="s0" size={13} />
        <span className="label ml-1.5">Brain, router, policies</span>
      </div>
      <h1 className="mt-2 text-ink">
        <span className="sr-only">{PAPER.title}</span>
        <span aria-hidden className="rise-in block text-[118px] font-[840] leading-[0.8] tracking-[-0.02em] [font-stretch:76%]" style={{ animationDelay: '0.12s' }}>
          {PAPER.name}
        </span>
      </h1>
      <p aria-hidden className="rise-in sign-md mt-4 text-[23px] text-ink" style={{ animationDelay: '0.2s' }}>
        A routed embodied agent runtime for asynchronous brain–cerebellum control
      </p>

      <Lines />

      {/* the one rule, as a station sign */}
      <div
        className="rise-in mt-5 flex items-center gap-3 rounded-[18px] bg-ink px-4 py-3.5 text-paper dark:bg-surface-2 dark:text-ink dark:shadow-[inset_0_0_0_1px_var(--rule-2)]"
        style={{ animationDelay: '0.36s' }}
      >
        <span className="flex shrink-0 flex-col gap-[3px]" aria-hidden>
          <span className="block h-[5px] w-6 rounded-full bg-s2" />
          <span className="block h-[5px] w-6 rounded-full bg-s1" />
          <span className="block h-[5px] w-6 rounded-full bg-s0" />
        </span>
        <p className="sign-md text-[21px]">{PAPER.rule}</p>
      </div>
      <p className="rise-in mt-4 text-[16px] leading-[1.6] text-ink-2" style={{ animationDelay: '0.42s' }}>
        A slow brain that writes policies and judges results, fast policies that act, and a router between them.
      </p>

      <div className="rise-in mt-6 space-y-2.5" style={{ animationDelay: '0.48s' }}>
        <a
          href={LINKS.arxiv || '#demo'}
          target={LINKS.arxiv ? '_blank' : undefined}
          rel="noreferrer"
          onClick={(e) => {
            if (!LINKS.arxiv) {
              // until the paper is public, the main button plays the robot demo
              e.preventDefault();
              goTo('demo');
            }
          }}
          className="p-press flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[16px] font-[700] text-paper [font-stretch:94%]"
        >
          <Icon icon={LINKS.arxiv ? File02Icon : PlayCircleIcon} size={18} stroke={1.9} />
          {LINKS.arxiv ? 'Read the paper' : 'Watch the robot demo'}
        </a>
        <div className="grid grid-cols-3 gap-2">
          <Pill onClick={() => goTo('film')} icon={FilmRoll01Icon}>
            Film
          </Pill>
          {LINKS.arxiv ? (
            <Pill onClick={() => goTo('demo')} icon={PlayCircleIcon}>
              Demo
            </Pill>
          ) : (
            <Pill href={LINKS.code} icon={GithubIcon}>
              Code
            </Pill>
          )}
          <Pill onClick={() => goTo('cite')} icon={QuoteDownIcon}>
            Cite
          </Pill>
        </div>
      </div>

      {/* authors; affiliations and contacts folded */}
      <div className="mt-10 border-t border-rule pt-5">
        <p className="text-[15.5px] leading-[1.75] text-ink [font-stretch:94%]">
          {AUTHORS.map((a, i) => (
            <Fragment key={a.name}>
              <span className="whitespace-nowrap">
                <span className="font-[640]">{a.name}</span>
                <sup className="tabular ml-px text-[10px] font-[600] text-ink-3">
                  {a.aff.join(',')}
                  {a.corresponding ? '‡' : ''}
                </sup>
                {i < AUTHORS.length - 1 && <span className="text-ink-4">,</span>}
              </span>{' '}
            </Fragment>
          ))}
        </p>
        <More label="Affiliations and contact">
          <ol className="space-y-1 text-[13px] leading-[1.5] text-ink-3">
            {AFFILIATIONS.map((a, i) => (
              <li key={a} className="flex gap-1.5">
                <sup className="tabular mt-[7px] w-2 shrink-0 text-[10px]">{i + 1}</sup>
                {a}
              </li>
            ))}
            <li className="pl-3.5">‡ Corresponding authors</li>
          </ol>
          <p className="mt-2 flex flex-col gap-0.5 pl-3.5 text-[13px] text-ink-3">
            {CONTACT.map((c) => (
              <a key={c} href={`mailto:${c}`} className="underline decoration-rule-2 underline-offset-4">
                {c}
              </a>
            ))}
          </p>
        </More>
        <img src={theme === 'dark' ? logoDark : logoLight} alt="InfRec, Cardinal AI Lab" className="mt-6 h-8 w-auto" />
      </div>
    </header>
  );
}

function Pill({ href, onClick, icon, children }: { href?: string; onClick?: () => void; icon: Parameters<typeof Icon>[0]['icon']; children: React.ReactNode }) {
  const disabled = !href && !onClick;
  return (
    <a
      href={href || undefined}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      target={href && !onClick ? '_blank' : undefined}
      rel="noreferrer"
      aria-disabled={disabled || undefined}
      className="p-press relative flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-ink/15 text-[14.5px] font-[660] text-ink [font-stretch:94%] aria-disabled:text-ink-3"
    >
      <Icon icon={icon} size={16} stroke={1.8} />
      {children}
      {disabled && <span className="absolute -right-0.5 -top-1.5 rounded-full bg-paper-2 px-1.5 py-px text-[10px] font-[700] text-ink-3 ring-1 ring-rule">soon</span>}
    </a>
  );
}

/**
 * The idea in one picture, as the films draw it: three lines, the router across them. The policy train runs the
 * blue line end to end and never stops; the router decides where it passes; the brain moves slowly on its own line.
 */
const W = 350;
const H = 214;
const Y = { s2: 54, s1: 112, s0: 170 };
const XR = 190; // the router
const X0 = 16;
const X1 = 334;

function Lines() {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [p] = useLoopClock(6, near && !reduce, 0.42);
  const dark = theme === 'dark';
  const station = dark ? t.paper : '#ffffff';
  const span = X1 - X0;
  // the train: three runs per loop, each one a policy from the router to the line's end and round again
  const tx = X0 + 30 + ((p * 3) % 1) * (span - 30);
  const near0 = Math.abs(tx - XR) < 26;
  // the brain: once across per loop, slowly
  const bx = X0 + 24 + p * (span - 48);
  const glow = (c: string) => (dark ? `drop-shadow(0 0 6px ${c})` : 'none');
  return (
    <div ref={ref} className="rise-in -mx-1 mt-6" style={{ animationDelay: '0.28s' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label="Three lines: the brain, the router across them, the policies">
        {(['s2', 's1', 's0'] as const).map((l, i) => (
          <path
            key={l}
            d={`M ${X0} ${Y[l]} H ${X1}`}
            stroke={l === 's2' ? t.s2 : l === 's1' ? t.s1 : t.s0}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
            className="jm-draw"
            style={{ animationDelay: `${0.15 + i * 0.12}s`, filter: glow(l === 's2' ? t.s2g : l === 's1' ? t.s1g : t.s0g) }}
          />
        ))}
        {/* stations on the policy line: the boundaries where a policy returns */}
        {[0.2, 0.42, 0.64, 0.86].map((f) => (
          <circle key={f} cx={X0 + f * span} cy={Y.s0} r={2.6} fill={station} />
        ))}
        {/* the brain, thinking slowly */}
        <g transform={`translate(${bx} ${Y.s2})`}>
          <circle r={9} fill={station} stroke={t.s2} strokeWidth={3.5} />
          <circle r={3.2} fill={t.s2} />
        </g>
        {/* the policy train, never stopping */}
        <g transform={`translate(${tx} ${Y.s0})`}>
          <rect x={-15} y={-8} width={30} height={16} rx={8} fill={t.s0} stroke={station} strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 8px ${t.s0g})` }} />
        </g>
        {/* the router: an interchange across all three lines */}
        <rect
          x={XR - 12}
          y={Y.s2 - 16}
          width={24}
          height={Y.s0 - Y.s2 + 32}
          rx={12}
          fill={station}
          stroke={near0 ? t.s1 : t.ink}
          strokeWidth={near0 ? 4 : 3}
          style={{ transition: 'stroke .2s, stroke-width .2s' }}
        />
        <text x={X0} y={Y.s2 - 16} fill={t.ink} style={{ fontSize: 13.5, fontWeight: 760, fontStretch: '88%' }}>
          Brain <tspan fill={t.ink3} style={{ fontWeight: 560 }}>thinks, slowly</tspan>
        </text>
        <text x={XR + 20} y={Y.s1 + 26} fill={t.ink} style={{ fontSize: 13.5, fontWeight: 760, fontStretch: '88%' }}>
          Router <tspan fill={t.ink3} style={{ fontWeight: 560 }}>in between</tspan>
        </text>
        <text x={X1} y={Y.s0 + 30} textAnchor="end" fill={t.ink} style={{ fontSize: 13.5, fontWeight: 760, fontStretch: '88%' }}>
          Policies <tspan fill={t.ink3} style={{ fontWeight: 560 }}>act, fast</tspan>
        </text>
      </svg>
    </div>
  );
}


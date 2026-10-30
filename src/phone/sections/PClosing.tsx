import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUp01Icon, ComputerIcon, Copy01Icon, CopyCheckIcon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { BrandMark, LineBadge } from '@/components/ui/Line';
import { AlohaMetrics, EndingsVideo, Pi05Card, ReleasePair, SetupCard } from '@/sections/Aloha';
import { DemoPlayer } from '@/sections/Demo';
import { BIBTEX, PAPER } from '@/data/paper';
import { useTheme } from '@/theme/ThemeProvider';
import logoLight from '@/assets/brand/infrec.webp';
import logoDark from '@/assets/brand/infrec-dark.webp';
import { switchView } from '../mode';
import { goTo } from '../stops';
import { PartSign, StopSign } from '../ui/Sign';

export function PAloha() {
  return (
    <section id="aloha" className="relative pb-12">
      <StopSign
        id="aloha"
        lede="On an AlohaMini2 arm, REA solved all ten trials where the other agents solved four to eight, and it needed the least time and the fewest model calls per success."
      />
      <div className="mt-7 space-y-4 px-5">
        <EndingsVideo />
        <AlohaMetrics />
        <SetupCard />
      </div>
      <div className="mt-14 px-5">
        <PartSign kicker="Real robot · with π0.5" title="π0.5 alone, and π0.5 inside REA" />
        <p className="mt-3 text-[16px] leading-[1.6] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">
          Same arm, same task, ten trials each. Inside REA the policy solves <b>8</b> instead of <b>3</b>, and placement failures fall from five to none.
        </p>
        <div className="mt-5 space-y-4">
          <ReleasePair />
          <Pi05Card />
        </div>
      </div>
    </section>
  );
}

export function PDemo() {
  return (
    <section id="demo" className="relative bg-paper-2 pb-12">
      <StopSign id="demo" lede="Three real-robot studies and three simulators in one film, narrated in English with Chinese subtitles." />
      <div className="mt-6 px-3">
        <DemoPlayer caption={false} />
      </div>
      <p className="mt-3 px-5 text-[12.5px] leading-snug text-ink-3">
        Real robots: four agents and π0.5 on an AlohaMini2 arm, a Unitree G1 pushing a chair. Simulators: LIBERO-Pro, RoboTwin 2.0, BEHAVIOR-1K.
      </p>
    </section>
  );
}

export function PCite() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(BIBTEX);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* the text stays selectable below */
    }
  };
  return (
    <section id="cite" className="relative pb-12">
      <StopSign
        id="cite"
        lede="If REA is useful to your work, please cite the paper. The runtime, the frozen policy libraries and every per-episode record will be released with it."
      />
      <div className="mt-7 px-5">
        <Ticket copied={copied} onCopy={copy} />
        <div className="mt-4 overflow-hidden rounded-[18px] bg-[#0d0f13] text-[#e8eaee] dark:ring-1 dark:ring-white/10">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="text-[12.5px] font-[650] text-white/60">BibTeX</span>
            <button type="button" onClick={copy} className="p-press inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-[700] text-[#0d0f13]">
              <Icon icon={copied ? CopyCheckIcon : Copy01Icon} size={15} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="code overflow-x-auto px-4 py-4 text-[11.5px] leading-[1.65]">{BIBTEX}</pre>
        </div>
      </div>
    </section>
  );
}

/** a transit ticket for the paper; its stub copies the BibTeX */
function Ticket({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="p-press relative flex w-full overflow-hidden rounded-[18px] border border-rule-2 bg-surface text-left shadow-[0_20px_50px_-30px_hsl(var(--shadow-color)/0.35)]"
      aria-label="Copy the BibTeX"
    >
      <span className="block min-w-0 flex-1 p-4">
        <span className="flex items-center gap-1">
          <LineBadge line="s2" size={10.5} />
          <LineBadge line="s1" size={10.5} />
          <LineBadge line="s0" size={10.5} />
          <span className="ml-1.5 text-[11.5px] font-[650] text-ink-3">Valid on all lines</span>
        </span>
        <span className="mt-3 block text-[42px] font-[820] leading-[0.9] text-ink [font-stretch:78%]">{PAPER.name}</span>
        <span className="mt-1.5 block text-[12.5px] font-[640] leading-snug text-ink-2">{PAPER.subtitle}</span>
        <span className="mt-3 flex items-end justify-between gap-2 text-[11px] text-ink-3">
          <span>Zhou, Ma, Zhang, Chen, Wan, Wang, Zhao, You</span>
          <span className="tabular">2026</span>
        </span>
      </span>
      {/* the stub, past the perforation */}
      <span
        className="relative flex w-[92px] shrink-0 flex-col items-center justify-center gap-1.5 border-l-2 border-dashed border-rule-2 px-2 text-center transition-colors duration-300"
        style={{ background: copied ? 'var(--done-wash)' : 'var(--paper-2)' }}
      >
        <span className="absolute -left-[9px] -top-[9px] h-4 w-4 rounded-full border border-rule-2 bg-paper" aria-hidden />
        <span className="absolute -bottom-[9px] -left-[9px] h-4 w-4 rounded-full border border-rule-2 bg-paper" aria-hidden />
        <motion.span key={String(copied)} initial={{ scale: 0.6, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22 }}>
          {copied ? (
            <span className="grid h-8 w-8 place-items-center rounded-full bg-done text-white">
              <Icon icon={CopyCheckIcon} size={17} stroke={2} />
            </span>
          ) : (
            <BrandMark size={30} />
          )}
        </motion.span>
        <span className="text-[13px] font-[780] leading-tight text-ink [font-stretch:86%]">{copied ? 'Copied' : 'Tap to copy'}</span>
        <span className="text-[11px] text-ink-3">BibTeX</span>
      </span>
    </button>
  );
}

export function PFooter() {
  const { theme } = useTheme();
  return (
    <footer className="border-t border-rule bg-paper-2 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-7">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <BrandMark size={22} />
          <span className="text-[18px] font-[800] text-ink [font-stretch:84%]">REA</span>
        </span>
        <img src={theme === 'dark' ? logoDark : logoLight} alt="InfRec, Cardinal AI Lab" className="h-7 w-auto" />
      </div>
      <p className="mt-3 text-[12.5px] leading-snug text-ink-3">{PAPER.title}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => switchView('desktop', '')}
          className="p-press flex h-11 items-center justify-center gap-2 rounded-full border border-rule bg-surface text-[14px] font-[700] text-ink"
        >
          <Icon icon={ComputerIcon} size={16} stroke={1.9} />
          Desktop page
        </button>
        <button
          type="button"
          onClick={() => goTo('top')}
          className="p-press flex h-11 items-center justify-center gap-2 rounded-full border border-rule bg-surface text-[14px] font-[700] text-ink"
        >
          <Icon icon={ArrowUp01Icon} size={16} stroke={1.9} />
          Back to top
        </button>
      </div>
    </footer>
  );
}

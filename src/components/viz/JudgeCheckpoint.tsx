import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Tick02Icon, Cancel01Icon, ViewIcon } from '@hugeicons/core-free-icons';
import JellyRadio from '@/components/reactbits/JellyRadio/JellyRadio';
import ThoughtLine from '@/components/reactbits/ThoughtLine/ThoughtLine';
import StatusMark from '@/components/reactbits/StatusMark/StatusMark';
import Icon from '@/components/ui/Icon';
import { EPISODES } from '@/data/gen/episodes';
import { nameOf } from '@/lib/episode';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The judge gate at work: real judge calls from test episodes. The judge sees the
 * episode's first frame, the frame after the skill returned and the instruction, and answers
 * done or not_done with a short reason. Everything shown is from the run logs.
 */
type Call = { ep: string; run: number; title: string };
const CALLS: Call[] = [
  { ep: 'bowl-stove-18', run: 0, title: 'Bowl beside the stove' },
  { ep: 'tomato-2', run: 1, title: 'Wrong item in the basket' },
  { ep: 'stove-23', run: 0, title: 'Stove still off' },
  { ep: 'stove-23', run: 1, title: 'Burner glowing' },
  { ep: 'wine-rack-25', run: 0, title: 'Bottle on the rack' },
];

export default function JudgeCheckpoint() {
  const { t, theme } = useTheme();
  const dark = theme === 'dark';
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('-15% 0px');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'judging' | 'verdict'>('idle');

  const c = CALLS[idx];
  const ep = useMemo(() => EPISODES.find((e) => e.id === c.ep)!, [c.ep]);
  const j = ep.judges.find((x) => x.after === c.run)!;
  const run = ep.runs[c.run];
  const ok = j.verdict === 'done';

  // each call replays: a beat of idle, the judge thinking for its real latency, then the stamp
  useEffect(() => {
    if (!near) return;
    if (reduce) {
      setPhase('verdict');
      return;
    }
    setPhase('idle');
    const a = window.setTimeout(() => setPhase('judging'), 700);
    const b = window.setTimeout(() => setPhase('verdict'), 700 + Math.max(900, j.latency * 1000));
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [idx, near, reduce, j.latency]);

  // then move on to the next call on its own
  useEffect(() => {
    if (phase !== 'verdict' || reduce) return;
    const id = window.setTimeout(() => setIdx((i) => (i + 1) % CALLS.length), 4200);
    return () => window.clearTimeout(id);
  }, [phase, reduce]);

  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="border-b border-rule px-5 py-4">
        <JellyRadio
          items={CALLS.map((x, i) => ({ value: String(i), label: x.title }))}
          value={String(idx)}
          onChange={(v) => setIdx(Number(v))}
          chipColor={dark ? t.surface2 : t.paper2}
          activeColor={t.ink}
          textColor={t.ink2}
          activeTextColor={t.paper}
          size="sm"
          ariaLabel="Judge call"
        />
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-[13px] font-[600] text-ink-3">
          {ep.instruction}, test seed {ep.seed}. {nameOf(run.which)} returned after {run.steps.toLocaleString('en-US')} steps,{' '}
          {run.exception ? `exception: ${run.exception}` : 'no exception'}.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Frame src={ep.frames[0]} label="f₀ first frame" />
          <Frame src={ep.frames[c.run + 1]} label="fₖ when the skill returned" scanning={phase === 'judging'}>
            <AnimatePresence>
              {phase === 'verdict' && (
                <motion.div
                  key={`${idx}-stamp`}
                  initial={{ scale: 2.2, opacity: 0, rotate: -14 }}
                  animate={{ scale: 1, opacity: 1, rotate: -9 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                  className="pointer-events-none absolute right-3 top-3 rounded-[10px] border-[3px] px-2.5 py-1 text-[clamp(1rem,2vw,1.45rem)] font-[850] tracking-[0.02em] [font-stretch:82%]"
                  style={{
                    color: ok ? '#3ddca5' : '#ff6b81',
                    borderColor: ok ? '#3ddca5' : '#ff6b81',
                    background: 'rgba(8,10,14,0.55)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {ok ? 'DONE' : 'NOT DONE'}
                </motion.div>
              )}
            </AnimatePresence>
          </Frame>
        </div>

        <div className="mt-4 min-h-[96px] rounded-xl border border-rule bg-surface-2 p-4">
          <div className="flex items-center gap-2 text-[13px] font-[650] text-ink-2">
            <StatusMark
              status={phase === 'judging' ? 'running' : phase === 'verdict' ? (ok ? 'done' : 'failed') : 'pending'}
              color={t.s2}
              doneColor={t.done}
              errorColor={t.fail}
              size={18}
              strokeWidth={2.2}
              strike={false}
            />
            <span className="badge text-[12px]" style={{ background: 'var(--s2)' }}>
              S2
            </span>
            <span>
              Judge, asked: “{ep.instruction}”. Done or not done?
            </span>
          </div>
          <div className="mt-3">
            {phase === 'judging' && (
              <ThoughtLine label="Comparing the two frames" glyph="sparkle" color={t.ink2} glyphColor={t.s2} fontSize={15} working showTimer collapsible={false} />
            )}
            {phase === 'verdict' && (
              <motion.div key={`${idx}-v`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[14px] font-[720] text-white [font-stretch:90%]"
                  style={{ background: ok ? 'var(--done)' : 'var(--fail)' }}
                >
                  <Icon icon={ok ? Tick02Icon : Cancel01Icon} size={14} stroke={2.6} />
                  <span className="code">{j.verdict}</span>
                </span>
                <span className="text-[17px] italic text-ink">“{j.rationale}”</span>
                <span className="tabular text-[13px] text-ink-3">
                  confidence {j.confidence?.toFixed(2)}, {j.latency.toFixed(2)} s
                </span>
              </motion.div>
            )}
            {phase === 'idle' && <p className="text-[14px] text-ink-4">Waiting for the skill to return.</p>}
          </div>
        </div>

        <p className="mt-4 text-[13.5px] leading-[1.55] text-ink-3">
          {ok
            ? 'done ends the episode right here, so a re-run cannot undo the finished task.'
            : c.run + 1 < ep.runs.length
              ? `not done escalates: the ladder starts ${nameOf(ep.runs[c.run + 1].which)} from this very scene.`
              : 'not done, but the budget or the ladder is used up.'}
        </p>
      </div>
    </div>
  );
}

function Frame({ src, label, scanning = false, children }: { src: string; label: string; scanning?: boolean; children?: React.ReactNode }) {
  return (
    <figure className="relative overflow-hidden rounded-xl bg-[#0b0e14]">
      <img src={src} alt="" className="aspect-[25/16] w-full object-cover" draggable={false} />
      {scanning && (
        <>
          <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--s2)_10%,transparent)]" />
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-[30%]"
            style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--s2-glow) 45%, transparent), transparent)', mixBlendMode: 'screen' }}
            initial={{ left: '-30%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-[650] text-white">
            <Icon icon={ViewIcon} size={12} /> looking
          </span>
        </>
      )}
      <figcaption className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11.5px] font-[650] text-white/90 backdrop-blur-sm">{label}</figcaption>
      {children}
    </figure>
  );
}

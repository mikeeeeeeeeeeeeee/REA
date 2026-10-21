import { useEffect, useMemo, useRef, useState } from 'react';
import { Tick02Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import SloshGauge from '@/components/reactbits/SloshGauge/SloshGauge';
import CallChip from '@/components/reactbits/CallChip/CallChip';
import Icon from '@/components/ui/Icon';
import { EPISODES } from '@/data/gen/episodes';
import { buildTimeline, fmtInt, nameOf, stateAt } from '@/lib/episode';
import { useNearViewport, useReducedMotion } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The escalation ladder [first, other, first] replayed on a real episode, with the one budget
 * every run and every judge call draws on (4,000 control steps, 900 s).
 */
export default function LadderBudget({ episodeId = 'tomato-2' }: { episodeId?: string }) {
  const { t, theme } = useTheme();
  const dark = theme === 'dark';
  const ep = useMemo(() => EPISODES.find((e) => e.id === episodeId)!, [episodeId]);
  const tl = useMemo(() => buildTimeline(ep, { runSpeed: 9, minRun: 2.2, verdictHold: 1.4, endHold: 3.6 }), [ep]);
  const reduce = useReducedMotion();
  const [ref, near] = useNearViewport<HTMLDivElement>('0px');
  const [r, setR] = useState(0);
  const rRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      setR(tl.total - 0.01);
      return;
    }
    if (!near) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      rRef.current = (rRef.current + dt) % (tl.total + 0.8);
      setR(rRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [near, reduce, tl.total]);

  const s = stateAt(tl, Math.min(r, tl.total - 0.01));
  const stepsLeft = ep.horizon - s.steps;
  const secondsLeft = ep.budget - s.e;
  const rungs = ep.runs.map((run, i) => {
    const started = s.run > i || (s.run === i && s.phase !== 'dispatch');
    const finished = s.run > i || (s.run === i && s.phase !== 'run' && s.phase !== 'dispatch');
    const verdict = s.verdicts > i ? ep.judges[i] : null;
    return { run, i, started, finished, verdict };
  });
  const ladderNames = ['first', 'other', 'first again'];

  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-5 py-4">
        <p className="text-[15px] font-[720] text-ink [font-stretch:88%]">
          “{ep.instruction}”, test seed {ep.seed}
        </p>
        <p className="label">replayed from the run log</p>
      </div>
      <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-6">
        <ol className="relative space-y-3">
          {rungs.map(({ run, i, started, finished, verdict }) => (
            <li
              key={i}
              className="relative grid grid-cols-[88px_minmax(0,1fr)] items-center gap-4 rounded-xl border p-2.5 pr-4 transition-[border-color,background-color,opacity] duration-300"
              style={{
                borderColor: started && !finished ? 'var(--s0)' : 'var(--rule)',
                background: started && !finished ? 'var(--s0-wash)' : 'var(--surface)',
                opacity: started ? 1 : 0.45,
              }}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img src={ep.frames[finished ? i + 1 : i]} alt="" className="aspect-[25/16] w-full object-cover transition-opacity duration-500" draggable={false} />
                <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] font-[700] text-white">{finished ? 'after' : 'from'}</span>
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 text-[16px] font-[720] text-ink [font-stretch:88%]">
                  <span className="text-ink-4">{i + 1}</span>
                  {nameOf(run.which)}
                  <span className="text-[13px] font-[600] text-ink-3">{ladderNames[i]} on the ladder</span>
                </p>
                {started && (
                  <div className="mt-1.5">
                    <CallChip
                      icon="terminal"
                      name="Run"
                      argument={`${run.which}.py`}
                      status={finished ? 'done' : 'running'}
                      expectedMs={2200}
                      size={26}
                      radius={8}
                      color={t.ink}
                      surfaceColor={dark ? t.surface2 : t.paper2}
                      progressColor={t.s0}
                      progressOpacity={0.16}
                      doneColor={t.done}
                      errorColor={t.fail}
                    />
                  </div>
                )}
                <p className="tabular mt-1 text-[13px] text-ink-3">
                  {started ? `${fmtInt(finished ? run.steps : Math.max(0, s.steps - run.from))} steps` : 'not needed yet'}
                  {i > 0 && started ? ', from the scene the last skill left' : i === 0 ? ', chosen by route memory' : ''}
                </p>
                {verdict && (
                  <p className="mt-1 flex items-start gap-1.5 text-[13.5px] leading-snug text-ink-2">
                    <Icon icon={verdict.verdict === 'done' ? Tick02Icon : Cancel01Icon} size={14} stroke={2.4} color={verdict.verdict === 'done' ? 'var(--done)' : 'var(--fail)'} className="mt-[3px] shrink-0" />
                    <span className="italic">“{verdict.rationale}”</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="flex justify-center gap-5 sm:flex-col sm:justify-start">
          <Gauge
            label="steps left"
            value={(stepsLeft / ep.horizon) * 100}
            text={`${fmtInt(stepsLeft)} / ${fmtInt(ep.horizon)}`}
            color={t.s0}
            glass={dark ? '#1a2029' : '#eef0f3'}
          />
          <Gauge
            label="seconds left"
            value={(secondsLeft / ep.budget) * 100}
            text={`${Math.round(secondsLeft)} / ${ep.budget}`}
            color={t.s1}
            glass={dark ? '#1a2029' : '#eef0f3'}
          />
        </div>
      </div>
      <p className="border-t border-rule px-5 py-3.5 text-[13.5px] leading-[1.55] text-ink-3 sm:px-6">
        One budget for the whole episode: every run and every judge call draws on it, so a routed episode never gets more steps or time than
        a single skill would. Here the third run finished with {fmtInt(ep.horizon - ep.steps)} steps to spare.
      </p>
    </div>
  );
}

function Gauge({ label, value, text, color, glass }: { label: string; value: number; text: string; color: string; glass: string }) {
  return (
    <div className="flex flex-col items-center">
      <SloshGauge value={Math.max(0, Math.min(100, value))} liquidColor={color} glassColor={glass} width={64} height={128} radius={16} ticks={4} showValue={false} ariaLabel={label} />
      <p className="tabular mt-2 text-[13px] font-[700] text-ink">{text}</p>
      <p className="text-[12px] text-ink-3">{label}</p>
    </div>
  );
}

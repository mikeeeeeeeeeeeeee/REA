import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PauseIcon, PlayIcon } from '@hugeicons/core-free-icons';
import ElasticSlider from '@/components/reactbits/ElasticSlider/ElasticSlider';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { ChartFrame, HBars, type BarRow } from '@/components/viz/charts';
import { ALOHA_TABLE, METHODS, PHOTO_CASES, PI05_TABLE, TRIALS, VIDEO_CASES, VIDEO_PAIRS, type PhotoCase } from '@/data/aloha';
import { wilson } from '@/data/results';
import { useInView, useNearViewport, useSeenOnce } from '@/lib/hooks';

/**
 * The ALOHA study: forty head-to-head trials and twenty under π0.5, all on the same right arm,
 * with the operator's original outcomes. The scoreboard is the whole result at once; a
 * photographed trial can be opened to its four observations and the three cameras on the rig.
 */
export default function Aloha() {
  const [pick, setPick] = useState<PhotoCase>(PHOTO_CASES[PHOTO_CASES.length - 1]);
  const cases = new Map(PHOTO_CASES.map((c) => [`${c.method}-${c.trial}`, c]));

  return (
    <section id="aloha" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Out of simulation, onto a real arm</SectionTitle>
          <p className="lede">
            Sixty trials on an AlohaMini2: forty between four agents on the same arm, twenty between π0.5 and REA. Outcomes are the operator's
            original labels, not re-scored.
          </p>
        </div>

        <div className="mt-14 grid gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,7fr)_minmax(0,6fr)] xl:items-center">
          <Scoreboard cases={cases} pick={pick} onPick={setPick} />
          <CaseViewer kase={pick} />
        </div>
      </Container>

      <Container wide className="mt-20">
        <VideoPairs />
      </Container>

      <Container wide className="mt-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <AlohaNumbers />
          <Pi05Numbers />
        </div>
      </Container>
    </section>
  );
}

/** a win is a solid tile: REA in its line colour, the baselines in a neutral dark that stays readable */
const WIN: Record<string, string> = { codex: 'var(--ink-2)', agents: 'var(--ink-2)', aspire: 'var(--ink-2)', rea: 'var(--s1)' };

/**
 * Ten trials across, one row per method: a filled square is a success, a hollow one a failure,
 * and a square with a ring is a trial with photographs behind it. Clicking one opens it.
 */
function Scoreboard({ cases, pick, onPick }: { cases: Map<string, PhotoCase>; pick: PhotoCase; onPick: (c: PhotoCase) => void }) {
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.2);
  const grid = 'grid grid-cols-[minmax(88px,auto)_repeat(10,minmax(0,1fr))] gap-[3px] sm:gap-1.5';
  return (
    <div ref={ref} className="figure-frame overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-[15px] font-[740] text-ink [font-stretch:88%]">Ten trials per method, block into the box</p>
        <p className="text-[12.5px] text-ink-3">AlohaMini2 right arm · operator-judged</p>
      </div>

      <div className={`${grid} mt-5 items-center`}>
        <span />
        {TRIALS.map((tr) => (
          <span key={tr} className="tabular pb-1 text-center text-[11px] font-[600] text-ink-4 sm:text-[12px]">
            {tr}
          </span>
        ))}
      </div>

      <ul className="mt-1 space-y-[3px] sm:space-y-1.5">
        {ALOHA_TABLE.map((run, ri) => {
          const ours = run.key === 'rea';
          return (
            <li key={run.key} className={grid}>
              <span className={`flex items-baseline gap-2 pr-2 ${ours ? 'text-ink' : 'text-ink-2'}`}>
                <span className={`truncate text-[13px] ${ours ? 'font-[760]' : 'font-[600]'} [font-stretch:90%] sm:text-[14px]`}>
                  {METHODS[run.key].label}
                </span>
                <span className="tabular hidden text-[12px] font-[700] text-ink-3 sm:inline">{run.success}/10</span>
              </span>
              {run.wins.map((win, ci) => {
                const kase = cases.get(`${run.key}-${TRIALS[ci]}`);
                const here = !!kase && kase.id === pick.id;
                const style = win
                  ? { background: WIN[run.key] }
                  : { background: 'color-mix(in srgb, var(--fail) 12%, var(--surface-2))', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--fail) 40%, transparent)' };
                // a photographed trial keeps a bright hairline inside the tile, so it reads on either fill
                const shot = kase ? 'inset 0 0 0 1.5px color-mix(in srgb, #ffffff 78%, transparent)' : undefined;
                const cell = (
                  <span
                    className="relative grid aspect-square w-full place-items-center rounded-[5px] transition-transform duration-200 group-hover:scale-[1.06]"
                    style={{
                      ...style,
                      ...(shot ? { boxShadow: `${style.boxShadow ? style.boxShadow + ', ' : ''}${shot}` } : {}),
                      ...(here ? { outline: '2px solid var(--ink)', outlineOffset: '2px' } : {}),
                      transform: seen ? undefined : 'scale(0.6)',
                      opacity: seen ? 1 : 0,
                      transition: `transform 420ms cubic-bezier(.2,.9,.3,1.3) ${ri * 40 + ci * 26}ms, opacity 300ms ${ri * 40 + ci * 26}ms, box-shadow 200ms`,
                    }}
                    aria-hidden={!win ? undefined : true}
                  >
                    {!win && <span className="h-[2px] w-[38%] rounded-full" style={{ background: 'var(--fail)' }} />}
                    {kase && <span className="absolute inset-[3px] rounded-[3px] ring-1 ring-inset ring-white/65" />}
                  </span>
                );
                return (
                  <span key={ci} className="group relative">
                    {kase ? (
                      <button
                        type="button"
                        onClick={() => onPick(kase)}
                        className="block w-full cursor-pointer rounded-[5px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        aria-label={`${METHODS[run.key].label} trial ${TRIALS[ci]}, ${win ? 'success' : 'failure'}, photographed`}
                        aria-pressed={here}
                        title={`Trial ${TRIALS[ci]} · ${win ? 'success' : 'failure'} · open its photos`}
                      >
                        {cell}
                      </button>
                    ) : (
                      cell
                    )}
                  </span>
                );
              })}
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-4 text-[12.5px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: 'var(--s1)' }} /> success
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: 'color-mix(in srgb, var(--fail) 10%, var(--surface-2))', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--fail) 34%, transparent)' }} />{' '}
          failure
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px]" style={{ background: 'var(--ink-2)', boxShadow: 'inset 0 0 0 1.5px color-mix(in srgb, #ffffff 78%, transparent)' }} />{' '}
          photographed, click to open
        </span>
      </div>
    </div>
  );
}

/** one photographed trial at four observations, three cameras, on one scrubber */
function CaseViewer({ kase }: { kase: PhotoCase }) {
  const [i, setI] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [ref, near] = useNearViewport<HTMLDivElement>('300px');
  const timer = useRef(0);
  const n = kase.stages.length;
  const st = kase.stages[Math.min(i, n - 1)];

  useEffect(() => {
    setI(n - 1);
  }, [kase.id, n]);

  useEffect(() => {
    if (!near || !playing) return;
    timer.current = window.setTimeout(() => setI((x) => (x + 1) % n), 1500);
    return () => window.clearTimeout(timer.current);
  }, [i, near, playing, n]);

  const ok = kase.outcome === 'success';
  return (
    <div ref={ref} className="figure-frame overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-[760] text-ink [font-stretch:88%]">
            {METHODS[kase.method].label} <span className="font-[600] text-ink-3">trial {kase.trial}</span>
          </span>
          <span
            className="badge text-[11px]"
            style={{ background: ok ? 'var(--done)' : 'var(--fail)' }}
            title={ok ? 'success' : 'failure'}
          >
            {ok ? 'OK' : 'FAIL'}
          </span>
        </div>
        <p className="tabular text-[12px] text-ink-3">
          observation {st.obs.replace(/^0+/, '')} of {Math.max(...kase.stages.map((s) => Number(s.obs)))}
        </p>
      </div>

      <div className="bg-[#0b0e14]">
        <div className="relative aspect-video overflow-hidden">
          {kase.stages.map((s, k) => (
            <img
              key={s.external}
              src={s.external}
              alt={k === i ? `${METHODS[kase.method].label} trial ${kase.trial}, third-person view, observation ${s.obs}` : ''}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
              style={{ opacity: k === i ? 1 : 0 }}
              draggable={false}
            />
          ))}
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-[650] text-white backdrop-blur-sm">
            third person
          </span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10">
          {(['head', 'wrist'] as const).map((cam) => (
            <div key={cam} className="relative aspect-[4/3] overflow-hidden">
              {kase.stages.map((s, k) => (
                <img
                  key={s[cam]}
                  src={s[cam]}
                  alt={k === i ? `${cam} camera, observation ${s.obs}` : ''}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
                  style={{ opacity: k === i ? 1 : 0 }}
                  draggable={false}
                />
              ))}
              <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10.5px] font-[650] text-white backdrop-blur-sm">
                {cam === 'head' ? 'head' : 'right wrist'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-rule px-5 pb-4 pt-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
            aria-label={playing ? 'Pause the trial' : 'Play the trial'}
          >
            <Icon icon={playing ? PauseIcon : PlayIcon} size={15} />
          </button>
          <div className="flex-1">
            <ElasticSlider
              value={i}
              maxValue={n - 1}
              isStepped
              stepSize={1}
              onChange={(v) => {
                setPlaying(false);
                setI(Math.round(v));
              }}
              valuePosition="none"
              ticks
              thickness={8}
              activeThickness={12}
              className="!w-full"
              leftIcon={<span className="text-[11.5px] font-[600] text-ink-3">start</span>}
              rightIcon={<span className="text-[11.5px] font-[600] text-ink-3">end</span>}
              ariaLabel="Observation"
            />
          </div>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-ink-3">
          Four observations of the trial, from three cameras on the rig; the photographed trial in each method is the one the summary names.
        </p>
      </div>
    </div>
  );
}

/** π0.5 and REA on the same task, one success pair and one failure pair, side by side */
function VideoPairs() {
  const [pair, setPair] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ref, near] = useNearViewport<HTMLDivElement>('400px');
  const vids = useRef<Record<string, HTMLVideoElement | null>>({});
  const ids = [VIDEO_PAIRS[pair].a, VIDEO_PAIRS[pair].b];
  const cards = ids.map((id) => VIDEO_CASES.find((v) => v.id === id)!);

  const setAll = (on: boolean) => {
    setPlaying(on);
    ids.forEach((id) => {
      const v = vids.current[id];
      if (!v) return;
      if (on) void v.play();
      else v.pause();
    });
  };

  // both clips run from the top when the pair changes or the panel scrolls in; muted, so no gate
  useEffect(() => {
    setPlaying(false);
    ids.forEach((id) => {
      const v = vids.current[id];
      if (v) v.currentTime = 0;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pair]);

  return (
    <div ref={ref} className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="flex items-center gap-2 text-[14px] font-[700] text-ink-3 [font-stretch:92%]">Real robot · π0.5 against REA</p>
          <h3 className="sign-lg title-part mt-2 text-ink">One model swap, ten trials each</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {VIDEO_PAIRS.map((p, k) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setPair(k)}
              aria-pressed={pair === k}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-[640] transition-colors ${
                pair === k ? 'border-ink bg-ink text-paper' : 'border-rule bg-surface text-ink-2 hover:border-rule-2 hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAll(!playing)}
            className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-rule bg-surface text-ink transition-colors hover:border-rule-2"
            aria-label={playing ? 'Pause both clips' : 'Play both clips'}
          >
            <Icon icon={playing ? PauseIcon : PlayIcon} size={15} />
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((v) => {
          const ok = v.outcome === 'success';
          return (
            <figure key={v.id} className="figure-frame overflow-hidden">
              <div className="relative aspect-video bg-[#0b0e14]">
                <video
                  ref={(el) => {
                    vids.current[v.id] = el;
                  }}
                  src={near ? v.src : undefined}
                  poster={v.poster}
                  muted
                  playsInline
                  preload={near ? 'metadata' : 'none'}
                  loop
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
                  <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-[680] text-white backdrop-blur-sm [font-stretch:92%]">{v.arm}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11.5px] font-[680] text-white backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: ok ? 'var(--done)' : 'var(--fail)' }} />
                    {ok ? 'success' : 'failure'}
                  </span>
                </div>
              </div>
              <figcaption className="flex items-baseline justify-between gap-3 px-4 py-3">
                <p className="text-[12.5px] leading-snug text-ink-3">
                  trial {v.trial} · {v.note}
                </p>
                <span className="tabular shrink-0 text-[12px] font-[640] text-ink-2">
                  {v.speed > 1 ? `${v.speed}×` : `${v.duration.toFixed(0)} s`}
                </span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

const pct = (k: number, n: number) => (100 * k) / n;
const ci = (k: number, n: number): [number, number] => {
  const [a, b] = wilson(k, n);
  return [100 * a, 100 * b];
};

function AlohaNumbers() {
  const rows: BarRow[] = ALOHA_TABLE.map((r) => ({
    label: METHODS[r.key].label,
    value: pct(r.success, 10),
    display: `${r.success}/10`,
    kind: r.key === 'rea' ? 'ours' : 'base',
    ci: ci(r.success, 10),
  }));
  return (
    <ChartFrame
      title="ALOHA, four methods on the same arm"
      sub="10 valid trials each; success means the block stayed in the box after the gripper left"
      table={{
        head: ['Method', 'Success', 'Mean s', 'Mean s (won)', 'Actions', 'Calls'],
        rows: ALOHA_TABLE.map((r) => [
          METHODS[r.key].label,
          `${r.success}/10`,
          r.mean.toFixed(0),
          r.meanWin.toFixed(0),
          r.actions.toFixed(1),
          r.calls.toFixed(1),
        ]),
      }}
    >
      <HBars rows={rows} max={100} unit="%" ticks={[0, 50, 100]} labelWidth={92} barH={22} ariaLabel="Success rate on ALOHA, four methods" />
      <p className="mt-7 border-t border-rule pt-3 text-[12.5px] leading-snug text-ink-3">
        REA wins ten of ten; the next best, ASPIRE, wins eight. Every run drives the same arm with the same three-grasp cap and no time limit.
      </p>
    </ChartFrame>
  );
}

function Pi05Numbers() {
  const rows: BarRow[] = PI05_TABLE.arms.map((a) => ({
    label: a.key === 'rea' ? 'REA (π0.5 + Code)' : 'π0.5, step 5000',
    value: pct(a.success, a.n),
    display: `${a.success}/10`,
    kind: a.key === 'rea' ? 'ours' : 'base',
    ci: ci(a.success, a.n),
  }));
  return (
    <ChartFrame
      title="π0.5 against REA, ten trials each"
      sub="the reference policy alone, then the same policy with the router in front of it"
      table={{
        head: ['Arm', 'Success', 'Active s', 'Median s', 'Grab fails', 'Place fails'],
        rows: PI05_TABLE.arms.map((a) => [a.label + (a.detail ? `, ${a.detail}` : ''), `${a.success}/10`, a.activeMean.toFixed(1), a.activeMedian.toFixed(1), a.grab, a.place]),
      }}
    >
      <HBars rows={rows} max={100} unit="%" ticks={[0, 50, 100]} labelWidth={124} barH={22} ariaLabel="Success rate of π0.5 and REA on ALOHA" />
      <p className="mt-7 border-t border-rule pt-3 text-[12.5px] leading-snug text-ink-3">
        Placement failures drop from five to none; the two that remain are failed grasps. REA takes longer per trial, and the router only speaks
        at the boundaries between skills.
      </p>
    </ChartFrame>
  );
}

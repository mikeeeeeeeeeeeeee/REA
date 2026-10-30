import { useState } from 'react';
import FilmPlayer from '@/components/film/FilmPlayer';
import Icon from '@/components/ui/Icon';
import { ROWS, REA_MODES, type Row } from '@/sections/Problem';
import type { CouplingMode } from '@/components/viz/CouplingStrip';
import { useTheme } from '@/theme/ThemeProvider';
import { StopSign } from '../ui/Sign';
import Seg from '../ui/Seg';
import Snap from '../ui/Snap';
import PStrip from '../ui/PStrip';

export function PFilm() {
  return (
    <section id="film" className="relative pb-12">
      <StopSign
        id="film"
        lede="A narrated walk through the paper, as the full explainer or a short cut. The robots are CG animation that re-stages the experiments; the numbers are the paper's."
      />
      <div className="mt-6 px-3">
        <FilmPlayer />
      </div>
    </section>
  );
}

const SHORT = ['Agent first', 'Policy first', 'REA'];

export function PProblem() {
  const [i, setI] = useState(0);
  return (
    <section id="problem" className="relative bg-paper-2 pb-12">
      <StopSign
        id="problem"
        lede={
          <>
            A foundation model is a capable brain but a poor controller: emitting actions itself, it solved <b>1 of 1,987</b> LIBERO-Pro episodes. Fast
            policies act at their own rate but cannot tell when they have quietly failed.
          </>
        }
      />
      <div className="mt-7 px-5">
        <p className="mb-2.5 text-[13px] font-[700] text-ink-3 [font-stretch:92%]">Three ways to couple a slow brain with fast policies</p>
        <Seg
          raised
          equal={false}
          label="Coupling design"
          value={String(i)}
          onChange={(v) => setI(Number(v))}
          items={ROWS.map((r, k) => ({
            value: String(k),
            label: (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-[800]">{r.code}</span>
                <span className="font-[600]">{SHORT[k]}</span>
              </span>
            ),
          }))}
        />
      </div>
      <div className="mt-4 px-5">
        <Snap index={i} onIndex={setI} label="Three coupling designs">
          {ROWS.map((r) => (
            <CouplingCard key={r.code} row={r} />
          ))}
        </Snap>
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 px-5 text-[12.5px] text-ink-3">
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-5 shrink-0 rounded-full bg-s0" /> policy running
        </li>
        <li className="flex items-center gap-2">
          <span className="h-2.5 w-5 shrink-0 rounded-full bg-s2" /> brain thinking
        </li>
        <li className="flex items-center gap-2">
          <span className="hatch-wait h-2.5 w-5 shrink-0 rounded-full border border-s2/60" /> robot waiting
        </li>
        <li className="flex items-center gap-2">
          <span className="h-3.5 w-2.5 shrink-0 rounded-full border-2 border-ink bg-[var(--station)]" /> router decision
        </li>
        <li className="col-span-2 flex items-center gap-2">
          <span className="h-0 w-5 shrink-0 border-t-[1.5px] border-dashed border-ink-3" /> advice, applied at the next boundary
        </li>
      </ul>
    </section>
  );
}

/** the one number each design is remembered by (REA's, per mode), for the phone's cards; the desktop rows say the same */
const BIG: Record<string, { value: string; note: string }> = {
  A: { value: '2.62 s', note: 'of idle robot per episode, 20% of its control time, with an advisor asked only 1.7 times per episode' },
  B: { value: '6 of 166', note: 'failed episodes escalated by an exception gate in 590: most failures raise no error' },
  rea: { value: '+3.1 pp', note: 'success over an exception gate: the judge is asked only when a policy returns' },
  async: { value: '2.62 → 0 s', note: 'of blocking per episode: the brain thinks in parallel and its advice applies at the next boundary; 11.3% less control time' },
};

function CouplingCard({ row: r }: { row: Row }) {
  const { t } = useTheme();
  const good = r.tone === 'good';
  const [mode, setMode] = useState<CouplingMode>('async');
  const big = BIG[r.mode === 'rea' ? mode : r.code];
  return (
    <article className={`figure-frame flex w-full flex-col p-4 ${good ? 'shadow-[inset_0_0_0_1.5px_var(--done)]' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[3px] border-ink text-[14px] font-[800] text-ink">{r.code}</span>
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[12.5px] font-[700] text-white [font-stretch:92%]"
          style={{ background: good ? t.done : r.tone === 'bad' ? t.fail : t.s2 }}
        >
          <Icon icon={r.icon} size={14} stroke={2.2} />
          {r.status}
        </span>
      </div>
      <p className="title-card mt-3 text-[19px] text-ink">{r.title}</p>
      {/* REA's card switches between its two modes; the others show their one timeline */}
      {r.mode === 'rea' && (
        <div className="mt-3">
          <Seg label="REA mode" value={mode} onChange={setMode} items={REA_MODES.map((m) => ({ value: m.mode, label: m.label }))} />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center py-3">
        <PStrip key={r.mode === 'rea' ? mode : r.mode} mode={r.mode === 'rea' ? mode : r.mode} />
      </div>
      {big ? (
        <div className="border-t border-rule pt-3">
          <p className="tabular text-[40px] font-[800] leading-none text-ink [font-stretch:80%]">{big.value}</p>
          <p className="mt-1.5 text-[14px] leading-[1.5] text-ink-2">{big.note}</p>
        </div>
      ) : (
        <p className="border-t border-rule pt-3 text-[14.5px] leading-[1.55] text-ink-2 [&_b]:font-[680] [&_b]:text-ink">{r.stat}</p>
      )}
    </article>
  );
}

import { useState } from 'react';
import JourneyMap from '@/components/viz/JourneyMap';
import { LINES, LineBadge } from '@/components/ui/Line';
import { BACKENDS, GUIDE, GuideVisual, type Guide } from '@/sections/Runtime';
import { ORDER } from '@/sections/Episodes';
import { EPISODES } from '@/data/gen/episodes';
import { nameOf } from '@/lib/episode';
import { StopSign } from '../ui/Sign';
import Seg from '../ui/Seg';
import Snap from '../ui/Snap';

export function PRuntime() {
  const [i, setI] = useState(0);
  return (
    <section id="runtime" className="relative pb-12">
      <StopSign
        id="runtime"
        lede="Every method in the paper, REA and the baselines alike, is a configuration of one runtime with three levels that meet only at boundaries."
      />
      <div className="mt-7 px-5">
        <Seg
          label="Level"
          value={String(i)}
          onChange={(v) => setI(Number(v))}
          items={GUIDE.map((g, k) => ({
            value: String(k),
            label: (
              <span className="inline-flex items-center gap-1.5">
                <LineBadge line={g.line} size={10.5} />
                {LINES[g.line].name}
              </span>
            ),
          }))}
        />
      </div>
      <div className="mt-4 px-5">
        <Snap index={i} onIndex={setI} label="The three levels">
          {GUIDE.map((g) => (
            <LevelCard key={g.line} g={g} />
          ))}
        </Snap>
      </div>
      {/* every backend implements the same contract */}
      <div className="mt-8 border-y border-rule py-4">
        <p className="label mb-3 px-5">Backends and tools behind the one contract</p>
        <ul className="p-snap p-start gap-2 px-5" style={{ scrollPaddingInline: 20 }} aria-label="Backends and tools">
          {BACKENDS.map((b) => (
            <li key={b.name} className="inline-flex items-center gap-2 rounded-full border border-rule bg-surface px-3 py-1.5 text-[13px] font-[640] text-ink [font-stretch:92%]">
              <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
              {b.name}
              <span className="whitespace-nowrap font-[520] text-ink-3">{b.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LevelCard({ g }: { g: Guide }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-[18px] border border-rule bg-surface shadow-[0_20px_50px_-30px_hsl(var(--shadow-color)/0.3)]">
      <div className="h-2" style={{ background: LINES[g.line].color }} />
      <div className="relative aspect-[16/10] overflow-hidden border-b border-rule bg-[#0b0e14]">
        <GuideVisual line={g.line} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2.5">
          <LineBadge line={g.line} size={15} />
          <div className="min-w-0">
            <p className="title-card text-[19px] leading-none text-ink">{g.role}</p>
            <p className="mt-1 text-[12.5px] font-[600] leading-snug text-ink-3">
              {LINES[g.line].system}, runs {g.runs}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">{g.what}</p>
        <ul className="mt-3 space-y-2">
          {g.calls.map((c) => (
            <li key={c.sig} className="rounded-lg border border-rule bg-surface-2 px-3 py-2">
              <code className="code block break-words text-[12.5px] font-[560] text-ink">{c.sig}</code>
              <span className="mt-0.5 block text-[12px] text-ink-3">{c.note}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-4">
          <span className="block border-t border-rule pt-3 text-[13.5px] leading-[1.5] text-ink-2">
            <span className="font-[700] text-ink">Never </span>
            {g.never}.
          </span>
        </p>
      </div>
    </article>
  );
}

/** the hero's episode (the paper's Figure 2) first, then the desktop page's six */
const LIST = ['bowl-stove-18', ...ORDER].map((id) => EPISODES.find((e) => e.id === id)!).filter(Boolean);

export function PEpisodes() {
  const [sel, setSel] = useState(0);
  const ep = LIST[sel];
  return (
    <section id="episodes" className="relative pb-12">
      <StopSign id="episodes" lede="Seven LIBERO-Pro test episodes from one run, from a one-stop trip to the full ladder, replayed from the router's own log." />
      <div className="p-snap p-start mt-6 gap-2.5 px-5" style={{ scrollPaddingInline: 20 }} role="tablist" aria-label="Episode">
        {LIST.map((e, i) => {
          const on = i === sel;
          const ok = e.judges[e.judges.length - 1]?.verdict === 'done';
          return (
            <button
              key={e.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSel(i)}
              className="p-press w-[148px] overflow-hidden rounded-2xl border bg-surface text-left"
              style={{ borderColor: on ? 'var(--ink)' : 'var(--rule)', boxShadow: on ? '0 0 0 1px var(--ink)' : 'none' }}
            >
              <div className="relative aspect-[25/14] overflow-hidden">
                <img src={e.frames[e.frames.length - 1]} alt="" className="h-full w-full object-cover" draggable={false} />
                <span className="absolute left-1.5 top-1.5 flex gap-1">
                  {e.runs.map((r, k) => (
                    <span key={k} className="badge text-[10px]" style={{ background: 'var(--s0)' }}>
                      {nameOf(r.which)}
                    </span>
                  ))}
                </span>
              </div>
              <div className="p-2.5">
                <p className="line-clamp-2 min-h-[2.5em] text-[13.5px] font-[700] leading-[1.25] text-ink [font-stretch:90%]">{e.instruction}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11.5px] font-[600] text-ink-3">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ok ? 'var(--done)' : 'var(--fail)' }} />
                  {e.runs.length === 1 ? 'one stop' : `${e.runs.length} runs`}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 px-5">
        <figure className="figure-frame px-3 pb-4 pt-5">
          <JourneyMap key={ep.id} episode={ep} />
          <figcaption className="mt-4 px-1 text-[13.5px] leading-[1.55] text-ink-3">
            <b className="font-[700] text-ink">{ep.instruction}</b>, {ep.suite.replace('libero_', '').replace('_', ' ')}, test seed {ep.seed}. {ep.blurb} Route
            memory picked {nameOf(ep.route.choice)}: {ep.route.reason === 'higher_dev_success_rate' ? 'higher development success' : 'a tie, broken by fewer steps'}.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

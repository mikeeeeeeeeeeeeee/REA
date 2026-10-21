import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import JourneyMap from '@/components/viz/JourneyMap';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { EPISODES } from '@/data/gen/episodes';
import { nameOf } from '@/lib/episode';

/**
 * More real journeys: every test episode below was logged by the judge-gated router,
 * one per kind of trip, from the common one-stop case to the full ladder.
 */
const ORDER = ['wine-rack-25', 'bbq-2', 'stove-23', 'tomato-2', 'bowl-cabinet-2', 'butter-21'];

export default function Episodes() {
  const list = ORDER.map((id) => EPISODES.find((e) => e.id === id)!).filter(Boolean);
  const [sel, setSel] = useState(3);
  const ep = list[sel];

  return (
    <section id="episodes" className="relative scroll-mt-20 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>Ride a few more episodes</SectionTitle>
          <p className="lede">
            Six more LIBERO-Pro test episodes from the same run. In the simplest trips the first skill succeeds, the judge says done and the
            router stops; the others show what silent failures look like, and how the ladder recovers from them.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {list.map((e, i) => {
            const on = i === sel;
            const ok = e.judges[e.judges.length - 1]?.verdict === 'done';
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setSel(i)}
                className="group relative overflow-hidden rounded-2xl border text-left transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor: on ? 'var(--ink)' : 'var(--rule)',
                  boxShadow: on ? '0 18px 40px -24px hsl(var(--shadow-color) / 0.5)' : 'none',
                  background: 'var(--surface)',
                }}
                aria-pressed={on}
              >
                <div className="relative aspect-[25/14] overflow-hidden">
                  <img src={e.frames[e.frames.length - 1]} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" draggable={false} />
                  <span className="absolute left-2 top-2 flex gap-1">
                    {e.runs.map((r, k) => (
                      <span key={k} className="badge text-[11px]" style={{ background: 'var(--s0)' }}>
                        {nameOf(r.which)}
                      </span>
                    ))}
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-2 min-h-[2.6em] text-[15px] font-[700] leading-[1.3] text-ink [font-stretch:90%]">{e.instruction}</p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-[600] text-ink-3">
                    <span className="h-2 w-2 rounded-full" style={{ background: ok ? 'var(--done)' : 'var(--fail)' }} />
                    {e.runs.length === 1 ? 'one stop' : `${e.runs.length} runs, ${e.runs.length - 1} escalation${e.runs.length > 2 ? 's' : ''}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="figure-frame mt-6 px-4 pb-6 pt-8 sm:px-8">
          <AnimatePresence mode="wait">
            <motion.div key={ep.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
              <JourneyMap episode={ep} />
              <p className="mt-5 text-[14.5px] leading-[1.6] text-ink-3">
                <b className="font-[700] text-ink">{ep.instruction}</b>, {ep.suite.replace('libero_', '').replace('_', ' ')}, test seed {ep.seed}. {ep.blurb}{' '}
                Route memory picked {nameOf(ep.route.choice)} because of{' '}
                {ep.route.reason === 'higher_dev_success_rate' ? 'its higher development success' : 'a tie in development success, broken by fewer steps'}.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

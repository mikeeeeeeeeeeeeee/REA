import { ChartFrame, HBars, Legend } from '@/components/viz/charts';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { PORTABILITY, wilson } from '@/data/results';
import { ALOHA_RUNS, METHODS } from '@/data/aloha';

/**
 * The results in one chart: the most solved on every platform compared beyond LIBERO-Pro, the
 * paper's Figure 7 (BEHAVIOR-1K, RoboTwin 2.0, the real Unitree G1) and the team's newest real-robot
 * study (four agents on an AlohaMini2 arm, October 2026, not yet in the paper).
 */
export const pct = (k: number, n: number) => (100 * k) / n;
export const ci = (k: number, n: number): [number, number] => {
  const [a, b] = wilson(k, n);
  return [100 * a, 100 * b];
};

export type Card = { key: string; bench: string; detail: string; n: number; real?: boolean; rows: { key: string; label: string; k: number | null }[] };

export const CARDS: Card[] = [
  ...PORTABILITY.map((b) => ({ ...b, real: b.key === 'g1' })),
  {
    key: 'aloha',
    bench: 'AlohaMini2',
    detail: '10 real block-into-box trials each, operator-judged; the newest study, October 2026',
    n: 10,
    real: true,
    rows: ALOHA_RUNS.map((r) => ({ key: r.key === 'agents' ? 'sdk' : r.key, label: METHODS[r.key].label, k: r.success })),
  },
];

export default function Results() {
  return (
    <section id="results" className="relative scroll-mt-20 bg-paper-2 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <SectionTitle>The most solved, on every line</SectionTitle>
          <p className="lede">
            On LIBERO-Pro REA reaches <b>95.9%</b> of 3,000 test episodes, above every method in its policy pool; with VLA and code policies
            together it reaches <b>86%</b> on RoboTwin 2.0. Beyond that, two simulators and two real robots:
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((b) => (
            <ChartFrame
              key={b.key}
              title={
                <span className="inline-flex items-center gap-2">
                  {b.bench}
                  {b.real && <span className="rounded-full border border-rule-2 px-2 py-px text-[11.5px] font-[700] text-ink-3 [font-stretch:92%]">real robot</span>}
                </span>
              }
              sub={b.detail}
              table={{ head: ['Method', 'Solved'], rows: b.rows.map((r) => [r.label, r.k === null ? 'not run' : `${r.k}/${b.n}`]) }}
            >
              <HBars
                rows={b.rows
                  .filter((r) => r.k !== null)
                  .map((r) => ({
                    label: r.label,
                    value: pct(r.k as number, b.n),
                    display: `${r.k}/${b.n}`,
                    kind: r.key === 'rea' ? 'ours' : r.key === 'show' ? 'loop' : 'base',
                    ci: ci(r.k as number, b.n),
                  }))}
                max={100}
                unit="%"
                ticks={[0, 50, 100]}
                labelWidth={110}
                barH={18}
                ariaLabel={`Solved episodes on ${b.bench}`}
              />
            </ChartFrame>
          ))}
        </div>
        <div className="mt-5">
          <Legend
            items={[
              { kind: 'ours', label: 'REA' },
              { kind: 'base', label: 'single method (Codex, ASPIRE, Agents SDK)' },
              { kind: 'loop', label: 'brain in the control loop (Show-Harness)' },
            ]}
          />
        </div>
      </Container>
    </section>
  );
}

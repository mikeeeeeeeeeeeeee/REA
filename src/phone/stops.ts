import type { LineId } from '@/components/ui/Line';
import { FILMS, lengthOf } from '@/data/film';

/**
 * The phone layout's stops, in the order of the desktop page (the same ids, so a switch between the layouts keeps
 * the place). `line` colours the stop's sign: the brain's question in orange, the router's in purple, the robots'
 * in blue.
 */
export type PStopInfo = { id: string; name: string; title: string; note: string; line: LineId };

export const P_STOPS: PStopInfo[] = [
  { id: 'top', name: 'Start', title: 'REA', note: 'The rule, in one line', line: 's1' },
  { id: 'film', name: 'Film', title: 'REA, explained', note: `The paper in ${lengthOf(FILMS.short)} or ${lengthOf(FILMS.full)}`, line: 's1' },
  { id: 'problem', name: 'Problem', title: 'Where should the brain sit?', note: 'Three ways to couple brain and policies', line: 's2' },
  { id: 'runtime', name: 'Runtime', title: 'Three lines, one contract', note: 'Brain, router, policies', line: 's1' },
  { id: 'episodes', name: 'Episodes', title: 'Ride a real episode', note: 'Seven test episodes, from the router’s log', line: 's1' },
  { id: 'results', name: 'Results', title: 'The most solved, on every line', note: 'Two simulators, two real robots', line: 's1' },
  { id: 'embodiments', name: 'Embodiments', title: 'One runtime, real and simulated', note: 'A Unitree G1, RoboTwin 2.0, BEHAVIOR-1K', line: 's0' },
  { id: 'aloha', name: 'ALOHA', title: 'Out of simulation, onto a real arm', note: 'Four agents and π0.5 on one arm', line: 's0' },
  { id: 'demo', name: 'Demo', title: 'Watch REA run', note: 'The robot demo, 1 min 47 s', line: 's0' },
  { id: 'cite', name: 'Cite', title: 'Take a ticket', note: 'BibTeX, one tap', line: 's1' },
];

/** scroll a stop under the top bar */
export function goTo(id: string, smooth = true) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 56;
  window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
}

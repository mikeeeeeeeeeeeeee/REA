import FilmPlayer from '@/components/film/FilmPlayer';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';

/** the film, right after the hero: the paper in 108 seconds, in the page's own theme */
export default function Film() {
  return (
    <section id="film" className="relative scroll-mt-20 pb-24 pt-14 sm:pb-32 sm:pt-20">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <LineBadge line="s2" size={13} />
              <LineBadge line="s1" size={13} />
              <LineBadge line="s0" size={13} />
              <span className="label ml-2">The film, 1 min 48 s</span>
            </div>
            <SectionTitle>REA in 108 seconds</SectionTitle>
          </div>
          <p className="lede">
            The problem, the runtime on one real test episode, and the results on LIBERO-Pro, BEHAVIOR-1K, RoboTwin 2.0 and a real Unitree G1.
            The robot footage, the numbers and the judge's verdicts all come from the paper's runs. It plays in the page's light or dark theme.
          </p>
        </div>
        <div className="mt-12">
          <FilmPlayer />
        </div>
      </Container>
    </section>
  );
}

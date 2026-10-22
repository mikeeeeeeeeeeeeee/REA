import FilmPlayer from '@/components/film/FilmPlayer';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { FILMS, lengthOf } from '@/data/film';

/** the film, right after the hero: a narrated introduction to the paper in two cuts, in the page's own theme */
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
              <span className="label ml-2">
                The film, {lengthOf(FILMS.full)} or {lengthOf(FILMS.short)}
              </span>
            </div>
            <SectionTitle>REA, explained</SectionTitle>
          </div>
          <p className="lede">
            A narrated walk through the paper, as the full explainer or a short cut. The robots are CG animation that re-stages the
            experiments; the numbers are the paper's.
          </p>
        </div>
        <div className="mt-12">
          <FilmPlayer />
        </div>
      </Container>
    </section>
  );
}

import { useRef } from 'react';
import { File02Icon, FilmRoll01Icon, GithubIcon, PlayCircleIcon, QuoteDownIcon } from '@hugeicons/core-free-icons';
import VariableProximity from '@/components/reactbits/VariableProximity/VariableProximity';
import GlareHover from '@/components/reactbits/GlareHover/GlareHover';
import Magnet from '@/components/reactbits/Magnet/Magnet';
import CircularText from '@/components/reactbits/CircularText/CircularText';
import SplitText from '@/components/reactbits/SplitText/SplitText';
import JourneyMap from '@/components/viz/JourneyMap';
import Icon from '@/components/ui/Icon';
import { Container } from '@/components/ui/Layout';
import { BrandMark, LineBadge } from '@/components/ui/Line';
import { AFFILIATIONS, AUTHORS, CONTACT, LINKS, PAPER } from '@/data/paper';
import { EPISODES } from '@/data/gen/episodes';
import { useTheme } from '@/theme/ThemeProvider';
import { scrollToId, useReducedMotion } from '@/lib/hooks';
import logoLight from '@/assets/brand/infrec.webp';
import logoDark from '@/assets/brand/infrec-dark.webp';

const HERO_EPISODE = EPISODES[0]; // "Put the bowl on the stove", seed 18: the paper's Figure 2 episode

function Pill({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  const disabled = !href && !onClick;
  return (
    <a
      href={href || undefined}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      target={href && !onClick ? '_blank' : undefined}
      rel="noreferrer"
      aria-disabled={disabled || undefined}
      title={disabled ? 'Available soon' : undefined}
      className="inline-flex h-11 items-center gap-2 rounded-full border-[1.5px] border-ink/15 px-4 text-[15px] font-[640] text-ink transition-[border-color,background-color] [font-stretch:94%] hover:border-ink/40 aria-disabled:cursor-default aria-disabled:text-ink-3 aria-disabled:hover:border-ink/15"
    >
      {icon}
      {children}
      {disabled && <span className="rounded-full bg-paper-2 px-1.5 py-px text-[11px] font-[650] text-ink-3">soon</span>}
    </a>
  );
}

export default function Hero() {
  const { t, theme } = useTheme();
  const reduce = useReducedMotion();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dark = theme === 'dark';

  return (
    <header id="top" className="relative overflow-hidden pt-[84px]">
      <Container wide>
        <div className="grid items-center gap-x-12 gap-y-6 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <div className="rise-in flex items-center gap-2" style={{ animationDelay: '0.05s' }}>
              <LineBadge line="s2" size={15} />
              <LineBadge line="s1" size={15} />
              <LineBadge line="s0" size={15} />
              <span className="label ml-2">Brain, router, policies</span>
            </div>
            <h1 ref={titleRef} className="mt-3 text-ink">
              <span className="sr-only">{PAPER.title}</span>
              <span aria-hidden className="rise-in block text-[clamp(6.5rem,13vw,12rem)] leading-[0.8] tracking-[-0.02em]" style={{ animationDelay: '0.12s' }}>
                <VariableProximity
                  label={PAPER.name}
                  fromFontVariationSettings="'wght' 800, 'wdth' 76"
                  toFontVariationSettings="'wght' 900, 'wdth' 112"
                  containerRef={titleRef as React.RefObject<HTMLElement | null>}
                  radius={210}
                  falloff="gaussian"
                  style={{ fontFamily: 'inherit' }}
                />
              </span>
            </h1>
          </div>

          <div className="relative lg:pt-6">
            {/* a station roundel with the one rule, beside the name */}
            <div className="rise-in absolute right-0 top-0 hidden xl:block" style={{ animationDelay: '0.3s' }}>
              <CircularText
                text="no running policy waits on the brain ✦ "
                repeat={2}
                size={112}
                fontSize={9.5}
                fontWeight={700}
                letterSpacing={0.3}
                spinDuration={24}
                onHover="speedUp"
                color={t.ink2}
                ring
                ringColor={t.rule}
                draggable
              >
                <BrandMark size={30} />
              </CircularText>
            </div>

            <div aria-hidden className="sign-md max-w-[30ch] text-[clamp(1.55rem,2.4vw,2.25rem)] text-ink">
              <SplitText
                text="A routed embodied agent runtime for asynchronous brain–cerebellum control"
                tag="span"
                splitType="words"
                effect="rise"
                delay={40}
                duration={0.8}
                trigger="load"
                textAlign="left"
                className="block"
              />
            </div>
            <p className="rise-in lede mt-3 !max-w-[64ch]" style={{ animationDelay: '0.32s' }}>
              A slow brain that writes policies and judges results, fast policies that act, and a router between them. One rule holds on every
              line: <b>no running policy waits on the brain.</b>
            </p>
            <div className="rise-in mt-5 flex flex-wrap items-center gap-2.5" style={{ animationDelay: '0.42s' }}>
              <Magnet padding={46} magnetStrength={5}>
                <GlareHover
                  width="auto"
                  height="auto"
                  background={t.ink}
                  borderRadius="999px"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.35}
                  glareAngle={-30}
                  glareSize={260}
                  transitionDuration={700}
                  className="!inline-flex"
                >
                  <a
                    href={LINKS.arxiv || '#demo'}
                    target={LINKS.arxiv ? '_blank' : undefined}
                    rel="noreferrer"
                    onClick={(e) => {
                      if (!LINKS.arxiv) {
                        // until the paper is public, the main button plays the robot demo
                        e.preventDefault();
                        scrollToId('demo');
                      }
                    }}
                    className="inline-flex h-11 items-center gap-2 px-5 text-[15px] font-[680] text-paper [font-stretch:94%]"
                  >
                    <Icon icon={LINKS.arxiv ? File02Icon : PlayCircleIcon} size={17} />
                    {LINKS.arxiv ? 'Read the paper' : 'Watch the robot demo'}
                  </a>
                </GlareHover>
              </Magnet>
              <Pill href="#film" onClick={() => scrollToId('film')} icon={<Icon icon={FilmRoll01Icon} size={17} />}>
                Watch the film
              </Pill>
              <Pill href={LINKS.code} icon={<Icon icon={GithubIcon} size={17} />}>
                Code
              </Pill>
              {LINKS.arxiv && (
                <Pill href="#demo" onClick={() => scrollToId('demo')} icon={<Icon icon={PlayCircleIcon} size={17} />}>
                  Robot demo
                </Pill>
              )}
              <Pill href="" onClick={() => scrollToId('cite')} icon={<Icon icon={QuoteDownIcon} size={17} />}>
                Cite
              </Pill>
            </div>
          </div>
        </div>

        {/* the hero figure: a real episode as a line map */}
        <figure className="relative mt-6 sm:mt-4">
          <JourneyMap episode={HERO_EPISODE} />
          <figcaption className="mt-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 text-[14px] text-ink-3">
            <span className="max-w-[70ch]">
              <b className="font-[680] text-ink">A real test episode, drawn as a line map.</b> “{HERO_EPISODE.instruction}”, LIBERO-Pro seed {HERO_EPISODE.seed}.
              The verdicts are the judge's own words.
            </span>
            <span className="tabular whitespace-nowrap">
              {HERO_EPISODE.steps.toLocaleString('en-US')} of {HERO_EPISODE.horizon.toLocaleString('en-US')} steps, {HERO_EPISODE.wall} s{reduce ? '' : ', policy runs replayed 11× faster'}
            </span>
          </figcaption>
        </figure>
        {/* authors */}
        <div className="rise-in mt-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-t border-rule pb-16 pt-6" style={{ animationDelay: '0.5s' }}>
          <div className="min-w-0 max-w-[62rem]">
            <p className="text-[16px] leading-[1.8] text-ink [font-stretch:94%]">
              {AUTHORS.map((a, i) => (
                <span key={a.name} className="whitespace-nowrap">
                  <span className="font-[640]">{a.name}</span>
                  <sup className="tabular ml-px text-[10.5px] font-[600] text-ink-3">
                    {a.aff.join(',')}
                    {a.corresponding ? '‡' : ''}
                  </sup>
                  {i < AUTHORS.length - 1 && <span className="mr-3 text-ink-4">,</span>}
                </span>
              ))}
            </p>
            <p className="mt-1 text-[13px] leading-[1.7] text-ink-3">
              {AFFILIATIONS.map((a, i) => (
                <span key={a} className="mr-4 inline-block">
                  <sup className="tabular mr-0.5">{i + 1}</sup>
                  {a}
                </span>
              ))}
              <span className="inline-block">‡ Corresponding authors</span>
            </p>
            <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[13px] text-ink-3">
              {CONTACT.map((c) => (
                <a key={c} href={`mailto:${c}`} className="underline decoration-rule-2 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
                  {c}
                </a>
              ))}
            </p>
          </div>
          <img src={dark ? logoDark : logoLight} alt="InfRec, Cardinal AI Lab" className="h-9 w-auto shrink-0" />
        </div>

      </Container>
    </header>
  );
}

import { useRef, useState } from 'react';
import { PlayIcon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { Container, SectionTitle } from '@/components/ui/Layout';
import { LineBadge } from '@/components/ui/Line';
import { DEMO } from '@/data/film';

/**
 * The robot demo: a narrated film of REA on the real robots and the simulators, made apart from the intro film at the
 * top of the page (../demo_film). English voice-over with English and Chinese subtitles burned in. Nothing is
 * downloaded until play is pressed; then the browser's own controls take over.
 */
export default function Demo() {
  return (
    <section id="demo" className="relative scroll-mt-20 bg-paper-2 py-24 sm:py-32">
      <Container wide>
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <LineBadge line="s2" size={13} />
              <LineBadge line="s1" size={13} />
              <LineBadge line="s0" size={13} />
              <span className="label ml-2">The robot demo, {DEMO.length}</span>
            </div>
            <SectionTitle>Watch REA run</SectionTitle>
          </div>
          <p className="lede">
            Three real-robot studies and three simulators in one film: the footage is the runs' own, narrated in English with Chinese subtitles.
          </p>
        </div>

        <DemoPlayer className="mt-12" />
      </Container>
    </section>
  );
}

/** the poster, the corner play button and the video; the phone layout shows it without the caption */
export function DemoPlayer({ className = '', caption = true }: { className?: string; caption?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const start = () => {
    const v = video.current;
    if (!v) return;
    setStarted(true);
    v.src = DEMO.src;
    v.play().catch(() => undefined);
  };
  return (
    <figure className={`figure-frame overflow-hidden ${className}`}>
      <div className="relative aspect-video bg-[#0b0e14]">
        <video
          ref={video}
          poster={DEMO.poster}
          controls={started}
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full"
          aria-label={`REA robot demo, ${DEMO.length}, English voice-over with English and Chinese subtitles`}
        />
        {/* as on the intro film: the whole frame plays, the button sits in a corner, off the poster's title and pictures */}
        {!started && (
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 flex items-end justify-start p-3 text-left outline-none sm:p-5"
            aria-label={`Play the robot demo, ${DEMO.length}, narrated, with subtitles`}
          >
            <span className="flex items-center gap-3.5 rounded-full bg-[rgba(255,255,255,0.78)] p-1.5 text-[#0f1218] shadow-[0_14px_34px_-18px_rgba(0,0,0,0.45)] backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 group-hover:-translate-y-0.5 xl:pr-5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0f1218] text-white transition-transform duration-300 group-hover:scale-[1.06] sm:h-12 sm:w-12">
                <Icon icon={PlayIcon} size={22} stroke={2} className="translate-x-[1.5px]" />
              </span>
              {/* only where the frame is wide enough to keep the pill clear of the poster's bottom line */}
              <span className="hidden leading-tight xl:block">
                <span className="block text-[17px] font-[740] [font-stretch:90%]">Play the demo</span>
                <span className="block text-[13px] font-[560] opacity-70">{DEMO.length}, narrated</span>
              </span>
            </span>
          </button>
        )}
      </div>
      {caption && (
        <figcaption className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-rule px-5 py-3.5 text-[13px] leading-snug text-ink-3 sm:px-6">
          <span>
            Real robots: four agents and π0.5 on an AlohaMini2 arm, a Unitree G1 pushing a chair. Simulators: LIBERO-Pro, RoboTwin 2.0, BEHAVIOR-1K.
          </span>
          <span className="shrink-0">English voice-over · English and Chinese subtitles</span>
        </figcaption>
      )}
    </figure>
  );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { ComputerIcon, SmartPhone01Icon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { BrandMark, LineBadge } from '@/components/ui/Line';
import { PAPER } from '@/data/paper';
import { SECTIONS, switchView } from './mode';
import { P_STOPS } from './stops';

/** a phone's screen, in CSS pixels (an iPhone 15): the phone layout inside the frame lays itself out at this size */
const SCREEN = { w: 390, h: 844 };
const BEZEL = 12;

/**
 * The phone layout as a computer shows it: the page in a phone-sized frame, so that every figure inside lays itself
 * out at a phone's width, exactly as on a phone. When the window is shorter than the phone, the phone is scaled down
 * as a whole; the page inside keeps its size.
 */
export default function PhonePreview() {
  const src = useMemo(() => {
    const u = new URL(location.href);
    u.searchParams.set('view', 'phone');
    u.searchParams.set('frame', '1');
    return u.toString();
  }, []);
  const scale = useFit();
  const frame = useRef<HTMLIFrameElement>(null);
  // back to the desktop page at the section the phone is showing
  const back = () => {
    let at = '';
    try {
      const doc = frame.current?.contentDocument;
      for (const id of SECTIONS) {
        const el = doc?.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) at = id;
      }
    } catch {
      /* a frame we cannot read */
    }
    switchView('desktop', at);
  };
  const address = `${location.host}${location.pathname}`.replace(/\/$/, '');
  const outer = { w: SCREEN.w + 2 * BEZEL, h: SCREEN.h + 2 * BEZEL };

  return (
    <div className="flex min-h-screen items-center justify-center gap-16 bg-paper-2 px-6 py-6">
      <aside className="hidden max-w-[340px] lg:block">
        <div className="flex items-center gap-2.5">
          <BrandMark size={28} />
          <span className="text-[24px] font-[800] tracking-[-0.01em] text-ink [font-stretch:84%]">REA</span>
        </div>
        <div className="mt-8 flex items-center gap-1.5">
          <LineBadge line="s2" size={12} />
          <LineBadge line="s1" size={12} />
          <LineBadge line="s0" size={12} />
          <span className="label ml-1.5">The phone layout</span>
        </div>
        <h1 className="sign-xl mt-3 text-[54px] text-ink">The page, on a phone</h1>
        <p className="mt-5 text-[17px] leading-[1.6] text-ink-2">
          One line with {P_STOPS.length - 1} stops: the bar at the top shows where you are and opens the list of stops; figures that sit side by side on the
          desktop page become cards to swipe. A phone opens this layout by itself.
        </p>
        <button
          type="button"
          onClick={back}
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-5 text-[15.5px] font-[700] text-paper transition-transform [font-stretch:94%] hover:-translate-y-0.5"
        >
          <Icon icon={ComputerIcon} size={18} stroke={1.9} />
          Back to the desktop page
        </button>
        <p className="mt-6 flex items-center gap-2 text-[13.5px] text-ink-3">
          <Icon icon={SmartPhone01Icon} size={16} stroke={1.8} />
          Or open <span className="font-[650] text-ink-2">{address}</span> on your phone.
        </p>
        <p className="mt-10 max-w-[30ch] text-[12.5px] leading-snug text-ink-4">{PAPER.title}</p>
      </aside>

      <div className="flex flex-col items-center gap-4">
        {/* below the side column's width: just the way back, above the phone */}
        <button
          type="button"
          onClick={back}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-rule bg-surface px-4 text-[14px] font-[680] text-ink lg:hidden"
        >
          <Icon icon={ComputerIcon} size={16} stroke={1.9} />
          Back to the desktop page
        </button>
        <div style={{ width: outer.w * scale, height: outer.h * scale }}>
          <div
            className="origin-top-left rounded-[56px] bg-[#0d0f13] shadow-[0_50px_100px_-40px_rgba(10,14,22,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]"
            style={{ width: outer.w, height: outer.h, padding: BEZEL, transform: `scale(${scale})` }}
          >
            <iframe ref={frame} src={src} title="REA, the phone layout" className="block h-full w-full rounded-[44px] bg-paper" style={{ colorScheme: 'normal' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** how much the phone has to shrink to fit the window's height (never grown past its size) */
function useFit() {
  const fit = () => Math.min(1, (window.innerHeight - 48) / (SCREEN.h + 2 * BEZEL));
  const [s, setS] = useState(fit);
  useEffect(() => {
    const on = () => setS(fit());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return Math.max(0.55, s);
}

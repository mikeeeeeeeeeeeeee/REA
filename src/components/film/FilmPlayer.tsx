import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { FullScreenIcon, MinimizeScreenIcon, Moon02Icon, PauseIcon, PlayIcon, RepeatIcon, Sun03Icon, VolumeHighIcon, VolumeMute02Icon } from '@hugeicons/core-free-icons';
import Icon from '@/components/ui/Icon';
import { FILM, chapterAt, type FilmVersion } from '@/data/film';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The film's player. Its version follows the page theme (or the switch in its own bar); switching mid-film keeps the
 * place and carries on, since both versions share one timeline. The scrubber is a line with a station per chapter.
 * Nothing is downloaded until play is pressed.
 */
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** the film's own backdrop colours, so the frame never flashes another colour while a version loads */
const BACKDROP: Record<FilmVersion, string> = { light: '#f4f5f8', dark: '#05070b' };

export default function FilmPlayer() {
  const { theme } = useTheme();
  const [override, setOverride] = useState<FilmVersion | null>(null);
  // a change of the page theme takes the film with it
  useEffect(() => setOverride(null), [theme]);
  const version: FilmVersion = override ?? theme;
  const night = version === 'dark';

  const hevc = useMemo(() => typeof document !== 'undefined' && document.createElement('video').canPlayType('video/mp4; codecs="hvc1.1.6.L123.B0"') !== '', []);

  const video = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  /** the version loaded, or on its way */
  const current = useRef<FilmVersion | null>(null);
  /** a load in flight: where it will resume and whether it plays (both can still change), and its listener */
  const pending = useRef<{ at: number; play: boolean; on: () => void } | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [failed, setFailed] = useState(false);
  const [idle, setIdle] = useState(false);
  const [full, setFull] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);

  /** open a version and resume at `at` (playing if `play`) */
  const open = useCallback(
    (ver: FilmVersion, at: number, play: boolean) => {
      const v = video.current;
      if (!v) return;
      if (pending.current) v.removeEventListener('loadedmetadata', pending.current.on);
      current.current = ver;
      setFailed(false);
      setBusy(true);
      const on = () => {
        v.removeEventListener('loadedmetadata', on);
        const p = pending.current;
        pending.current = null;
        if (!p) return;
        v.currentTime = Math.min(p.at, FILM.duration - 0.05);
        if (!p.play) return setBusy(false);
        v.play().catch(() => {
          setPlaying(false);
          setBusy(false);
        });
      };
      pending.current = { at, play, on };
      v.addEventListener('loadedmetadata', on);
      v.src = FILM.src(ver, hevc);
      v.load();
    },
    [hevc]
  );

  const start = useCallback(
    (at = 0) => {
      setStarted(true);
      setEnded(false);
      // the big button unmounts once the film starts; keep the focus in the player so its keys still work
      wrap.current?.focus({ preventScroll: true });
      const v = video.current;
      if (current.current === version && pending.current) {
        pending.current.at = at;
        pending.current.play = true;
      } else if (v && current.current === version && v.readyState >= 1) {
        v.currentTime = at;
        v.play().catch(() => setPlaying(false));
      } else open(version, at, true);
    },
    [open, version]
  );

  // a different version: keep the place, carry on as before (from where a load still in flight would have resumed)
  useEffect(() => {
    const v = video.current;
    if (!v || !started || current.current === version) return;
    const p = pending.current;
    open(version, p ? p.at : v.currentTime, p ? p.play : !v.paused);
  }, [version, started, open]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (!started || ended) return start(ended ? 0 : time);
    if (pending.current) {
      pending.current.play = !pending.current.play;
      setPlaying(pending.current.play);
      return;
    }
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, [started, ended, start, time]);

  const seek = useCallback(
    (t: number) => {
      const v = video.current;
      const at = clamp(t, 0, FILM.duration - 0.05);
      setTime(at);
      setEnded(false);
      if (!v || !started) return start(at);
      if (pending.current) pending.current.at = at;
      else v.currentTime = at;
    },
    [started, start]
  );

  // the playhead moves smoothly while the film plays
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const v = video.current;
      if (v && v.readyState >= 1 && !pending.current) setTime(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // the bar steps aside after a moment of stillness while playing
  const idleTimer = useRef(0);
  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2400);
  }, []);
  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === wrap.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const fullscreen = () => {
    const w = wrap.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    const v = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (w?.requestFullscreen) w.requestFullscreen().catch(() => {});
    else if (w?.webkitRequestFullscreen) w.webkitRequestFullscreen();
    else v?.webkitEnterFullscreen?.();
  };

  // the scrubber handles (and stops) its own arrow keys; everything else reaches here wherever the focus is
  const onKey = (e: ReactKeyboardEvent) => {
    if (e.target instanceof HTMLElement && e.target.tagName === 'BUTTON' && (e.key === ' ' || e.key === 'Enter')) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') {
      e.preventDefault();
      toggle();
    } else if (k === 'arrowleft' || k === 'j') seek(time - 5);
    else if (k === 'arrowright' || k === 'l') seek(time + 5);
    else if (k === 'm') setMuted((m) => !m);
    else if (k === 'f') fullscreen();
    else return;
    wake();
  };

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted]);

  const showBar = started && (!playing || !idle);
  const chapter = chapterAt(time);
  const glass = night ? 'bg-[rgba(8,10,16,0.58)] text-white' : 'bg-[rgba(255,255,255,0.78)] text-[#0f1218]';

  return (
    <div
      ref={wrap}
      tabIndex={-1}
      onPointerMove={wake}
      onPointerDown={wake}
      onFocus={wake}
      onKeyDown={onKey}
      // above the page's fixed bottom blur (z 45), so the bar stays sharp; below the top navigation (z 50)
      className="group relative z-[46] overflow-hidden rounded-[22px] shadow-[0_1px_0_hsl(var(--shadow-color)/0.04),0_40px_90px_-50px_hsl(var(--shadow-color)/0.55)] outline-none ring-1 ring-rule [-webkit-tap-highlight-color:transparent]"
      style={{ aspectRatio: '16 / 9', background: BACKDROP[version], cursor: started && playing && idle ? 'none' : undefined, transition: 'background-color .5s ease' }}
    >
      <video
        ref={video}
        className="absolute inset-0 h-full w-full"
        playsInline
        preload="none"
        aria-label={`REA, the film (${version} version)`}
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          setTime(FILM.duration);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => {
          setWaiting(false);
          setBusy(false);
        }}
        onSeeked={() => video.current && setTime(video.current.currentTime)}
        onLoadedData={() => setHasFrame(true)}
        onError={() => {
          if (!current.current) return;
          setBusy(false);
          setFailed(true);
        }}
      />

      {/* posters, one per version: before the film has a frame to show, and again at the end */}
      {(['light', 'dark'] as const).map((v) => (
        <img
          key={v}
          src={FILM.poster[v]}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ opacity: (!started || !hasFrame || ended) && version === v ? 1 : 0 }}
        />
      ))}

      {/* before the film and after it: the whole frame plays; the button sits in a corner, off the title */}
      {(!started || ended) && !failed && (
        <button
          type="button"
          onClick={() => start(0)}
          className="absolute inset-0 flex items-end justify-end p-3 text-left outline-none sm:justify-start sm:p-7"
          aria-label={ended ? 'Watch the film again' : 'Play the film, 1 minute 48 seconds, with sound'}
        >
          <span className={`flex items-center gap-3.5 rounded-full p-1.5 backdrop-blur-xl backdrop-saturate-150 transition-transform duration-300 group-hover:-translate-y-0.5 sm:py-2 sm:pl-2 sm:pr-5 ${glass}`}>
            <span
              className={`grid h-11 w-11 place-items-center rounded-full transition-transform duration-300 group-hover:scale-[1.06] sm:h-14 sm:w-14 ${
                night ? 'bg-white text-[#0b0d12] shadow-[0_0_40px_rgba(170,120,255,0.45)]' : 'bg-[#0f1218] text-white'
              }`}
            >
              <Icon icon={ended ? RepeatIcon : PlayIcon} size={24} stroke={2} className={ended ? '' : 'translate-x-[1.5px]'} />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[17px] font-[740] [font-stretch:90%]">{ended ? 'Watch again' : 'Play the film'}</span>
              <span className="block text-[13px] font-[560] opacity-70">{ended ? 'from the start' : '1 min 48 s, with sound'}</span>
            </span>
          </span>
        </button>
      )}

      {failed && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <p className={`max-w-[34rem] rounded-2xl px-5 py-4 text-[15px] leading-relaxed backdrop-blur-md ${glass}`}>
            The film could not be loaded here. It plays on the{' '}
            <a className="font-[680] underline underline-offset-2" href="https://mikeeeeeeeeeeeeee.github.io/REA/#film" target="_blank" rel="noreferrer">
              project page
            </a>
            .
          </p>
        </div>
      )}

      {started && !failed && (busy || (waiting && playing)) && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-[3px] border-current border-t-transparent opacity-60" style={{ color: night ? '#fff' : '#0f1218' }} />
      )}

      {/* the bar */}
      <div
        className={`absolute inset-x-3 bottom-3 transition-[opacity,transform] duration-300 sm:inset-x-4 sm:bottom-4 ${showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
      >
        <div className={`flex items-center gap-2 rounded-2xl px-2.5 py-2 backdrop-blur-xl backdrop-saturate-150 sm:gap-3 sm:px-3 ${glass}`}>
          <BarButton label={playing ? 'Pause' : 'Play'} onClick={toggle}>
            <Icon icon={playing ? PauseIcon : PlayIcon} size={19} stroke={2} />
          </BarButton>
          <span className="hidden w-[92px] shrink-0 text-[13px] font-[600] tabular-nums opacity-80 sm:block">
            {fmt(time)} / {fmt(FILM.duration)}
          </span>
          <Scrubber time={time} night={night} onSeek={seek} />
          <span className="hidden w-[150px] shrink-0 truncate text-[13px] font-[650] [font-stretch:92%] lg:block">{chapter.title}</span>
          <VersionSwitch version={version} night={night} onChange={(v) => setOverride(v === theme ? null : v)} />
          <BarButton label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((m) => !m)}>
            <Icon icon={muted ? VolumeMute02Icon : VolumeHighIcon} size={19} stroke={1.8} />
          </BarButton>
          <BarButton label={full ? 'Exit full screen' : 'Full screen'} onClick={fullscreen}>
            <Icon icon={full ? MinimizeScreenIcon : FullScreenIcon} size={18} stroke={1.8} />
          </BarButton>
        </div>
      </div>
    </div>
  );
}

function BarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-current/10">
      {children}
    </button>
  );
}

/** light or dark film; the active one is the filled half */
function VersionSwitch({ version, night, onChange }: { version: FilmVersion; night: boolean; onChange: (v: FilmVersion) => void }) {
  return (
    <div role="radiogroup" aria-label="Film version" className={`hidden shrink-0 items-center rounded-full p-[3px] sm:flex ${night ? 'bg-white/10' : 'bg-black/[0.06]'}`}>
      {(['light', 'dark'] as const).map((v) => {
        const on = v === version;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={v === 'light' ? 'Light version' : 'Dark version'}
            title={v === 'light' ? 'Light version' : 'Dark version'}
            onClick={() => onChange(v)}
            className={`grid h-[30px] w-[34px] place-items-center rounded-full transition-colors ${on ? (night ? 'bg-white text-[#0b0d12]' : 'bg-[#0f1218] text-white') : 'opacity-70 hover:opacity-100'}`}
          >
            <Icon icon={v === 'light' ? Sun03Icon : Moon02Icon} size={15} stroke={1.9} />
          </button>
        );
      })}
    </div>
  );
}

/** the scrubber as a line: filled up to the playhead, with a station for every chapter */
function Scrubber({ time, night, onSeek }: { time: number; night: boolean; onSeek: (t: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const drag = useRef(false);
  const at = (x: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((x - r.left) / r.width, 0, 1) * FILM.duration;
  };
  const down = (e: ReactPointerEvent) => {
    drag.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    onSeek(at(e.clientX));
  };
  const move = (e: ReactPointerEvent) => {
    setHover(at(e.clientX));
    if (drag.current) onSeek(at(e.clientX));
  };
  const up = () => (drag.current = false);
  const key = (e: ReactKeyboardEvent) => {
    const step = e.shiftKey ? 10 : 5;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onSeek(time - step);
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onSeek(time + step);
    else if (e.key === 'Home') onSeek(0);
    else if (e.key === 'End') onSeek(FILM.duration - 0.1);
    else if (e.key === 'PageDown') onSeek(FILM.chapters.find((c) => c.t > time + 0.5)?.t ?? time);
    else if (e.key === 'PageUp') onSeek([...FILM.chapters].reverse().find((c) => c.t < time - 1)?.t ?? 0);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };
  const k = time / FILM.duration;
  const track = night ? 'rgba(255,255,255,0.22)' : 'rgba(15,18,24,0.14)';
  const line = night ? '#b773ff' : '#9a37c3';
  const station = night ? '#0b0d12' : '#ffffff';
  const ink = night ? '#ffffff' : '#0f1218';
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={FILM.duration}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${fmt(time)} of ${fmt(FILM.duration)}, ${chapterAt(time).title}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerLeave={() => setHover(null)}
      onKeyDown={key}
      className="relative h-9 min-w-0 flex-1 cursor-pointer touch-none rounded-full outline-none"
    >
      <div className="absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full" style={{ background: track }} />
      <div className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full" style={{ width: `${k * 100}%`, background: line }} />
      {FILM.chapters.map((c) => {
        const passed = time >= c.t;
        return (
          <span
            key={c.t}
            className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px]"
            style={{ left: `${(c.t / FILM.duration) * 100}%`, borderColor: passed ? line : ink, background: passed ? line : station, opacity: passed ? 1 : 0.85 }}
          />
        );
      })}
      <span
        className="absolute top-1/2 h-[17px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3.5px]"
        style={{ left: `${k * 100}%`, borderColor: ink, background: station, boxShadow: `0 0 0 4px color-mix(in srgb, ${line} 30%, transparent)` }}
      />
      {hover != null && (
        <span
          className="pointer-events-none absolute bottom-[calc(100%+10px)] -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[12.5px] font-[650] [font-stretch:92%]"
          style={{ left: `${(hover / FILM.duration) * 100}%`, background: ink, color: station }}
        >
          {chapterAt(hover).title}
          <span className="ml-1.5 tabular-nums opacity-70">{fmt(hover)}</span>
        </span>
      )}
    </div>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { CG_LABEL, CG_NOTE, cgPoster, cgSrc, type CgClip } from '@/data/cg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A CG clip as a silent inline video in the page's theme. It downloads nothing until `load`, plays while `play`, and
 * keeps its place when the theme, and with it the file, changes.
 */
const CgVideo = forwardRef<
  HTMLVideoElement,
  { clip: CgClip; play: boolean; load?: boolean; label: string; className?: string; style?: React.CSSProperties; onEnded?: () => void }
>(function CgVideo({ clip, play, load = play, label, className = '', style, onEnded }, fwd) {
  const { theme } = useTheme();
  const ref = useRef<HTMLVideoElement>(null);
  useImperativeHandle(fwd, () => ref.current!, []);
  const playing = useRef(play);
  playing.current = play;

  // the file is set here rather than as an attribute, so the moment it had reached can be read before it changes
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    const next = new URL(cgSrc(clip, theme), document.baseURI).href;
    if (v.src === next) return;
    const at = v.src ? v.currentTime : 0;
    const on = () => {
      if (at) v.currentTime = Math.min(at, v.duration - 0.05);
      if (playing.current) v.play().catch(() => {});
    };
    v.addEventListener('loadedmetadata', on, { once: true });
    v.src = next;
    return () => v.removeEventListener('loadedmetadata', on);
  }, [clip, theme, load]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    if (play) v.play().catch(() => {});
    else v.pause();
  }, [play, load]);

  return (
    <video
      ref={ref}
      muted
      playsInline
      // once it may download, it loads ahead, so it starts at once when its turn comes and a new file can be sought
      preload={load ? 'auto' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      poster={cgPoster(clip, theme)}
      aria-label={label}
      className={className}
      style={style}
      onEnded={onEnded}
    />
  );
});

export default CgVideo;

/** the chip every CG clip carries, so it is never taken for a run's footage */
export function CgChip({ className = '' }: { className?: string }) {
  return (
    <span title={CG_NOTE} className={`pointer-events-auto rounded-full bg-black/45 px-2.5 py-1 text-[11.5px] font-[650] text-white/90 backdrop-blur-md [font-stretch:92%] ${className}`}>
      {CG_LABEL}
    </span>
  );
}

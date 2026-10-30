/**
 * REA's mark: the page's timing diagram reduced to three strokes. The brain (System 2) acts
 * rarely, the router (System 1) at boundaries, the policies (System 0) run the whole way.
 */
export default function BrandMark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="3" y="4" width="7" height="3.6" rx="1.8" fill="var(--s2)" />
      <rect x="3" y="10.2" width="12" height="3.6" rx="1.8" fill="var(--s1)" />
      <rect x="3" y="16.4" width="18" height="3.6" rx="1.8" fill="var(--s0)" />
    </svg>
  );
}

import type { ReactNode } from 'react';

/**
 * Transit-map vocabulary shared by the whole page. REA routes work between three lines:
 *   S2 the brain (orange), S1 the router (purple), S0 the policies (blue).
 */
export type LineId = 's2' | 's1' | 's0';

export const LINES: Record<LineId, { code: string; name: string; system: string; color: string; wash: string; glow: string }> = {
  s2: { code: 'S2', name: 'Brain', system: 'System 2', color: 'var(--s2)', wash: 'var(--s2-wash)', glow: 'var(--s2-glow)' },
  s1: { code: 'S1', name: 'Router', system: 'System 1', color: 'var(--s1)', wash: 'var(--s1-wash)', glow: 'var(--s1-glow)' },
  s0: { code: 'S0', name: 'Policies', system: 'System 0', color: 'var(--s0)', wash: 'var(--s0-wash)', glow: 'var(--s0-glow)' },
};

/** a line badge, as on transit signage: [S2] */
export function LineBadge({ line, size = 14, className = '' }: { line: LineId; size?: number; className?: string }) {
  return (
    <span className={`badge ${className}`} style={{ background: LINES[line].color, fontSize: size }} aria-label={LINES[line].system}>
      {LINES[line].code}
    </span>
  );
}

/** badge + name, e.g. [S0] Policies */
export function LineTag({ line, children, size = 13, className = '' }: { line: LineId; children?: ReactNode; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LineBadge line={line} size={size - 1} />
      <span className="font-[650] text-ink" style={{ fontSize: size + 1, fontStretch: '92%' }}>
        {children ?? LINES[line].name}
      </span>
    </span>
  );
}

/**
 * REA's mark: the three lines and an interchange across them, the one place where the brain,
 * the router and the policies meet.
 */
export function BrandMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="1.5" y="4.4" width="21" height="3.2" rx="1.6" fill="var(--s2)" />
      <rect x="1.5" y="10.4" width="21" height="3.2" rx="1.6" fill="var(--s1)" />
      <rect x="1.5" y="16.4" width="21" height="3.2" rx="1.6" fill="var(--s0)" />
      <rect x="8.6" y="1.8" width="6.8" height="20.4" rx="3.4" fill="var(--station)" stroke="var(--ink)" strokeWidth="1.7" />
    </svg>
  );
}

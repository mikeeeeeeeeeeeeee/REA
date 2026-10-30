import type { ReactNode } from 'react';
import RubberSegment from '@/components/reactbits/RubberSegment/RubberSegment';
import { useTheme } from '@/theme/ThemeProvider';

/** the page's segmented control (the desktop theme switch and ALOHA tabs), in the phone's colours and full width */
export default function Seg<V extends string>({
  items,
  value,
  onChange,
  label,
  size = 'sm',
  raised = false,
  equal = true,
  className = '',
}: {
  items: { value: V; label: ReactNode }[];
  value: V;
  onChange: (v: V) => void;
  label: string;
  size?: 'sm' | 'md';
  /** on the grey paper: a darker track, so it still reads as a control */
  raised?: boolean;
  /** equal slots; false sizes each slot to its label */
  equal?: boolean;
  className?: string;
}) {
  const { t, theme } = useTheme();
  return (
    <RubberSegment
      items={items}
      value={value}
      onChange={(v) => onChange(v as V)}
      trackColor={raised ? t.rule : theme === 'dark' ? t.surface2 : t.paper2}
      thumbColor={t.ink}
      textColor={t.ink2}
      activeTextColor={t.paper}
      size={size}
      radius={999}
      equalSlots={equal}
      className={`!w-full ${className}`}
      aria-label={label}
    />
  );
}

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import SplitFlapText from '@/components/reactbits/SplitFlapText/SplitFlapText';
import { useMediaQuery, useSeenOnce } from '@/lib/hooks';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Route memory as a departure board: for each task, the development evidence for its two
 * candidate skills and the route the router will take. Data: the paper's Table 12 (matched
 * subset, development seeds 51-60).
 */
export const ROUTES = [
  { key: 'GS-drawer', task: 'OPEN DRAWER, PUT BOWL', fix: [1, 10], evo: [10, 10], first: 'EVO', ladder: 'EVO FIX EVO', why: 'higher development success' },
  { key: 'GT-drawer', task: 'DRAWER, CREAM CHEESE', fix: [1, 10], evo: [1, 10], first: 'FIX', ladder: 'FIX EVO FIX', why: 'a tie, broken by fewer steps' },
  { key: 'OT-butter', task: 'BUTTER INTO BASKET', fix: [0, 10], evo: [3, 10], first: 'EVO', ladder: 'EVO FIX EVO', why: 'higher development success' },
  { key: 'SS-between', task: 'BOWL BETWEEN PLATES', fix: [1, 10], evo: [10, 10], first: 'EVO', ladder: 'EVO FIX EVO', why: 'higher development success' },
  { key: 'SS-center', task: 'BOWL FROM TABLE CENTER', fix: [6, 20], evo: null, first: 'FIX', ladder: 'FIX FIX', why: 'the only distinct skill' },
  { key: 'SS-ramekin', task: 'BOWL ON RAMEKIN', fix: [4, 10], evo: [2, 10], first: 'FIX', ladder: 'FIX EVO FIX', why: 'higher development success' },
] as const;

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/,=';

export default function DepartureBoard({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [ref, seen] = useSeenOnce<HTMLDivElement>(0.3);
  const [rows, setRows] = useState(0);

  // rows clatter in one after another once the board is on screen
  useEffect(() => {
    if (!seen) return;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setRows(n);
      if (n >= ROUTES.length) window.clearInterval(id);
    }, 260);
    return () => window.clearInterval(id);
  }, [seen]);

  const tile = dark ? '#0a0c10' : '#14171d';
  const roomy = useMediaQuery('(min-width: 640px)');
  const fs = roomy ? 14 : 11;
  const gapPx = 2;
  // a split-flap tile is 0.78em wide; a column of n characters is exactly this wide
  const colW = (n: number) => Math.ceil(n * (fs * 0.78 + gapPx) - gapPx);
  const COLS = { task: 22, dev: 11, first: 3, ladder: 11 };
  // phones: task and first skill only; the evidence shows in the panel under the board
  const grid = `minmax(0,1fr) 0px ${colW(COLS.first)}px`;
  const gridWide = `minmax(0,1fr) ${colW(COLS.dev)}px ${colW(COLS.first)}px ${colW(COLS.ladder)}px`;
  const flap = { tileColor: tile, fontSize: fs, gap: gapPx, tileRadius: 3, flipDuration: 0.07, stagger: 0.022, glare: 0.5, depth: 0.55, charset: CHARSET, flipsPerChar: 4, intro: true, loop: false };

  return (
    <div ref={ref} className="overflow-hidden rounded-[16px] p-4 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:p-5" style={{ background: dark ? '#05070a' : '#0d0f13' }}>
      <div className="flex items-center justify-between gap-4 px-1 pb-3">
        <p className="text-[15px] font-[760] text-white [font-stretch:86%]">
          Route memory <span className="font-[560] text-white/50">departures</span>
        </p>
        <p className="text-[12px] font-[600] text-white/50">dev seeds 51-60, lookup at test time</p>
      </div>
      <div className="board-grid grid items-center gap-x-4 border-b border-white/10 px-1 pb-2 text-[11.5px] font-[700] text-white/45 [font-stretch:92%]" style={{ '--g': grid, '--gw': gridWide } as React.CSSProperties}>
        <span>Task</span>
        <span className="hidden text-right sm:block">Fix / Evo dev</span>
        <span>First</span>
        <span className="hidden sm:block">Ladder</span>
      </div>
      <ul className="mt-1">
        {ROUTES.map((r, i) => {
          const on = i === selected;
          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                onMouseEnter={() => onSelect(i)}
                className="board-grid relative grid w-full items-center gap-x-4 rounded-md px-1 py-[7px] text-left outline-none"
                style={{ '--g': grid, '--gw': gridWide } as React.CSSProperties}
                aria-pressed={on}
                aria-label={`${r.key}: first ${r.first}, ladder ${r.ladder}`}
              >
                {on && <motion.span layoutId="board-row" className="absolute inset-0 rounded-md bg-white/[0.07] ring-1 ring-white/15" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <span className="relative min-w-0 overflow-hidden">
                  {i < rows ? <SplitFlapText {...flap} text={r.task} padTo={COLS.task} textColor="#f4f5f7" /> : <Blank n={COLS.task} tile={tile} fs={fs} />}
                </span>
                <span className="relative hidden justify-end sm:flex">
                  {i < rows ? (
                    <SplitFlapText {...flap} text={`${pad(r.fix.join('/'), 5)} ${r.evo ? pad(r.evo.join('/'), 5) : '  =FIX'}`} padTo={11} textColor="#cfd3da" align="right" />
                  ) : (
                    <Blank n={11} tile={tile} fs={fs} />
                  )}
                </span>
                <span className="relative">{i < rows ? <SplitFlapText {...flap} text={r.first} padTo={3} textColor="#ffd25e" /> : <Blank n={3} tile={tile} fs={fs} />}</span>
                <span className="relative hidden sm:block">
                  {i < rows ? <SplitFlapText {...flap} text={r.ladder} padTo={11} textColor="#f4f5f7" /> : <Blank n={11} tile={tile} fs={fs} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function pad(s: string, n: number) {
  return s.length >= n ? s : ' '.repeat(n - s.length) + s;
}

function Blank({ n, tile, fs }: { n: number; tile: string; fs: number }) {
  return (
    <span className="inline-flex gap-[2px]" aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="inline-block rounded-[3px]" style={{ width: fs * 0.78, height: fs * 1.08, background: tile }} />
      ))}
    </span>
  );
}

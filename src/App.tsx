import { useEffect, useState, type ComponentType } from 'react';
import TopNav from './sections/TopNav';
import Hero from './sections/Hero';
import Noise from './components/reactbits/Noise/Noise';
import GradualBlur from './components/reactbits/GradualBlur/GradualBlur';
import { useTheme } from './theme/ThemeProvider';
import { useReducedMotion } from './lib/hooks';

// everything below the hero is split into chunks that start loading right after first paint
const loadMethod = () => import('./sections/parts/PartMethod');
const loadEvidence = () => import('./sections/parts/PartEvidence');
const loadClosing = () => import('./sections/parts/PartClosing');
type Parts = { method?: ComponentType; evidence?: ComponentType; closing?: ComponentType };

const Hold = ({ h }: { h: string }) => <div style={{ minHeight: h }} aria-hidden />;

export default function App() {
  const { theme } = useTheme();
  const reduce = useReducedMotion();

  // Each part is shown with an ordinary state update once its chunk has arrived. React.lazy would retry the
  // suspended render at retry priority, which the hero's per-frame replay keeps interrupting: on a slow machine
  // the sections below the hero then never appeared.
  const [parts, setParts] = useState<Parts>({});
  useEffect(() => {
    const put = (key: keyof Parts) => (m: { default: ComponentType }) => setParts((p) => ({ ...p, [key]: m.default }));
    loadMethod().then(put('method'));
    loadEvidence().then(put('evidence'));
    loadClosing().then(put('closing'));
  }, []);
  const { method: PartMethod, evidence: PartEvidence, closing: PartClosing } = parts;

  // honour a #hash in the URL once the lazy sections exist
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 50) {
        window.clearInterval(timer);
        el?.scrollIntoView();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <TopNav />
      {/* film grain over the whole page; static when motion is reduced */}
      <Noise fixed zIndex={60} opacity={theme === 'dark' ? 0.045 : 0.03} fps={reduce ? 0 : 10} size={1.2} contrast={0.55} blendMode="overlay" />
      {/* progressive blur along the bottom edge of the viewport, gone at the end of the page */}
      <GradualBlur target="page" position="bottom" height="4.5rem" strength={1.6} layers={5} curve="bezier" exponential opacity={1} autoHide zIndex={45} />
      <main>
        <Hero />
        {PartMethod ? <PartMethod /> : <Hold h="400vh" />}
        {PartEvidence ? <PartEvidence /> : <Hold h="400vh" />}
        {PartClosing ? <PartClosing /> : <Hold h="300vh" />}
      </main>
    </>
  );
}

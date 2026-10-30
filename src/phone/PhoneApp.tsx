import { useEffect } from 'react';
import './phone.css';
import PBar from './ui/PBar';
import PHero from './sections/PHero';
import { PFilm, PProblem } from './sections/PProblem';
import { PEpisodes, PRuntime } from './sections/PMethod';
import { PResults, PRobots } from './sections/PEvidence';
import { PAloha, PCite, PDemo, PFooter } from './sections/PClosing';
import { goTo } from './stops';

/**
 * The phone layout: the same paper as the desktop page, re-set for a phone held upright. The page is a line with
 * stops (the bar at the top shows the stop and the whole line); figures that are side by side on the desktop page
 * become rails to swipe, with a segmented control to jump.
 */
export default function PhoneApp() {
  // honour a #hash in the URL (a shared link, or a switch from the desktop page) once the stops exist
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      if (document.getElementById(id) || ++tries > 30) {
        window.clearInterval(timer);
        goTo(id, false);
      }
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="p-shell relative overflow-x-clip">
      <PBar />
      <main>
        <PHero />
        <PFilm />
        <PProblem />
        <PRuntime />
        <PEpisodes />
        <PResults />
        <PRobots />
        <PAloha />
        <PDemo />
        <PCite />
      </main>
      <PFooter />
    </div>
  );
}

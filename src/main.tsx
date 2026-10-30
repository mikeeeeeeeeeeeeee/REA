import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import '@fontsource-variable/saira/wdth.css';
import '@fontsource-variable/red-hat-mono/wght.css';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';
import { chooseView, settleAfterSwitch, wantsPreview } from './phone/mode';

// The desktop page and the phone layout are separate chunks: each device downloads only its own. The chosen one is
// rendered once it has arrived, with a plain render (no React.lazy: see App.tsx). A computer that chose the phone
// layout gets it in a phone-sized frame.
const view = chooseView();
settleAfterSwitch();
const preview = wantsPreview(view);
document.documentElement.dataset.view = preview ? 'preview' : view;
const root = createRoot(document.getElementById('root')!);
const page: Promise<{ default: ComponentType }> = preview ? import('./phone/PhonePreview') : view === 'phone' ? import('./phone/PhoneApp') : import('./App');
page.then(({ default: Page }) =>
  root.render(
    // no StrictMode: several WebGL effects release their context on unmount, and StrictMode's
    // dev-only double mount would hand them a lost context
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  )
);

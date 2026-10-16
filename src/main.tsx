import { createRoot } from 'react-dom/client';
import '@fontsource-variable/saira/wdth.css';
import '@fontsource-variable/red-hat-mono/wght.css';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  // no StrictMode: several WebGL effects release their context on unmount, and StrictMode's
  // dev-only double mount would hand them a lost context
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

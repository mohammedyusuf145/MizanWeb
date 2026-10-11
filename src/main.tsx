import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import './index.css';
import { App } from './app/App';
import { applyDocumentLang, useI18n } from './lib/i18n';
import { initAuth } from './lib/auth';
import { registerSW } from 'virtual:pwa-register';

applyDocumentLang(useI18n.getState().lang);
void initAuth();
// Service worker: push reminders, notification clicks, app-shell caching (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

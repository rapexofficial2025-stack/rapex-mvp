import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from '@rapex/ui-web'
import './index.css'
import App from './App.tsx'
import { AppProviders } from './AppProviders.tsx'
import { reportCrash } from './services/sentry'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary onError={reportCrash}>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
)

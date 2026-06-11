import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { StartupLoadingProvider } from './context/StartupLoadingContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StartupLoadingProvider>
        <App />
      </StartupLoadingProvider>
    </BrowserRouter>
  </StrictMode>,
)

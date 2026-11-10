import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import { initCloud } from './core/lib/cloud'
import { useRates } from './core/store/rates'
import { useCatalog } from './core/store/catalog'

initCloud()
void useRates.getState().load()
void useCatalog.getState().load()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

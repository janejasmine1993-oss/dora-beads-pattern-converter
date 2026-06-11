import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppWithLiteMode } from './AppWithLiteMode.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithLiteMode />
  </StrictMode>,
)

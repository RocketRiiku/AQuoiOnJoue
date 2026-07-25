import React from 'react'
import ReactDOM from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

/**
 * Les composants d'animation sont chargés dans un second temps, dans leur
 * propre chunk : importer `motion` directement embarquait tout Framer Motion
 * dans le bundle initial. Les composants utilisent `m.*` au lieu de `motion.*`
 * (`strict` échoue explicitement si l'un d'eux repasse à `motion`).
 * `domMax` — et non `domAnimation` — car les listes utilisent `layout`.
 */
const loadFeatures = () => import('framer-motion').then((mod) => mod.domMax)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LazyMotion features={loadFeatures} strict>
        <App />
      </LazyMotion>
    </ErrorBoundary>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

/**
 * Aucune bibliothèque d'animation : survols, fondus d'apparition et dépliage du
 * panneau de filtres sont tous en CSS. Framer Motion a été retiré — ce qu'il
 * restait à animer ne le justifiait plus, et ses deux mécanismes irremplaçables
 * (`layout` et `AnimatePresence`) avaient chacun causé une panne en production :
 * une projection figée décalant la liste hors de l'écran, puis une animation de
 * sortie qui ne se terminait pas et empêchait les fiches de s'ouvrir.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

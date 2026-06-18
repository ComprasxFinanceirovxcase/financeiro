import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter evita erro 404 em subrotas no GitHub Pages */}
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)

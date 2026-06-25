import { createContext, useContext, useEffect, useState } from 'react'

// Temas disponíveis. O `data-tema` é aplicado no <html> e o index.css
// define as cores (fundo, texto) de cada um.
export const TEMAS = [
  { chave: 'claro', rotulo: 'Claro', icone: '☀️' },
  { chave: 'medio', rotulo: 'Médio', icone: '🌗' },
  { chave: 'escuro', rotulo: 'Escuro', icone: '🌙' },
]

const CHAVE_STORAGE = 'tema-financeiro'
const ThemeContext = createContext(null)

function temaInicial() {
  if (typeof window === 'undefined') return 'claro'
  const salvo = window.localStorage.getItem(CHAVE_STORAGE)
  return TEMAS.some((t) => t.chave === salvo) ? salvo : 'claro'
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
    window.localStorage.setItem(CHAVE_STORAGE, tema)
  }, [tema])

  return <ThemeContext.Provider value={{ tema, setTema }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}

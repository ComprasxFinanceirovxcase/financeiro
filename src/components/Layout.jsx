import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ROTULOS_PAPEL = {
  admin: 'Administrador',
  editor: 'Editor',
  visualizador: 'Visualizador',
}

function abaClasse({ isActive }) {
  return [
    'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-marca-700 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-200',
  ].join(' ')
}

export default function Layout({ children }) {
  const { perfil, papel, ehAdmin, sair } = useAuth()
  const navigate = useNavigate()

  async function aoSair() {
    await sair()
    navigate('/')
  }

  const nome = perfil?.nome?.trim() || perfil?.email || 'Usuário'

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-800">
                Financeiro · Compras
              </h1>
              <p className="text-xs text-slate-500">Painel de pagamentos</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{nome}</p>
              <p className="text-xs text-slate-500">{ROTULOS_PAPEL[papel] ?? papel}</p>
            </div>
            <button
              onClick={aoSair}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 scroll-suave">
          <NavLink to="/visao-geral" className={abaClasse}>
            Visão geral
          </NavLink>
          <NavLink to="/solicitacoes" className={abaClasse}>
            Solicitações
          </NavLink>
          <NavLink to="/fundo-caixa" className={abaClasse}>
            Fundo de Caixa
          </NavLink>
          {ehAdmin && (
            <NavLink to="/usuarios" className={abaClasse}>
              Gerenciar usuários
            </NavLink>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

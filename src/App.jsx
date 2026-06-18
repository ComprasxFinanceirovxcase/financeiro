import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './components/Login.jsx'
import Layout from './components/Layout.jsx'
import Painel from './pages/Painel.jsx'
import Solicitacoes from './pages/Solicitacoes.jsx'
import FundoCaixa from './pages/FundoCaixa.jsx'
import Historico from './pages/Historico.jsx'
import Usuarios from './pages/Usuarios.jsx'

function TelaCarregando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-marca-600" />
        <p className="text-sm">Carregando...</p>
      </div>
    </div>
  )
}

export default function App() {
  const { session, ehAdmin, carregando } = useAuth()

  if (carregando) return <TelaCarregando />

  // Sem sessão -> só a tela de login
  if (!session) return <Login />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/visao-geral" replace />} />
        <Route path="/visao-geral" element={<Painel />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/fundo-caixa" element={<FundoCaixa />} />
        <Route
          path="/historico"
          element={ehAdmin ? <Historico /> : <Navigate to="/visao-geral" replace />}
        />
        <Route
          path="/usuarios"
          element={ehAdmin ? <Usuarios /> : <Navigate to="/solicitacoes" replace />}
        />
        <Route path="*" element={<Navigate to="/visao-geral" replace />} />
      </Routes>
    </Layout>
  )
}

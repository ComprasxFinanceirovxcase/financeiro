import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { supabaseConfigurado } from '../lib/supabase.js'

export default function Login() {
  const { entrar } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const error = await entrar(email.trim(), senha)
    setEnviando(false)
    if (error) {
      // Mensagens amigáveis para os erros mais comuns do Supabase
      if (error.message?.toLowerCase().includes('invalid login')) {
        setErro('E-mail ou senha incorretos. Confira e tente novamente.')
      } else if (error.message?.toLowerCase().includes('email not confirmed')) {
        setErro('Seu e-mail ainda não foi confirmado. Procure o administrador.')
      } else {
        setErro('Não foi possível entrar. Tente novamente em instantes.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-marca-900 via-marca-800 to-slate-900 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl">
            💰
          </div>
          <h1 className="text-2xl font-bold text-white">Financeiro · Compras</h1>
          <p className="mt-1 text-sm text-marca-100">Acesse com seu e-mail e senha</p>
        </div>

        <form
          onSubmit={aoEnviar}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-xl"
        >
          {!supabaseConfigurado && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
              ⚠️ O sistema ainda não foi conectado ao Supabase. Configure o arquivo{' '}
              <code>.env</code> com a URL e a chave anônima.
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100"
              placeholder="voce@empresa.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100"
              placeholder="••••••••"
            />
          </div>

          {erro && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-marca-700 py-2.5 text-sm font-semibold text-white transition hover:bg-marca-800 disabled:opacity-60"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Não tem acesso? Solicite ao administrador do sistema.
          </p>
        </form>
      </div>
    </div>
  )
}

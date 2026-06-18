import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null) // { id, email, nome, role }
  const [carregando, setCarregando] = useState(true)

  // Busca o perfil (papel/nome) do usuário logado na tabela public.profiles
  const carregarPerfil = useCallback(async (userId) => {
    if (!userId) {
      setPerfil(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, nome, role')
      .eq('id', userId)
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao carregar perfil:', error.message)
      setPerfil(null)
    } else {
      setPerfil(data)
    }
  }, [])

  useEffect(() => {
    let ativo = true

    // Sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!ativo) return
      setSession(session)
      await carregarPerfil(session?.user?.id)
      setCarregando(false)
    })

    // Escuta mudanças de login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_evento, novaSessao) => {
      setSession(novaSessao)
      await carregarPerfil(novaSessao?.user?.id)
      setCarregando(false)
    })

    return () => {
      ativo = false
      subscription.unsubscribe()
    }
  }, [carregarPerfil])

  const entrar = useCallback(async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    return error
  }, [])

  const sair = useCallback(async () => {
    await supabase.auth.signOut()
    setPerfil(null)
  }, [])

  const papel = perfil?.role ?? null
  const podeEditar = papel === 'admin' || papel === 'editor'
  const ehAdmin = papel === 'admin'

  const valor = {
    session,
    usuario: session?.user ?? null,
    perfil,
    papel,
    podeEditar,
    ehAdmin,
    carregando,
    entrar,
    sair,
    recarregarPerfil: () => carregarPerfil(session?.user?.id),
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}

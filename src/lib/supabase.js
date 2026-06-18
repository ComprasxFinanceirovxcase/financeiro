import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Aviso claro no console caso as variáveis de ambiente não tenham sido configuradas.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas. ' +
      'Crie um arquivo .env a partir do .env.example.',
  )
}

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const BUCKET = 'anexos'

function icone(nome) {
  const n = String(nome).toLowerCase()
  if (n.endsWith('.pdf')) return '📕'
  if (/\.(png|jpe?g|gif|webp)$/.test(n)) return '🖼️'
  return '📄'
}

/**
 * Lista/gerencia anexos (NF, comprovante) de um registro.
 * @param {{ tabela:string, registroId:number, anexosIniciais?:Array, podeEditar?:boolean }} props
 */
export default function Anexos({ tabela, registroId, anexosIniciais = [], podeEditar = false }) {
  const [lista, setLista] = useState(Array.isArray(anexosIniciais) ? anexosIniciais : [])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  async function aoEscolher(e) {
    const arquivos = Array.from(e.target.files || [])
    if (!arquivos.length) return
    setEnviando(true)
    setErro('')
    const novos = [...lista]
    for (const file of arquivos) {
      const limpo = file.name.replace(/[^\w.\-]+/g, '_')
      const path = `${registroId}/${Date.now()}_${limpo}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file)
      if (error) {
        setErro(`Falha ao enviar ${file.name}: ${error.message}`)
        continue
      }
      novos.push({ path, nome: file.name })
    }
    const { error: e2 } = await supabase.from(tabela).update({ anexos: novos }).eq('id', registroId)
    if (e2) setErro('Falha ao salvar anexos: ' + e2.message)
    else setLista(novos)
    setEnviando(false)
    e.target.value = ''
  }

  async function baixar(a) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(a.path, 3600)
    if (error) {
      setErro('Não foi possível abrir o arquivo: ' + error.message)
      return
    }
    window.open(data.signedUrl, '_blank', 'noopener')
  }

  async function remover(a) {
    if (!window.confirm(`Remover "${a.nome}"?`)) return
    await supabase.storage.from(BUCKET).remove([a.path])
    const novos = lista.filter((x) => x.path !== a.path)
    const { error } = await supabase.from(tabela).update({ anexos: novos }).eq('id', registroId)
    if (error) setErro('Falha ao remover: ' + error.message)
    else setLista(novos)
  }

  return (
    <div>
      {lista.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhum anexo ainda.</p>
      ) : (
        <ul className="space-y-1.5">
          {lista.map((a) => (
            <li
              key={a.path}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <button
                type="button"
                onClick={() => baixar(a)}
                className="flex min-w-0 items-center gap-2 text-left text-sm text-marca-700 hover:underline"
              >
                <span>{icone(a.nome)}</span>
                <span className="truncate">{a.nome}</span>
              </button>
              {podeEditar && (
                <button
                  type="button"
                  onClick={() => remover(a)}
                  className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {podeEditar && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-marca-300 bg-marca-50 px-3 py-2 text-sm font-semibold text-marca-700 transition hover:bg-marca-100">
          <span>📎</span>
          {enviando ? 'Enviando...' : 'Anexar arquivo (PDF, JPG, PNG)'}
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
            multiple
            disabled={enviando}
            onChange={aoEscolher}
            className="hidden"
          />
        </label>
      )}

      {erro && <p className="mt-2 text-xs text-red-600">{erro}</p>}
    </div>
  )
}

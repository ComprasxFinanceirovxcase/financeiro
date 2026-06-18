import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { formatarDataHora, formatarMoeda } from '../lib/format.js'

const ROTULO_TABELA = {
  solicitacoes: 'Solicitações',
  fundo_caixa: 'Fundo de Caixa',
}

const ROTULO_ACAO = {
  criou: { texto: 'Criou', classe: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200' },
  editou: { texto: 'Editou', classe: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200' },
  excluiu: { texto: 'Excluiu', classe: 'bg-red-100 text-red-800 ring-1 ring-red-200' },
}

// Nomes legíveis dos campos
const ROTULO_CAMPO = {
  data: 'Data',
  produto: 'Produto',
  quantidade: 'Quantidade',
  valor_total: 'Valor total',
  valor_unitario: 'Valor unitário',
  frete: 'Frete',
  motivo: 'Motivo',
  detalhamento: 'Detalhamento',
  centro_custo: 'Centro de custo',
  setor_custo: 'Setor de custo',
  local_entrega: 'Local de entrega',
  fornecedor: 'Fornecedor',
  cidade_estado: 'Cidade/Estado',
  forma_pagamento: 'Forma de pagamento',
  empresa: 'Responsável',
  conta_pagamento: 'Responsável',
  cnpj_cpf: 'CNPJ/CPF',
  nf: 'NF',
  status: 'Status',
  data_vencimento: 'Vencimento',
  id_card: 'ID do card',
}

const CAMPOS_IGNORADOS = new Set(['id', 'created_at', 'updated_at', 'created_by'])
const CAMPOS_MOEDA = new Set(['valor_total', 'valor_unitario', 'frete'])

function valorLegivel(campo, v) {
  if (v === null || v === undefined || v === '') return '—'
  if (CAMPOS_MOEDA.has(campo)) return formatarMoeda(v)
  return String(v)
}

function calcularMudancas(antes, depois) {
  if (!antes || !depois) return []
  const chaves = new Set([...Object.keys(antes), ...Object.keys(depois)])
  const lista = []
  for (const k of chaves) {
    if (CAMPOS_IGNORADOS.has(k)) continue
    const a = antes[k]
    const d = depois[k]
    if (String(a ?? '') !== String(d ?? '')) {
      lista.push({ campo: k, antes: a, depois: d })
    }
  }
  return lista
}

function Item({ h }) {
  const [aberto, setAberto] = useState(false)
  const acao = ROTULO_ACAO[h.acao] ?? { texto: h.acao, classe: 'bg-slate-100 text-slate-700' }
  const mudancas = useMemo(
    () => (h.acao === 'editou' ? calcularMudancas(h.dados_antes, h.dados_depois) : []),
    [h],
  )

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${acao.classe}`}>
          {acao.texto}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          {ROTULO_TABELA[h.tabela] ?? h.tabela}
        </span>
        <span className="text-sm font-semibold text-slate-800">{h.descricao || '—'}</span>
        <span className="ml-auto text-xs text-slate-400">{formatarDataHora(h.criado_em)}</span>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        por <strong>{h.usuario_email || '(painel Supabase)'}</strong>
      </p>

      {h.acao === 'editou' && mudancas.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setAberto((v) => !v)}
            className="text-xs font-semibold text-marca-700 hover:underline"
          >
            {aberto ? 'Ocultar alterações' : `Ver alterações (${mudancas.length})`}
          </button>
          {aberto && (
            <ul className="mt-2 space-y-1 border-l-2 border-slate-100 pl-3 text-sm">
              {mudancas.map((m) => (
                <li key={m.campo}>
                  <span className="text-slate-500">{ROTULO_CAMPO[m.campo] ?? m.campo}: </span>
                  <span className="text-red-600 line-through">{valorLegivel(m.campo, m.antes)}</span>
                  <span className="text-slate-400"> → </span>
                  <span className="font-semibold text-emerald-700">
                    {valorLegivel(m.campo, m.depois)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function Historico() {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [filtroAcao, setFiltroAcao] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    let ativo = true

    async function carregar() {
      const { data, error } = await supabase
        .from('historico')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(1000)
      if (!ativo) return
      if (error) setErro(error.message)
      else setItens(data ?? [])
      setCarregando(false)
    }
    carregar()

    const canal = supabase
      .channel('realtime:historico')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'historico' },
        (payload) => setItens((a) => [payload.new, ...a]),
      )
      .subscribe()

    return () => {
      ativo = false
      supabase.removeChannel(canal)
    }
  }, [])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return itens.filter((h) => {
      if (filtroAcao && h.acao !== filtroAcao) return false
      if (termo) {
        const alvo = `${h.descricao ?? ''} ${h.usuario_email ?? ''} ${h.tabela ?? ''}`.toLowerCase()
        if (!alvo.includes(termo)) return false
      }
      return true
    })
  }, [itens, filtroAcao, busca])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Histórico</h2>
        <p className="text-sm text-slate-500">
          Tudo o que foi criado, editado ou excluído — com quem fez e quando. Registro
          automático e protegido (ninguém apaga).
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por produto, usuário..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100"
        />
        <select
          value={filtroAcao}
          onChange={(e) => setFiltroAcao(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-marca-600"
        >
          <option value="">Todas as ações</option>
          <option value="criou">Criou</option>
          <option value="editou">Editou</option>
          <option value="excluiu">Excluiu</option>
        </select>
      </div>

      {erro && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          Erro ao carregar histórico: {erro}
        </div>
      )}

      {carregando ? (
        <p className="py-10 text-center text-slate-400">Carregando histórico...</p>
      ) : filtrados.length === 0 ? (
        <p className="py-10 text-center text-slate-400">
          Nenhum registro ainda. Assim que alguém criar, editar ou excluir um lançamento,
          aparece aqui.
        </p>
      ) : (
        <div className="space-y-2">
          {filtrados.map((h) => (
            <Item key={h.id} h={h} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useMemo, useState, useEffect } from 'react'
import { useRealtimeTable } from '../hooks/useRealtimeTable.js'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import {
  formatarMoeda,
  formatarData,
  mesDaData,
  anoDaData,
  rotuloMes,
  grupoStatus,
  situacaoVencimento,
  OPCOES_STATUS,
} from '../lib/format.js'
import { montarSugestoes } from '../lib/opcoes.js'
import Filters from './Filters.jsx'
import PeriodFilter from './PeriodFilter.jsx'
import SummaryCards from './SummaryCards.jsx'
import StatusBadge from './StatusBadge.jsx'
import LancamentoModal from './LancamentoModal.jsx'

/** Renderiza uma célula de acordo com o tipo da coluna. */
function celula(registro, coluna) {
  const valor = registro[coluna.chave]
  if (coluna.tipo === 'moeda') return formatarMoeda(valor)
  if (coluna.tipo === 'data') return formatarData(valor)
  if (valor === null || valor === undefined || valor === '') return '—'
  return String(valor)
}

/**
 * @param {{
 *   tabela: string,
 *   titulo: string,
 *   colunas: Array<{chave,rotulo,tipo?,className?}>,
 *   campos: Array<object>,
 *   statusWorkflow?: boolean,   // true = Pendente/Enviado/Pago | false = só "Pago"
 * }} props
 */
export default function TelaLancamentos({ tabela, titulo, colunas, campos, statusWorkflow = true }) {
  const { registros, carregando, erro } = useRealtimeTable(tabela)
  const { podeEditar, ehAdmin } = useAuth()

  const [busca, setBusca] = useState('')
  const [filtroAno, setFiltroAno] = useState('')
  const [filtroMes, setFiltroMes] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('') // '' | 'pendente' | 'enviado' | 'pago'
  const [modalAberto, setModalAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState(null)

  const statusPadrao = statusWorkflow ? 'Pendente' : 'Pago'

  // Sugestões (datalist) para os campos marcados como tipo 'datalist'
  const sugestoes = useMemo(() => {
    const mapa = {}
    for (const campo of campos) {
      if (campo.tipo === 'datalist') {
        mapa[campo.nome] = montarSugestoes(campo.nome, registros)
      }
    }
    return mapa
  }, [campos, registros])

  // Anos disponíveis (mais recente primeiro)
  const anosDisponiveis = useMemo(() => {
    const set = new Set()
    for (const r of registros) {
      const a = anoDaData(r.data)
      if (a) set.add(a)
    }
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [registros])

  // Define o ano ativo (mais recente) quando os dados chegam
  useEffect(() => {
    if (!filtroAno && anosDisponiveis.length > 0) {
      setFiltroAno(anosDisponiveis[0])
    }
  }, [anosDisponiveis, filtroAno])

  // Meses (1..12) com dados no ano ativo
  const mesesComDados = useMemo(() => {
    const set = new Set()
    for (const r of registros) {
      if (anoDaData(r.data) !== filtroAno) continue
      const m = mesDaData(r.data)
      if (m) set.add(Number(m.slice(5, 7)))
    }
    return [...set].sort((a, b) => a - b)
  }, [registros, filtroAno])

  function selecionarAno(ano) {
    setFiltroAno(ano)
    setFiltroMes('')
  }

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return registros.filter((r) => {
      if (filtroAno && anoDaData(r.data) !== filtroAno) return false
      if (filtroMes && mesDaData(r.data) !== filtroMes) return false
      if (filtroStatus && grupoStatus(r.status) !== filtroStatus) return false
      if (termo) {
        const alvo = Object.values(r).join(' ').toLowerCase()
        if (!alvo.includes(termo)) return false
      }
      return true
    })
  }, [registros, busca, filtroAno, filtroMes, filtroStatus])

  // Resumo do período (respeita ano/mês/busca; conta cada família de status)
  const resumo = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const base = registros.filter((r) => {
      if (filtroAno && anoDaData(r.data) !== filtroAno) return false
      if (filtroMes && mesDaData(r.data) !== filtroMes) return false
      if (termo && !Object.values(r).join(' ').toLowerCase().includes(termo)) return false
      return true
    })
    let total = 0
    let pendentes = 0
    let enviados = 0
    let pagos = 0
    for (const r of base) {
      total += Number(r.valor_total) || 0
      const g = grupoStatus(r.status)
      if (g === 'pago') pagos += 1
      else if (g === 'enviado') enviados += 1
      else pendentes += 1
    }
    return { total, pendentes, enviados, pagos, qtd: base.length }
  }, [registros, filtroAno, filtroMes, busca])

  // Agrupamento da lista por mês (com subtotal)
  const grupos = useMemo(() => {
    const map = new Map()
    for (const r of filtrados) {
      const mes = mesDaData(r.data) || 'sem-data'
      if (!map.has(mes)) map.set(mes, [])
      map.get(mes).push(r)
    }
    const arr = [...map.entries()].map(([mes, rows]) => ({
      mes,
      rows,
      subtotal: rows.reduce((s, r) => s + (Number(r.valor_total) || 0), 0),
    }))
    arr.sort((a, b) => b.mes.localeCompare(a.mes))
    return arr
  }, [filtrados])

  const totalCols = colunas.length + 1 + (podeEditar ? 1 : 0)

  async function mudarStatus(registro, novoStatus) {
    await supabase
      .from(tabela)
      .update({ status: novoStatus, updated_at: new Date().toISOString() })
      .eq('id', registro.id)
  }

  async function excluir(registro) {
    const ok = window.confirm('Tem certeza que deseja excluir este lançamento?')
    if (!ok) return
    await supabase.from(tabela).delete().eq('id', registro.id)
  }

  function abrirNovo() {
    setEmEdicao(null)
    setModalAberto(true)
  }
  function abrirEdicao(registro) {
    setEmEdicao(registro)
    setModalAberto(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{titulo}</h2>
          <p className="text-sm text-slate-500">
            Atualiza em tempo real para todos os usuários conectados.
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={abrirNovo}
            className="inline-flex items-center justify-center gap-1 rounded-lg bg-marca-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-marca-800 active:scale-95"
          >
            <span className="text-base leading-none">＋</span> Novo lançamento
          </button>
        )}
      </div>

      {/* Cartões-menu de status (clicáveis) */}
      <SummaryCards
        totalGasto={resumo.total}
        qtdPendentes={resumo.pendentes}
        qtdEnviados={resumo.enviados}
        qtdPagos={resumo.pagos}
        qtdTotal={resumo.qtd}
        statusAtivo={filtroStatus}
        aoSelecionarStatus={setFiltroStatus}
        modoSimples={!statusWorkflow}
      />

      {/* Filtro por ano e mês (toque) */}
      <PeriodFilter
        anos={anosDisponiveis}
        anoAtivo={filtroAno}
        aoSelecionarAno={selecionarAno}
        mesesComDados={mesesComDados}
        mesAtivo={filtroMes}
        aoSelecionarMes={setFiltroMes}
      />

      <Filters busca={busca} setBusca={setBusca} />

      {erro && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          Erro ao carregar dados: {erro}
        </div>
      )}

      {/* ----- Tabela (desktop) ----- */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto scroll-suave">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {colunas.map((c) => (
                  <th
                    key={c.chave}
                    className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {c.rotulo}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                {podeEditar && (
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {carregando ? (
                <tr>
                  <td colSpan={totalCols} className="px-3 py-10 text-center text-slate-400">
                    Carregando lançamentos...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="px-3 py-10 text-center text-slate-400">
                    Nenhum lançamento neste filtro. Use “＋ Novo lançamento” para adicionar.
                  </td>
                </tr>
              ) : (
                grupos.map((grupo) => (
                  <FragmentoGrupo
                    key={grupo.mes}
                    grupo={grupo}
                    colunas={colunas}
                    totalCols={totalCols}
                    podeEditar={podeEditar}
                    ehAdmin={ehAdmin}
                    statusWorkflow={statusWorkflow}
                    onStatus={mudarStatus}
                    onEditar={abrirEdicao}
                    onExcluir={excluir}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----- Cartões (mobile) ----- */}
      <div className="space-y-4 md:hidden">
        {carregando ? (
          <p className="py-10 text-center text-slate-400">Carregando lançamentos...</p>
        ) : filtrados.length === 0 ? (
          <p className="py-10 text-center text-slate-400">
            Nenhum lançamento neste filtro.
          </p>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.mes} className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-700">
                  {grupo.mes === 'sem-data' ? 'Sem data' : rotuloMes(grupo.mes)}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {formatarMoeda(grupo.subtotal)}
                </span>
              </div>
              {grupo.rows.map((r) => {
                const s = situacaoVencimento(r.status, r.data_vencimento)
                return (
                  <div
                    key={r.id}
                    className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${s.classeLinha}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800">{r.produto || '—'}</p>
                      <StatusBadge status={r.status} dataVencimento={r.data_vencimento} />
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                      {colunas
                        .filter((c) => c.chave !== 'produto')
                        .map((c) => (
                          <div key={c.chave}>
                            <dt className="text-xs text-slate-400">{c.rotulo}</dt>
                            <dd className={c.tipo === 'moeda' ? 'font-medium tabular-nums' : ''}>
                              {celula(r, c)}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    {podeEditar && (
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                        {statusWorkflow && (
                          <select
                            value={r.status}
                            onChange={(e) => mudarStatus(r, e.target.value)}
                            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs font-medium outline-none focus:border-marca-600"
                          >
                            {OPCOES_STATUS.map((op) => (
                              <option key={op} value={op}>
                                {op}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => abrirEdicao(r)}
                          className="rounded px-3 py-2 text-xs font-medium text-marca-700 hover:bg-marca-50 active:scale-95"
                        >
                          Editar
                        </button>
                        {ehAdmin && (
                          <button
                            onClick={() => excluir(r)}
                            className="rounded px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 active:scale-95"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>

      {podeEditar && (
        <LancamentoModal
          aberto={modalAberto}
          aoFechar={() => setModalAberto(false)}
          tabela={tabela}
          titulo={titulo + ' · novo lançamento'}
          campos={campos}
          registro={emEdicao}
          statusPadrao={statusPadrao}
          sugestoes={sugestoes}
        />
      )}
    </div>
  )
}

/** Um cabeçalho de mês (com subtotal) seguido das linhas daquele mês. */
function FragmentoGrupo({
  grupo,
  colunas,
  totalCols,
  podeEditar,
  ehAdmin,
  statusWorkflow,
  onStatus,
  onEditar,
  onExcluir,
}) {
  return (
    <>
      <tr className="bg-slate-100/70">
        <td colSpan={totalCols} className="px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">
              {grupo.mes === 'sem-data' ? 'Sem data' : rotuloMes(grupo.mes)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {grupo.rows.length} · {formatarMoeda(grupo.subtotal)}
            </span>
          </div>
        </td>
      </tr>
      {grupo.rows.map((r) => {
        const s = situacaoVencimento(r.status, r.data_vencimento)
        return (
          <tr key={r.id} className={`${s.classeLinha} hover:bg-slate-50`}>
            {colunas.map((c) => (
              <td
                key={c.chave}
                className={`px-3 py-2.5 align-top ${c.className ?? ''} ${
                  c.tipo === 'moeda' ? 'whitespace-nowrap font-medium tabular-nums' : ''
                }`}
              >
                {celula(r, c)}
              </td>
            ))}
            <td className="px-3 py-2.5 align-top">
              {podeEditar && statusWorkflow && (
                <select
                  value={r.status}
                  onChange={(e) => onStatus(r, e.target.value)}
                  className="mb-1 block rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium outline-none focus:border-marca-600"
                >
                  {OPCOES_STATUS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              )}
              <StatusBadge status={r.status} dataVencimento={r.data_vencimento} />
            </td>
            {podeEditar && (
              <td className="whitespace-nowrap px-3 py-2.5 text-right align-top">
                <button
                  onClick={() => onEditar(r)}
                  className="rounded px-2 py-1 text-xs font-medium text-marca-700 hover:bg-marca-50 active:scale-95"
                >
                  Editar
                </button>
                {ehAdmin && (
                  <button
                    onClick={() => onExcluir(r)}
                    className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 active:scale-95"
                  >
                    Excluir
                  </button>
                )}
              </td>
            )}
          </tr>
        )
      })}
    </>
  )
}

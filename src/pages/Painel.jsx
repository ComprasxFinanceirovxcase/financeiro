import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useRealtimeTable } from '../hooks/useRealtimeTable.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  formatarMoeda,
  formatarData,
  grupoStatus,
  situacaoVencimento,
} from '../lib/format.js'
import { montarSugestoes } from '../lib/opcoes.js'
import { CAMPOS_SOLICITACOES } from '../lib/camposConfig.js'
import StatusBadge from '../components/StatusBadge.jsx'
import LancamentoModal from '../components/LancamentoModal.jsx'

function resumirPorStatus(registros) {
  const r = {
    pendente: { qtd: 0, total: 0 },
    enviado: { qtd: 0, total: 0 },
    pago: { qtd: 0, total: 0 },
    geral: { qtd: registros.length, total: 0 },
  }
  for (const reg of registros) {
    const v = Number(reg.valor_total) || 0
    const g = grupoStatus(reg.status)
    r[g].qtd += 1
    r[g].total += v
    r.geral.total += v
  }
  return r
}

/** Um pedido está "pronto para pagar" quando já tem responsável e forma de pagamento. */
function prontoParaPagar(r) {
  const temResp = r.empresa && String(r.empresa).trim()
  const temForma = r.forma_pagamento && String(r.forma_pagamento).trim()
  return Boolean(temResp && temForma)
}

function Cartao({ titulo, valor, detalhe, cor, anel }) {
  return (
    <div className={`rounded-2xl border-2 ${anel} bg-white p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`mt-2 text-2xl font-extrabold ${cor}`}>{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-slate-500">{detalhe}</p>}
    </div>
  )
}

export default function Painel() {
  const sol = useRealtimeTable('solicitacoes')
  const fun = useRealtimeTable('fundo_caixa')
  const { podeEditar } = useAuth()

  const [emEdicao, setEmEdicao] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)

  const carregando = sol.carregando || fun.carregando

  const rSol = useMemo(() => resumirPorStatus(sol.registros), [sol.registros])
  const rFun = useMemo(() => resumirPorStatus(fun.registros), [fun.registros])

  const sugestoes = useMemo(() => {
    const mapa = {}
    for (const campo of CAMPOS_SOLICITACOES) {
      if (campo.tipo === 'datalist') mapa[campo.nome] = montarSugestoes(campo.nome, sol.registros)
    }
    return mapa
  }, [sol.registros])

  // Totais combinados (as duas telas)
  const comb = useMemo(() => {
    const soma = (a, b) => ({ qtd: a.qtd + b.qtd, total: a.total + b.total })
    return {
      geral: soma(rSol.geral, rFun.geral),
      pendente: soma(rSol.pendente, rFun.pendente),
      enviado: soma(rSol.enviado, rFun.enviado),
      pago: soma(rSol.pago, rFun.pago),
    }
  }, [rSol, rFun])

  // Pendentes das Solicitações (o que precisa ser pago)
  const pendentes = useMemo(
    () => sol.registros.filter((r) => grupoStatus(r.status) === 'pendente'),
    [sol.registros],
  )

  // Quanto o financeiro já definiu (responsável + forma) x falta definir
  const definicao = useMemo(() => {
    const def = { qtd: 0, total: 0 }
    const falta = { qtd: 0, total: 0 }
    for (const r of pendentes) {
      const v = Number(r.valor_total) || 0
      if (prontoParaPagar(r)) {
        def.qtd += 1
        def.total += v
      } else {
        falta.qtd += 1
        falta.total += v
      }
    }
    return { def, falta }
  }, [pendentes])

  // Lista ordenada: primeiro os que faltam definir, depois por vencimento
  const atencao = useMemo(() => {
    return [...pendentes].sort((a, b) => {
      const pa = prontoParaPagar(a) ? 1 : 0
      const pb = prontoParaPagar(b) ? 1 : 0
      if (pa !== pb) return pa - pb // "falta definir" primeiro
      return (a.data_vencimento || a.data || '').localeCompare(b.data_vencimento || b.data || '')
    })
  }, [pendentes])

  function abrirDefinicao(registro) {
    if (!podeEditar) return
    setEmEdicao(registro)
    setModalAberto(true)
  }

  if (carregando) {
    return <p className="py-10 text-center text-slate-400">Carregando visão geral...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Visão geral</h2>
        <p className="text-sm text-slate-500">
          Tudo o que está pendente, enviado e pago — Solicitações e Fundo de Caixa juntos.
        </p>
      </div>

      {/* Indicadores principais */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Cartao
          titulo="Total geral"
          valor={formatarMoeda(comb.geral.total)}
          detalhe={`${comb.geral.qtd} lançamentos no total`}
          cor="text-slate-800"
          anel="border-slate-200"
        />
        <Cartao
          titulo="Pendente a pagar"
          valor={formatarMoeda(comb.pendente.total)}
          detalhe={`${comb.pendente.qtd} aguardando pagamento`}
          cor="text-amber-600"
          anel="border-amber-200"
        />
        <Cartao
          titulo="Enviado"
          valor={formatarMoeda(comb.enviado.total)}
          detalhe={`${comb.enviado.qtd} pagamento(s) enviado(s)`}
          cor="text-blue-600"
          anel="border-blue-200"
        />
        <Cartao
          titulo="Pago"
          valor={formatarMoeda(comb.pago.total)}
          detalhe={`${comb.pago.qtd} quitado(s)`}
          cor="text-emerald-600"
          anel="border-emerald-200"
        />
      </div>

      {/* Definição do financeiro (entre os pendentes) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Prontos para pagar
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {formatarMoeda(definicao.def.total)}
          </p>
          <p className="text-xs text-emerald-600">
            {definicao.def.qtd} pedido(s) com responsável e forma já definidos
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Falta o financeiro definir
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {formatarMoeda(definicao.falta.total)}
          </p>
          <p className="text-xs text-amber-600">
            {definicao.falta.qtd} pedido(s) sem responsável ou forma de pagamento
          </p>
        </div>
      </div>

      {/* Quebra por tela */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tela
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-amber-600">
                Pendente
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-blue-600">
                Enviado
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Pago
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <LinhaQuebra nome="Solicitações" para="/solicitacoes" r={rSol} />
            <LinhaQuebra nome="Fundo de Caixa" para="/fundo-caixa" r={rFun} />
          </tbody>
        </table>
      </div>

      {/* Precisa de atenção — clicável para definir o pagamento */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            Precisa de atenção{' '}
            <span className="text-sm font-normal text-slate-400">({atencao.length})</span>
          </h3>
          <Link to="/solicitacoes" className="text-sm font-semibold text-marca-700 hover:underline">
            Ver Solicitações →
          </Link>
        </div>

        {podeEditar && (
          <p className="mb-2 text-xs text-slate-500">
            👉 Toque em um pedido para definir <strong>como vai ser pago</strong>, por qual{' '}
            <strong>pessoa/PF</strong> e qual <strong>CNPJ/CPF</strong>, e marcar o status.
          </p>
        )}

        {atencao.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            🎉 Nada pendente — tudo está enviado ou pago!
          </div>
        ) : (
          <div className="max-h-[28rem] space-y-2 overflow-y-auto scroll-suave pr-1">
            {atencao.map((r) => {
              const pronto = prontoParaPagar(r)
              const linha = situacaoVencimento(r.status, r.data_vencimento).classeLinha
              const Tag = podeEditar ? 'button' : 'div'
              return (
                <Tag
                  key={r.id}
                  onClick={() => abrirDefinicao(r)}
                  className={[
                    'flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-left shadow-sm',
                    linha || 'border-slate-200',
                    podeEditar ? 'transition hover:border-marca-300 hover:shadow active:scale-[0.99]' : '',
                  ].join(' ')}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{r.produto || '—'}</p>
                    <p className="truncate text-xs text-slate-500">
                      {r.fornecedor || 'sem fornecedor'} ·{' '}
                      {r.empresa || <span className="text-amber-600">definir responsável</span>}
                      {r.forma_pagamento ? ` · ${r.forma_pagamento}` : ''}
                      {r.data_vencimento ? ` · vence ${formatarData(r.data_vencimento)}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="whitespace-nowrap text-sm font-bold tabular-nums text-slate-700">
                      {formatarMoeda(r.valor_total)}
                    </span>
                    {pronto ? (
                      <span className="whitespace-nowrap rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        ✓ definido
                      </span>
                    ) : (
                      <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        definir
                      </span>
                    )}
                  </div>
                </Tag>
              )
            })}
          </div>
        )}
      </div>

      {podeEditar && (
        <LancamentoModal
          aberto={modalAberto}
          aoFechar={() => setModalAberto(false)}
          tabela="solicitacoes"
          titulo="Definir pagamento"
          campos={CAMPOS_SOLICITACOES}
          registro={emEdicao}
          sugestoes={sugestoes}
        />
      )}
    </div>
  )
}

function LinhaQuebra({ nome, para, r }) {
  const cel = (v) => (
    <td className="px-4 py-2.5 text-right tabular-nums">
      <div className="font-semibold text-slate-800">{formatarMoeda(v.total)}</div>
      <div className="text-xs text-slate-400">{v.qtd}</div>
    </td>
  )
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-2.5">
        <Link to={para} className="font-semibold text-marca-700 hover:underline">
          {nome}
        </Link>
      </td>
      {cel(r.pendente)}
      {cel(r.enviado)}
      {cel(r.pago)}
    </tr>
  )
}

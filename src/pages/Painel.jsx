import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRealtimeTable } from '../hooks/useRealtimeTable.js'
import {
  formatarMoeda,
  formatarData,
  grupoStatus,
  situacaoVencimento,
} from '../lib/format.js'
import StatusBadge from '../components/StatusBadge.jsx'

function resumirPorStatus(registros) {
  const r = {
    pendente: { qtd: 0, total: 0 },
    enviado: { qtd: 0, total: 0 },
    pago: { qtd: 0, total: 0 },
  }
  for (const reg of registros) {
    const g = grupoStatus(reg.status)
    r[g].qtd += 1
    r[g].total += Number(reg.valor_total) || 0
  }
  return r
}

function CartaoStatus({ titulo, cor, anel, qtd, total }) {
  return (
    <div className={`rounded-2xl border-2 ${anel} bg-white p-5 shadow-sm`}>
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-extrabold ${cor}`}>{formatarMoeda(total)}</p>
      <p className="mt-1 text-sm text-slate-500">
        {qtd} lançamento{qtd === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default function Painel() {
  const sol = useRealtimeTable('solicitacoes')
  const fun = useRealtimeTable('fundo_caixa')

  const carregando = sol.carregando || fun.carregando

  const rSol = useMemo(() => resumirPorStatus(sol.registros), [sol.registros])
  const rFun = useMemo(() => resumirPorStatus(fun.registros), [fun.registros])

  // Combinado (as duas telas juntas)
  const comb = useMemo(() => {
    const soma = (a, b) => ({ qtd: a.qtd + b.qtd, total: a.total + b.total })
    return {
      pendente: soma(rSol.pendente, rFun.pendente),
      enviado: soma(rSol.enviado, rFun.enviado),
      pago: soma(rSol.pago, rFun.pago),
    }
  }, [rSol, rFun])

  // Itens que precisam de atenção (pendentes + enviados), só das Solicitações
  const atencao = useMemo(() => {
    return sol.registros
      .filter((r) => grupoStatus(r.status) !== 'pago')
      .sort((a, b) => (a.data_vencimento || a.data || '').localeCompare(b.data_vencimento || b.data || ''))
  }, [sol.registros])

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

      {/* Três grandes status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoStatus
          titulo="Pendente"
          cor="text-amber-600"
          anel="border-amber-200"
          qtd={comb.pendente.qtd}
          total={comb.pendente.total}
        />
        <CartaoStatus
          titulo="Enviado"
          cor="text-blue-600"
          anel="border-blue-200"
          qtd={comb.enviado.qtd}
          total={comb.enviado.total}
        />
        <CartaoStatus
          titulo="Pago"
          cor="text-emerald-600"
          anel="border-emerald-200"
          qtd={comb.pago.qtd}
          total={comb.pago.total}
        />
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

      {/* Precisa de atenção */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Precisa de atenção</h3>
          <Link to="/solicitacoes" className="text-sm font-semibold text-marca-700 hover:underline">
            Ver Solicitações →
          </Link>
        </div>
        {atencao.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            🎉 Nada pendente nem enviado — tudo está pago!
          </div>
        ) : (
          <div className="space-y-2">
            {atencao.slice(0, 12).map((r) => (
              <div
                key={r.id}
                className={`flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm ${
                  situacaoVencimento(r.status, r.data_vencimento).classeLinha
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{r.produto || '—'}</p>
                  <p className="truncate text-xs text-slate-500">
                    {r.fornecedor || '—'} · {r.empresa || 'sem responsável'}
                    {r.data_vencimento ? ` · vence ${formatarData(r.data_vencimento)}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="whitespace-nowrap text-sm font-bold tabular-nums text-slate-700">
                    {formatarMoeda(r.valor_total)}
                  </span>
                  <StatusBadge status={r.status} dataVencimento={r.data_vencimento} />
                </div>
              </div>
            ))}
            {atencao.length > 12 && (
              <p className="pt-1 text-center text-xs text-slate-400">
                +{atencao.length - 12} outros — veja a tela de Solicitações
              </p>
            )}
          </div>
        )}
      </div>
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

import { useMemo, useState } from 'react'
import { formatarMoeda, mesDaData, rotuloMes, grupoStatus } from '../lib/format.js'

function Card({ titulo, valor, detalhe, cor }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`mt-1 text-xl font-extrabold ${cor}`}>{valor}</p>
      {detalhe && <p className="mt-0.5 text-xs text-slate-400">{detalhe}</p>}
    </div>
  )
}

// Calcula o resumo mensal de um conjunto de registros (exceto reembolsados).
function calcular(regs) {
  const map = new Map()
  for (const r of regs) {
    const g = grupoStatus(r.status)
    if (g === 'reembolsado') continue
    const mes = mesDaData(r.data)
    if (!mes) continue
    const v = Number(r.valor_total) || 0
    if (!map.has(mes)) map.set(mes, { mes, total: 0, pago: 0, pendente: 0, count: 0 })
    const o = map.get(mes)
    o.total += v
    o.count += 1
    if (g === 'pago') o.pago += v
    else o.pendente += v
  }
  const meses = [...map.values()].sort((a, b) => a.mes.localeCompare(b.mes))
  const total = meses.reduce((s, m) => s + m.total, 0)
  const pago = meses.reduce((s, m) => s + m.pago, 0)
  const pico = meses.reduce((mx, m) => (m.total > (mx?.total || 0) ? m : mx), null)
  const media = meses.length ? total / meses.length : 0
  const maxBar = meses.reduce((mx, m) => Math.max(mx, m.total), 0) || 1
  const qtd = meses.reduce((s, m) => s + m.count, 0)
  return { meses, total, pago, pico, media, maxBar, qtd }
}

const FONTES = [
  { chave: 'compras', rotulo: '🧾 Compras' },
  { chave: 'fundo', rotulo: '💵 Fundo de Caixa' },
  { chave: 'tudo', rotulo: 'Σ Tudo' },
]

/**
 * Relatório mensal SEPARADO por fonte: Compras (Solicitações) e Fundo de Caixa
 * têm cada um seu total próprio. Reembolsados não entram.
 */
export default function RelatorioMensal({ registrosSol = [], registrosFun = [] }) {
  const [fonte, setFonte] = useState('compras')

  const dadosCompras = useMemo(() => calcular(registrosSol), [registrosSol])
  const dadosFundo = useMemo(() => calcular(registrosFun), [registrosFun])
  const dadosTudo = useMemo(
    () => calcular([...registrosSol, ...registrosFun]),
    [registrosSol, registrosFun]
  )

  const dados = fonte === 'compras' ? dadosCompras : fonte === 'fundo' ? dadosFundo : dadosTudo
  const rotuloFonte = FONTES.find((f) => f.chave === fonte)?.rotulo || ''

  if (!dadosTudo.meses.length) {
    return <p className="py-10 text-center text-slate-400">Ainda não há dados para o relatório.</p>
  }

  return (
    <div className="space-y-5">
      {/* Totais separados — sempre visíveis */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-marca-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">🧾 Compras</p>
          <p className="mt-1 text-2xl font-extrabold text-marca-700">{formatarMoeda(dadosCompras.total)}</p>
          <p className="mt-0.5 text-xs text-slate-400">{dadosCompras.qtd} lançamentos</p>
        </div>
        <div className="rounded-xl border-2 border-blue-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">💵 Fundo de Caixa</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-600">{formatarMoeda(dadosFundo.total)}</p>
          <p className="mt-0.5 text-xs text-slate-400">{dadosFundo.qtd} lançamentos</p>
        </div>
        <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Σ Total geral</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800">{formatarMoeda(dadosTudo.total)}</p>
          <p className="mt-0.5 text-xs text-slate-400">Compras + Fundo</p>
        </div>
      </div>

      {/* Seletor de fonte para o detalhamento abaixo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Detalhar:</span>
        {FONTES.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => setFonte(f.chave)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-semibold transition active:scale-95',
              fonte === f.chave
                ? 'bg-marca-700 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {/* Indicadores da fonte selecionada */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card
          titulo={`Total — ${rotuloFonte}`}
          valor={formatarMoeda(dados.total)}
          detalhe={`${dados.qtd} lançamentos`}
          cor="text-slate-800"
        />
        <Card
          titulo="Mês de maior pico"
          valor={dados.pico ? rotuloMes(dados.pico.mes) : '—'}
          detalhe={dados.pico ? formatarMoeda(dados.pico.total) : ''}
          cor="text-marca-700"
        />
        <Card
          titulo="Média mensal"
          valor={formatarMoeda(dados.media)}
          detalhe={`em ${dados.meses.length} mês(es)`}
          cor="text-blue-600"
        />
        <Card
          titulo="Total pago"
          valor={formatarMoeda(dados.pago)}
          detalhe="já quitado"
          cor="text-emerald-600"
        />
      </div>

      {/* Gráfico de barras por mês */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-700">Gasto por mês — {rotuloFonte}</p>
        <div className="space-y-2">
          {dados.meses.map((m) => {
            const pct = Math.max(2, (m.total / dados.maxBar) * 100)
            const ehPico = dados.pico && m.mes === dados.pico.mes
            return (
              <div key={m.mes} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs font-medium text-slate-500">
                  {rotuloMes(m.mes)}
                </span>
                <div className="h-6 flex-1 overflow-hidden rounded bg-slate-100">
                  <div
                    className={`h-full rounded ${ehPico ? 'bg-marca-700' : 'bg-marca-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-28 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
                  {formatarMoeda(m.total)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabela mensal (para relatório) */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto scroll-suave">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Mês
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Lançamentos
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Pago
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-amber-600">
                  A pagar
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dados.meses.map((m) => (
                <tr key={m.mes} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-700">{rotuloMes(m.mes)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{m.count}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-emerald-700">
                    {formatarMoeda(m.pago)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-amber-600">
                    {formatarMoeda(m.pendente)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-slate-800">
                    {formatarMoeda(m.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-800">
                <td className="px-4 py-2.5">Total — {rotuloFonte}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{dados.qtd}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatarMoeda(dados.pago)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatarMoeda(dados.total - dados.pago)}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{formatarMoeda(dados.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

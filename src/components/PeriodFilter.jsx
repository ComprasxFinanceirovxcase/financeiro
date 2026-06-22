import { abrevMes } from '../lib/format.js'

/** Botão de um controle segmentado. */
function Seg({ ativo, suave, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-1.5 text-sm font-semibold transition active:scale-95',
        ativo
          ? 'bg-white text-marca-700 shadow-sm'
          : suave
            ? 'text-slate-300 hover:text-slate-500'
            : 'text-slate-500 hover:text-slate-800',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * Filtro por ano e por mês em controle segmentado.
 * Mostra os 12 meses; os sem lançamento ficam em tom suave (mas clicáveis).
 */
export default function PeriodFilter({
  anos,
  anoAtivo,
  aoSelecionarAno,
  mesesComDados,
  mesAtivo,
  aoSelecionarMes,
}) {
  const todosOsMeses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const comDados = new Set(mesesComDados)

  return (
    <div className="space-y-2">
      {anos.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Ano
          </span>
          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {anos.map((ano) => (
              <Seg key={ano} ativo={ano === anoAtivo} onClick={() => aoSelecionarAno(ano)}>
                {ano}
              </Seg>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Mês
        </span>
        <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
          <Seg ativo={mesAtivo === ''} onClick={() => aoSelecionarMes('')}>
            Todos
          </Seg>
          {todosOsMeses.map((m) => {
            const valor = `${anoAtivo}-${String(m).padStart(2, '0')}`
            return (
              <Seg
                key={valor}
                ativo={mesAtivo === valor}
                suave={!comDados.has(m)}
                onClick={() => aoSelecionarMes(valor)}
              >
                {abrevMes(m)}
              </Seg>
            )
          })}
        </div>
      </div>
    </div>
  )
}

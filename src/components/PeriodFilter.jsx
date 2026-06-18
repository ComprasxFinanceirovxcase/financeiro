import { abrevMes } from '../lib/format.js'

/** Pílula clicável (alvo grande, bom para toque). */
function Pilula({ ativo, suave, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative select-none whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95',
        ativo
          ? 'bg-marca-700 text-white shadow-sm'
          : suave
            ? 'bg-white text-slate-400 ring-1 ring-slate-200 hover:bg-slate-50'
            : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/**
 * Barra de filtro por ano e por mês, totalmente tocável.
 * Mostra os 12 meses; os que não têm lançamento ficam em tom suave
 * (mas continuam clicáveis — é onde você lança manualmente depois).
 *
 * @param {{
 *   anos: string[],
 *   anoAtivo: string,
 *   aoSelecionarAno: Function,
 *   mesesComDados: number[],   // números de mês (1..12) que têm lançamentos no ano
 *   mesAtivo: string,          // '' = todos, ou 'YYYY-MM'
 *   aoSelecionarMes: Function,
 * }} props
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-10 text-xs font-medium uppercase tracking-wide text-slate-400">
            Ano
          </span>
          {anos.map((ano) => (
            <Pilula key={ano} ativo={ano === anoAtivo} onClick={() => aoSelecionarAno(ano)}>
              {ano}
            </Pilula>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-10 text-xs font-medium uppercase tracking-wide text-slate-400">Mês</span>
        <Pilula ativo={mesAtivo === ''} onClick={() => aoSelecionarMes('')}>
          Todos
        </Pilula>
        {todosOsMeses.map((m) => {
          const valor = `${anoAtivo}-${String(m).padStart(2, '0')}`
          const temDados = comDados.has(m)
          return (
            <Pilula
              key={valor}
              ativo={mesAtivo === valor}
              suave={!temDados}
              onClick={() => aoSelecionarMes(valor)}
            >
              {abrevMes(m)}
            </Pilula>
          )
        })}
      </div>
    </div>
  )
}

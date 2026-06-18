/**
 * Caixa de busca por texto.
 * @param {{ busca:string, setBusca:Function }} props
 */
export default function Filters({ busca, setBusca }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔎
      </span>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por produto, fornecedor, detalhe..."
        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm outline-none focus:border-marca-600 focus:ring-2 focus:ring-marca-100"
      />
    </div>
  )
}

import { situacaoVencimento } from '../lib/format.js'

/** Etiqueta colorida de status com destaque de vencimento (verde/âmbar/vermelho). */
export default function StatusBadge({ status, dataVencimento }) {
  const s = situacaoVencimento(status, dataVencimento)
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.classeBadge}`}
    >
      {s.rotulo}
    </span>
  )
}

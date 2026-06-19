import TelaLancamentos from '../components/TelaLancamentos.jsx'
import { COLUNAS_SOLICITACOES, CAMPOS_SOLICITACOES } from '../lib/camposConfig.js'

export default function Solicitacoes() {
  return (
    <TelaLancamentos
      tabela="solicitacoes"
      titulo="Solicitações"
      colunas={COLUNAS_SOLICITACOES}
      campos={CAMPOS_SOLICITACOES}
      statusWorkflow
      comAnexos
    />
  )
}

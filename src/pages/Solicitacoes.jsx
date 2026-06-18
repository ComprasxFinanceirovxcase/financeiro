import TelaLancamentos from '../components/TelaLancamentos.jsx'

const COLUNAS = [
  { chave: 'data', rotulo: 'Data', tipo: 'data' },
  { chave: 'produto', rotulo: 'Produto', className: 'min-w-[14rem]' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'valor_total', rotulo: 'Valor total', tipo: 'moeda' },
  { chave: 'forma_pagamento', rotulo: 'Forma de pgto.' },
  { chave: 'empresa', rotulo: 'Responsável' },
  { chave: 'cnpj_cpf', rotulo: 'CNPJ/CPF' },
  { chave: 'data_vencimento', rotulo: 'Vencimento', tipo: 'data' },
]

// Campos do formulário. tipo 'datalist' = escolhe na lista OU digita um novo.
const CAMPOS = [
  { nome: 'data', rotulo: 'Data', tipo: 'date', obrigatorio: true },
  { nome: 'id_card', rotulo: 'ID do card' },
  { nome: 'produto', rotulo: 'Produto', obrigatorio: true, largura: 'full' },
  { nome: 'quantidade', rotulo: 'Quantidade', tipo: 'number' },
  { nome: 'valor_total', rotulo: 'Valor total (R$)', tipo: 'number', obrigatorio: true },
  { nome: 'valor_unitario', rotulo: 'Valor unitário (R$)', tipo: 'number' },
  { nome: 'frete', rotulo: 'Frete (R$)', tipo: 'number' },
  { nome: 'motivo', rotulo: 'Motivo', tipo: 'textarea', largura: 'full' },
  { nome: 'centro_custo', rotulo: 'Centro de custo', tipo: 'datalist' },
  { nome: 'local_entrega', rotulo: 'Local de entrega', tipo: 'datalist' },
  { nome: 'fornecedor', rotulo: 'Fornecedor', tipo: 'datalist' },
  { nome: 'cidade_estado', rotulo: 'Cidade/Estado', tipo: 'datalist' },
  { nome: 'forma_pagamento', rotulo: 'Forma de pagamento', tipo: 'datalist' },
  { nome: 'empresa', rotulo: 'Responsável pelo pagamento', tipo: 'datalist' },
  { nome: 'cnpj_cpf', rotulo: 'CNPJ/CPF (NF)', tipo: 'datalist' },
  { nome: 'data_vencimento', rotulo: 'Data de vencimento', tipo: 'date' },
  { nome: 'status', rotulo: 'Status', tipo: 'select' },
]

export default function Solicitacoes() {
  return (
    <TelaLancamentos
      tabela="solicitacoes"
      titulo="Solicitações"
      colunas={COLUNAS}
      campos={CAMPOS}
      statusWorkflow
    />
  )
}

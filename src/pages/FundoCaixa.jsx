import TelaLancamentos from '../components/TelaLancamentos.jsx'

const COLUNAS = [
  { chave: 'data', rotulo: 'Data', tipo: 'data' },
  { chave: 'produto', rotulo: 'Produto', className: 'min-w-[14rem]' },
  { chave: 'detalhamento', rotulo: 'Detalhamento', className: 'min-w-[14rem]' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'valor_total', rotulo: 'Valor total', tipo: 'moeda' },
  { chave: 'forma_pagamento', rotulo: 'Forma de pgto.' },
  { chave: 'conta_pagamento', rotulo: 'Responsável' },
  { chave: 'nf', rotulo: 'NF' },
]

// Fundo de Caixa: tudo já é "Pago" (sem fluxo de status), então o campo
// status não aparece no formulário — entra automaticamente como "Pago".
const CAMPOS = [
  { nome: 'data', rotulo: 'Data', tipo: 'date', obrigatorio: true },
  { nome: 'produto', rotulo: 'Produto', obrigatorio: true, largura: 'full' },
  { nome: 'quantidade', rotulo: 'Quantidade', tipo: 'number' },
  { nome: 'valor_total', rotulo: 'Valor total (R$)', tipo: 'number', obrigatorio: true },
  { nome: 'valor_unitario', rotulo: 'Valor unitário (R$)', tipo: 'number' },
  { nome: 'frete', rotulo: 'Frete (R$)', tipo: 'number' },
  { nome: 'detalhamento', rotulo: 'Detalhamento', tipo: 'textarea', largura: 'full' },
  { nome: 'setor_custo', rotulo: 'Setor de custo', tipo: 'datalist' },
  { nome: 'local_entrega', rotulo: 'Local de entrega', tipo: 'datalist' },
  { nome: 'fornecedor', rotulo: 'Fornecedor', tipo: 'datalist' },
  { nome: 'forma_pagamento', rotulo: 'Forma de pagamento', tipo: 'datalist' },
  { nome: 'conta_pagamento', rotulo: 'Conta/Responsável pelo pagamento', tipo: 'datalist' },
  { nome: 'nf', rotulo: 'NF' },
]

export default function FundoCaixa() {
  return (
    <TelaLancamentos
      tabela="fundo_caixa"
      titulo="Fundo de Caixa"
      colunas={COLUNAS}
      campos={CAMPOS}
      statusWorkflow={false}
    />
  )
}

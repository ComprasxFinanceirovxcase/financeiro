// Configuração das colunas (tabela) e campos (formulário) de cada tela.
// Centralizado aqui para ser reaproveitado pelas páginas e pela Visão geral.

export const COLUNAS_SOLICITACOES = [
  { chave: 'data', rotulo: 'Data', tipo: 'data' },
  { chave: 'produto', rotulo: 'Produto', className: 'min-w-[14rem]' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'valor_total', rotulo: 'Valor total', tipo: 'moeda' },
  { chave: 'forma_pagamento', rotulo: 'Forma de pgto.' },
  { chave: 'empresa', rotulo: 'Responsável' },
  { chave: 'cnpj_cpf', rotulo: 'CNPJ/CPF' },
  { chave: 'data_vencimento', rotulo: 'Vencimento', tipo: 'data' },
]

export const CAMPOS_SOLICITACOES = [
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

export const COLUNAS_FUNDO = [
  { chave: 'data', rotulo: 'Data', tipo: 'data' },
  { chave: 'produto', rotulo: 'Produto', className: 'min-w-[14rem]' },
  { chave: 'detalhamento', rotulo: 'Detalhamento', className: 'min-w-[14rem]' },
  { chave: 'fornecedor', rotulo: 'Fornecedor' },
  { chave: 'valor_total', rotulo: 'Valor total', tipo: 'moeda' },
  { chave: 'forma_pagamento', rotulo: 'Forma de pgto.' },
  { chave: 'conta_pagamento', rotulo: 'Responsável' },
  { chave: 'nf', rotulo: 'NF' },
]

export const CAMPOS_FUNDO = [
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

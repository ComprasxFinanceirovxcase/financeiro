// Listas fixas (curadas pelo admin) usadas como sugestões nos formulários.
// Você pode me passar os nomes/CNPJs/fornecedores que eu preencho aqui.
//
// Estas listas se SOMAM automaticamente aos valores que já existem nos
// lançamentos — ou seja, todo responsável/CNPJ/fornecedor já usado aparece
// como sugestão sem precisar cadastrar. E ao digitar um novo valor, ele
// passa a aparecer também.

// Pessoas/contas que realizam os pagamentos (responsáveis).
const RESPONSAVEIS = [
  'PF - Alisson',
  'PF - Igor',
  'PF - Jose Celso',
  'PF - Leon',
  'PF - Marcos Raniere',
  'PF - Bruno Neves',
  'PF - Paulo Marcio',
  'PF - Vitor',
  'PF - Tayna',
  'PF - Thales',
  'RC9',
]

export const LISTAS = {
  // Responsável pelo pagamento (pessoas / contas)
  empresa: RESPONSAVEIS,
  conta_pagamento: RESPONSAVEIS,

  // Documentos para emissão de NF
  cnpj_cpf: [],

  // Fornecedores recorrentes (Mercado Livre já unificado)
  fornecedor: [
    'Mercado Livre',
    'Mercado Pago',
    'Amazon',
    'Magazine Luiza',
    'Kabum',
    'Dell',
    'Login',
    'Ubiquiti',
    'Flex Form',
    'Ayca Digital',
    'NS Impressoras Digitais',
    'TLT Soluções Corporativas',
    'Visual Bordados',
    'Ivon Camisas',
    'Vale Uniformes',
    'Polo Salvador',
    'Filha e Netas TMJ',
    'PH Química',
    'EMCAIXA',
    'Inovação Indústria',
    'Impressão Bigraf',
    'Potisigns',
    'Camicado',
    'Clone Tech',
  ],

  // Formas de pagamento mais usadas
  forma_pagamento: [
    'BOLETO A VISTA',
    'BOLETO PARCELADO',
    'TRANSFERÊNCIA/ PIX',
    'CARTÃO',
    'Pix',
  ],

  // Centros / setores de custo
  centro_custo: [],
  setor_custo: [],

  // Locais de entrega
  local_entrega: [],
}

/**
 * Monta a lista de sugestões de um campo: junta a lista curada (LISTAS)
 * com os valores já existentes nos registros, sem repetir, ordenado.
 */
export function montarSugestoes(nomeCampo, registros) {
  const set = new Set()
  for (const v of LISTAS[nomeCampo] ?? []) {
    if (v && String(v).trim()) set.add(String(v).trim())
  }
  for (const r of registros ?? []) {
    const v = r[nomeCampo]
    if (v !== null && v !== undefined && String(v).trim()) set.add(String(v).trim())
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

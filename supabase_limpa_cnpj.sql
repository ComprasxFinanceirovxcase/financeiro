-- ============================================================
-- Limpa valores de CNPJ/CPF que vieram como DATA/HORA (trocados na planilha).
-- Ex.: "Fri Jan 30 2026 00:00:28 GMT-0300 (Horário Padrão de Brasília)".
-- Só zera esses; CNPJs/CPFs de verdade não são afetados.
-- Cole no SQL Editor do Supabase e clique em Run.
-- ============================================================

update public.solicitacoes
set cnpj_cpf = null
where cnpj_cpf ilike '%GMT%'
   or cnpj_cpf ilike '%Horário%'
   or cnpj_cpf ~ '^[A-Za-z]{3} [A-Za-z]{3} [0-9]';

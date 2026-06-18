-- ============================================================
-- Normaliza o fornecedor "Mercado Livre - <loja>" para apenas
-- "Mercado Livre" (marketplace). Cole no SQL Editor e clique em Run.
-- ============================================================

update public.solicitacoes
set fornecedor = 'Mercado Livre'
where fornecedor ilike '%mercado livre%';

update public.fundo_caixa
set fornecedor = 'Mercado Livre'
where fornecedor ilike '%mercado livre%';

-- (Opcional) também unifica o "Mercado Pago":
update public.solicitacoes
set fornecedor = 'Mercado Pago'
where fornecedor ilike '%mercado pago%';

update public.fundo_caixa
set fornecedor = 'Mercado Pago'
where fornecedor ilike '%mercado pago%';

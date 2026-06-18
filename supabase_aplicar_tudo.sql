-- ============================================================
-- APLICAR TUDO DE UMA VEZ
-- 1) Status -> Pendente / Enviado / Pago  (e Fundo de Caixa = Pago)
-- 2) Normaliza fornecedor "Mercado Livre - loja X" -> "Mercado Livre"
-- Cole no SQL Editor do Supabase e clique em Run (uma única vez).
-- ============================================================

-- ---------- 1) STATUS ----------
alter table public.solicitacoes drop constraint if exists solicitacoes_status_check;
alter table public.fundo_caixa  drop constraint if exists fundo_caixa_status_check;

update public.solicitacoes set status = 'Pendente' where status = 'Atrasado';
update public.fundo_caixa  set status = 'Pendente' where status = 'Atrasado';

alter table public.solicitacoes
  add constraint solicitacoes_status_check check (status in ('Pendente','Enviado','Pago'));
alter table public.fundo_caixa
  add constraint fundo_caixa_status_check check (status in ('Pendente','Enviado','Pago'));

-- Fundo de Caixa: tudo é "Pago"
update public.fundo_caixa set status = 'Pago';
alter table public.fundo_caixa alter column status set default 'Pago';

-- ---------- 2) NORMALIZA FORNECEDOR ----------
update public.solicitacoes set fornecedor = 'Mercado Livre' where fornecedor ilike '%mercado livre%';
update public.fundo_caixa  set fornecedor = 'Mercado Livre' where fornecedor ilike '%mercado livre%';
update public.solicitacoes set fornecedor = 'Mercado Pago'  where fornecedor ilike '%mercado pago%';
update public.fundo_caixa  set fornecedor = 'Mercado Pago'  where fornecedor ilike '%mercado pago%';

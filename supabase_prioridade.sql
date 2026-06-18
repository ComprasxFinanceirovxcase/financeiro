-- ============================================================
-- Acrescenta o campo "prioridade" (urgência) aos pedidos.
-- Cole no SQL Editor do Supabase e clique em Run (uma vez).
-- ============================================================

alter table public.solicitacoes add column if not exists prioridade boolean not null default false;
alter table public.fundo_caixa  add column if not exists prioridade boolean not null default false;

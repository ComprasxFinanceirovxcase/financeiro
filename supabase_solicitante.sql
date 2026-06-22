-- ============================================================
-- Campos novos: "solicitante" (quem pediu a compra) e "observacoes".
-- Cole no SQL Editor do Supabase e clique em Run (uma vez).
-- ============================================================

alter table public.solicitacoes add column if not exists solicitante text;
alter table public.solicitacoes add column if not exists observacoes text;

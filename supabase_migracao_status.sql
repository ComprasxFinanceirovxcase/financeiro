-- ============================================================
-- MIGRAÇÃO: status agora é  Pendente -> Enviado -> Pago
-- e o Fundo de Caixa passa a ser sempre "Pago".
-- Cole no SQL Editor do Supabase e clique em Run (uma vez).
-- ============================================================

-- 1) Remove as regras antigas de status (que só aceitavam Pago/Pendente/Atrasado)
alter table public.solicitacoes drop constraint if exists solicitacoes_status_check;
alter table public.fundo_caixa  drop constraint if exists fundo_caixa_status_check;

-- 2) Converte qualquer 'Atrasado' antigo em 'Pendente'
update public.solicitacoes set status = 'Pendente' where status = 'Atrasado';
update public.fundo_caixa  set status = 'Pendente' where status = 'Atrasado';

-- 3) Cria as novas regras: só Pendente, Enviado ou Pago
alter table public.solicitacoes
  add constraint solicitacoes_status_check check (status in ('Pendente','Enviado','Pago'));
alter table public.fundo_caixa
  add constraint fundo_caixa_status_check check (status in ('Pendente','Enviado','Pago'));

-- 4) Fundo de Caixa: tudo é "Pago" (registros existentes e novos)
update public.fundo_caixa set status = 'Pago';
alter table public.fundo_caixa alter column status set default 'Pago';

-- (Solicitações continuam começando em 'Pendente' por padrão.)

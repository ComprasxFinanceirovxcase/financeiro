-- ============================================================
-- ATUALIZAÇÕES (rodar de uma vez)
-- 1) 4º status "Reembolsado"
-- 2) Histórico / auditoria (registro de criar/editar/excluir)
-- Seguro rodar mesmo que parte já tenha sido aplicada.
-- Cole no SQL Editor, apague o conteúdo anterior, e clique em Run.
-- ============================================================

-- ---------- 1) STATUS: + Reembolsado ----------
alter table public.solicitacoes drop constraint if exists solicitacoes_status_check;
alter table public.fundo_caixa  drop constraint if exists fundo_caixa_status_check;

alter table public.solicitacoes
  add constraint solicitacoes_status_check
  check (status in ('Pendente','Enviado','Pago','Reembolsado'));

alter table public.fundo_caixa
  add constraint fundo_caixa_status_check
  check (status in ('Pendente','Enviado','Pago','Reembolsado'));

-- ---------- 2) HISTÓRICO / AUDITORIA ----------
create table if not exists public.historico (
  id bigint generated always as identity primary key,
  tabela text not null,
  registro_id bigint,
  acao text not null check (acao in ('criou','editou','excluiu')),
  usuario_id uuid,
  usuario_email text,
  descricao text,
  dados_antes jsonb,
  dados_depois jsonb,
  criado_em timestamptz default now()
);

alter table public.historico enable row level security;

drop policy if exists "hist: admin le" on public.historico;
create policy "hist: admin le" on public.historico for select
  using (public.get_my_role() = 'admin');

create or replace function public.registrar_historico()
returns trigger language plpgsql security definer as $$
declare
  v_email text;
  v_acao text;
  v_id bigint;
  v_produto text;
begin
  select email into v_email from public.profiles where id = auth.uid();

  if (TG_OP = 'INSERT') then
    v_acao := 'criou';   v_id := NEW.id; v_produto := NEW.produto;
  elsif (TG_OP = 'UPDATE') then
    v_acao := 'editou';  v_id := NEW.id; v_produto := NEW.produto;
  else
    v_acao := 'excluiu'; v_id := OLD.id; v_produto := OLD.produto;
  end if;

  insert into public.historico
    (tabela, registro_id, acao, usuario_id, usuario_email, descricao, dados_antes, dados_depois)
  values (
    TG_TABLE_NAME, v_id, v_acao, auth.uid(), v_email, v_produto,
    case when TG_OP in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when TG_OP in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );

  if (TG_OP = 'DELETE') then return OLD; else return NEW; end if;
end; $$;

drop trigger if exists trg_hist_solicitacoes on public.solicitacoes;
create trigger trg_hist_solicitacoes
  after insert or update or delete on public.solicitacoes
  for each row execute function public.registrar_historico();

drop trigger if exists trg_hist_fundo on public.fundo_caixa;
create trigger trg_hist_fundo
  after insert or update or delete on public.fundo_caixa
  for each row execute function public.registrar_historico();

do $$
begin
  begin
    alter publication supabase_realtime add table public.historico;
  exception when duplicate_object then null;
  end;
end $$;

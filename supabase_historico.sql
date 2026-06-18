-- ============================================================
-- HISTÓRICO / AUDITORIA
-- Registra automaticamente tudo que for criado, editado ou excluído
-- em Solicitações e Fundo de Caixa: quem fez, quando, e o que mudou.
-- À prova de bagunça: nem pela API dá para apagar/alterar o histórico.
-- Cole no SQL Editor do Supabase e clique em Run (uma vez).
-- ============================================================

create table if not exists public.historico (
  id bigint generated always as identity primary key,
  tabela text not null,                 -- 'solicitacoes' | 'fundo_caixa'
  registro_id bigint,
  acao text not null check (acao in ('criou','editou','excluiu')),
  usuario_id uuid,
  usuario_email text,
  descricao text,                       -- normalmente o nome do produto
  dados_antes jsonb,
  dados_depois jsonb,
  criado_em timestamptz default now()
);

alter table public.historico enable row level security;

-- Só o admin pode LER o histórico
drop policy if exists "hist: admin le" on public.historico;
create policy "hist: admin le" on public.historico for select
  using (public.get_my_role() = 'admin');
-- (Sem políticas de insert/update/delete: ninguém altera o histórico pela API.
--  Só o gatilho abaixo escreve nele, pois roda como dono do banco.)

-- Função que grava o histórico
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

-- Gatilhos nas duas tabelas
drop trigger if exists trg_hist_solicitacoes on public.solicitacoes;
create trigger trg_hist_solicitacoes
  after insert or update or delete on public.solicitacoes
  for each row execute function public.registrar_historico();

drop trigger if exists trg_hist_fundo on public.fundo_caixa;
create trigger trg_hist_fundo
  after insert or update or delete on public.fundo_caixa
  for each row execute function public.registrar_historico();

-- Tempo real (o histórico aparece ao vivo para o admin)
do $$
begin
  begin
    alter publication supabase_realtime add table public.historico;
  exception when duplicate_object then null;
  end;
end $$;

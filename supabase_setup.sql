-- ============================================================
-- Configuração do banco no Supabase
-- Cole TODO este arquivo no SQL Editor do Supabase e execute uma vez.
-- ============================================================

-- PERFIS / PAPÉIS
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  nome text,
  role text not null default 'visualizador' check (role in ('admin','editor','visualizador')),
  created_at timestamptz default now()
);

create or replace function public.get_my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- cria o perfil automaticamente quando um usuário se registra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, nome, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome',''), 'visualizador');
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TABELA SOLICITAÇÕES
create table if not exists public.solicitacoes (
  id bigint generated always as identity primary key,
  id_card text,
  data date,
  produto text,
  quantidade numeric,
  valor_total numeric,
  valor_unitario numeric,
  frete numeric,
  motivo text,
  centro_custo text,
  local_entrega text,
  fornecedor text,
  cidade_estado text,
  forma_pagamento text,
  empresa text,            -- responsável pelo pagamento
  cnpj_cpf text,           -- documento para emissão da NF
  status text not null default 'Pendente' check (status in ('Pago','Pendente','Atrasado')),
  data_vencimento date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- TABELA FUNDO DE CAIXA
create table if not exists public.fundo_caixa (
  id bigint generated always as identity primary key,
  data date,
  produto text,
  quantidade numeric,
  valor_total numeric,
  valor_unitario numeric,
  frete numeric,
  detalhamento text,
  setor_custo text,
  local_entrega text,
  fornecedor text,
  forma_pagamento text,
  conta_pagamento text,    -- responsável pelo pagamento
  nf text,
  status text not null default 'Pendente' check (status in ('Pago','Pendente','Atrasado')),
  data_vencimento date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid references auth.users(id)
);

-- SEGURANÇA (RLS)
alter table public.profiles enable row level security;
alter table public.solicitacoes enable row level security;
alter table public.fundo_caixa enable row level security;

drop policy if exists "perfil: ver" on public.profiles;
create policy "perfil: ver" on public.profiles for select
  using (id = auth.uid() or public.get_my_role() = 'admin');

drop policy if exists "perfil: admin gerencia" on public.profiles;
create policy "perfil: admin gerencia" on public.profiles for all
  using (public.get_my_role() = 'admin') with check (public.get_my_role() = 'admin');

-- todos os logados leem; admin/editor escrevem; só admin apaga
drop policy if exists "solic: ler" on public.solicitacoes;
create policy "solic: ler"     on public.solicitacoes for select using (auth.uid() is not null);
drop policy if exists "solic: inserir" on public.solicitacoes;
create policy "solic: inserir" on public.solicitacoes for insert with check (public.get_my_role() in ('admin','editor'));
drop policy if exists "solic: editar" on public.solicitacoes;
create policy "solic: editar"  on public.solicitacoes for update using (public.get_my_role() in ('admin','editor'));
drop policy if exists "solic: apagar" on public.solicitacoes;
create policy "solic: apagar"  on public.solicitacoes for delete using (public.get_my_role() = 'admin');

drop policy if exists "fundo: ler" on public.fundo_caixa;
create policy "fundo: ler"     on public.fundo_caixa for select using (auth.uid() is not null);
drop policy if exists "fundo: inserir" on public.fundo_caixa;
create policy "fundo: inserir" on public.fundo_caixa for insert with check (public.get_my_role() in ('admin','editor'));
drop policy if exists "fundo: editar" on public.fundo_caixa;
create policy "fundo: editar"  on public.fundo_caixa for update using (public.get_my_role() in ('admin','editor'));
drop policy if exists "fundo: apagar" on public.fundo_caixa;
create policy "fundo: apagar"  on public.fundo_caixa for delete using (public.get_my_role() = 'admin');

-- TEMPO REAL
-- (envolto em bloco para não falhar se a tabela já estiver na publicação)
do $$
begin
  begin
    alter publication supabase_realtime add table public.solicitacoes;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.fundo_caixa;
  exception when duplicate_object then null;
  end;
end $$;

-- ============================================================
-- DEPOIS DE EXECUTAR:
-- 1) Authentication -> Add user: crie o primeiro usuário (você).
-- 2) Table Editor -> profiles: troque o seu 'role' para 'admin'.
-- 3) Table Editor -> solicitacoes / fundo_caixa -> Import data via CSV:
--    importe os arquivos da pasta /data deste projeto.
-- ============================================================

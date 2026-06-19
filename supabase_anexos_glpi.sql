-- ============================================================
-- Anexos (NF/comprovante em PDF/JPG/PNG) + Código GLPI
-- Cole no SQL Editor do Supabase e clique em Run (uma vez).
-- ============================================================

-- 1) Campos novos nos pedidos
alter table public.solicitacoes add column if not exists codigo_glpi text;
alter table public.solicitacoes add column if not exists anexos jsonb not null default '[]'::jsonb;

-- 2) "Balde" de arquivos (privado)
insert into storage.buckets (id, name, public)
values ('anexos', 'anexos', false)
on conflict (id) do nothing;

-- 3) Permissões do Storage
--    Ver/baixar: qualquer usuário logado. Subir/Apagar: admin ou editor.
drop policy if exists "anexos: ver" on storage.objects;
create policy "anexos: ver" on storage.objects for select
  using (bucket_id = 'anexos' and auth.uid() is not null);

drop policy if exists "anexos: subir" on storage.objects;
create policy "anexos: subir" on storage.objects for insert
  with check (bucket_id = 'anexos' and public.get_my_role() in ('admin','editor'));

drop policy if exists "anexos: atualizar" on storage.objects;
create policy "anexos: atualizar" on storage.objects for update
  using (bucket_id = 'anexos' and public.get_my_role() in ('admin','editor'));

drop policy if exists "anexos: apagar" on storage.objects;
create policy "anexos: apagar" on storage.objects for delete
  using (bucket_id = 'anexos' and public.get_my_role() in ('admin','editor'));

-- ============================================================
-- FT SEDE — Caixa de Perguntas
-- Rode este script no SQL Editor do projeto Supabase do FT SEDE
-- (projeto lhogqynmbdmlxhbrmrke — o mesmo usado em src/lib/supabase.ts)
-- ============================================================

create table if not exists public.appft_perguntas (
  id            uuid primary key default gen_random_uuid(),
  pergunta      text not null check (char_length(pergunta) between 1 and 2000),
  respondido    boolean not null default false,
  respondido_at timestamptz,
  created_at    timestamptz not null default now()
);

-- Ordena a listagem do painel por data de forma rapida
create index if not exists appft_perguntas_created_at_idx
  on public.appft_perguntas (created_at desc);

-- Row Level Security
alter table public.appft_perguntas enable row level security;

-- Qualquer visitante (anon) pode ENVIAR uma pergunta pelo formulario publico
drop policy if exists "perguntas_insert_publico" on public.appft_perguntas;
create policy "perguntas_insert_publico"
  on public.appft_perguntas
  for insert
  to anon, authenticated
  with check (true);

-- Apenas usuarios logados podem LER as perguntas (painel)
drop policy if exists "perguntas_select_logado" on public.appft_perguntas;
create policy "perguntas_select_logado"
  on public.appft_perguntas
  for select
  to authenticated
  using (true);

-- Apenas usuarios logados podem MARCAR como respondida / reabrir
drop policy if exists "perguntas_update_logado" on public.appft_perguntas;
create policy "perguntas_update_logado"
  on public.appft_perguntas
  for update
  to authenticated
  using (true)
  with check (true);

-- Apenas usuarios logados podem EXCLUIR
drop policy if exists "perguntas_delete_logado" on public.appft_perguntas;
create policy "perguntas_delete_logado"
  on public.appft_perguntas
  for delete
  to authenticated
  using (true);

-- (Opcional) Atualizacao em tempo real no painel:
-- Painel > Database > Replication, marque a tabela appft_perguntas,
-- OU rode a linha abaixo:
-- alter publication supabase_realtime add table public.appft_perguntas;

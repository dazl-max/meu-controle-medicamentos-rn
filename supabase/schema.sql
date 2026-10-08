-- =========================================================
-- Meu Controle de Medicamentos — esquema do Supabase
-- Rode este arquivo inteiro em: Supabase → SQL Editor → New query
-- =========================================================

-- Extensão necessária pro job automático que roda a cada poucos minutos
create extension if not exists pg_cron with schema extensions;

-- ---------- Tabelas ----------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  papel text not null check (papel in ('usuario', 'admin')),
  nome text not null
);

create table if not exists public.vinculos (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  unique (admin_id, usuario_id)
);

create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  nome text not null,
  dose text not null,
  horario time not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.registros_dose (
  id uuid primary key default gen_random_uuid(),
  medicamento_id uuid not null references public.medicamentos (id) on delete cascade,
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  data date not null,
  status text not null check (status in ('tomado', 'perdido')),
  criado_em timestamptz not null default now(),
  unique (medicamento_id, data)
);

create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  criado_em timestamptz not null default now(),
  unique (profile_id, expo_push_token)
);

-- ---------- Segurança (Row Level Security) ----------

alter table public.profiles enable row level security;
alter table public.vinculos enable row level security;
alter table public.medicamentos enable row level security;
alter table public.registros_dose enable row level security;
alter table public.push_tokens enable row level security;

-- profiles: cada um vê o próprio perfil; admin também vê o perfil do usuário vinculado
create policy "ver_proprio_perfil" on public.profiles
  for select using (id = auth.uid());

create policy "admin_ve_perfil_vinculado" on public.profiles
  for select using (
    id in (select usuario_id from public.vinculos where admin_id = auth.uid())
  );

-- vinculos: cada admin vê só os próprios vínculos
create policy "admin_ve_proprios_vinculos" on public.vinculos
  for select using (admin_id = auth.uid());

-- medicamentos: usuário cuida dos próprios; admin só lê os do usuário vinculado
create policy "usuario_gerencia_proprios_medicamentos" on public.medicamentos
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy "admin_le_medicamentos_vinculados" on public.medicamentos
  for select using (
    usuario_id in (select usuario_id from public.vinculos where admin_id = auth.uid())
  );

-- registros_dose: mesma lógica dos medicamentos
create policy "usuario_gerencia_proprios_registros" on public.registros_dose
  for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

create policy "admin_le_registros_vinculados" on public.registros_dose
  for select using (
    usuario_id in (select usuario_id from public.vinculos where admin_id = auth.uid())
  );

-- push_tokens: cada um gerencia só o próprio token
create policy "usuario_gerencia_proprio_token" on public.push_tokens
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ---------- Job automático: marca doses perdidas após 30 min de atraso ----------

create or replace function public.marcar_doses_perdidas()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  agora time := (now() at time zone 'America/Sao_Paulo')::time;
  hoje date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  insert into public.registros_dose (medicamento_id, usuario_id, data, status)
  select m.id, m.usuario_id, hoje, 'perdido'
  from public.medicamentos m
  where m.horario <= (agora - interval '30 minutes')
    and not exists (
      select 1 from public.registros_dose r
      where r.medicamento_id = m.id and r.data = hoje
    );
end;
$$;

select cron.schedule(
  'checar-doses-perdidas',
  '*/5 * * * *',
  $$select public.marcar_doses_perdidas();$$
);

-- =========================================================
-- Depois de rodar o script acima, crie as duas contas em:
-- Authentication → Users → Add user (defina e-mail e senha
-- pra você e pro seu pai). Copie o "User UID" de cada um e
-- rode os comandos abaixo, trocando os valores de exemplo:
-- =========================================================

-- insert into public.profiles (id, papel, nome) values
--   ('uuid-do-seu-pai-aqui', 'usuario', 'Nome do seu pai'),
--   ('uuid-do-admin-aqui', 'admin', 'Seu nome');

-- insert into public.vinculos (admin_id, usuario_id) values
--   ('uuid-do-admin-aqui', 'uuid-do-seu-pai-aqui');

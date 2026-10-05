-- Padel Torneio - schema inicial
-- Rode este arquivo completo no SQL Editor do seu projeto Supabase (quoracup@gmail.com).

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============ ADMIN ROLES ============
create table public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;

create or replace function public.is_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_roles where user_id = p_user_id);
$$;

grant execute on function public.is_admin(uuid) to anon, authenticated;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin(auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid());

create policy "admin_roles_select_self"
  on public.admin_roles for select
  using (user_id = auth.uid());

-- cria profile automaticamente quando um usuario se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ TOURNAMENTS ============
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  event_date date not null,
  status text not null default 'open' check (status in ('open','closed')),
  registration_opens_at timestamptz,
  scheduled_close_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.tournaments enable row level security;

create policy "tournaments_select_all"
  on public.tournaments for select using (true);

create policy "tournaments_insert_admin"
  on public.tournaments for insert with check (public.is_admin(auth.uid()));

create policy "tournaments_update_admin"
  on public.tournaments for update using (public.is_admin(auth.uid()));

create policy "tournaments_delete_admin"
  on public.tournaments for delete using (public.is_admin(auth.uid()));

-- ============ TOURNAMENT CATEGORIES ============
create table public.tournament_categories (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  category text not null check (category in ('6a','5a','4a')),
  slots_limit int not null check (slots_limit > 0),
  created_at timestamptz not null default now(),
  unique (tournament_id, category)
);

alter table public.tournament_categories enable row level security;

create policy "categories_select_all"
  on public.tournament_categories for select using (true);

create policy "categories_insert_admin"
  on public.tournament_categories for insert with check (public.is_admin(auth.uid()));

create policy "categories_update_admin"
  on public.tournament_categories for update using (public.is_admin(auth.uid()));

create policy "categories_delete_admin"
  on public.tournament_categories for delete using (public.is_admin(auth.uid()));

-- ============ REGISTRATIONS ============
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  tournament_category_id uuid not null references public.tournament_categories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  player1_name text not null,
  player2_name text not null,
  status text not null default 'waitlist' check (status in ('confirmed','waitlist')),
  created_at timestamptz not null default now(),
  unique (tournament_id, user_id)
);

create index registrations_category_status_idx
  on public.registrations (tournament_category_id, status, created_at);

alter table public.registrations enable row level security;

-- leitura: dono ou admin. Escritas (insert/update/delete) acontecem só via as
-- funções abaixo (security definer), que fazem a lógica de vaga/fila e checam
-- permissão (dono ou admin) internamente. Não há policies de insert/update/delete
-- diretas de propósito.
create policy "registrations_select_own_or_admin"
  on public.registrations for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

-- inscreve a dupla: confirma se houver vaga, senão entra na lista de espera
create or replace function public.register_team(
  p_tournament_category_id uuid,
  p_player1_name text,
  p_player2_name text
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category public.tournament_categories;
  v_tournament public.tournaments;
  v_confirmed_count int;
  v_status text;
  v_result public.registrations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_category from public.tournament_categories where id = p_tournament_category_id;
  if v_category is null then
    raise exception 'category not found';
  end if;

  select * into v_tournament from public.tournaments where id = v_category.tournament_id;

  if v_tournament.status = 'closed'
     or (v_tournament.scheduled_close_at is not null and v_tournament.scheduled_close_at <= now()) then
    raise exception 'registrations are closed for this tournament';
  end if;

  if v_tournament.registration_opens_at is not null and v_tournament.registration_opens_at > now() then
    raise exception 'registrations have not opened yet for this tournament';
  end if;

  if p_player1_name is null or trim(p_player1_name) = ''
     or p_player2_name is null or trim(p_player2_name) = '' then
    raise exception 'player names are required';
  end if;

  -- trava a categoria para serializar a contagem de vagas com outras inscricoes/cancelamentos concorrentes
  perform 1 from public.tournament_categories where id = p_tournament_category_id for update;

  select count(*) into v_confirmed_count
  from public.registrations
  where tournament_category_id = p_tournament_category_id and status = 'confirmed';

  if v_confirmed_count < v_category.slots_limit then
    v_status := 'confirmed';
  else
    v_status := 'waitlist';
  end if;

  insert into public.registrations (
    tournament_id, tournament_category_id, user_id, player1_name, player2_name, status
  ) values (
    v_tournament.id, p_tournament_category_id, auth.uid(), trim(p_player1_name), trim(p_player2_name), v_status
  )
  returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.register_team(uuid, text, text) to authenticated;

-- edita os nomes dos jogadores de uma inscricao (dono ou admin)
create or replace function public.update_registration(
  p_registration_id uuid,
  p_player1_name text,
  p_player2_name text
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reg public.registrations;
  v_result public.registrations;
begin
  select * into v_reg from public.registrations where id = p_registration_id;
  if v_reg is null then
    raise exception 'registration not found';
  end if;

  if v_reg.user_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if p_player1_name is null or trim(p_player1_name) = ''
     or p_player2_name is null or trim(p_player2_name) = '' then
    raise exception 'player names are required';
  end if;

  update public.registrations
    set player1_name = trim(p_player1_name), player2_name = trim(p_player2_name)
    where id = p_registration_id
    returning * into v_result;

  return v_result;
end;
$$;

grant execute on function public.update_registration(uuid, text, text) to authenticated;

-- cancela/remove uma inscricao (dono ou admin) e promove o proximo da lista de espera
create or replace function public.cancel_registration(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reg public.registrations;
  v_next_id uuid;
begin
  select * into v_reg from public.registrations where id = p_registration_id;
  if v_reg is null then
    raise exception 'registration not found';
  end if;

  if v_reg.user_id <> auth.uid() and not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  perform 1 from public.tournament_categories where id = v_reg.tournament_category_id for update;

  delete from public.registrations where id = p_registration_id;

  if v_reg.status = 'confirmed' then
    select id into v_next_id
    from public.registrations
    where tournament_category_id = v_reg.tournament_category_id and status = 'waitlist'
    order by created_at asc
    limit 1;

    if v_next_id is not null then
      update public.registrations set status = 'confirmed' where id = v_next_id;
    end if;
  end if;
end;
$$;

grant execute on function public.cancel_registration(uuid) to authenticated;

-- ============ VIEWS DE APOIO ============
create view public.category_slot_counts
with (security_invoker = true) as
select
  tc.id as tournament_category_id,
  tc.tournament_id,
  tc.category,
  tc.slots_limit,
  count(r.id) filter (where r.status = 'confirmed') as confirmed_count,
  count(r.id) filter (where r.status = 'waitlist') as waitlist_count
from public.tournament_categories tc
left join public.registrations r on r.tournament_category_id = tc.id
group by tc.id, tc.tournament_id, tc.category, tc.slots_limit;

-- ============ COMO VIRAR ADMIN ============
-- 1. Crie sua conta normalmente pelo site (cadastro com email/senha).
-- 2. No painel Supabase > Authentication > Users, copie o UUID do seu usuario.
-- 3. Rode (trocando o UUID):
--    insert into public.admin_roles (user_id) values ('COLE-SEU-UUID-AQUI');

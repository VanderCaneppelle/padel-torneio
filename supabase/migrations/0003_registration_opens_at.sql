-- Rode isso no SQL Editor do Supabase (projeto ja existente).
alter table public.tournaments add column registration_opens_at timestamptz;

-- atualiza a funcao de inscricao pra tambem respeitar a data de abertura agendada
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

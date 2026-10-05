-- Rode isso no SQL Editor do Supabase (projeto ja existente).
-- Funcao pro admin editar o limite de vagas de uma categoria, promovendo da
-- lista de espera (se o limite aumentou) ou devolvendo pra lista de espera
-- as duplas mais recentes (se o limite diminuiu), sempre respeitando ordem
-- de chegada.
create or replace function public.admin_update_category_slots(
  p_category_id uuid,
  p_new_limit int
)
returns public.tournament_categories
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category public.tournament_categories;
  v_confirmed_count int;
  v_id uuid;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if p_new_limit < 1 then
    raise exception 'limit must be at least 1';
  end if;

  perform 1 from public.tournament_categories where id = p_category_id for update;

  select * into v_category from public.tournament_categories where id = p_category_id;
  if v_category is null then
    raise exception 'category not found';
  end if;

  update public.tournament_categories set slots_limit = p_new_limit where id = p_category_id;

  select count(*) into v_confirmed_count
  from public.registrations
  where tournament_category_id = p_category_id and status = 'confirmed';

  if v_confirmed_count < p_new_limit then
    for v_id in
      select id from public.registrations
      where tournament_category_id = p_category_id and status = 'waitlist'
      order by created_at asc
      limit (p_new_limit - v_confirmed_count)
    loop
      update public.registrations set status = 'confirmed' where id = v_id;
    end loop;
  elsif v_confirmed_count > p_new_limit then
    for v_id in
      select id from public.registrations
      where tournament_category_id = p_category_id and status = 'confirmed'
      order by created_at desc
      limit (v_confirmed_count - p_new_limit)
    loop
      update public.registrations set status = 'waitlist' where id = v_id;
    end loop;
  end if;

  select * into v_category from public.tournament_categories where id = p_category_id;
  return v_category;
end;
$$;

grant execute on function public.admin_update_category_slots(uuid, int) to authenticated;

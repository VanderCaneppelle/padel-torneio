-- Script de teste: cria 8 duplas fake no torneio criado mais recentemente,
-- na categoria com menor limite de vagas (pra ver confirmados + lista de espera).
-- Rode no SQL Editor do Supabase. Pode rodar de novo pra adicionar outras 8
-- duplas fake (os emails usam um sufixo aleatório, não vai colidir).
do $$
declare
  v_tournament_id uuid;
  v_category_id uuid;
  v_slots_limit int;
  v_confirmed_count int;
  v_user_id uuid;
  v_status text;
  v_suffix text := substr(md5(random()::text), 1, 6);
  pairs text[] := array[
    'Carlos Silva,Bruno Costa',
    'Marina Alves,Paula Souza',
    'Rafael Lima,Diego Martins',
    'Fernanda Rocha,Juliana Dias',
    'Gustavo Pereira,Lucas Ferreira',
    'Camila Santos,Beatriz Gomes',
    'Thiago Almeida,Rodrigo Barros',
    'Larissa Castro,Amanda Teixeira'
  ];
  v_pair text;
  v_p1 text;
  v_p2 text;
begin
  select id into v_tournament_id from public.tournaments order by created_at desc limit 1;
  if v_tournament_id is null then
    raise exception 'nenhum torneio encontrado';
  end if;

  select id, slots_limit into v_category_id, v_slots_limit
  from public.tournament_categories
  where tournament_id = v_tournament_id
  order by slots_limit asc
  limit 1;

  if v_category_id is null then
    raise exception 'esse torneio nao tem categoria cadastrada';
  end if;

  for i in 1..8 loop
    v_pair := pairs[i];
    v_p1 := split_part(v_pair, ',', 1);
    v_p2 := split_part(v_pair, ',', 2);
    v_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
      'fake' || i || '-' || v_suffix || '@quoracup.test',
      crypt('fakepassword123', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', v_p1),
      now(), now()
    );

    select count(*) into v_confirmed_count
    from public.registrations
    where tournament_category_id = v_category_id and status = 'confirmed';

    v_status := case when v_confirmed_count < v_slots_limit then 'confirmed' else 'waitlist' end;

    insert into public.registrations (
      tournament_id, tournament_category_id, user_id, player1_name, player2_name, status
    ) values (
      v_tournament_id, v_category_id, v_user_id, v_p1, v_p2, v_status
    );
  end loop;
end $$;

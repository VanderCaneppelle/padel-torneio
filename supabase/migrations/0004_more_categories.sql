-- Rode isso no SQL Editor do Supabase (projeto ja existente).
-- Adiciona as categorias 7a, 3a e 2a (antes so existia 6a, 5a, 4a).
alter table public.tournament_categories
  drop constraint tournament_categories_category_check;

alter table public.tournament_categories
  add constraint tournament_categories_category_check
  check (category in ('7a', '6a', '5a', '4a', '3a', '2a'));

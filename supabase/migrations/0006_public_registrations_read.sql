-- Rode isso no SQL Editor do Supabase (projeto ja existente).
-- Antes, so dava pra ver a propria inscricao (ou ser admin). Agora qualquer
-- usuario logado pode ver a lista de duplas inscritas em qualquer torneio
-- (como uma lista de chamada normal), mesmo sem ter se inscrito.
drop policy "registrations_select_own_or_admin" on public.registrations;

create policy "registrations_select_authenticated"
  on public.registrations for select
  using (auth.uid() is not null);

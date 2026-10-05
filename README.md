# QuoraCup Padel — inscrições de torneios

App de cadastro de duplas para os torneios semanais de padel. Next.js (App
Router) + Supabase (auth + banco) + Vercel.

## Funcionalidades

- **Atleta**: cria conta (email/senha), vê torneios com inscrições abertas,
  escolhe categoria (6ª, 5ª, 4ª) e se inscreve informando jogador 1 e jogador
  2. Se a categoria estiver cheia, entra na lista de espera automaticamente.
  Pode editar ou cancelar a própria inscrição (uma por torneio); ao cancelar,
  o próximo da lista de espera assume a vaga.
- **Admin**: cria torneios, define categorias e limite de vagas de cada uma,
  encerra inscrições manualmente ou agenda data/hora de encerramento, e pode
  editar/remover a inscrição de qualquer pessoa.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) logado com `quoracup@gmail.com`
   e crie um novo projeto.
2. Vá em **SQL Editor**, cole todo o conteúdo de
   [`supabase/schema.sql`](supabase/schema.sql) e rode.
3. Em **Project Settings > API**, copie a **Project URL** e a
   **anon public key**.
4. Em **Authentication > Providers**, confira se "Email" está habilitado.
   Se quiser pular a confirmação de email por enquanto (mais rápido para
   testar), desative "Confirm email" em **Authentication > Sign In / Providers**.

## 2. Configurar o projeto localmente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com a URL e a anon key copiadas:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000), clique em "Cadastre-se" e
crie sua conta.

## 3. Virar admin

1. No painel Supabase, vá em **Authentication > Users** e copie o UUID da sua
   conta recém-criada.
2. No **SQL Editor**, rode (trocando o UUID):

```sql
insert into public.admin_roles (user_id) values ('COLE-SEU-UUID-AQUI');
```

3. Recarregue a página no navegador — um link "Admin" aparece na navegação.

## 4. Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Importe o projeto na Vercel.
3. Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) em **Project Settings > Environment
   Variables**.
4. Deploy.

## Estrutura

- `supabase/schema.sql` — tabelas, RLS e as funções que controlam vaga/lista
  de espera (`register_team`, `update_registration`, `cancel_registration`).
- `src/app/torneios` — área do atleta.
- `src/app/admin` — área do admin (protegida por `admin_roles`).
- `src/lib/supabase` — clients Supabase (browser, server, proxy/middleware de
  sessão).

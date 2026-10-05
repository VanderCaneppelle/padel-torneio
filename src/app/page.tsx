import Link from "next/link";
import { DiagonalLines } from "@/components/diagonal-lines";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES,
  getTournamentPhase,
  type Tournament,
  type TournamentCategory,
} from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(10)
    .returns<Tournament[]>();

  const list = tournaments ?? [];
  const proximos = list.filter((t) => getTournamentPhase(t) !== "closed").slice(0, 3);
  const recentes = list.filter((t) => getTournamentPhase(t) === "closed").slice(0, 3);

  const { data: allCategories } = await supabase
    .from("tournament_categories")
    .select("*")
    .in(
      "tournament_id",
      proximos.map((t) => t.id)
    )
    .order("category", { ascending: false })
    .returns<TournamentCategory[]>();

  const categoriesByTournament = new Map<string, TournamentCategory[]>();
  for (const c of allCategories ?? []) {
    const arr = categoriesByTournament.get(c.tournament_id) ?? [];
    arr.push(c);
    categoriesByTournament.set(c.tournament_id, arr);
  }

  return (
    <div className="flex flex-col">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-60" />
        <div className="relative z-10 mx-auto grid max-w-5xl gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="flex flex-col items-start">
            <p className="eyebrow text-xs">Padel · torneios semanais</p>
            <h1 className="heading-xl mt-3 text-4xl sm:text-5xl">
              Inscreva sua dupla nos torneios da QuoraCup
            </h1>
            <p className="mt-5 max-w-xl text-base text-fg-muted">
              Escolha sua categoria, informe os dois jogadores e garanta sua vaga. Se a
              categoria lotar, você entra automaticamente na lista de espera — e se alguém
              cancelar, a próxima dupla assume o lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn btn-primary">
                Criar conta
              </Link>
              <Link href="/login" className="btn btn-outline">
                Entrar
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {proximos.length > 0 && (
              <div className="card flex flex-col gap-1 p-6">
                <p className="heading text-sm text-fg-muted">Próximos torneios</p>
                {proximos.map((t) => {
                  const phase = getTournamentPhase(t);
                  const cats = categoriesByTournament.get(t.id) ?? [];
                  return (
                    <Link key={t.id} href="/login" className="info-row group flex-col !items-start gap-2">
                      <div className="flex w-full items-center justify-between">
                        <span className="font-display text-base uppercase tracking-tight group-hover:text-accent">
                          {t.name}
                        </span>
                        <span className={`badge ${phase === "open" ? "badge-accent" : ""}`}>
                          {phase === "open" ? "aberto" : "em breve"}
                        </span>
                      </div>
                      <span className="text-xs text-fg-muted">
                        {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        {phase === "scheduled" &&
                          t.registration_opens_at &&
                          ` · inscrições abrem em ${new Date(t.registration_opens_at).toLocaleString("pt-BR")}`}
                      </span>
                      {cats.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {cats.map((c) => (
                            <span key={c.id} className="badge">
                              {c.category.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {recentes.length > 0 && (
              <div className="card flex flex-col gap-1 p-6">
                <p className="heading text-sm text-fg-muted">Torneios recentes</p>
                {recentes.map((t) => (
                  <Link key={t.id} href="/login" className="info-row group">
                    <span>
                      <span className="block font-display text-base uppercase tracking-tight group-hover:text-accent">
                        {t.name}
                      </span>
                      <span className="text-xs text-fg-muted">
                        {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </span>
                    <span className="badge">encerrado</span>
                  </Link>
                ))}
              </div>
            )}

            {proximos.length === 0 && recentes.length === 0 && (
              <div className="card p-6">
                <p className="text-sm text-fg-muted">Nenhum torneio cadastrado ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-3xl gap-4 px-6 py-16 sm:grid-cols-3">
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">Categorias</p>
          <p className="text-sm text-fg-muted">
            De {CATEGORIES[CATEGORIES.length - 1].toUpperCase()} à{" "}
            {CATEGORIES[0].toUpperCase()}, pra todo nível de jogo.
          </p>
        </div>
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">
            Lista de espera
          </p>
          <p className="text-sm text-fg-muted">
            Categoria lotada não é problema — sua dupla entra na fila automaticamente.
          </p>
        </div>
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">
            Você no controle
          </p>
          <p className="text-sm text-fg-muted">
            Edite os jogadores ou cancele sua inscrição quando quiser, direto pelo site.
          </p>
        </div>
      </div>
    </div>
  );
}

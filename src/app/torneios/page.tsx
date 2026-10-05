import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DiagonalLines } from "@/components/diagonal-lines";
import { getTournamentPhase, type Tournament } from "@/lib/types";

export default async function TorneiosPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: true })
    .returns<Tournament[]>();

  const list = tournaments ?? [];
  const abertos = list.filter((t) => getTournamentPhase(t) === "open");
  const emBreve = list.filter((t) => getTournamentPhase(t) === "scheduled");
  const encerrados = list.filter((t) => getTournamentPhase(t) === "closed");

  return (
    <div className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-50" />
        <div className="relative z-10 mx-auto max-w-5xl px-5 py-12">
          <p className="eyebrow text-xs">Padel · torneios semanais</p>
          <h1 className="heading-xl mt-2 text-4xl">Torneios</h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-16">
        <section className="flex flex-col gap-4">
          <h2 className="heading text-sm text-fg-muted">Inscrições abertas</h2>
          {abertos.length === 0 && (
            <p className="text-sm text-fg-muted">
              Nenhum torneio com inscrições abertas no momento.
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2">
            {abertos.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/torneios/${t.id}`}
                  className="card group flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
                >
                  <span>
                    <span className="block font-display text-lg uppercase tracking-tight">
                      {t.name}
                    </span>
                    <span className="text-sm text-fg-muted">
                      {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </span>
                  <span className="badge badge-accent">aberto</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {emBreve.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="heading text-sm text-fg-muted">Em breve</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {emBreve.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/torneios/${t.id}`}
                    className="card flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
                  >
                    <span>
                      <span className="block font-display text-lg uppercase tracking-tight">
                        {t.name}
                      </span>
                      <span className="text-sm text-fg-muted">
                        {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        {t.registration_opens_at &&
                          ` · abre em ${new Date(t.registration_opens_at).toLocaleString("pt-BR")}`}
                      </span>
                    </span>
                    <span className="badge">em breve</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {encerrados.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="heading text-sm text-fg-muted">Encerrados</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {encerrados.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/torneios/${t.id}`}
                    className="card flex items-center justify-between px-5 py-4 opacity-70 transition-opacity hover:opacity-100"
                  >
                    <span>
                      <span className="block font-display text-lg uppercase tracking-tight">
                        {t.name}
                      </span>
                      <span className="text-sm text-fg-muted">
                        {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </span>
                    <span className="badge">encerrado</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

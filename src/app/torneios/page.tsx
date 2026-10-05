import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isTournamentOpen, type Tournament } from "@/lib/types";

export default async function TorneiosPage() {
  const supabase = await createClient();

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: true })
    .returns<Tournament[]>();

  const list = tournaments ?? [];
  const abertos = list.filter(isTournamentOpen);
  const encerrados = list.filter((t) => !isTournamentOpen(t));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <h1 className="text-2xl font-semibold">Torneios</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Inscrições abertas</h2>
        {abertos.length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum torneio com inscrições abertas no momento.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {abertos.map((t) => (
            <li key={t.id}>
              <Link
                href={`/torneios/${t.id}`}
                className="block rounded border border-black/15 px-4 py-3 hover:bg-black/[.03] dark:border-white/20 dark:hover:bg-white/[.06]"
              >
                <span className="font-medium">{t.name}</span>{" "}
                <span className="text-sm text-black/60 dark:text-white/60">
                  — {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {encerrados.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Encerrados</h2>
          <ul className="flex flex-col gap-2">
            {encerrados.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/torneios/${t.id}`}
                  className="block rounded border border-black/10 px-4 py-3 text-black/60 hover:bg-black/[.03] dark:border-white/10 dark:text-white/60 dark:hover:bg-white/[.06]"
                >
                  <span className="font-medium">{t.name}</span>{" "}
                  <span className="text-sm">
                    — {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

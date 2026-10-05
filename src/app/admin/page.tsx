import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Tournament } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: false })
    .returns<Tournament[]>();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Torneios</h1>
        <Link
          href="/admin/torneios/novo"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Novo torneio
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {(tournaments ?? []).map((t) => (
          <li key={t.id}>
            <Link
              href={`/admin/torneios/${t.id}`}
              className="flex items-center justify-between rounded border border-black/15 px-4 py-3 hover:bg-black/[.03] dark:border-white/20 dark:hover:bg-white/[.06]"
            >
              <span>
                <span className="font-medium">{t.name}</span>{" "}
                <span className="text-sm text-black/60 dark:text-white/60">
                  {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                </span>
              </span>
              <span className="text-sm text-black/60 dark:text-white/60">
                {t.status === "open" ? "aberto" : "encerrado"}
              </span>
            </Link>
          </li>
        ))}
        {(tournaments ?? []).length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">Nenhum torneio cadastrado.</p>
        )}
      </ul>
    </div>
  );
}

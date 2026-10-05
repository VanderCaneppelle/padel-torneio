import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DiagonalLines } from "@/components/diagonal-lines";
import type { Tournament } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("event_date", { ascending: false })
    .returns<Tournament[]>();

  return (
    <div className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-50" />
        <div className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-12">
          <div>
            <p className="eyebrow text-xs">Painel admin</p>
            <h1 className="heading-xl mt-2 text-4xl">Torneios</h1>
          </div>
          <Link href="/admin/torneios/novo" className="btn btn-primary">
            Novo torneio
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 pb-16">
        <ul className="flex flex-col gap-3">
          {(tournaments ?? []).map((t) => (
            <li key={t.id}>
              <Link
                href={`/admin/torneios/${t.id}`}
                className="card flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
              >
                <span>
                  <span className="block font-display text-lg uppercase tracking-tight">{t.name}</span>
                  <span className="text-sm text-fg-muted">
                    {new Date(t.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </span>
                <span className={`badge ${t.status === "open" ? "badge-accent" : ""}`}>
                  {t.status === "open" ? "aberto" : "encerrado"}
                </span>
              </Link>
            </li>
          ))}
          {(tournaments ?? []).length === 0 && (
            <p className="text-sm text-fg-muted">Nenhum torneio cadastrado.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

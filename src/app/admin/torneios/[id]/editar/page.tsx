import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tournament, TournamentCategory } from "@/lib/types";
import { EditarTorneioDetail } from "./editar-torneio-detail";

export default async function EditarTorneioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tournament }, { data: categories }] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).maybeSingle<Tournament>(),
    supabase
      .from("tournament_categories")
      .select("*")
      .eq("tournament_id", id)
      .order("category", { ascending: false })
      .returns<TournamentCategory[]>(),
  ]);

  if (!tournament) notFound();

  return <EditarTorneioDetail tournament={tournament} categories={categories ?? []} />;
}

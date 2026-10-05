import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Registration, Tournament, TournamentCategory } from "@/lib/types";
import { AdminTorneioDetail } from "./admin-torneio-detail";

export default async function AdminTorneioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tournament }, { data: categories }, { data: registrations }] = await Promise.all([
    supabase.from("tournaments").select("*").eq("id", id).maybeSingle<Tournament>(),
    supabase
      .from("tournament_categories")
      .select("*")
      .eq("tournament_id", id)
      .order("category", { ascending: false })
      .returns<TournamentCategory[]>(),
    supabase
      .from("registrations")
      .select("*")
      .eq("tournament_id", id)
      .order("created_at", { ascending: true })
      .returns<Registration[]>(),
  ]);

  if (!tournament) notFound();

  return (
    <AdminTorneioDetail
      tournament={tournament}
      categories={categories ?? []}
      registrations={registrations ?? []}
    />
  );
}

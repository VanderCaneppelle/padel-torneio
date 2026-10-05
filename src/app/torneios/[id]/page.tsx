import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { CategorySlotCount, Registration, Tournament } from "@/lib/types";
import { TorneioDetail } from "./torneio-detail";

export default async function TorneioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: tournament }, { data: slotCounts }, { data: registrations }, { data: profile }] =
    await Promise.all([
      supabase.from("tournaments").select("*").eq("id", id).maybeSingle<Tournament>(),
      supabase
        .from("category_slot_counts")
        .select("*")
        .eq("tournament_id", id)
        .order("category", { ascending: false })
        .returns<CategorySlotCount[]>(),
      supabase
        .from("registrations")
        .select("*")
        .eq("tournament_id", id)
        .order("created_at", { ascending: true })
        .returns<Registration[]>(),
      user
        ? supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!tournament) notFound();

  const myRegistration = user
    ? (registrations ?? []).find((r) => r.user_id === user.id) ?? null
    : null;

  return (
    <TorneioDetail
      tournament={tournament}
      slotCounts={slotCounts ?? []}
      registrations={registrations ?? []}
      myRegistration={myRegistration}
      defaultPlayer1Name={profile?.full_name ?? ""}
    />
  );
}

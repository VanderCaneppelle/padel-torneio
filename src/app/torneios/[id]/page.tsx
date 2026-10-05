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

  const [{ data: tournament }, { data: slotCounts }, { data: myRegistration }, { data: profile }] =
    await Promise.all([
      supabase.from("tournaments").select("*").eq("id", id).maybeSingle<Tournament>(),
      supabase
        .from("category_slot_counts")
        .select("*")
        .eq("tournament_id", id)
        .order("category", { ascending: false })
        .returns<CategorySlotCount[]>(),
      user
        ? supabase
            .from("registrations")
            .select("*")
            .eq("tournament_id", id)
            .eq("user_id", user.id)
            .maybeSingle<Registration>()
        : Promise.resolve({ data: null }),
      user
        ? supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  if (!tournament) notFound();

  return (
    <TorneioDetail
      tournament={tournament}
      slotCounts={slotCounts ?? []}
      myRegistration={myRegistration ?? null}
      defaultPlayer1Name={profile?.full_name ?? ""}
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";
import {
  getTournamentPhase,
  type CategorySlotCount,
  type Registration,
  type Tournament,
} from "@/lib/types";

export function TorneioDetail({
  tournament,
  slotCounts,
  myRegistration,
  defaultPlayer1Name,
}: {
  tournament: Tournament;
  slotCounts: CategorySlotCount[];
  myRegistration: Registration | null;
  defaultPlayer1Name: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const phase = getTournamentPhase(tournament);
  const open = phase === "open";

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    slotCounts[0]?.tournament_category_id ?? ""
  );
  const [player1, setPlayer1] = useState(defaultPlayer1Name);
  const [player2, setPlayer2] = useState("");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const myCategory = myRegistration
    ? slotCounts.find((c) => c.tournament_category_id === myRegistration.tournament_category_id)
    : null;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.rpc("register_team", {
      p_tournament_category_id: selectedCategoryId,
      p_player1_name: player1,
      p_player2_name: player2,
    });

    setLoading(false);
    if (error) {
      setError(
        error.message.includes("duplicate key")
          ? "Você já está inscrito nesse torneio."
          : "Não foi possível fazer a inscrição. Tente novamente."
      );
      return;
    }

    router.refresh();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!myRegistration) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.rpc("update_registration", {
      p_registration_id: myRegistration.id,
      p_player1_name: player1,
      p_player2_name: player2,
    });

    setLoading(false);
    if (error) {
      setError("Não foi possível salvar as alterações.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleCancel() {
    if (!myRegistration) return;
    if (!confirm("Cancelar sua inscrição nesse torneio?")) return;
    setError(null);
    setLoading(true);

    const { error } = await supabase.rpc("cancel_registration", {
      p_registration_id: myRegistration.id,
    });

    setLoading(false);
    if (error) {
      setError("Não foi possível cancelar a inscrição.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-50" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          <p className="eyebrow text-xs">
            {new Date(tournament.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
          <h1 className="heading-xl mt-2 text-3xl sm:text-4xl">{tournament.name}</h1>
          <span className={`badge mt-3 ${open ? "badge-accent" : ""}`}>
            {phase === "open"
              ? "inscrições abertas"
              : phase === "scheduled"
                ? `inscrições abrem em ${new Date(tournament.registration_opens_at!).toLocaleString("pt-BR")}`
                : "inscrições encerradas"}
          </span>
          {tournament.description && (
            <p className="mt-4 max-w-xl text-sm text-fg-muted">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-16">
        <section className="flex flex-col gap-3">
          <h2 className="heading text-sm text-fg-muted">Categorias</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {slotCounts.map((c) => (
              <li key={c.tournament_category_id} className="card flex items-center justify-between px-5 py-3">
                <span className="font-display text-lg uppercase">{c.category}</span>
                <span className="text-sm text-fg-muted">
                  {c.confirmed_count}/{c.slots_limit} vagas
                  {c.waitlist_count > 0 && ` · ${c.waitlist_count} na espera`}
                </span>
              </li>
            ))}
            {slotCounts.length === 0 && (
              <p className="text-sm text-fg-muted">Nenhuma categoria cadastrada ainda.</p>
            )}
          </ul>
        </section>

        {error && <p className="text-sm text-danger">{error}</p>}

        {myRegistration ? (
          <section className="card flex flex-col gap-4 p-6">
            <div>
              <h2 className="heading text-sm text-fg-muted">Sua inscrição</h2>
              <p className="mt-1 text-sm">
                Categoria: <strong className="text-accent">{myCategory?.category}</strong> ·{" "}
                {myRegistration.status === "confirmed" ? "confirmada" : "na lista de espera"}
              </p>
            </div>

            {editing ? (
              <form onSubmit={handleEdit} className="flex flex-col gap-3">
                <PlayersFields player1={player1} player2={player2} setPlayer1={setPlayer1} setPlayer2={setPlayer2} />
                <div className="flex gap-2">
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    Salvar
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-outline">
                    Cancelar edição
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-sm text-fg-muted">
                  Jogador 1: <span className="text-fg">{myRegistration.player1_name}</span>
                  <br />
                  Jogador 2: <span className="text-fg">{myRegistration.player2_name}</span>
                </p>
                {open && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPlayer1(myRegistration.player1_name);
                        setPlayer2(myRegistration.player2_name);
                        setEditing(true);
                      }}
                      className="btn btn-outline"
                    >
                      Editar
                    </button>
                    <button onClick={handleCancel} disabled={loading} className="btn btn-danger">
                      Cancelar inscrição
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ) : open && slotCounts.length > 0 ? (
          <section className="card flex flex-col gap-4 p-6">
            <h2 className="heading text-sm text-fg-muted">Inscrever dupla</h2>
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <label className="label">
                Categoria
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="input"
                >
                  {slotCounts.map((c) => (
                    <option key={c.tournament_category_id} value={c.tournament_category_id}>
                      {c.category} ({c.confirmed_count}/{c.slots_limit} vagas)
                    </option>
                  ))}
                </select>
              </label>
              <PlayersFields player1={player1} player2={player2} setPlayer1={setPlayer1} setPlayer2={setPlayer2} />
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Inscrevendo..." : "Inscrever"}
              </button>
            </form>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function PlayersFields({
  player1,
  player2,
  setPlayer1,
  setPlayer2,
}: {
  player1: string;
  player2: string;
  setPlayer1: (v: string) => void;
  setPlayer2: (v: string) => void;
}) {
  return (
    <>
      <label className="label">
        Jogador 1
        <input required value={player1} onChange={(e) => setPlayer1(e.target.value)} className="input" />
      </label>
      <label className="label">
        Jogador 2
        <input required value={player2} onChange={(e) => setPlayer2(e.target.value)} className="input" />
      </label>
    </>
  );
}

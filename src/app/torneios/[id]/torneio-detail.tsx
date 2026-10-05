"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  isTournamentOpen,
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
  const open = isTournamentOpen(tournament);

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
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold">{tournament.name}</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          {new Date(tournament.event_date + "T00:00:00").toLocaleDateString("pt-BR")} ·{" "}
          {open ? "inscrições abertas" : "inscrições encerradas"}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Categorias</h2>
        <ul className="flex flex-col gap-2">
          {slotCounts.map((c) => (
            <li
              key={c.tournament_category_id}
              className="flex items-center justify-between rounded border border-black/10 px-4 py-2 dark:border-white/15"
            >
              <span className="font-medium">{c.category}</span>
              <span className="text-sm text-black/60 dark:text-white/60">
                {c.confirmed_count}/{c.slots_limit} vagas
                {c.waitlist_count > 0 && ` · ${c.waitlist_count} na lista de espera`}
              </span>
            </li>
          ))}
          {slotCounts.length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">
              Nenhuma categoria cadastrada ainda.
            </p>
          )}
        </ul>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {myRegistration ? (
        <section className="flex flex-col gap-3 rounded border border-black/15 p-4 dark:border-white/20">
          <h2 className="text-lg font-medium">Sua inscrição</h2>
          <p className="text-sm">
            Categoria: <strong>{myCategory?.category}</strong> ·{" "}
            {myRegistration.status === "confirmed" ? "confirmada" : "na lista de espera"}
          </p>

          {editing ? (
            <form onSubmit={handleEdit} className="flex flex-col gap-3">
              <PlayersFields player1={player1} player2={player2} setPlayer1={setPlayer1} setPlayer2={setPlayer2} />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded border border-black/15 px-4 py-2 text-sm dark:border-white/20"
                >
                  Cancelar edição
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm">
                Jogador 1: {myRegistration.player1_name}
                <br />
                Jogador 2: {myRegistration.player2_name}
              </p>
              {open && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPlayer1(myRegistration.player1_name);
                      setPlayer2(myRegistration.player2_name);
                      setEditing(true);
                    }}
                    className="rounded border border-black/15 px-4 py-2 text-sm dark:border-white/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="rounded border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                  >
                    Cancelar inscrição
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      ) : open && slotCounts.length > 0 ? (
        <section className="flex flex-col gap-3 rounded border border-black/15 p-4 dark:border-white/20">
          <h2 className="text-lg font-medium">Inscrever dupla</h2>
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Categoria
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
              >
                {slotCounts.map((c) => (
                  <option key={c.tournament_category_id} value={c.tournament_category_id}>
                    {c.category} ({c.confirmed_count}/{c.slots_limit} vagas)
                  </option>
                ))}
              </select>
            </label>
            <PlayersFields player1={player1} player2={player2} setPlayer1={setPlayer1} setPlayer2={setPlayer2} />
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {loading ? "Inscrevendo..." : "Inscrever"}
            </button>
          </form>
        </section>
      ) : null}
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
      <label className="flex flex-col gap-1 text-sm">
        Jogador 1
        <input
          required
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Jogador 2
        <input
          required
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
        />
      </label>
    </>
  );
}

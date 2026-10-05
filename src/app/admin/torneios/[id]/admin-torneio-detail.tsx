"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Registration, Tournament, TournamentCategory } from "@/lib/types";

export function AdminTorneioDetail({
  tournament,
  categories,
  registrations,
}: {
  tournament: Tournament;
  categories: TournamentCategory[];
  registrations: Registration[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editP1, setEditP1] = useState("");
  const [editP2, setEditP2] = useState("");

  async function closeNow() {
    setLoading(true);
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "closed" })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível encerrar o torneio.");
    else router.refresh();
  }

  async function reopen() {
    setLoading(true);
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "open", scheduled_close_at: null })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível reabrir o torneio.");
    else router.refresh();
  }

  async function scheduleClose() {
    if (!scheduledAt) return;
    setLoading(true);
    const iso = new Date(scheduledAt).toISOString();
    const { error } = await supabase
      .from("tournaments")
      .update({ scheduled_close_at: iso })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível agendar o encerramento.");
    else router.refresh();
  }

  async function removeSchedule() {
    setLoading(true);
    const { error } = await supabase
      .from("tournaments")
      .update({ scheduled_close_at: null })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível remover o agendamento.");
    else router.refresh();
  }

  async function saveEdit(registrationId: string) {
    setLoading(true);
    const { error } = await supabase.rpc("update_registration", {
      p_registration_id: registrationId,
      p_player1_name: editP1,
      p_player2_name: editP2,
    });
    setLoading(false);
    if (error) {
      setError("Não foi possível salvar a edição.");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function removeRegistration(registrationId: string) {
    if (!confirm("Remover essa inscrição? O próximo da lista de espera (se houver) assume a vaga.")) return;
    setLoading(true);
    const { error } = await supabase.rpc("cancel_registration", {
      p_registration_id: registrationId,
    });
    setLoading(false);
    if (error) {
      setError("Não foi possível remover a inscrição.");
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
          {tournament.status === "open" ? "aberto" : "encerrado manualmente"}
          {tournament.scheduled_close_at &&
            ` · encerra em ${new Date(tournament.scheduled_close_at).toLocaleString("pt-BR")}`}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="flex flex-col gap-3 rounded border border-black/15 p-4 dark:border-white/20">
        <h2 className="text-lg font-medium">Inscrições</h2>
        <div className="flex flex-wrap items-center gap-2">
          {tournament.status === "open" ? (
            <button
              onClick={closeNow}
              disabled={loading}
              className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-50"
            >
              Encerrar agora
            </button>
          ) : (
            <button
              onClick={reopen}
              disabled={loading}
              className="rounded border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
            >
              Reabrir inscrições
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
          />
          <button
            onClick={scheduleClose}
            disabled={loading || !scheduledAt}
            className="rounded border border-black/15 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/20"
          >
            Agendar encerramento
          </button>
          {tournament.scheduled_close_at && (
            <button
              onClick={removeSchedule}
              disabled={loading}
              className="rounded border border-black/15 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-white/20"
            >
              Remover agendamento
            </button>
          )}
        </div>
      </section>

      {categories.map((cat) => {
        const regs = registrations.filter((r) => r.tournament_category_id === cat.id);
        const confirmed = regs.filter((r) => r.status === "confirmed");
        const waitlist = regs.filter((r) => r.status === "waitlist");

        return (
          <section key={cat.id} className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">
              {cat.category}{" "}
              <span className="text-sm font-normal text-black/60 dark:text-white/60">
                ({confirmed.length}/{cat.slots_limit} vagas
                {waitlist.length > 0 && `, ${waitlist.length} na lista de espera`})
              </span>
            </h2>

            <RegList
              title="Confirmados"
              regs={confirmed}
              editingId={editingId}
              editP1={editP1}
              editP2={editP2}
              setEditP1={setEditP1}
              setEditP2={setEditP2}
              onStartEdit={(r) => {
                setEditingId(r.id);
                setEditP1(r.player1_name);
                setEditP2(r.player2_name);
              }}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={saveEdit}
              onRemove={removeRegistration}
              loading={loading}
            />

            {waitlist.length > 0 && (
              <RegList
                title="Lista de espera"
                regs={waitlist}
                editingId={editingId}
                editP1={editP1}
                editP2={editP2}
                setEditP1={setEditP1}
                setEditP2={setEditP2}
                onStartEdit={(r) => {
                  setEditingId(r.id);
                  setEditP1(r.player1_name);
                  setEditP2(r.player2_name);
                }}
                onCancelEdit={() => setEditingId(null)}
                onSaveEdit={saveEdit}
                onRemove={removeRegistration}
                loading={loading}
              />
            )}
          </section>
        );
      })}
    </div>
  );
}

function RegList({
  title,
  regs,
  editingId,
  editP1,
  editP2,
  setEditP1,
  setEditP2,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onRemove,
  loading,
}: {
  title: string;
  regs: Registration[];
  editingId: string | null;
  editP1: string;
  editP2: string;
  setEditP1: (v: string) => void;
  setEditP2: (v: string) => void;
  onStartEdit: (r: Registration) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onRemove: (id: string) => void;
  loading: boolean;
}) {
  if (regs.length === 0) {
    return <p className="text-sm text-black/60 dark:text-white/60">{title}: nenhuma dupla.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-black/70 dark:text-white/70">{title}</span>
      <ul className="flex flex-col gap-2">
        {regs.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded border border-black/10 px-4 py-2 dark:border-white/15"
          >
            {editingId === r.id ? (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={editP1}
                  onChange={(e) => setEditP1(e.target.value)}
                  className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
                />
                <input
                  value={editP2}
                  onChange={(e) => setEditP2(e.target.value)}
                  className="rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => onSaveEdit(r.id)}
                    disabled={loading}
                    className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="rounded border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-sm">
                  {r.player1_name} / {r.player2_name}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => onStartEdit(r)} className="text-sm underline">
                    Editar
                  </button>
                  <button
                    onClick={() => onRemove(r.id)}
                    disabled={loading}
                    className="text-sm text-red-600 underline disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

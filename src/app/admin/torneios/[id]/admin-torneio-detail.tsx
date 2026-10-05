"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";
import { BackLink } from "@/components/back-link";
import { getTournamentPhase, type Registration, type Tournament, type TournamentCategory } from "@/lib/types";

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
  const phase = getTournamentPhase(tournament);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [opensAt, setOpensAt] = useState("");
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

  async function scheduleOpen() {
    if (!opensAt) return;
    setLoading(true);
    const iso = new Date(opensAt).toISOString();
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "open", registration_opens_at: iso })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível agendar a abertura.");
    else router.refresh();
  }

  async function openNow() {
    setLoading(true);
    const { error } = await supabase
      .from("tournaments")
      .update({ status: "open", registration_opens_at: null })
      .eq("id", tournament.id);
    setLoading(false);
    if (error) setError("Não foi possível abrir as inscrições agora.");
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
    <div className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-50" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          <BackLink href="/admin" label="Torneios" />
          <p className="eyebrow mt-4 text-xs">
            {new Date(tournament.event_date + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
          <h1 className="heading-xl mt-2 text-3xl sm:text-4xl">{tournament.name}</h1>
          <p className="mt-3 text-sm text-fg-muted">
            {phase === "open" ? (
              <span className="badge badge-accent">aberto</span>
            ) : phase === "scheduled" ? (
              <span className="badge">abre em breve</span>
            ) : (
              <span className="badge">
                inscrições encerradas{tournament.status === "closed" ? " manualmente" : ""}
              </span>
            )}
            {tournament.registration_opens_at &&
              ` · abre em ${new Date(tournament.registration_opens_at).toLocaleString("pt-BR")}`}
            {tournament.scheduled_close_at &&
              ` · encerra em ${new Date(tournament.scheduled_close_at).toLocaleString("pt-BR")}`}
          </p>
          {tournament.description && (
            <p className="mt-4 max-w-xl text-sm text-fg-muted">{tournament.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-16">
        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="card flex flex-col gap-5 p-6">
          <h2 className="heading text-sm text-fg-muted">Controle de inscrições</h2>

          {phase !== "open" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Abertura
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                  className="input !py-1.5 text-sm"
                />
                <button onClick={scheduleOpen} disabled={loading || !opensAt} className="btn btn-outline">
                  Agendar abertura
                </button>
                <button onClick={openNow} disabled={loading} className="btn btn-outline">
                  Abrir agora
                </button>
              </div>
            </div>
          )}

          {phase !== "closed" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                Encerramento
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={closeNow} disabled={loading} className="btn btn-danger">
                  Encerrar agora
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input !py-1.5 text-sm"
                />
                <button
                  onClick={scheduleClose}
                  disabled={loading || !scheduledAt}
                  className="btn btn-outline"
                >
                  Agendar encerramento
                </button>
                {tournament.scheduled_close_at && (
                  <button onClick={removeSchedule} disabled={loading} className="btn btn-outline">
                    Remover agendamento
                  </button>
                )}
              </div>
            </div>
          )}

        </section>

        {categories.map((cat) => {
          const regs = registrations.filter((r) => r.tournament_category_id === cat.id);
          const confirmed = regs.filter((r) => r.status === "confirmed");
          const waitlist = regs.filter((r) => r.status === "waitlist");

          return (
            <section key={cat.id} className="flex flex-col gap-3">
              <h2 className="heading flex items-baseline gap-2 text-sm">
                <span className="text-accent">{cat.category}</span>
                <span className="font-sans text-xs font-normal normal-case tracking-normal text-fg-muted">
                  {confirmed.length}/{cat.slots_limit} vagas
                  {waitlist.length > 0 && `, ${waitlist.length} na lista de espera`}
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
    return <p className="text-sm text-fg-muted">{title}: nenhuma dupla.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{title}</span>
      <ul className="flex flex-col gap-2">
        {regs.map((r) => (
          <li key={r.id} className="card flex items-center justify-between gap-3 px-4 py-3">
            {editingId === r.id ? (
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={editP1}
                  onChange={(e) => setEditP1(e.target.value)}
                  className="input !py-1.5 text-sm"
                />
                <input
                  value={editP2}
                  onChange={(e) => setEditP2(e.target.value)}
                  className="input !py-1.5 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => onSaveEdit(r.id)}
                    disabled={loading}
                    className="btn btn-primary !px-3 !py-1.5 text-xs"
                  >
                    Salvar
                  </button>
                  <button onClick={onCancelEdit} className="btn btn-outline !px-3 !py-1.5 text-xs">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-sm">
                  {r.player1_name} / {r.player2_name}
                </span>
                <div className="flex gap-3">
                  <button onClick={() => onStartEdit(r)} className="text-xs font-medium text-fg-muted hover:text-fg">
                    Editar
                  </button>
                  <button
                    onClick={() => onRemove(r.id)}
                    disabled={loading}
                    className="text-xs font-medium text-danger hover:underline disabled:opacity-50"
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

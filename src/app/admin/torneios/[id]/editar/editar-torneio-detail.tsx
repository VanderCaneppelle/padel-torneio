"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";
import { BackLink } from "@/components/back-link";
import {
  CATEGORIES,
  toDatetimeLocalValue,
  type Category,
  type Tournament,
  type TournamentCategory,
} from "@/lib/types";

export function EditarTorneioDetail({
  tournament,
  categories,
}: {
  tournament: Tournament;
  categories: TournamentCategory[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(tournament.name);
  const [description, setDescription] = useState(tournament.description ?? "");
  const [eventDate, setEventDate] = useState(tournament.event_date);
  const [registrationOpensAt, setRegistrationOpensAt] = useState(() =>
    toDatetimeLocalValue(tournament.registration_opens_at)
  );
  const [limits, setLimits] = useState<Record<string, string>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, String(c.slots_limit)]))
  );
  const [newSelected, setNewSelected] = useState<Record<Category, boolean>>({
    "7a": false,
    "6a": false,
    "5a": false,
    "4a": false,
    "3a": false,
    "2a": false,
  });
  const [newLimits, setNewLimits] = useState<Record<Category, string>>({
    "7a": "8",
    "6a": "8",
    "5a": "8",
    "4a": "8",
    "3a": "8",
    "2a": "8",
  });
  const [error, setError] = useState<string | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [addingCategories, setAddingCategories] = useState(false);

  const usedCategories = new Set(categories.map((c) => c.category));
  const availableToAdd = CATEGORIES.filter((c) => !usedCategories.has(c));

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavingInfo(true);

    const { error } = await supabase
      .from("tournaments")
      .update({
        name,
        description: description.trim() || null,
        event_date: eventDate,
        registration_opens_at: registrationOpensAt
          ? new Date(registrationOpensAt).toISOString()
          : null,
      })
      .eq("id", tournament.id);

    setSavingInfo(false);
    if (error) {
      setError("Não foi possível salvar os dados do torneio.");
      return;
    }
    router.refresh();
  }

  async function handleSaveLimit(categoryId: string) {
    const newLimit = Number(limits[categoryId]);
    if (!newLimit || newLimit < 1) {
      setError("O limite de vagas precisa ser pelo menos 1.");
      return;
    }
    setError(null);
    setSavingCategoryId(categoryId);

    const { error } = await supabase.rpc("admin_update_category_slots", {
      p_category_id: categoryId,
      p_new_limit: newLimit,
    });

    setSavingCategoryId(null);
    if (error) {
      setError("Não foi possível atualizar o limite de vagas.");
      return;
    }
    router.refresh();
  }

  async function handleAddCategories() {
    const selected = availableToAdd.filter((c) => newSelected[c]);
    if (selected.length === 0) return;
    if (selected.some((c) => !newLimits[c] || Number(newLimits[c]) < 1)) {
      setError("Informe o limite de vagas de cada categoria marcada.");
      return;
    }

    setError(null);
    setAddingCategories(true);

    const { error } = await supabase.from("tournament_categories").insert(
      selected.map((category) => ({
        tournament_id: tournament.id,
        category,
        slots_limit: Number(newLimits[category]),
      }))
    );

    setAddingCategories(false);
    if (error) {
      setError("Não foi possível adicionar as categorias.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-50" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          <BackLink href={`/admin/torneios/${tournament.id}`} label="Voltar" />
          <p className="eyebrow mt-4 text-xs">Painel admin</p>
          <h1 className="heading-xl mt-2 text-3xl sm:text-4xl">Editar torneio</h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-16">
        {error && <p className="text-sm text-danger">{error}</p>}

        <section className="card flex flex-col gap-4 p-6">
          <h2 className="heading text-sm text-fg-muted">Dados do torneio</h2>
          <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
            <label className="label">
              Nome
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </label>
            <label className="label">
              Observações
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input resize-none"
              />
            </label>
            <label className="label">
              Data
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="input"
              />
            </label>
            <label className="label">
              Abertura das inscrições (opcional)
              <input
                type="datetime-local"
                value={registrationOpensAt}
                onChange={(e) => setRegistrationOpensAt(e.target.value)}
                className="input"
              />
            </label>
            <button type="submit" disabled={savingInfo} className="btn btn-primary self-start">
              {savingInfo ? "Salvando..." : "Salvar dados"}
            </button>
          </form>
        </section>

        <section className="card flex flex-col gap-4 p-6">
          <h2 className="heading text-sm text-fg-muted">Vagas por categoria</h2>
          <p className="text-sm text-fg-muted">
            Ao mudar o limite, as duplas da lista de espera são confirmadas automaticamente (se
            aumentar) ou as mais recentes voltam pra lista de espera (se diminuir).
          </p>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <div key={c.id} className="option-chip">
                <span className="font-display text-sm uppercase tracking-wide">{c.category}</span>
                <input
                  type="number"
                  min={1}
                  value={limits[c.id] ?? ""}
                  onChange={(e) => setLimits((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  className="input !ml-auto !w-20 !py-1.5"
                />
                <button
                  onClick={() => handleSaveLimit(c.id)}
                  disabled={savingCategoryId === c.id || limits[c.id] === String(c.slots_limit)}
                  className="btn btn-outline !px-3 !py-1.5 text-xs"
                >
                  {savingCategoryId === c.id ? "Salvando..." : "Salvar"}
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-fg-muted">Nenhuma categoria cadastrada ainda.</p>
            )}
          </div>
        </section>

        {availableToAdd.length > 0 && (
          <section className="card flex flex-col gap-4 p-6">
            <h2 className="heading text-sm text-fg-muted">Adicionar categoria</h2>
            <div className="flex flex-col gap-2">
              {availableToAdd.map((cat) => (
                <label key={cat} className="option-chip cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSelected[cat]}
                    onChange={(e) =>
                      setNewSelected((prev) => ({ ...prev, [cat]: e.target.checked }))
                    }
                  />
                  <span className="font-display text-sm uppercase tracking-wide">{cat}</span>
                  {newSelected[cat] && (
                    <input
                      type="number"
                      min={1}
                      value={newLimits[cat]}
                      onChange={(e) =>
                        setNewLimits((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      className="input !ml-auto !w-20 !py-1.5"
                    />
                  )}
                </label>
              ))}
            </div>
            <button
              onClick={handleAddCategories}
              disabled={addingCategories || !availableToAdd.some((c) => newSelected[c])}
              className="btn btn-primary self-start"
            >
              {addingCategories ? "Adicionando..." : "Adicionar categoria(s)"}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

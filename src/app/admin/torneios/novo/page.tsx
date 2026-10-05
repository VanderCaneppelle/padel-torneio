"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";
import { CATEGORIES, type Category } from "@/lib/types";

export default function NovoTorneioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registrationOpensAt, setRegistrationOpensAt] = useState("");
  const [limits, setLimits] = useState<Record<Category, string>>({
    "6a": "",
    "5a": "",
    "4a": "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleCategory(cat: Category, enabled: boolean) {
    setLimits((prev) => ({ ...prev, [cat]: enabled ? "8" : "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const selected = CATEGORIES.filter((c) => limits[c] !== "");
    if (selected.length === 0) {
      setError("Selecione ao menos uma categoria.");
      return;
    }

    setLoading(true);

    const { data: tournament, error: tError } = await supabase
      .from("tournaments")
      .insert({
        name,
        description: description.trim() || null,
        event_date: eventDate,
        registration_opens_at: registrationOpensAt
          ? new Date(registrationOpensAt).toISOString()
          : null,
      })
      .select()
      .single();

    if (tError || !tournament) {
      setLoading(false);
      setError("Não foi possível criar o torneio.");
      return;
    }

    const { error: cError } = await supabase.from("tournament_categories").insert(
      selected.map((category) => ({
        tournament_id: tournament.id,
        category,
        slots_limit: Number(limits[category]),
      }))
    );

    setLoading(false);

    if (cError) {
      setError("Torneio criado, mas falhou ao salvar categorias.");
      return;
    }

    router.push(`/admin/torneios/${tournament.id}`);
  }

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-start justify-center overflow-hidden px-4 py-16">
      <DiagonalLines className="opacity-40" />
      <div className="card relative z-10 w-full max-w-sm p-8">
        <p className="eyebrow text-xs">Painel admin</p>
        <h1 className="heading-xl mt-1 text-3xl">Novo torneio</h1>
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="label">
            Nome
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Torneio semanal #12"
              className="input"
            />
          </label>
          <label className="label">
            Observações (opcional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: levar bolinha, confirmação até sexta, etc."
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
          <p className="-mt-2 text-xs text-fg-muted">
            Deixe em branco para abrir as inscrições assim que o torneio for criado.
          </p>

          <div className="flex flex-col gap-2">
            <span className="label">Categorias e limite de vagas</span>
            {CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={limits[cat] !== ""}
                    onChange={(e) => toggleCategory(cat, e.target.checked)}
                    className="accent-accent"
                  />
                  {cat}
                </label>
                {limits[cat] !== "" && (
                  <input
                    type="number"
                    min={1}
                    value={limits[cat]}
                    onChange={(e) => setLimits((prev) => ({ ...prev, [cat]: e.target.value }))}
                    className="input !w-20 !py-1.5 text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Criando..." : "Criar torneio"}
          </button>
        </form>
      </div>
    </div>
  );
}

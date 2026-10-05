"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Category } from "@/lib/types";

export default function NovoTorneioPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
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
      .insert({ name, event_date: eventDate })
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
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-10">
      <h1 className="text-2xl font-semibold">Novo torneio</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nome
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Torneio semanal #12"
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Data
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded border border-black/15 px-3 py-2 dark:border-white/20"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Categorias e limite de vagas</span>
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={limits[cat] !== ""}
                  onChange={(e) => toggleCategory(cat, e.target.checked)}
                />
                {cat}
              </label>
              {limits[cat] !== "" && (
                <input
                  type="number"
                  min={1}
                  value={limits[cat]}
                  onChange={(e) => setLimits((prev) => ({ ...prev, [cat]: e.target.value }))}
                  className="w-20 rounded border border-black/15 px-2 py-1 text-sm dark:border-white/20"
                />
              )}
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Criando..." : "Criar torneio"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não são iguais.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(
        "Não foi possível redefinir a senha. O link pode ter expirado — peça um novo."
      );
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
        <DiagonalLines className="opacity-60" />
        <div className="card relative z-10 w-full max-w-sm p-8">
          <p className="eyebrow text-xs">Tudo certo</p>
          <h1 className="heading-xl mt-1 text-2xl">Senha redefinida</h1>
          <p className="mt-4 text-sm text-fg-muted">
            Sua senha foi alterada com sucesso.
          </p>
          <Link
            href="/torneios"
            className="btn btn-primary mt-6 inline-flex"
            onClick={() => router.refresh()}
          >
            Ver torneios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
      <DiagonalLines className="opacity-60" />
      <div className="card relative z-10 w-full max-w-sm p-8">
        <p className="eyebrow text-xs">Recuperar acesso</p>
        <h1 className="heading-xl mt-1 text-3xl">Nova senha</h1>
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="label">
            Nova senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            Confirmar nova senha
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/torneios");
    router.refresh();
  }

  return (
    <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
      <DiagonalLines className="opacity-60" />
      <div className="card relative z-10 w-full max-w-sm p-8">
        <p className="eyebrow text-xs">Bem-vindo de volta</p>
        <h1 className="heading-xl mt-1 text-3xl">Entrar</h1>
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="label">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            Senha
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          <Link href="/esqueci-senha" className="-mt-2 self-end text-xs text-fg-muted hover:text-accent">
            Esqueci minha senha
          </Link>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm text-fg-muted">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-accent hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

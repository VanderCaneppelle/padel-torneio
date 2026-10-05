"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setLoading(false);

    if (error) {
      setError("Não foi possível enviar o email. Tente novamente.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
        <DiagonalLines className="opacity-60" />
        <div className="card relative z-10 w-full max-w-sm p-8">
          <p className="eyebrow text-xs">Verifique seu email</p>
          <h1 className="heading-xl mt-1 text-2xl">Link enviado</h1>
          <p className="mt-4 text-sm text-fg-muted">
            Se <strong className="text-fg">{email}</strong> tiver uma conta, enviamos um link
            pra redefinir a senha. Abra o email e clique no link.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
            Voltar pro login
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
        <h1 className="heading-xl mt-1 text-3xl">Esqueci minha senha</h1>
        <p className="mt-3 text-sm text-fg-muted">
          Informe o email da sua conta. Vamos te mandar um link pra escolher uma senha nova.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Enviando..." : "Enviar link"}
          </button>
        </form>
        <p className="mt-6 text-sm text-fg-muted">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

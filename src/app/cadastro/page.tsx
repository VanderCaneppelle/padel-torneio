"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DiagonalLines } from "@/components/diagonal-lines";
import { formatPhoneBR } from "@/lib/format";

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "needs-confirmation" | "done">("form");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: phone.trim() } },
    });

    setLoading(false);

    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Esse email já tem cadastro. Faça login."
          : "Não foi possível criar sua conta. Tente novamente."
      );
      return;
    }

    if (!data.session) {
      setStep("needs-confirmation");
      return;
    }

    setStep("done");
    router.refresh();
  }

  if (step === "needs-confirmation") {
    return (
      <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
        <DiagonalLines className="opacity-60" />
        <div className="card relative z-10 w-full max-w-sm p-8">
          <p className="eyebrow text-xs">Quase lá</p>
          <h1 className="heading-xl mt-1 text-2xl">Confirme seu email</h1>
          <p className="mt-4 text-sm text-fg-muted">
            Enviamos um link de confirmação para <strong className="text-fg">{email}</strong>.
            Abra o email e confirme para poder entrar.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:underline">
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="relative isolate flex min-h-[calc(100dvh-69px)] items-center justify-center overflow-hidden px-4 py-16">
        <DiagonalLines className="opacity-60" />
        <div className="card relative z-10 w-full max-w-sm p-8">
          <p className="eyebrow text-xs">Tudo certo</p>
          <h1 className="heading-xl mt-1 text-2xl">Cadastro completo</h1>
          <p className="mt-4 text-sm text-fg-muted">
            Sua conta foi criada com sucesso. Você já pode acessar os torneios.
          </p>
          <Link href="/torneios" className="btn btn-primary mt-6 inline-flex">
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
        <p className="eyebrow text-xs">Primeira vez por aqui</p>
        <h1 className="heading-xl mt-1 text-3xl">Criar conta</h1>
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <label className="label">
            Nome completo
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </label>
          <label className="label">
            WhatsApp
            <input
              type="tel"
              required
              inputMode="numeric"
              placeholder="(11) 91234-5678"
              value={phone}
              onChange={(e) => setPhone(formatPhoneBR(e.target.value))}
              maxLength={15}
              className="input"
            />
          </label>
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="mt-6 text-sm text-fg-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

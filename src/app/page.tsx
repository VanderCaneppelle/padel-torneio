import Link from "next/link";
import { DiagonalLines } from "@/components/diagonal-lines";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="relative isolate overflow-hidden border-b border-border bg-bg-soft">
        <DiagonalLines className="opacity-60" />
        <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-start px-6 py-20 sm:py-28">
          <p className="eyebrow text-xs">Padel · torneios semanais</p>
          <h1 className="heading-xl mt-3 text-4xl sm:text-5xl">
            Inscreva sua dupla nos torneios da QuoraCup
          </h1>
          <p className="mt-5 max-w-xl text-base text-fg-muted">
            Escolha sua categoria, informe os dois jogadores e garanta sua vaga. Se a
            categoria lotar, você entra automaticamente na lista de espera — e se alguém
            cancelar, a próxima dupla assume o lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/cadastro" className="btn btn-primary">
              Criar conta
            </Link>
            <Link href="/login" className="btn btn-outline">
              Entrar
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-3xl gap-4 px-6 py-16 sm:grid-cols-3">
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">Categorias</p>
          <p className="text-sm text-fg-muted">
            De {CATEGORIES[CATEGORIES.length - 1].toUpperCase()} à{" "}
            {CATEGORIES[0].toUpperCase()}, pra todo nível de jogo.
          </p>
        </div>
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">
            Lista de espera
          </p>
          <p className="text-sm text-fg-muted">
            Categoria lotada não é problema — sua dupla entra na fila automaticamente.
          </p>
        </div>
        <div className="card flex flex-col gap-2 p-6">
          <p className="font-display text-sm uppercase tracking-wide text-accent">
            Você no controle
          </p>
          <p className="text-sm text-fg-muted">
            Edite os jogadores ou cancele sua inscrição quando quiser, direto pelo site.
          </p>
        </div>
      </div>
    </div>
  );
}

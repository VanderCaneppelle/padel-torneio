"use client";

import { useState } from "react";

export function ShareButton({ title, path }: { title: string; path?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = path ? `${window.location.origin}${path}` : window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // usuário cancelou o compartilhamento, não faz nada
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard indisponível, ignora silenciosamente
    }
  }

  return (
    <button onClick={handleShare} className="btn btn-outline">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M11.5 5a1.75 1.75 0 1 0-1.69-2.2L5.6 5.02a1.75 1.75 0 1 0 0 1.96l4.21 2.22a1.75 1.75 0 1 0 .5-.94L6.1 6.04a1.76 1.76 0 0 0 0-.08l4.21-2.22c.3.17.65.26 1.19.26Z"
          fill="currentColor"
        />
      </svg>
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}

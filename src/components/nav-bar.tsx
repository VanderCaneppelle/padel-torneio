"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function NavBar() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
      if (user) {
        const { data } = await supabase
          .from("admin_roles")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
    }
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/torneios" className="font-semibold">
          QuoraCup Padel
        </Link>
        {email && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/torneios">Torneios</Link>
            {isAdmin && <Link href="/admin">Admin</Link>}
            <span className="text-black/50 dark:text-white/50">{email}</span>
            <button onClick={handleLogout} className="underline">
              Sair
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

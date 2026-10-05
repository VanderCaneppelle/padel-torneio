"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
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

  if (!email) {
    return (
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/torneios">
            <Logo />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-border bg-bg-soft">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/torneios">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/torneios"
            className={`eyebrow text-xs transition-colors hover:text-fg ${
              pathname?.startsWith("/torneios") ? "text-accent" : ""
            }`}
          >
            Torneios
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`eyebrow text-xs transition-colors hover:text-fg ${
                pathname?.startsWith("/admin") ? "text-accent" : ""
              }`}
            >
              Admin
            </Link>
          )}
          <span className="hidden text-sm text-fg-muted sm:inline">{email}</span>
          <button onClick={handleLogout} className="btn btn-outline !px-3 !py-1.5 text-xs">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}

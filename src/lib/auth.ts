import { createClient } from "@/lib/supabase/server";

export async function getSessionInfo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false, fullName: null as string | null };
  }

  const [{ data: adminRow }, { data: profile }] = await Promise.all([
    supabase.from("admin_roles").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  return {
    supabase,
    user,
    isAdmin: !!adminRow,
    fullName: profile?.full_name ?? null,
  };
}

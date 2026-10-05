import { redirect } from "next/navigation";
import { getSessionInfo } from "@/lib/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { isAdmin } = await getSessionInfo();

  if (!isAdmin) {
    redirect("/torneios");
  }

  return <div>{children}</div>;
}

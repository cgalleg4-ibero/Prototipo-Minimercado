import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) redirect("/");

  return (
    <AdminShell userName={session.userName || "Administrador"}>
      {children}
    </AdminShell>
  );
}

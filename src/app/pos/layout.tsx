import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { requireSession } from "@/lib/session";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      <header className="sticky top-0 z-20 border-b border-emerald-900/10 bg-emerald-950 text-emerald-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/90">
              Minimercado · POS
            </p>
            <p className="truncate text-sm text-emerald-100">
              <strong>{session.userName}</strong>
              <span className="text-emerald-300/80"> · {session.role}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {session.role === "admin" ? (
              <Link
                href="/admin"
                className="rounded-lg border border-emerald-700 px-2.5 py-1.5 text-xs hover:bg-emerald-900 sm:text-sm"
              >
                Admin
              </Link>
            ) : null}
            <LogoutButton label="Salir" variant="dark" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </div>
  );
}

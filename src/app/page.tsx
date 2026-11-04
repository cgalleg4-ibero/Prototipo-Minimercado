import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/LoginPanel";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  if (session.userId && session.role === "admin") {
    redirect("/admin");
  }
  if (session.userId && session.role === "cajero") {
    redirect("/pos");
  }

  const cashiers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.role, "cajero"), eq(users.active, true)))
    .orderBy(asc(users.name));

  const [admin] = await db
    .select({ name: users.name })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.active, true)))
    .limit(1);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-700/80">
            Sistema de caja
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            MINIMERCADO POS
          </h1>
        </div>

        <LoginPanel
          cashiers={cashiers}
          adminName={admin?.name || "Administrador"}
        />
      </div>
    </main>
  );
}

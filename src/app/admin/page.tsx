import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import {
  expiryBadgeClass,
  expiryLabel,
  getExpiryStatus,
} from "@/lib/expiry";
import { formatCOP, formatDateOnly } from "@/lib/format";
import { getReportSummary } from "@/lib/reports";

export default async function AdminDashboardPage() {
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const summary = await getReportSummary(from, from);

  const catalog = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.name));

  const alerts = catalog
    .map((product) => ({
      ...product,
      status: getExpiryStatus(product.expiresAt),
    }))
    .filter((p) => p.status === "expired" || p.status === "warning")
    .slice(0, 8);

  const lowStock = catalog.filter((p) => p.stock <= 5).slice(0, 8);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Resumen del día y alertas de inventario.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi title="Ingresos hoy" value={formatCOP(summary.ingresos)} />
        <Kpi title="Egresos hoy" value={formatCOP(summary.egresos)} />
        <Kpi title="Ganancia neta" value={formatCOP(summary.gananciaNeta)} />
        <Kpi title="Ventas hoy" value={String(summary.ventasCount)} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Alertas de caducidad</h2>
            <Link href="/admin/inventario" className="text-sm text-emerald-700">
              Ver inventario
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {!alerts.length ? (
              <li className="text-sm text-slate-500">Sin alertas por ahora.</li>
            ) : (
              alerts.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      Vence: {formatDateOnly(item.expiresAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${expiryBadgeClass(item.status)}`}
                  >
                    {expiryLabel(item.status)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Stock bajo (≤ 5)</h2>
          <ul className="mt-4 space-y-3">
            {!lowStock.length ? (
              <li className="text-sm text-slate-500">Sin productos en stock bajo.</li>
            ) : (
              lowStock.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-amber-700">{item.stock} und</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-sm sm:p-5">
      <p className="text-xs text-slate-500 sm:text-sm">{title}</p>
      <p className="mt-1.5 text-lg font-semibold text-slate-900 sm:mt-2 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

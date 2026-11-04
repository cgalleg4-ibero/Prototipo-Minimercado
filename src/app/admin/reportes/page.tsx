import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import {
  expiryBadgeClass,
  expiryLabel,
  getExpiryStatus,
} from "@/lib/expiry";
import { formatCOP, formatDate, formatDateOnly } from "@/lib/format";
import {
  getMovementsInRange,
  getReportSummary,
  getSalesInRange,
} from "@/lib/reports";

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from =
    params.from ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);
  const to = params.to || new Date().toISOString().slice(0, 10);

  const summary = await getReportSummary(from, to);
  const salesRows = await getSalesInRange(from, to);
  const movements = await getMovementsInRange(from, to);
  const stock = await db
    .select()
    .from(products)
    .where(eq(products.active, true))
    .orderBy(asc(products.name));

  const salesCsv = [
    "recibo,fecha,cajero,total,costo,ganancia",
    ...salesRows.map((s) =>
      [
        s.receiptNumber,
        s.createdAt.toISOString(),
        s.userName,
        s.total,
        s.costTotal,
        Number(s.total) - Number(s.costTotal),
      ].join(","),
    ),
  ].join("\n");

  const gainsCsv = [
    "desde,hasta,ingresos,cogs,egresos,ganancia_bruta,ganancia_neta,ventas",
    [
      from,
      to,
      summary.ingresos,
      summary.cogs,
      summary.egresos,
      summary.gananciaBruta,
      summary.gananciaNeta,
      summary.ventasCount,
    ].join(","),
  ].join("\n");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Reportes
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Ingresos, egresos, ganancias, stock y movimiento de productos.
        </p>
      </header>

      <form className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="text-sm">
          Desde
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Hasta
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="mt-1 block rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Filtrar
        </button>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(salesCsv)}`}
          download={`ventas-${from}-${to}.csv`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Exportar ventas CSV
        </a>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(gainsCsv)}`}
          download={`ganancias-${from}-${to}.csv`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
        >
          Exportar ganancias CSV
        </a>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Ingresos" value={formatCOP(summary.ingresos)} />
        <Kpi label="COGS" value={formatCOP(summary.cogs)} />
        <Kpi label="Egresos" value={formatCOP(summary.egresos)} />
        <Kpi label="Ganancia bruta" value={formatCOP(summary.gananciaBruta)} />
        <Kpi label="Ganancia neta" value={formatCOP(summary.gananciaNeta)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Ventas del periodo</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">Recibo</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Cajero</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {salesRows.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-100">
                  <td className="px-3 py-2">{sale.receiptNumber}</td>
                  <td className="px-3 py-2">{formatDate(sale.createdAt)}</td>
                  <td className="px-3 py-2">{sale.userName}</td>
                  <td className="px-3 py-2">{formatCOP(sale.total)}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/pos/recibo/${sale.id}`}
                      className="text-emerald-700"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Stock actual</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {stock.map((p) => {
              const status = getExpiryStatus(p.expiresAt);
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.stock} und · vence {formatDateOnly(p.expiresAt)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${expiryBadgeClass(status)}`}
                  >
                    {expiryLabel(status)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Movimiento de productos</h2>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {movements.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <div className="flex justify-between gap-2">
                  <span className="font-medium">{m.productName}</span>
                  <span
                    className={
                      m.delta >= 0 ? "text-emerald-700" : "text-red-700"
                    }
                  >
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {m.reason} · {m.userName} · {formatDate(m.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

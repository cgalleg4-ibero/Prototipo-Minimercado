import { desc } from "drizzle-orm";
import { createExpense, deleteExpense } from "@/actions/expenses";
import { db } from "@/lib/db";
import { expenses, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatCOP, formatDate } from "@/lib/format";

export default async function EgresosPage() {
  const rows = await db
    .select({
      id: expenses.id,
      concept: expenses.concept,
      amount: expenses.amount,
      createdAt: expenses.createdAt,
      userName: users.name,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.userId, users.id))
    .orderBy(desc(expenses.createdAt));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Egresos
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Gastos operativos del negocio (arriendo, servicios, etc.).
        </p>
      </header>

      <form
        action={createExpense}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3"
      >
        <input
          name="concept"
          required
          placeholder="Concepto"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <input
          name="amount"
          required
          type="number"
          min="1"
          step="1"
          placeholder="Monto"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white sm:col-span-3 sm:w-fit"
        >
          Registrar egreso
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Concepto</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Registró</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">{row.concept}</td>
                <td className="px-4 py-3">{formatCOP(row.amount)}</td>
                <td className="px-4 py-3">{row.userName}</td>
                <td className="px-4 py-3">
                  <form action={deleteExpense.bind(null, row.id)}>
                    <button type="submit" className="text-xs text-red-600">
                      Eliminar
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

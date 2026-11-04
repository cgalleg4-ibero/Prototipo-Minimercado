import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  expenses,
  products,
  saleItems,
  sales,
  stockMovements,
  users,
} from "@/lib/db/schema";
import { toNumber } from "@/lib/format";

export function parseDateRange(from?: string, to?: string) {
  const start = from
    ? new Date(`${from}T00:00:00`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = to
    ? new Date(`${to}T23:59:59.999`)
    : new Date();
  return { start, end };
}

export async function getReportSummary(from?: string, to?: string) {
  const { start, end } = parseDateRange(from, to);

  const [salesAgg] = await db
    .select({
      ingresos: sql<string>`coalesce(sum(${sales.total}), 0)`,
      cogs: sql<string>`coalesce(sum(${sales.costTotal}), 0)`,
      count: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));

  const [expenseAgg] = await db
    .select({
      egresos: sql<string>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(gte(expenses.createdAt, start), lte(expenses.createdAt, end)));

  const ingresos = toNumber(salesAgg?.ingresos);
  const cogs = toNumber(salesAgg?.cogs);
  const egresos = toNumber(expenseAgg?.egresos);
  const gananciaBruta = ingresos - cogs;
  const gananciaNeta = gananciaBruta - egresos;

  return {
    start,
    end,
    ingresos,
    cogs,
    egresos,
    gananciaBruta,
    gananciaNeta,
    ventasCount: Number(salesAgg?.count || 0),
  };
}

export async function getSalesInRange(from?: string, to?: string) {
  const { start, end } = parseDateRange(from, to);
  return db
    .select({
      id: sales.id,
      receiptNumber: sales.receiptNumber,
      total: sales.total,
      costTotal: sales.costTotal,
      createdAt: sales.createdAt,
      userName: users.name,
    })
    .from(sales)
    .innerJoin(users, eq(sales.userId, users.id))
    .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)))
    .orderBy(desc(sales.createdAt));
}

export async function getMovementsInRange(from?: string, to?: string) {
  const { start, end } = parseDateRange(from, to);
  return db
    .select({
      id: stockMovements.id,
      delta: stockMovements.delta,
      reason: stockMovements.reason,
      createdAt: stockMovements.createdAt,
      productName: products.name,
      sku: products.sku,
      userName: users.name,
    })
    .from(stockMovements)
    .innerJoin(products, eq(stockMovements.productId, products.id))
    .innerJoin(users, eq(stockMovements.userId, users.id))
    .where(
      and(
        gte(stockMovements.createdAt, start),
        lte(stockMovements.createdAt, end),
      ),
    )
    .orderBy(desc(stockMovements.createdAt));
}

export async function getSaleDetail(saleId: string) {
  const [sale] = await db
    .select({
      id: sales.id,
      receiptNumber: sales.receiptNumber,
      total: sales.total,
      costTotal: sales.costTotal,
      createdAt: sales.createdAt,
      userName: users.name,
    })
    .from(sales)
    .innerJoin(users, eq(sales.userId, users.id))
    .where(eq(sales.id, saleId))
    .limit(1);

  if (!sale) return null;

  const items = await db
    .select({
      id: saleItems.id,
      qty: saleItems.qty,
      unitPrice: saleItems.unitPrice,
      unitCost: saleItems.unitCost,
      productName: products.name,
      sku: products.sku,
    })
    .from(saleItems)
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.saleId, saleId));

  return { sale, items };
}

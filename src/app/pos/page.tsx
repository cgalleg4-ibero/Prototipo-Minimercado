import { and, asc, eq, gt, gte, isNull, or } from "drizzle-orm";
import { PosClient } from "@/components/PosClient";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";

export default async function PosPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const catalog = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      salePrice: products.salePrice,
      stock: products.stock,
    })
    .from(products)
    .where(
      and(
        eq(products.active, true),
        gt(products.stock, 0),
        or(isNull(products.expiresAt), gte(products.expiresAt, startOfToday)),
      ),
    )
    .orderBy(asc(products.name));

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-xl font-semibold text-slate-900 sm:text-xl">
          Punto de venta
        </h1>
      </header>
      <PosClient products={catalog} />
    </div>
  );
}

"use server";

import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, saleItems, sales, stockMovements } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";

export type CartItemInput = {
  productId: string;
  qty: number;
};

export async function checkoutSale(items: CartItemInput[]) {
  const session = await requireSession();
  if (!session) {
    return { error: "Sesión no válida." };
  }

  if (!items.length) {
    return { error: "El carrito está vacío." };
  }

  const normalized = items
    .map((item) => ({
      productId: item.productId,
      qty: Math.floor(Number(item.qty)),
    }))
    .filter((item) => item.productId && item.qty > 0);

  if (!normalized.length) {
    return { error: "Cantidades inválidas." };
  }

  try {
    const saleId = await db.transaction(async (tx) => {
      let total = 0;
      let costTotal = 0;
      const lines: {
        productId: string;
        qty: number;
        unitPrice: string;
        unitCost: string;
      }[] = [];

      for (const item of normalized) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (!product || !product.active) {
          throw new Error("Producto no disponible.");
        }

        const result = await tx.execute(sql`
          UPDATE products
          SET stock = stock - ${item.qty}
          WHERE id = ${item.productId} AND stock >= ${item.qty} AND active = true
          RETURNING id
        `);

        if (!result.count && !(Array.isArray(result) && result.length)) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}.`,
          );
        }

        const unitPrice = Number(product.salePrice);
        const unitCost = Number(product.costPrice);
        total += unitPrice * item.qty;
        costTotal += unitCost * item.qty;
        lines.push({
          productId: product.id,
          qty: item.qty,
          unitPrice: product.salePrice,
          unitCost: product.costPrice,
        });

        await tx.insert(stockMovements).values({
          id: nanoid(),
          productId: product.id,
          delta: -item.qty,
          reason: "venta",
          userId: session.userId,
        });
      }

      const id = nanoid();
      const receiptNumber = `RC-${Date.now().toString().slice(-8)}`;

      await tx.insert(sales).values({
        id,
        userId: session.userId,
        total: total.toFixed(2),
        costTotal: costTotal.toFixed(2),
        receiptNumber,
      });

      await tx.insert(saleItems).values(
        lines.map((line) => ({
          id: nanoid(),
          saleId: id,
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          unitCost: line.unitCost,
        })),
      );

      return id;
    });

    revalidatePath("/pos");
    revalidatePath("/admin");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/reportes");
    return { ok: true, saleId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error al registrar la venta.",
    };
  }
}

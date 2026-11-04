"use server";

import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { products, stockMovements } from "@/lib/db/schema";
import { requireAdmin, requireSession } from "@/lib/session";

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const sku = String(formData.get("sku") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const costPrice = String(formData.get("costPrice") || "0");
  const salePrice = String(formData.get("salePrice") || "0");
  const stock = Number(formData.get("stock") || 0);
  const expiresRaw = String(formData.get("expiresAt") || "");

  if (!sku || !name || !category) return;

  const id = nanoid();
  await db.insert(products).values({
    id,
    sku,
    name,
    category,
    costPrice,
    salePrice,
    stock: Number.isFinite(stock) ? stock : 0,
    expiresAt: expiresRaw ? new Date(expiresRaw) : null,
    active: true,
  });

  if (stock > 0) {
    await db.insert(stockMovements).values({
      id: nanoid(),
      productId: id,
      delta: stock,
      reason: "entrada",
      userId: admin.userId,
    });
  }

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}

export async function updateProduct(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = String(formData.get("id") || "");
  const sku = String(formData.get("sku") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const costPrice = String(formData.get("costPrice") || "0");
  const salePrice = String(formData.get("salePrice") || "0");
  const expiresRaw = String(formData.get("expiresAt") || "");
  const active = String(formData.get("active") || "true") === "true";

  if (!id || !sku || !name) return;

  await db
    .update(products)
    .set({
      sku,
      name,
      category,
      costPrice,
      salePrice,
      expiresAt: expiresRaw ? new Date(expiresRaw) : null,
      active,
    })
    .where(eq(products.id, id));

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  revalidatePath("/pos");
}

export async function adjustStock(formData: FormData) {
  const session = await requireSession();
  if (!session || session.role !== "admin") return;

  const productId = String(formData.get("productId") || "");
  const delta = Number(formData.get("delta") || 0);
  const reason = String(formData.get("reason") || "ajuste");

  if (!productId || !Number.isFinite(delta) || delta === 0) return;

  const allowed = ["ajuste", "entrada", "merma"];
  if (!allowed.includes(reason)) return;

  await db.transaction(async (tx) => {
    const result = await tx.execute(sql`
      UPDATE products
      SET stock = stock + ${delta}
      WHERE id = ${productId} AND active = true AND stock + ${delta} >= 0
      RETURNING id
    `);

    if (!result.count && !(Array.isArray(result) && result.length)) {
      throw new Error("Stock insuficiente o producto inactivo.");
    }

    await tx.insert(stockMovements).values({
      id: nanoid(),
      productId,
      delta,
      reason,
      userId: session.userId,
    });
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  revalidatePath("/admin/reportes");
}

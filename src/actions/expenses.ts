"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { expenses } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export async function createExpense(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const concept = String(formData.get("concept") || "").trim();
  const amount = String(formData.get("amount") || "0");

  if (!concept || Number(amount) <= 0) return;

  await db.insert(expenses).values({
    id: nanoid(),
    concept,
    amount,
    userId: admin.userId,
  });

  revalidatePath("/admin/egresos");
  revalidatePath("/admin");
  revalidatePath("/admin/reportes");
}

export async function deleteExpense(id: string) {
  const admin = await requireAdmin();
  if (!admin) return;

  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/admin/egresos");
  revalidatePath("/admin");
  revalidatePath("/admin/reportes");
}

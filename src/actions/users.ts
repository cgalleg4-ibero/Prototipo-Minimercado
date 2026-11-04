"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export async function createUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "cajero") as "admin" | "cajero";

  if (!name) return;
  if (role !== "admin" && role !== "cajero") return;

  await db.insert(users).values({
    id: nanoid(),
    name,
    role,
    active: true,
  });

  revalidatePath("/admin/usuarios");
  revalidatePath("/");
}

export async function toggleUserActive(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return;
  if (user.id === admin.userId) return;

  await db
    .update(users)
    .set({ active: !user.active })
    .where(eq(users.id, userId));

  revalidatePath("/admin/usuarios");
  revalidatePath("/");
}

export async function updateUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "cajero") as "admin" | "cajero";

  if (!id || !name) return;

  await db
    .update(users)
    .set({ name, role })
    .where(eq(users.id, id));

  revalidatePath("/admin/usuarios");
  revalidatePath("/");
}

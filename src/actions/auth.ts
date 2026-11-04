"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function selectCashier(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || !user.active || user.role !== "cajero") {
    return { error: "Cajero no válido o inactivo." };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = "cajero";
  session.userName = user.name;
  await session.save();
  redirect("/pos");
}

export async function loginAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expected) {
    return { error: "Clave de administrador incorrecta." };
  }

  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (!admin || !admin.active) {
    return { error: "No hay un usuario administrador activo en la base de datos." };
  }

  const session = await getSession();
  session.userId = admin.id;
  session.role = "admin";
  session.userName = admin.name;
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}

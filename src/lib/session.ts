import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/session-options";

export type { SessionData };
export { sessionOptions };

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.userId || !session.role) {
    return null;
  }
  return session as SessionData & {
    userId: string;
    role: "admin" | "cajero";
    userName: string;
  };
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!session || session.role !== "admin") {
    return null;
  }
  return session;
}

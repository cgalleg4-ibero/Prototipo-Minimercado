import { SessionOptions } from "iron-session";

export type SessionData = {
  userId?: string;
  role?: "admin" | "cajero";
  userName?: string;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    "dev-session-secret-change-me-32chars-min!",
  cookieName: "minimercado_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },
};

"use client";

import { logout } from "@/actions/auth";

export function LogoutButton({
  label = "Salir",
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "dark";
}) {
  const className =
    variant === "dark"
      ? "w-full rounded-xl border border-emerald-700/80 bg-emerald-900/40 px-3 py-2 text-sm font-medium text-emerald-50 hover:bg-emerald-900"
      : "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50";

  return (
    <form action={logout}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

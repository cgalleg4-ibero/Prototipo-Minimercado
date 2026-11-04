"use client";

import { useState, useTransition } from "react";
import { loginAdmin, selectCashier } from "@/actions/auth";

type Cashier = {
  id: string;
  name: string;
};

const ADMIN_VALUE = "__admin__";

export function LoginPanel({
  cashiers,
  adminName,
}: {
  cashiers: Cashier[];
  adminName: string;
}) {
  const [selection, setSelection] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isAdmin = selection === ADMIN_VALUE;
  const selectedCashier = cashiers.find((c) => c.id === selection);

  function enterAsCashier() {
    if (!selectedCashier) return;
    setError(null);
    startTransition(async () => {
      const result = await selectCashier(selectedCashier.id);
      if (result?.error) setError(result.error);
    });
  }

  function enterAsAdmin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAdmin(String(formData.get("password") || ""));
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-[22rem] rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
        Usuario
      </label>
      <select
        value={selection}
        onChange={(e) => {
          setSelection(e.target.value);
          setError(null);
        }}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
      >
        <option value="">Seleccionar…</option>
        {cashiers.map((cashier) => (
          <option key={cashier.id} value={cashier.id}>
            {cashier.name}
          </option>
        ))}
        <option value={ADMIN_VALUE}>Administrador</option>
      </select>

      {!cashiers.length ? (
        <p className="mt-3 text-xs text-amber-700">
          No hay cajeros activos. Elige Administrador para crearlos.
        </p>
      ) : null}

      {selectedCashier ? (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
              {selectedCashier.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedCashier.name}
              </p>
              <p className="text-xs text-slate-500">Cajero · Punto de venta</p>
            </div>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            disabled={pending}
            onClick={enterAsCashier}
            className="w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar al POS"}
          </button>
        </div>
      ) : null}

      {isAdmin ? (
        <form action={enterAsAdmin} className="mt-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              {(adminName || "A").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {adminName || "Administrador"}
              </p>
              <p className="text-xs text-slate-500">Acceso administrativo</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Clave
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Clave de administrador"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {pending ? "Verificando…" : "Entrar"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

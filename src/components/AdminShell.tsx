"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/LogoutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/inventario", label: "Inventario" },
  { href: "/admin/egresos", label: "Egresos" },
  { href: "/admin/reportes", label: "Reportes" },
  { href: "/pos", label: "POS" },
];

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-emerald-800 text-white"
                : "text-emerald-100/90 hover:bg-emerald-900 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen bg-[#f3f7f4]">
      {/* Desktop sidebar: fixed, no page scroll */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-emerald-900/20 bg-emerald-950 text-emerald-50 lg:flex">
        <div className="border-b border-emerald-900/40 px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
            Minimercado
          </p>
          <h1 className="mt-1 text-lg font-semibold">Panel admin</h1>
          <p className="mt-1 truncate text-sm text-emerald-200/80">{userName}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t border-emerald-900/40 px-4 py-4">
          <LogoutButton label="Cerrar sesión" variant="dark" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-700">
            Admin
          </p>
          <p className="truncate text-sm font-semibold text-slate-900">
            {userName}
          </p>
        </div>
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
        >
          <span className="sr-only">Menú</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col bg-emerald-950 text-emerald-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-emerald-900/40 px-4 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
                  Minimercado
                </p>
                <p className="mt-1 text-sm font-semibold">Panel admin</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-emerald-200 hover:bg-emerald-900"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-emerald-900/40 px-4 py-4">
              <LogoutButton label="Cerrar sesión" variant="dark" />
            </div>
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white print:hidden"
    >
      Imprimir
    </button>
  );
}

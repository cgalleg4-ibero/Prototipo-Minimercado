"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { checkoutSale } from "@/actions/sales";
import { formatCOP } from "@/lib/format";

export type PosProduct = {
  id: string;
  sku: string;
  name: string;
  salePrice: string;
  stock: number;
};

type CartLine = {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  qty: number;
  stock: number;
};

export function PosClient({ products }: { products: PosProduct[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, query]);

  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  function addProduct(product: PosProduct) {
    setError(null);
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stock) {
          setError(`Stock insuficiente para ${product.name}`);
          return prev;
        }
        return prev.map((line) =>
          line.productId === product.id
            ? { ...line, qty: line.qty + 1 }
            : line,
        );
      }
      if (product.stock < 1) {
        setError(`Sin stock: ${product.name}`);
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unitPrice: Number(product.salePrice),
          qty: 1,
          stock: product.stock,
        },
      ];
    });
  }

  function setQty(productId: string, qty: number) {
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.productId !== productId) return line;
          const nextQty = Math.max(0, Math.min(line.stock, Math.floor(qty)));
          return { ...line, qty: nextQty };
        })
        .filter((line) => line.qty > 0),
    );
  }

  function changeQty(productId: string, delta: number) {
    const line = cart.find((l) => l.productId === productId);
    if (!line) return;
    setQty(productId, line.qty + delta);
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  function clearCart() {
    setCart([]);
    setError(null);
  }

  function pay() {
    setError(null);
    startTransition(async () => {
      const result = await checkoutSale(
        cart.map((line) => ({ productId: line.productId, qty: line.qty })),
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.saleId) {
        router.push(`/pos/recibo/${result.saleId}`);
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] md:items-start lg:gap-6">
      {/* Izquierda: catálogo */}
      <section className="space-y-3 sm:space-y-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU…"
          autoFocus
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none ring-emerald-600 focus:ring-2"
        />
        <div className="grid max-h-[min(70vh,42rem)] gap-2 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              className="rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-emerald-500 hover:shadow-sm active:scale-[0.99] sm:p-4"
            >
              <div className="text-xs text-slate-500">{product.sku}</div>
              <div className="font-semibold leading-snug text-slate-900">
                {product.name}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-emerald-800">
                  {formatCOP(product.salePrice)}
                </span>
                <span className="text-slate-500">{product.stock} und</span>
              </div>
            </button>
          ))}
          {!filtered.length ? (
            <p className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
              No hay productos para esa búsqueda.
            </p>
          ) : null}
        </div>
      </section>

      {/* Derecha: detalle de la venta */}
      <aside className="md:sticky md:top-20">
        <section className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm md:min-h-[28rem] md:max-h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Detalle de la venta
              </h2>
              <p className="text-xs text-slate-500">
                {itemCount === 0
                  ? "Sin productos"
                  : `${itemCount} ${itemCount === 1 ? "ítem" : "ítems"}`}
              </p>
            </div>
            {cart.length ? (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-slate-500 hover:text-red-600"
              >
                Vaciar
              </button>
            ) : null}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {!cart.length ? (
              <div className="flex h-full min-h-[8rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
                Toca un producto a la izquierda para agregarlo.
              </div>
            ) : (
              cart.map((line) => (
                <div
                  key={line.productId}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {line.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatCOP(line.unitPrice)} c/u
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      className="shrink-0 text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        aria-label="Restar"
                        onClick={() => changeQty(line.productId, -1)}
                        className="px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={line.stock}
                        value={line.qty}
                        onChange={(e) =>
                          setQty(line.productId, Number(e.target.value))
                        }
                        className="w-12 border-x border-slate-200 py-1.5 text-center text-sm outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Sumar"
                        onClick={() => changeQty(line.productId, 1)}
                        className="px-2.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCOP(line.unitPrice * line.qty)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-auto border-t border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between text-lg font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCOP(total)}</span>
            </div>
            {error ? (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            ) : null}
            <button
              type="button"
              disabled={!cart.length || pending}
              onClick={pay}
              className="mt-3 w-full rounded-xl bg-emerald-700 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Procesando…" : "Cobrar y emitir recibo"}
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

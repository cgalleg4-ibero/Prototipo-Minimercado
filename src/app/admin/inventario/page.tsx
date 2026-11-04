import { asc } from "drizzle-orm";
import { adjustStock, createProduct, updateProduct } from "@/actions/products";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import {
  expiryBadgeClass,
  expiryLabel,
  getExpiryStatus,
} from "@/lib/expiry";
import { formatCOP, formatDateOnly } from "@/lib/format";

export default async function InventarioPage() {
  const rows = await db.select().from(products).orderBy(asc(products.name));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Inventario
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Productos, precios, stock y alertas visuales de caducidad.
        </p>
      </header>

      <form
        action={createProduct}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3"
      >
        <h2 className="md:col-span-3 text-lg font-semibold">Nuevo producto</h2>
        <input
          name="sku"
          required
          placeholder="SKU"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="name"
          required
          placeholder="Nombre"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="category"
          required
          placeholder="Categoría"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="costPrice"
          required
          type="number"
          min="0"
          step="1"
          placeholder="Precio costo"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="salePrice"
          required
          type="number"
          min="0"
          step="1"
          placeholder="Precio venta"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="stock"
          type="number"
          min="0"
          step="1"
          defaultValue={0}
          placeholder="Stock inicial"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="expiresAt"
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white md:col-span-2"
        >
          Guardar producto
        </button>
      </form>

      <div className="space-y-4">
        {rows.map((product) => {
          const status = getExpiryStatus(product.expiresAt);
          const expiresValue = product.expiresAt
            ? product.expiresAt.toISOString().slice(0, 10)
            : "";
          return (
            <article
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">{product.sku}</p>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm text-slate-600">
                    {product.category} · Stock:{" "}
                    <strong>{product.stock}</strong> · Costo{" "}
                    {formatCOP(product.costPrice)} · Venta{" "}
                    {formatCOP(product.salePrice)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Vence: {formatDateOnly(product.expiresAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${expiryBadgeClass(status)}`}
                >
                  {expiryLabel(status)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <form
                  action={updateProduct}
                  className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-2"
                >
                  <input type="hidden" name="id" value={product.id} />
                  <input
                    name="sku"
                    defaultValue={product.sku}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="name"
                    defaultValue={product.name}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="category"
                    defaultValue={product.category}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="costPrice"
                    type="number"
                    defaultValue={Number(product.costPrice)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="salePrice"
                    type="number"
                    defaultValue={Number(product.salePrice)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                  />
                  <input
                    name="expiresAt"
                    type="date"
                    defaultValue={expiresValue}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <select
                    name="active"
                    defaultValue={product.active ? "true" : "false"}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white sm:col-span-2"
                  >
                    Actualizar datos
                  </button>
                </form>

                <form
                  action={adjustStock}
                  className="grid gap-2 rounded-xl bg-emerald-50 p-3 sm:grid-cols-3"
                >
                  <input type="hidden" name="productId" value={product.id} />
                  <input
                    name="delta"
                    type="number"
                    required
                    placeholder="Δ stock (+/-)"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <select
                    name="reason"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    defaultValue="ajuste"
                  >
                    <option value="entrada">Entrada</option>
                    <option value="ajuste">Ajuste</option>
                    <option value="merma">Merma</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Ajustar stock
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { formatCOP, formatDate, toNumber } from "@/lib/format";
import { getSaleDetail } from "@/lib/reports";

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getSaleDetail(id);
  if (!detail) notFound();

  const { sale, items } = detail;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex gap-3 print:hidden">
        <Link
          href="/pos"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          Nueva venta
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl border border-dashed border-slate-400 bg-white p-6 font-mono text-sm shadow-sm">
        <header className="border-b border-slate-200 pb-4 text-center">
          <p className="text-base font-bold tracking-wide">MINIMERCADO</p>
          <p className="text-xs text-slate-500">Recibo interno — No fiscal</p>
          <p className="mt-2 font-semibold">{sale.receiptNumber}</p>
          <p className="text-xs text-slate-600">{formatDate(sale.createdAt)}</p>
          <p className="text-xs text-slate-600">Atendió: {sale.userName}</p>
        </header>

        <ul className="space-y-2 border-b border-slate-200 py-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <div>
                <p>{item.productName}</p>
                <p className="text-xs text-slate-500">
                  {item.qty} x {formatCOP(item.unitPrice)}
                </p>
              </div>
              <p>{formatCOP(toNumber(item.unitPrice) * item.qty)}</p>
            </li>
          ))}
        </ul>

        <div className="flex justify-between pt-4 text-base font-bold">
          <span>TOTAL</span>
          <span>{formatCOP(sale.total)}</span>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-500">
          Documento de control interno. No constituye factura electrónica ni
          documento equivalente ante la DIAN.
        </p>
      </article>
    </div>
  );
}

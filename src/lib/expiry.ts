export type ExpiryStatus = "ok" | "warning" | "expired" | "none";

const MS_DAY = 24 * 60 * 60 * 1000;

export function getExpiryStatus(
  expiresAt: Date | string | null | undefined,
  warningDays = 7,
): ExpiryStatus {
  if (!expiresAt) return "none";
  const date = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfExpiry = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const diffDays = Math.floor(
    (startOfExpiry.getTime() - startOfToday.getTime()) / MS_DAY,
  );
  if (diffDays < 0) return "expired";
  if (diffDays <= warningDays) return "warning";
  return "ok";
}

export function expiryLabel(status: ExpiryStatus) {
  switch (status) {
    case "expired":
      return "Vencido";
    case "warning":
      return "Por vencer";
    case "ok":
      return "Vigente";
    default:
      return "Sin fecha";
  }
}

export function expiryBadgeClass(status: ExpiryStatus) {
  switch (status) {
    case "expired":
      return "bg-red-100 text-red-800 border-red-300";
    case "warning":
      return "bg-amber-100 text-amber-900 border-amber-300";
    case "ok":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

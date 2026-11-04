export type Role = "admin" | "cajero";

export function canAccessAdmin(role?: Role) {
  return role === "admin";
}

export function canAccessPos(role?: Role) {
  return role === "admin" || role === "cajero";
}

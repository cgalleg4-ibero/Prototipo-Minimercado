import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // admin | cajero
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sales = pgTable("sales", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  costTotal: numeric("cost_total", { precision: 12, scale: 2 }).notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const saleItems = pgTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id")
    .notNull()
    .references(() => sales.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  qty: integer("qty").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  concept: text("concept").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(), // ajuste | venta | entrada | merma
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;

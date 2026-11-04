import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { nanoid } from "nanoid";
import postgres from "postgres";
import {
  expenses,
  products,
  saleItems,
  sales,
  stockMovements,
  users,
} from "../src/lib/db/schema";

function daysFromNow(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL es requerida para el seed");
  }

  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);

  console.log("Limpiando tablas…");
  await db.delete(saleItems);
  await db.delete(sales);
  await db.delete(stockMovements);
  await db.delete(expenses);
  await db.delete(products);
  await db.delete(users);

  const adminId = nanoid();
  const mariaId = nanoid();
  const pedroId = nanoid();
  const luciaId = nanoid();

  console.log("Insertando usuarios…");
  await db.insert(users).values([
    { id: adminId, name: "Admin Minimercado", role: "admin", active: true },
    { id: mariaId, name: "María López", role: "cajero", active: true },
    { id: pedroId, name: "Pedro Ramírez", role: "cajero", active: true },
    { id: luciaId, name: "Lucía Gómez", role: "cajero", active: true },
  ]);

  const catalog = [
    {
      sku: "LAC-001",
      name: "Leche entera 1L",
      category: "Lácteos",
      costPrice: "2800",
      salePrice: "3800",
      stock: 40,
      expiresAt: daysFromNow(3),
    },
    {
      sku: "LAC-002",
      name: "Yogurt natural 1L",
      category: "Lácteos",
      costPrice: "3500",
      salePrice: "4900",
      stock: 18,
      expiresAt: daysFromNow(-2),
    },
    {
      sku: "LAC-003",
      name: "Queso campesino 500g",
      category: "Lácteos",
      costPrice: "7800",
      salePrice: "10500",
      stock: 12,
      expiresAt: daysFromNow(20),
    },
    {
      sku: "GRA-001",
      name: "Arroz Diana 1kg",
      category: "Granos",
      costPrice: "3200",
      salePrice: "4200",
      stock: 60,
      expiresAt: daysFromNow(180),
    },
    {
      sku: "GRA-002",
      name: "Frijol cargamanto 500g",
      category: "Granos",
      costPrice: "4100",
      salePrice: "5500",
      stock: 35,
      expiresAt: daysFromNow(120),
    },
    {
      sku: "GRA-003",
      name: "Azúcar 1kg",
      category: "Granos",
      costPrice: "2900",
      salePrice: "3800",
      stock: 45,
      expiresAt: daysFromNow(200),
    },
    {
      sku: "ASE-001",
      name: "Jabón líquido 500ml",
      category: "Aseo",
      costPrice: "5200",
      salePrice: "6900",
      stock: 22,
      expiresAt: daysFromNow(365),
    },
    {
      sku: "ASE-002",
      name: "Detergente en polvo 1kg",
      category: "Aseo",
      costPrice: "7800",
      salePrice: "9900",
      stock: 15,
      expiresAt: daysFromNow(300),
    },
    {
      sku: "BEB-001",
      name: "Agua 600ml",
      category: "Bebidas",
      costPrice: "800",
      salePrice: "1500",
      stock: 80,
      expiresAt: daysFromNow(90),
    },
    {
      sku: "BEB-002",
      name: "Gaseosa 1.5L",
      category: "Bebidas",
      costPrice: "2800",
      salePrice: "4200",
      stock: 30,
      expiresAt: daysFromNow(5),
    },
    {
      sku: "PAN-001",
      name: "Pan tajado",
      category: "Panadería",
      costPrice: "3500",
      salePrice: "4800",
      stock: 10,
      expiresAt: daysFromNow(1),
    },
    {
      sku: "SNK-001",
      name: "Papas fritas 150g",
      category: "Snacks",
      costPrice: "2200",
      salePrice: "3500",
      stock: 28,
      expiresAt: daysFromNow(45),
    },
    {
      sku: "HUE-001",
      name: "Huevos AA x12",
      category: "Perecederos",
      costPrice: "6500",
      salePrice: "8500",
      stock: 20,
      expiresAt: daysFromNow(6),
    },
    {
      sku: "CAF-001",
      name: "Café molido 250g",
      category: "Abarrotes",
      costPrice: "7800",
      salePrice: "10900",
      stock: 16,
      expiresAt: daysFromNow(150),
    },
  ] as const;

  console.log("Insertando productos y movimientos de entrada…");
  const productIds: string[] = [];

  for (const item of catalog) {
    const id = nanoid();
    productIds.push(id);

    await db.insert(products).values({
      id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      costPrice: item.costPrice,
      salePrice: item.salePrice,
      stock: item.stock,
      expiresAt: item.expiresAt,
      active: true,
    });

    await db.insert(stockMovements).values([
      {
        id: nanoid(),
        productId: id,
        delta: item.stock + 5,
        reason: "entrada",
        userId: adminId,
        createdAt: daysFromNow(-10),
      },
      {
        id: nanoid(),
        productId: id,
        delta: -5,
        reason: "ajuste",
        userId: adminId,
        createdAt: daysFromNow(-9),
      },
    ]);
  }

  const saleDefs = [
    {
      cashierId: mariaId,
      lines: [
        { productIndex: 0, qty: 2 },
        { productIndex: 8, qty: 3 },
      ],
      daysAgo: 2,
    },
    {
      cashierId: pedroId,
      lines: [
        { productIndex: 3, qty: 1 },
        { productIndex: 9, qty: 2 },
        { productIndex: 11, qty: 1 },
      ],
      daysAgo: 1,
    },
    {
      cashierId: luciaId,
      lines: [
        { productIndex: 12, qty: 1 },
        { productIndex: 1, qty: 1 },
      ],
      daysAgo: 0,
    },
  ];

  console.log("Insertando ventas demo…");
  for (const [index, saleDef] of saleDefs.entries()) {
    const saleId = nanoid();
    let total = 0;
    let costTotal = 0;
    const itemRows: {
      id: string;
      saleId: string;
      productId: string;
      qty: number;
      unitPrice: string;
      unitCost: string;
    }[] = [];

    for (const line of saleDef.lines) {
      const product = catalog[line.productIndex];
      const productId = productIds[line.productIndex];
      total += Number(product.salePrice) * line.qty;
      costTotal += Number(product.costPrice) * line.qty;

      itemRows.push({
        id: nanoid(),
        saleId,
        productId,
        qty: line.qty,
        unitPrice: product.salePrice,
        unitCost: product.costPrice,
      });

      await db.insert(stockMovements).values({
        id: nanoid(),
        productId,
        delta: -line.qty,
        reason: "venta",
        userId: saleDef.cashierId,
        createdAt: daysFromNow(-saleDef.daysAgo),
      });

      const [current] = await db
        .select()
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);

      await db
        .update(products)
        .set({ stock: (current?.stock ?? 0) - line.qty })
        .where(eq(products.id, productId));
    }

    await db.insert(sales).values({
      id: saleId,
      userId: saleDef.cashierId,
      total: total.toFixed(2),
      costTotal: costTotal.toFixed(2),
      receiptNumber: `RC-SEED-${String(index + 1).padStart(3, "0")}`,
      createdAt: daysFromNow(-saleDef.daysAgo),
    });
    await db.insert(saleItems).values(itemRows);
  }

  console.log("Insertando egresos…");
  await db.insert(expenses).values([
    {
      id: nanoid(),
      concept: "Pago de energía eléctrica",
      amount: "185000",
      userId: adminId,
      createdAt: daysFromNow(-5),
    },
    {
      id: nanoid(),
      concept: "Compra de bolsas para empaque",
      amount: "35000",
      userId: adminId,
      createdAt: daysFromNow(-1),
    },
  ]);

  await client.end();
  console.log("Seed completado.");
  console.log("- Cajeros: María López, Pedro Ramírez, Lucía Gómez");
  console.log("- Clave admin (ADMIN_PASSWORD): admin123 por defecto");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  postgresClient?: ReturnType<typeof postgres>;
  drizzleDb?: Db;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está definida. Configúrala con la connection string de Supabase.",
    );
  }

  const client =
    globalForDb.postgresClient ??
    postgres(connectionString, {
      prepare: false,
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return drizzle(client, { schema });
}

function getDb(): Db {
  if (!globalForDb.drizzleDb) {
    globalForDb.drizzleDb = createDb();
  }
  return globalForDb.drizzleDb;
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(real)
      : value;
  },
});

# Minimercado — Prototipo

Sistema web para gestión de inventario, ventas (recibo interno), egresos y reportes de un minimercado.

Stack: **Next.js**, **Supabase (Postgres)**, **Drizzle ORM**, sesión con cookie firmada (**iron-session**, sin JWT).

## Funcionalidades

- Pantalla inicial para elegir cajero
- Acceso administrador con clave compartida (`ADMIN_PASSWORD`)
- Inventario con alertas de caducidad (rojo / amarillo)
- POS con carrito, descuento de stock concurrente y recibo interno no fiscal
- Egresos y reportes (ingresos, COGS, egresos, ganancia, stock, movimientos)
- Exportación CSV de ventas y ganancias

## Requisitos

- Node.js 20+ recomendado
- Proyecto en [Supabase](https://supabase.com) (free tier)

## Configuración

1. Crea un proyecto en Supabase.
2. Copia la connection string (Settings → Database → Connection string → URI).
   - Para la app en Vercel usa el **pooler** (puerto `6543`, modo Transaction) si está disponible.
   - Para `drizzle-kit push` / seed local a veces es más estable la conexión directa (puerto `5432`).
3. Copia el entorno de ejemplo:

```bash
cp .env.example .env.local
```

4. Completa `.env.local`:

```env
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=admin123
SESSION_SECRET=cambia-este-secreto-de-sesion-32ch
```

5. Instala, crea tablas y carga datos demo:

```bash
npm install
npm run db:push
npm run seed
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Credenciales demo

- **Cajeros:** María López, Pedro Ramírez, Lucía Gómez (solo selección en pantalla)
- **Admin:** clave `admin123` (o la de `ADMIN_PASSWORD`)

## Despliegue en Vercel

1. Sube el repo a GitHub/GitLab.
2. Importa el proyecto en Vercel.
3. Define las variables `DATABASE_URL`, `ADMIN_PASSWORD` y `SESSION_SECRET`.
4. Deploy.
5. Ejecuta `npm run db:push` y `npm run seed` una vez contra la misma base (desde tu máquina o CI).

## Alcance (según documento del proyecto)

Incluye roles admin/cajero, inventario, ventas y reportería.

No incluye: facturación electrónica DIAN, nómina ni pagos con tarjeta.

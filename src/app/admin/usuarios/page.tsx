import { desc } from "drizzle-orm";
import { createUser, toggleUserActive, updateUser } from "@/actions/users";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";

export default async function UsuariosPage() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-slate-600 sm:text-base">
          Administradores y cajeros. Los cajeros activos aparecen en el inicio
          de sesión.
        </p>
      </header>

      <form
        action={createUser}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4 sm:p-5"
      >
        <input
          name="name"
          required
          placeholder="Nombre"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          name="role"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          defaultValue="cajero"
        >
          <option value="cajero">Cajero</option>
          <option value="admin">Administrador</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"
        >
          Crear usuario
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Creado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-b border-slate-100">
                <td className="px-4 py-3">
                  <form action={updateUser} className="flex gap-2">
                    <input type="hidden" name="id" value={user.id} />
                    <input
                      name="name"
                      defaultValue={user.name}
                      className="w-40 rounded border border-slate-300 px-2 py-1"
                    />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded border border-slate-300 px-2 py-1"
                    >
                      <option value="cajero">Cajero</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium text-emerald-700"
                    >
                      Guardar
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 capitalize">{user.role}</td>
                <td className="px-4 py-3">
                  {user.active ? (
                    <span className="text-emerald-700">Activo</span>
                  ) : (
                    <span className="text-slate-500">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <form action={toggleUserActive.bind(null, user.id)}>
                    <button
                      type="submit"
                      className="text-xs font-medium text-slate-700 underline"
                    >
                      {user.active ? "Desactivar" : "Activar"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

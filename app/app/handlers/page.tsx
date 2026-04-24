import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createHandlerAction } from "./actions";

export default async function HandlersPage() {
  const user = await requireOperator();
  const handlers = await db.handler.findMany({ where: { operatorId: user.operatorId }, orderBy: { name: "asc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Handlers</h1>
      <form action={createHandlerAction as unknown as (fd: FormData) => void} className="grid gap-2 rounded-lg border border-navy-700 bg-navy-900 p-4 md:grid-cols-4">
        <input name="name" placeholder="Handler name" required className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm md:col-span-1" />
        <input name="company" placeholder="Company (optional)" className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm md:col-span-1" />
        <input name="email" placeholder="Email (optional)" className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm md:col-span-1" />
        <button type="submit" className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 md:col-span-1">Add handler</button>
      </form>
      <ul className="divide-y divide-navy-700 rounded-lg border border-navy-700 bg-navy-900">
        {handlers.length === 0 && <li className="p-4 text-sm text-slate-500">No handlers yet.</li>}
        {handlers.map((h) => (
          <li key={h.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <span>{h.name}</span>
              {h.company && <span className="ml-2 text-xs text-slate-400">{h.company}</span>}
            </div>
            {h.email && <span className="text-xs text-slate-400">{h.email}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

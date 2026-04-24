import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { createCrewAction } from "./actions";

export default async function CrewPage() {
  const user = await requireOperator();
  const crew = await db.crewMember.findMany({ where: { operatorId: user.operatorId }, orderBy: { name: "asc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Crew roster</h1>
      <form action={createCrewAction as unknown as (fd: FormData) => void} className="flex gap-2 rounded-lg border border-navy-700 bg-navy-900 p-4">
        <input name="name" placeholder="Name" required className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm" />
        <select name="role" required className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm">
          <option value="PIC">PIC</option>
          <option value="FO">FO</option>
          <option value="CABIN">Cabin</option>
        </select>
        <button type="submit" className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400">Add</button>
      </form>
      <ul className="divide-y divide-navy-700 rounded-lg border border-navy-700 bg-navy-900">
        {crew.length === 0 && <li className="p-4 text-sm text-slate-500">No crew yet.</li>}
        {crew.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4 text-sm">
            <span>{c.name}</span>
            <span className="font-mono text-xs text-amber-400">{c.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

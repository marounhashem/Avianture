import Link from "next/link";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import type { CrewRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { createCrewAction } from "./actions";

const ROLE_FILTERS: { value: CrewRole; label: string }[] = [
  { value: "PIC", label: "PIC" },
  { value: "SIC", label: "SIC" },
  { value: "FA", label: "FA" },
];

function parseRoleFilter(raw: string | undefined): CrewRole | undefined {
  if (!raw) return undefined;
  const v = raw.toUpperCase();
  return (ROLE_FILTERS.map((r) => r.value) as string[]).includes(v)
    ? (v as CrewRole)
    : undefined;
}

export default async function CrewPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await requireOperator();
  const sp = await searchParams;
  const roleFilter = parseRoleFilter(sp.role);

  const crew = await db.crewMember.findMany({
    where: {
      operatorId: user.operatorId,
      ...(roleFilter ? { role: roleFilter } : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Crew list</h1>
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/app/crew"
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              !roleFilter
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                : "border-navy-700 bg-navy-950 text-slate-400 hover:border-amber-500/40",
            )}
          >
            All
          </Link>
          {ROLE_FILTERS.map((opt) => {
            const active = roleFilter === opt.value;
            return (
              <Link
                key={opt.value}
                href={`/app/crew?role=${opt.value.toLowerCase()}`}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-mono",
                  active
                    ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                    : "border-navy-700 bg-navy-950 text-slate-400 hover:border-amber-500/40",
                )}
              >
                {opt.label}
              </Link>
            );
          })}
        </div>
      </div>

      <form
        action={createCrewAction as unknown as (fd: FormData) => void}
        className="flex gap-2 rounded-lg border border-navy-700 bg-navy-900 p-4"
      >
        <input
          name="name"
          placeholder="Name"
          required
          className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
        />
        <select
          name="role"
          required
          className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
        >
          <option value="PIC">PIC</option>
          <option value="SIC">SIC</option>
          <option value="FA">FA</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
        >
          Add
        </button>
      </form>

      <ul className="divide-y divide-navy-700 rounded-lg border border-navy-700 bg-navy-900">
        {crew.length === 0 && (
          <li className="p-4 text-sm text-slate-500">
            {roleFilter ? `No ${roleFilter} crew yet.` : "No crew yet."}
          </li>
        )}
        {crew.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between p-4 text-sm"
          >
            <span>{c.name}</span>
            <span className="font-mono text-xs text-amber-400">{c.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

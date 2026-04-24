import Link from "next/link";
import { requireHandler } from "@/lib/auth/session";
import { db } from "@/lib/db";

export default async function HubPage() {
  const user = await requireHandler();
  const requests = await db.handlerRequest.findMany({
    where: { handlerId: user.handlerId, inviteAcceptedAt: { not: null } },
    include: { flight: true, services: true },
    orderBy: { flight: { etdUtc: "asc" } },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Handler Hub</h1>
      <p className="text-sm text-slate-400">{requests.length} active flight{requests.length === 1 ? "" : "s"}</p>
      {requests.length === 0 && <p className="rounded-lg border border-dashed border-navy-700 p-8 text-center text-sm text-slate-500">No assigned flights yet.</p>}
      <div className="grid gap-3">
        {requests.map((r) => {
          const done = r.services.filter((s) => s.status === "COMPLETED").length;
          return (
            <Link key={r.id} href={`/app/hub/${r.flight.id}`} className="block rounded-lg border border-navy-700 bg-navy-900 p-4 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-amber-400">{r.flight.tailNumber}</span>
                  <span className="font-mono text-sm">{r.airport}</span>
                </div>
                <span className="text-xs text-slate-400">{new Date(r.flight.etdUtc).toUTCString().slice(5, 22)} UTC</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">{done}/{r.services.length} services completed</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

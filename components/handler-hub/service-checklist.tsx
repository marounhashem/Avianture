import { updateServiceStatusAction } from "@/app/app/hub/[flightId]/actions";
import { StatusChip } from "@/components/shared/status-chip";
import { ALLOWED_TRANSITIONS, type ServiceStatus } from "@/lib/flights/services";
import type { ServiceRequest } from "@prisma/client";

export function ServiceChecklist({ flightId, services }: { flightId: string; services: ServiceRequest[] }) {
  return (
    <ul className="space-y-3">
      {services.map((s) => {
        const nextOptions = ALLOWED_TRANSITIONS[s.status as ServiceStatus];
        return (
          <li key={s.id} className="rounded-lg border border-navy-700 bg-navy-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{s.type}</span>
              <StatusChip status={s.status.toLowerCase() as "pending" | "acknowledged" | "in_progress" | "completed"} />
            </div>
            {s.note && <p className="mt-2 text-xs text-slate-400">{s.note}</p>}
            {nextOptions.length > 0 && (
              <form action={updateServiceStatusAction as unknown as (fd: FormData) => void} className="mt-3 flex gap-2">
                <input type="hidden" name="serviceRequestId" value={s.id} />
                <input type="hidden" name="flightId" value={flightId} />
                <input name="note" placeholder="Note (optional)" defaultValue={s.note ?? ""} className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-xs" />
                {nextOptions.map((next) => (
                  <button key={next} type="submit" name="toStatus" value={next} className="rounded-md bg-amber-500 px-3 py-2 text-xs font-medium text-navy-950 hover:bg-amber-400 whitespace-nowrap">
                    Mark {next.toLowerCase().replace("_", " ")}
                  </button>
                ))}
              </form>
            )}
          </li>
        );
      })}
    </ul>
  );
}

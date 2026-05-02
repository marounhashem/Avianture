import { StatusChip } from "@/components/shared/status-chip";
import type { Handler, HandlerRequest, ServiceRequest } from "@prisma/client";

type RequestWithServices = HandlerRequest & { handler: Handler; services: ServiceRequest[] };

export function HandlerStatusList({ requests }: { requests: RequestWithServices[] }) {
  if (requests.length === 0) {
    return (
      <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Handlers</h2>
        <p className="text-sm text-slate-500">No handlers assigned yet.</p>
      </section>
    );
  }
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Handlers</h2>
      <div className="space-y-4">
        {requests.map((r) => {
          const acceptedOrPending = r.inviteAcceptedAt ? "Accepted" : "Awaiting acceptance";
          return (
            <div key={r.id} className="rounded-md border border-navy-700 bg-navy-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">{r.handler.name}</span>
                  <span className="ml-2 font-mono text-xs text-amber-400">{r.airport}</span>
                </div>
                <span className="text-xs text-slate-400">{acceptedOrPending}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.services.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">{s.type}</span>
                    <StatusChip
                      status={
                        s.status.toLowerCase() as
                          | "pending"
                          | "acknowledged"
                          | "in_progress"
                          | "completed"
                          | "not_required"
                      }
                    />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

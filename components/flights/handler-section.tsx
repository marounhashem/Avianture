import {
  inviteHandlerAction,
  resendHandlerInviteAction,
  cancelHandlerInviteAction,
} from "@/app/app/flights/[id]/actions";
import { StatusChip } from "@/components/shared/status-chip";
import { CopyButton } from "@/components/shared/copy-button";
import type { Handler, HandlerRequest, ServiceRequest } from "@prisma/client";

type RequestWithServices = HandlerRequest & { handler: Handler; services: ServiceRequest[] };

export function HandlerSection({
  flightId,
  origin,
  dest,
  requests,
  availableHandlers,
  baseUrl,
}: {
  flightId: string;
  origin: string;
  dest: string;
  requests: RequestWithServices[];
  availableHandlers: Handler[];
  baseUrl: string;
}) {
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Handlers</h2>
      <div className="space-y-4">
        {requests.map((r) => {
          const acceptedOrPending = r.inviteAcceptedAt ? "Accepted" : "Awaiting acceptance";
          const link = `${baseUrl}/invite/${r.inviteToken}`;
          return (
            <div key={r.id} className="rounded-md border border-navy-700 bg-navy-950 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">{r.handler.name}</span>
                  <span className="ml-2 font-mono text-xs text-amber-400">{r.airport}</span>
                </div>
                <span className="text-xs text-slate-400">{acceptedOrPending}</span>
              </div>
              {!r.inviteAcceptedAt && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 truncate rounded bg-navy-900 px-2 py-1 text-xs text-slate-400">
                      {link}
                    </code>
                    <CopyButton text={link} />
                  </div>
                  <div className="mb-3 flex items-center gap-2">
                    <form
                      action={
                        resendHandlerInviteAction as unknown as (
                          fd: FormData,
                        ) => void
                      }
                    >
                      <input type="hidden" name="flightId" value={flightId} />
                      <input type="hidden" name="handlerRequestId" value={r.id} />
                      <button
                        type="submit"
                        disabled={!r.handler.email}
                        title={
                          r.handler.email
                            ? `Resend to ${r.handler.email}`
                            : "No email on handler record"
                        }
                        className="rounded-md border border-navy-700 bg-navy-950 px-2.5 py-1 text-xs text-slate-300 hover:border-amber-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-navy-700"
                      >
                        Resend email
                      </button>
                    </form>
                    <form
                      action={
                        cancelHandlerInviteAction as unknown as (
                          fd: FormData,
                        ) => void
                      }
                    >
                      <input type="hidden" name="flightId" value={flightId} />
                      <input type="hidden" name="handlerRequestId" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-md border border-navy-700 bg-navy-950 px-2.5 py-1 text-xs text-slate-400 hover:border-red-500 hover:text-red-300"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                </>
              )}
              <div className="flex flex-wrap gap-1.5">
                {r.services.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">{s.type}</span>
                    <StatusChip status={s.status.toLowerCase() as "pending" | "acknowledged" | "in_progress" | "completed"} />
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {availableHandlers.length > 0 && (
        <div className="mt-4 grid gap-2">
          {["origin", "destination"].map((port) => (
            <form key={port} action={inviteHandlerAction as unknown as (fd: FormData) => void} className="flex gap-2">
              <input type="hidden" name="flightId" value={flightId} />
              <input type="hidden" name="airport" value={port === "origin" ? origin : dest} />
              <select name="handlerId" required className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm">
                <option value="">Invite handler for {port === "origin" ? origin : dest}...</option>
                {availableHandlers.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <button type="submit" className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400">
                Invite
              </button>
            </form>
          ))}
        </div>
      )}
    </section>
  );
}

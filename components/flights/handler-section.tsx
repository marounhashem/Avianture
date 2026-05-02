import Link from "next/link";
import {
  inviteHandlerAction,
  resendHandlerInviteAction,
  cancelHandlerInviteAction,
  createAndInviteHandlerAction,
  operatorUpdateServiceStatusAction,
} from "@/app/app/flights/[id]/actions";
import { StatusChip } from "@/components/shared/status-chip";
import { CopyButton } from "@/components/shared/copy-button";
import { DEFAULT_SERVICE_TYPES } from "@/lib/flights/services";
import type { Handler, HandlerRequest, ServiceRequest } from "@prisma/client";

type RequestWithServices = HandlerRequest & {
  handler: Handler;
  services: ServiceRequest[];
};

export function HandlerSection({
  flightId,
  origin,
  dest,
  requests,
  originHandlers,
  destHandlers,
  newHandlerForAirport,
  baseUrl,
}: {
  flightId: string;
  origin: string;
  dest: string;
  requests: RequestWithServices[];
  originHandlers: Handler[];
  destHandlers: Handler[];
  /** When the URL has ?newHandler=<icao>, this is that ICAO — render the inline form for that airport */
  newHandlerForAirport?: string;
  baseUrl: string;
}) {
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Handlers</h2>

      <div className="space-y-4">
        {requests.map((r) => {
          const acceptedOrPending = r.inviteAcceptedAt
            ? "Accepted"
            : "Awaiting acceptance";
          const link = `${baseUrl}/invite/${r.inviteToken}`;
          return (
            <div
              key={r.id}
              className="rounded-md border border-navy-700 bg-navy-950 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">{r.handler.name}</span>
                  <span className="ml-2 font-mono text-xs text-amber-400">
                    {r.airport}
                  </span>
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
              <div className="space-y-2">
                {r.services.map((s) => (
                  <OperatorServiceRow
                    key={s.id}
                    flightId={flightId}
                    service={s}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        <InvitePicker
          flightId={flightId}
          icao={origin}
          handlers={originHandlers}
          showNewForm={newHandlerForAirport === origin}
        />
        <InvitePicker
          flightId={flightId}
          icao={dest}
          handlers={destHandlers}
          showNewForm={newHandlerForAirport === dest}
        />
      </div>
    </section>
  );
}

/**
 * Operator-side inline edit row for a single ServiceRequest. Lets the
 * operator change the status to anything (including NOT_REQUIRED) and
 * attach an optional note. One small form per service.
 */
function OperatorServiceRow({
  flightId,
  service,
}: {
  flightId: string;
  service: ServiceRequest;
}) {
  const isNotRequired = service.status === "NOT_REQUIRED";
  return (
    <form
      action={
        operatorUpdateServiceStatusAction as unknown as (fd: FormData) => void
      }
      className="grid grid-cols-1 sm:grid-cols-[80px_140px_1fr_auto] items-center gap-2 rounded border border-navy-800 bg-navy-900/60 px-3 py-2"
    >
      <input type="hidden" name="flightId" value={flightId} />
      <input type="hidden" name="serviceRequestId" value={service.id} />
      <span
        className={
          "text-xs font-medium " +
          (isNotRequired ? "text-slate-500" : "text-slate-300")
        }
      >
        {service.type}
      </span>
      <select
        name="toStatus"
        defaultValue={service.status}
        className="rounded border border-navy-700 bg-navy-950 px-2 py-1 text-xs"
      >
        <option value="PENDING">Pending</option>
        <option value="ACKNOWLEDGED">Acknowledged</option>
        <option value="IN_PROGRESS">In progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="NOT_REQUIRED">Not required</option>
      </select>
      <input
        name="note"
        defaultValue={service.note ?? ""}
        placeholder="Note (optional)"
        maxLength={500}
        className="rounded border border-navy-700 bg-navy-950 px-2 py-1 text-xs"
      />
      <div className="flex items-center gap-2 justify-end">
        <StatusChip
          status={
            service.status.toLowerCase() as
              | "pending"
              | "acknowledged"
              | "in_progress"
              | "completed"
              | "not_required"
          }
        />
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-2.5 py-1 text-xs font-medium text-navy-950 hover:bg-amber-400"
        >
          Save
        </button>
      </div>
    </form>
  );
}

/**
 * Six checkboxes (default checked) + per-service note inputs, posted as part
 * of the same invite form. Unchecked services get created as NOT_REQUIRED so
 * the handler doesn't see them as actionable. Notes save with the service.
 *
 * Field naming is read by buildServiceCreates() in actions.ts:
 *   service-include-{TYPE}  (checkbox; absent when unchecked)
 *   service-note-{TYPE}     (text input)
 */
function PreInviteServicesEditor() {
  return (
    <fieldset className="rounded-md border border-navy-700/70 bg-navy-950/60 px-3 py-2">
      <legend className="px-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        Services
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {DEFAULT_SERVICE_TYPES.map((t) => (
          <label
            key={t}
            className="grid grid-cols-[auto_70px_1fr] items-center gap-2 text-xs"
          >
            <input
              type="checkbox"
              name={`service-include-${t}`}
              defaultChecked
              className="h-3.5 w-3.5 rounded border-navy-600 bg-navy-900 text-amber-500 focus:ring-amber-500"
            />
            <span className="text-slate-300">{t}</span>
            <input
              type="text"
              name={`service-note-${t}`}
              placeholder="Note (optional)"
              maxLength={500}
              className="rounded border border-navy-700 bg-navy-900 px-2 py-1 text-xs"
            />
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-slate-500">
        Uncheck a service to mark it Not required for this flight — the handler
        won&apos;t see it as actionable.
      </p>
    </fieldset>
  );
}

function InvitePicker({
  flightId,
  icao,
  handlers,
  showNewForm,
}: {
  flightId: string;
  icao: string;
  handlers: Handler[];
  showNewForm: boolean;
}) {
  return (
    <div className="space-y-2">
      {!showNewForm && (
        <form
          action={inviteHandlerAction as unknown as (fd: FormData) => void}
          className="space-y-2 rounded-md border border-navy-700 bg-navy-950 p-3"
        >
          <input type="hidden" name="flightId" value={flightId} />
          <input type="hidden" name="airport" value={icao} />
          <div className="flex items-center gap-2">
            <select
              name="handlerId"
              required
              defaultValue=""
              className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                {handlers.length === 0
                  ? `No handlers found for ${icao}`
                  : `Invite handler for ${icao}...`}
              </option>
              {handlers.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                  {h.airports.length > 0 && !h.airports.includes(icao)
                    ? " (no airports)"
                    : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={handlers.length === 0}
              className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Invite
            </button>
            <Link
              href={`/app/flights/${flightId}?newHandler=${icao}`}
              className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-slate-300 hover:border-amber-500 whitespace-nowrap"
              title={`Add a new handler for ${icao}`}
            >
              + New
            </Link>
          </div>
          <PreInviteServicesEditor />
        </form>
      )}

      {showNewForm && (
        <form
          action={
            createAndInviteHandlerAction as unknown as (fd: FormData) => void
          }
          className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-amber-300">
              Add new handler for{" "}
              <span className="font-mono">{icao}</span>
            </h3>
            <Link
              href={`/app/flights/${flightId}`}
              className="text-xs text-slate-400 hover:text-amber-400"
            >
              Cancel
            </Link>
          </div>
          <input type="hidden" name="flightId" value={flightId} />
          <input type="hidden" name="airport" value={icao} />
          <div className="grid gap-2 md:grid-cols-3">
            <input
              name="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Handler name"
              className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              placeholder="Email (optional)"
              className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone # (e.g. +97155000000)"
              pattern="^\+[1-9][0-9\s\-()]{7,20}$"
              title="International format with leading + (e.g. +971 55 000 000)"
              className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
            />
          </div>
          <PreInviteServicesEditor />
          <p className="text-[11px] text-slate-500">
            Handler will be added to your roster and immediately invited for this
            flight.{" "}
            <span className="font-mono text-amber-400">{icao}</span> will be
            saved to their airports.
          </p>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400"
            >
              Add &amp; invite
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

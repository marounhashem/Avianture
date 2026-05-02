import { operatorUpdateServiceStatusAction } from "@/app/app/flights/[id]/actions";
import { StatusChip } from "@/components/shared/status-chip";
import type { ServiceRequest } from "@prisma/client";

/**
 * Inline edit row for a single ServiceRequest, used by anyone with
 * "principal" rights on the flight (operator OR acknowledged PIC). The
 * server action enforces authorization — this component just renders the
 * form. Authoring it once and rendering on both /app/flights/[id] and
 * /app/schedule/[flightId] keeps the UX identical between the two roles.
 */
export function PrincipalServiceRow({
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

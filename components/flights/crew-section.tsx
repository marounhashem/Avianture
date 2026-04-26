import {
  appointCrewAction,
  unappointCrewAction,
  resolveIssueAction,
} from "@/app/app/flights/[id]/actions";
import type { CrewAssignment, CrewMember, User } from "@prisma/client";

type Props = {
  flightId: string;
  assignments: (CrewAssignment & {
    crewMember: CrewMember;
    issueResolvedBy?: User | null;
  })[];
  availableCrew: CrewMember[];
};

export function CrewSection({ flightId, assignments, availableCrew }: Props) {
  const appointedIds = new Set(assignments.map((a) => a.crewMemberId));
  const unassigned = availableCrew.filter((c) => !appointedIds.has(c.id));
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
      <h2 className="text-sm font-semibold text-slate-300 mb-3">Crew</h2>
      {assignments.length === 0 && (
        <p className="text-sm text-slate-500">No crew appointed yet.</p>
      )}
      <ul className="space-y-2">
        {assignments.map((a) => {
          const resolved = !!a.issueResolvedAt;
          return (
            <li
              key={a.id}
              className="rounded-md border border-navy-700 bg-navy-950 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">{a.crewMember.name}</span>
                  <span className="font-mono text-xs text-amber-400">
                    {a.crewMember.role}
                  </span>
                  {a.acknowledgedAt ? (
                    <span
                      title={`Acknowledged ${new Date(a.acknowledgedAt).toUTCString()}`}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                    >
                      ✓ Ack&apos;d
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/40 bg-slate-500/10 px-2 py-0.5 text-[11px] text-slate-400">
                      ⏳ Pending ack
                    </span>
                  )}
                </div>
                <form
                  action={unappointCrewAction as unknown as (fd: FormData) => void}
                >
                  <input type="hidden" name="flightId" value={flightId} />
                  <input type="hidden" name="crewMemberId" value={a.crewMemberId} />
                  <button
                    type="submit"
                    className="text-xs text-slate-400 hover:text-red-400"
                  >
                    Remove
                  </button>
                </form>
              </div>

              {a.issue && resolved && (
                <div className="mt-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-200">
                    <span>✓</span>
                    <span>Resolved</span>
                    {a.issueResolvedAt && (
                      <span className="ml-1 text-emerald-300/70">
                        · {new Date(a.issueResolvedAt).toUTCString().slice(5, 22)}{" "}
                        UTC
                      </span>
                    )}
                    {a.issueResolvedBy?.name && (
                      <span className="ml-1 text-emerald-300/70">
                        by {a.issueResolvedBy.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-emerald-100/70">
                    Original: {a.issue}
                  </p>
                  {a.issueResolution && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-emerald-100">
                      Response: {a.issueResolution}
                    </p>
                  )}
                </div>
              )}

              {a.issue && !resolved && (
                <div className="mt-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-200">
                    <span>⚠</span>
                    <span>Issue</span>
                    {a.issueUpdatedAt && (
                      <span className="ml-1 text-amber-300/70">
                        · {new Date(a.issueUpdatedAt).toUTCString().slice(5, 22)}{" "}
                        UTC
                      </span>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-amber-100">
                    {a.issue}
                  </p>
                  <form
                    action={resolveIssueAction as unknown as (fd: FormData) => void}
                    className="mt-3 space-y-2"
                  >
                    <input type="hidden" name="flightId" value={flightId} />
                    <input
                      type="hidden"
                      name="crewMemberId"
                      value={a.crewMemberId}
                    />
                    <textarea
                      name="resolution"
                      maxLength={500}
                      rows={2}
                      placeholder="Optional response (max 500 chars)..."
                      className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-emerald-400"
                    >
                      Mark resolved
                    </button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {unassigned.length > 0 && (
        <form
          action={appointCrewAction as unknown as (fd: FormData) => void}
          className="mt-4 flex gap-2"
        >
          <input type="hidden" name="flightId" value={flightId} />
          <select
            name="crewMemberId"
            required
            className="flex-1 rounded-md border border-navy-700 bg-navy-950 px-3 py-2 text-sm"
          >
            <option value="">Appoint crew...</option>
            {unassigned.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
          >
            Appoint
          </button>
        </form>
      )}
    </section>
  );
}

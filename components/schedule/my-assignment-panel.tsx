import {
  acknowledgeAssignmentAction,
  flagIssueAction,
  clearIssueAction,
} from "@/app/app/schedule/[flightId]/actions";
import type { CrewAssignment, CrewMember } from "@prisma/client";
import { Check, AlertTriangle } from "lucide-react";

type Assignment = CrewAssignment & { crewMember: CrewMember };

export function MyAssignmentPanel({
  flightId,
  assignment,
}: {
  flightId: string;
  assignment: Assignment;
}) {
  return (
    <section className="rounded-lg border border-navy-700 bg-navy-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-300">Your assignment</h2>

      {/* Acknowledgment */}
      <div className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-950 px-4 py-3">
        <div className="text-sm">
          <span className="text-slate-400">Status:</span>{" "}
          {assignment.acknowledgedAt ? (
            <span className="text-emerald-300 inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Acknowledged on{" "}
              {new Date(assignment.acknowledgedAt).toUTCString().slice(5, 22)} UTC
            </span>
          ) : (
            <span className="text-slate-300">Not yet acknowledged</span>
          )}
        </div>
        {!assignment.acknowledgedAt && (
          <form
            action={acknowledgeAssignmentAction as unknown as (fd: FormData) => void}
          >
            <input type="hidden" name="flightId" value={flightId} />
            <button
              type="submit"
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400"
            >
              Acknowledge
            </button>
          </form>
        )}
      </div>

      {/* Issue */}
      <div className="rounded-md border border-navy-700 bg-navy-950 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Issue
        </div>
        {assignment.issue ? (
          <div className="space-y-2">
            {assignment.issueResolvedAt && (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-200">
                  <span>✓</span>
                  <span>Resolved by operator</span>
                  <span className="ml-1 text-emerald-300/70">
                    · {new Date(assignment.issueResolvedAt).toUTCString().slice(5, 22)} UTC
                  </span>
                </div>
                {assignment.issueResolution && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-emerald-100">
                    {assignment.issueResolution}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-amber-200 whitespace-pre-wrap">
              {assignment.issue}
            </p>
            {assignment.issueUpdatedAt && (
              <p className="text-xs text-slate-500">
                Last updated{" "}
                {new Date(assignment.issueUpdatedAt).toUTCString().slice(5, 22)} UTC
              </p>
            )}
            <div className="flex gap-2">
              <form action={clearIssueAction as unknown as (fd: FormData) => void}>
                <input type="hidden" name="flightId" value={flightId} />
                <button
                  type="submit"
                  className="rounded-md border border-navy-700 bg-navy-900 px-3 py-1.5 text-xs text-slate-300 hover:border-amber-500"
                >
                  Clear
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form
            action={flagIssueAction as unknown as (fd: FormData) => void}
            className="space-y-2"
          >
            <input type="hidden" name="flightId" value={flightId} />
            <textarea
              name="issue"
              required
              maxLength={500}
              rows={3}
              placeholder="Describe the issue (max 500 chars)..."
              className="w-full rounded-md border border-navy-700 bg-navy-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-amber-400"
            >
              Flag issue
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

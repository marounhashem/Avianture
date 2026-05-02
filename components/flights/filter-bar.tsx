import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export type StatusFilter = "all" | "draft" | "active" | "completed" | "cancelled";
export type AttentionFilter = "messages" | "requests" | "assignments" | undefined;

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const ATTENTION_OPTIONS: { value: AttentionFilter; label: string }[] = [
  { value: undefined, label: "All flights" },
  { value: "messages", label: "💬 Messages" },
  { value: "requests", label: "⚠ Open Requests" },
  { value: "assignments", label: "⏳ Pending Assignments" },
];

function buildHref({
  q,
  status,
  filter,
}: {
  q?: string;
  status?: StatusFilter;
  filter?: AttentionFilter;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status && status !== "all") params.set("status", status);
  if (filter) params.set("filter", filter);
  const qs = params.toString();
  return qs ? `/app/flights?${qs}` : "/app/flights";
}

export function FilterBar({
  q,
  status,
  filter,
  totalShown,
  totalAll,
  badges,
}: {
  q: string;
  status: StatusFilter;
  filter: AttentionFilter;
  totalShown: number;
  totalAll: number;
  /** Aggregate counts across all flights, used to show numeric badges on the
   * attention chips so the user knows what's waiting before clicking. */
  badges: { messages: number; requests: number; assignments: number };
}) {
  const anyActive = !!q || status !== "all" || !!filter;

  const badgeFor = (value: AttentionFilter): number | null => {
    if (value === "messages") return badges.messages;
    if (value === "requests") return badges.requests;
    if (value === "assignments") return badges.assignments;
    return null;
  };

  return (
    <div className="space-y-3">
      <form
        action="/app/flights"
        method="get"
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by tail or ICAO..."
            className="w-full rounded-md border border-navy-700 bg-navy-950 pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-500"
          />
        </div>
        {/* Preserve other params on search submit */}
        {status !== "all" && (
          <input type="hidden" name="status" value={status} />
        )}
        {filter && <input type="hidden" name="filter" value={filter} />}
        <button
          type="submit"
          className="rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const href = buildHref({
            q: q || undefined,
            status: opt.value,
            filter,
          });
          const active = status === opt.value;
          return (
            <Link
              key={opt.value}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
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

      <div className="flex flex-wrap gap-2">
        {ATTENTION_OPTIONS.map((opt) => {
          const href = buildHref({
            q: q || undefined,
            status,
            filter: opt.value,
          });
          const active = filter === opt.value;
          const badge = badgeFor(opt.value);
          return (
            <Link
              key={opt.label}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                active
                  ? "border-amber-500/60 bg-amber-500/10 text-amber-300"
                  : "border-navy-700 bg-navy-950 text-slate-400 hover:border-amber-500/40",
              )}
            >
              <span>{opt.label}</span>
              {badge !== null && badge > 0 && (
                <span
                  className={cn(
                    "inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                    active
                      ? "bg-amber-500/30 text-amber-200"
                      : "bg-red-500/20 text-red-300",
                  )}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {anyActive ? (
            <>
              Showing <span className="text-slate-200">{totalShown}</span> of{" "}
              <span className="text-slate-200">{totalAll}</span> flights
            </>
          ) : (
            <>{totalAll} flight{totalAll === 1 ? "" : "s"}</>
          )}
        </span>
        {anyActive && (
          <Link
            href="/app/flights"
            className="text-amber-400 hover:underline"
          >
            Clear all
          </Link>
        )}
      </div>
    </div>
  );
}

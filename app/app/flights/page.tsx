import Link from "next/link";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { FlightCard } from "@/components/flights/flight-card";
import {
  FilterBar,
  type StatusFilter,
  type AttentionFilter,
} from "@/components/flights/filter-bar";
import { Plane } from "lucide-react";
import { lastSeenMap, computeUnread } from "@/lib/flights/views";

const VALID_STATUS: StatusFilter[] = [
  "all",
  "draft",
  "active",
  "completed",
  "cancelled",
];
const VALID_ATTENTION = ["messages", "requests", "assignments"] as const;

function parseStatus(raw: string | undefined): StatusFilter {
  if (!raw) return "all";
  const v = raw.toLowerCase();
  return (VALID_STATUS as readonly string[]).includes(v)
    ? (v as StatusFilter)
    : "all";
}

function parseAttention(raw: string | undefined): AttentionFilter {
  if (!raw) return undefined;
  const v = raw.toLowerCase();
  return (VALID_ATTENTION as readonly string[]).includes(v)
    ? (v as Exclude<AttentionFilter, undefined>)
    : undefined;
}

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; filter?: string }>;
}) {
  const user = await requireOperator();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const status = parseStatus(sp.status);
  const filter = parseAttention(sp.filter);

  const flights = await db.flight.findMany({
    where: { operatorId: user.operatorId },
    include: {
      handlerRequests: { include: { services: true } },
      crewAssignments: true,
      messages: { select: { createdAt: true } },
      _count: { select: { crewAssignments: true } },
    },
    orderBy: { etdUtc: "asc" },
  });

  const seen = await lastSeenMap(
    user.id,
    flights.map((f) => f.id),
  );

  const flightsWithBadges = flights.map((f) => ({
    flight: f,
    badges: {
      unread: computeUnread(f.messages, seen.get(f.id)),
      issues: f.crewAssignments.filter(
        (a) => a.issue && !a.issueResolvedAt,
      ).length,
      pending: f.handlerRequests.filter((r) => !r.inviteAcceptedAt).length,
    },
  }));

  // Aggregate counts for filter chip badges (across ALL flights, not the filtered subset).
  const totals = flightsWithBadges.reduce(
    (acc, { badges }) => ({
      messages: acc.messages + badges.unread,
      // "requests" = pending handler requests
      requests: acc.requests + badges.pending,
      // "assignments" = open crew issues / unacknowledged assignments
      assignments: acc.assignments + badges.issues,
    }),
    { messages: 0, requests: 0, assignments: 0 },
  );

  // Apply filters
  const filtered = flightsWithBadges.filter(({ flight, badges }) => {
    // Search across tail + ICAO
    if (q) {
      const needle = q.toLowerCase();
      const hay = `${flight.tailNumber} ${flight.originIcao} ${flight.destIcao}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    // Status
    if (status !== "all" && flight.status.toLowerCase() !== status) return false;
    // Attention
    if (filter === "messages" && badges.unread === 0) return false;
    if (filter === "requests" && badges.pending === 0) return false;
    if (filter === "assignments" && badges.issues === 0) return false;
    return true;
  });

  const anyFilter = !!q || status !== "all" || !!filter;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flights</h1>
        </div>
        <Link
          href="/app/flights/new"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
        >
          New flight
        </Link>
      </div>

      <FilterBar
        q={q}
        status={status}
        filter={filter}
        totalShown={filtered.length}
        totalAll={flights.length}
        badges={totals}
      />

      {flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
          <Plane className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No flights yet. Create your first one.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
          <Plane className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No flights match these filters.{" "}
            {anyFilter && (
              <Link href="/app/flights" className="text-amber-400 hover:underline">
                Clear all
              </Link>
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(({ flight, badges }) => (
            <FlightCard key={flight.id} flight={flight} badges={badges} />
          ))}
        </div>
      )}
    </div>
  );
}

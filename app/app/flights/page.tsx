import Link from "next/link";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { FlightCard } from "@/components/flights/flight-card";
import { Plane } from "lucide-react";
import { lastSeenMap, computeUnread } from "@/lib/flights/views";

export default async function FlightsPage() {
  const user = await requireOperator();
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
      issues: f.crewAssignments.filter((a) => a.issue).length,
      pending: f.handlerRequests.filter((r) => !r.inviteAcceptedAt).length,
    },
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Flights</h1>
          <p className="text-sm text-slate-400 mt-1">
            {flights.length} flight{flights.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/app/flights/new"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
        >
          New flight
        </Link>
      </div>
      {flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
          <Plane className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No flights yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {flightsWithBadges.map(({ flight, badges }) => (
            <FlightCard key={flight.id} flight={flight} badges={badges} />
          ))}
        </div>
      )}
    </div>
  );
}

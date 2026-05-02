import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { lastSeenMap, computeUnread } from "@/lib/flights/views";
import { StatCard } from "@/components/dashboard/stat-card";
import { FlightCard } from "@/components/flights/flight-card";
import { Plane } from "lucide-react";

export default async function AppIndex() {
  const user = await requireAuth();
  if (user.role === "HANDLER") redirect("/app/hub");
  if (user.role === "CREW") redirect("/app/schedule");

  // Operator dashboard
  if (user.role !== "OPERATOR" || !user.operatorId) {
    redirect("/app/account");
  }

  // Two independent queries in parallel.
  const [operator, flights] = await Promise.all([
    db.operator.findUnique({ where: { id: user.operatorId } }),
    db.flight.findMany({
      where: { operatorId: user.operatorId },
      include: {
        handlerRequests: { include: { services: true } },
        crewAssignments: true,
        messages: { select: { createdAt: true } },
        _count: { select: { crewAssignments: true } },
      },
      orderBy: { etdUtc: "asc" },
    }),
  ]);

  // lastSeenMap depends on flight IDs.
  const seen = await lastSeenMap(
    user.id,
    flights.map((f) => f.id),
  );

  // Aggregate KPI counts from already-fetched flight data (no extra queries).
  let unread = 0;
  let requestsCount = 0;
  let assignmentsCount = 0;
  for (const f of flights) {
    unread += computeUnread(f.messages, seen.get(f.id));
    // "Requests" = flight requests an operator/pilot makes to handlers that
    // are still awaiting acknowledgement.
    requestsCount += f.handlerRequests.filter((r) => !r.inviteAcceptedAt).length;
    // "Assignments" = crew or handlers attached to a flight who haven't
    // acknowledged their assignment yet.
    assignmentsCount += f.crewAssignments.filter(
      (a) => a.issue && !a.issueResolvedAt,
    ).length;
  }

  // Upcoming flights: closest date first, capped at 3.
  // (db query already orders by etdUtc asc; we just filter to future.)
  const now = new Date();
  const upcoming = flights.filter((f) => f.etdUtc >= now).slice(0, 3);
  const upcomingWithBadges = upcoming.map((f) => ({
    flight: f,
    badges: {
      unread: computeUnread(f.messages, seen.get(f.id)),
      issues: f.crewAssignments.filter((a) => a.issue && !a.issueResolvedAt)
        .length,
      pending: f.handlerRequests.filter((r) => !r.inviteAcceptedAt).length,
    },
  }));

  const activeFlights = flights.filter(
    (f) => f.status === "ACTIVE" || f.status === "DRAFT",
  ).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "Operator"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {operator?.name ?? "Workspace"} · {activeFlights} active flight
          {activeFlights === 1 ? "" : "s"}
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          href="/app/messages"
          emoji="💬"
          count={unread}
          label="Unread messages"
          tone="amber"
        />
        <StatCard
          href="/app/flights?filter=requests"
          emoji="⚠"
          count={requestsCount}
          label="Requests"
          tone="red"
        />
        <StatCard
          href="/app/flights?filter=assignments"
          emoji="⏳"
          count={assignmentsCount}
          label="Assignments"
          tone="slate"
        />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Upcoming flights</h2>
          <Link
            href="/app/flights"
            className="text-xs text-amber-400 hover:underline"
          >
            View all
          </Link>
        </div>
        {upcomingWithBadges.length === 0 ? (
          <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
            <Plane className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 text-sm text-slate-400">
              No upcoming flights.{" "}
              <Link
                href="/app/flights/new"
                className="text-amber-400 hover:underline"
              >
                Create one
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcomingWithBadges.map(({ flight, badges }) => (
              <FlightCard key={flight.id} flight={flight} badges={badges} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

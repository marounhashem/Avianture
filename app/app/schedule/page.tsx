import { requireCrew } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CrewFlightCard } from "@/components/schedule/crew-flight-card";
import { CalendarDays } from "lucide-react";
import { lastSeenMap, computeUnread } from "@/lib/flights/views";

export default async function SchedulePage() {
  const user = await requireCrew();
  // eslint-disable-next-line react-hooks/purity -- server component rendered per request, time-based scoping is intentional
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // last 30 days + future

  const flights = await db.flight.findMany({
    where: {
      crewAssignments: { some: { crewMemberId: user.crewMemberId } },
      etdUtc: { gte: since },
    },
    include: {
      crewAssignments: { include: { crewMember: true } },
      messages: {
        where: { isSystem: false, deletedAt: null },
        select: { createdAt: true },
      },
    },
    orderBy: { etdUtc: "asc" },
  });

  const seen = await lastSeenMap(
    user.id,
    flights.map((f) => f.id),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Schedule</h1>
        <p className="text-sm text-slate-400 mt-1">
          {flights.length} flight{flights.length === 1 ? "" : "s"} for {user.name ?? "you"}
        </p>
      </div>
      {flights.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-700 p-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 text-sm text-slate-400">
            No flights yet. Check back when an operator assigns you to a flight.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {flights.map((f) => (
            <CrewFlightCard
              key={f.id}
              flight={f}
              myCrewMemberId={user.crewMemberId}
              unread={computeUnread(f.messages, seen.get(f.id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

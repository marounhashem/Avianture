import { notFound } from "next/navigation";
import { requireCrew } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { FlightHeader } from "@/components/flights/flight-header";
import { HandlerStatusList } from "@/components/flights/handler-status-list";
import { StatusTimeline } from "@/components/flights/status-timeline";
import { FlightThread } from "@/components/flights/flight-thread";
import { MyAssignmentPanel } from "@/components/schedule/my-assignment-panel";
import { markFlightSeen } from "@/lib/flights/views";

export default async function CrewFlightDetail({
  params,
  searchParams,
}: {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { flightId } = await params;
  const { edit } = await searchParams;
  const user = await requireCrew();

  const flight = await db.flight.findFirst({
    where: {
      id: flightId,
      crewAssignments: { some: { crewMemberId: user.crewMemberId } },
    },
    include: {
      crewAssignments: { include: { crewMember: true } },
      handlerRequests: {
        include: {
          handler: true,
          services: {
            include: {
              statusLogs: {
                include: { changedBy: true },
                orderBy: { changedAt: "desc" },
              },
            },
          },
        },
      },
    },
  });
  if (!flight) notFound();

  await markFlightSeen(user.id, flight.id);

  const allLogs = flight.handlerRequests.flatMap((hr) =>
    hr.services.flatMap((s) => s.statusLogs),
  );
  allLogs.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 space-y-6"
      data-flight-id={flight.id}
    >
      <FlightHeader flight={flight} />

      {(() => {
        const mine = flight.crewAssignments.find((a) => a.crewMemberId === user.crewMemberId);
        return mine ? <MyAssignmentPanel flightId={flight.id} assignment={mine} /> : null;
      })()}

      <section className="rounded-lg border border-navy-700 bg-navy-900 p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Crew on this flight</h2>
        {flight.crewAssignments.length === 0 ? (
          <p className="text-sm text-slate-500">No crew appointed yet.</p>
        ) : (
          <ul className="space-y-2">
            {flight.crewAssignments.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-navy-700 bg-navy-950 px-3 py-2"
              >
                <span className="text-sm">
                  {a.crewMember.name}
                  {a.crewMemberId === user.crewMemberId && (
                    <span className="ml-2 text-xs text-amber-400">(you)</span>
                  )}
                </span>
                <span className="font-mono text-xs text-amber-400">{a.crewMember.role}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HandlerStatusList requests={flight.handlerRequests} />

      <StatusTimeline logs={allLogs} />

      <FlightThread
        flightId={flight.id}
        currentUserId={user.id}
        basePath={`/app/schedule/${flight.id}`}
        editingMessageId={edit}
      />

      <AutoRefresh />
    </div>
  );
}

function AutoRefresh() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `setTimeout(() => { if (document.visibilityState === 'visible') location.reload(); }, 5000);`,
      }}
    />
  );
}

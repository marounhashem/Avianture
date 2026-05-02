import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CrewSection } from "@/components/flights/crew-section";
import { HandlerSection } from "@/components/flights/handler-section";
import { StatusTimeline } from "@/components/flights/status-timeline";
import { FlightHeader } from "@/components/flights/flight-header";
import { FlightThread } from "@/components/flights/flight-thread";
import { markFlightSeen } from "@/lib/flights/views";
import { APP_BASE_URL } from "@/lib/email/resend";

export default async function FlightDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; newHandler?: string }>;
}) {
  const { id } = await params;
  const { edit, newHandler } = await searchParams;
  const user = await requireOperator();
  const flight = await db.flight.findFirst({
    where: { id, operatorId: user.operatorId },
    include: {
      crewAssignments: {
        include: { crewMember: true, issueResolvedBy: true },
      },
      handlerRequests: {
        include: {
          handler: true,
          services: { include: { statusLogs: { include: { changedBy: true }, orderBy: { changedAt: "desc" } } } },
        },
      },
    },
  });
  if (!flight) notFound();

  await markFlightSeen(user.id, flight.id);

  // Filter handlers by airport coverage. Include handlers whose airports[]
  // contains the relevant ICAO, plus handlers with no airports specified
  // (legacy / unspecified — operator can still pick them).
  const handlerWhere = (icao: string) => ({
    operatorId: user.operatorId,
    OR: [{ airports: { has: icao } }, { airports: { isEmpty: true } }],
  });

  const [availableCrew, originHandlers, destHandlers] = await Promise.all([
    db.crewMember.findMany({
      where: { operatorId: user.operatorId },
      orderBy: { name: "asc" },
    }),
    db.handler.findMany({
      where: handlerWhere(flight.originIcao),
      orderBy: { name: "asc" },
    }),
    db.handler.findMany({
      where: handlerWhere(flight.destIcao),
      orderBy: { name: "asc" },
    }),
  ]);

  // Use the same APP_BASE_URL source the invite emails use, so the link
  // displayed in the UI matches the link the handler actually receives.
  // Building from request headers fails on Railway because the container's
  // internal Host is `localhost:<PORT>`, not the public domain.
  const baseUrl = APP_BASE_URL;

  const allLogs = flight.handlerRequests.flatMap((hr) => hr.services.flatMap((s) => s.statusLogs));
  allLogs.sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime());

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10 space-y-6" data-flight-id={flight.id}>
      <FlightHeader flight={flight} />

      <CrewSection flightId={flight.id} assignments={flight.crewAssignments} availableCrew={availableCrew} />

      <HandlerSection
        flightId={flight.id}
        origin={flight.originIcao}
        dest={flight.destIcao}
        requests={flight.handlerRequests}
        originHandlers={originHandlers}
        destHandlers={destHandlers}
        newHandlerForAirport={newHandler}
        baseUrl={baseUrl}
      />

      <StatusTimeline logs={allLogs} />

      <FlightThread
        flightId={flight.id}
        currentUserId={user.id}
        basePath={`/app/flights/${flight.id}`}
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

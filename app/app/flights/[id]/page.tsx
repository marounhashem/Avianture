import { notFound } from "next/navigation";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { CrewSection } from "@/components/flights/crew-section";
import { HandlerSection } from "@/components/flights/handler-section";
import { StatusTimeline } from "@/components/flights/status-timeline";
import { FlightHeader } from "@/components/flights/flight-header";
import { FlightThread } from "@/components/flights/flight-thread";
import { markFlightSeen } from "@/lib/flights/views";
import { headers } from "next/headers";

export default async function FlightDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
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

  const [availableCrew, availableHandlers] = await Promise.all([
    db.crewMember.findMany({ where: { operatorId: user.operatorId }, orderBy: { name: "asc" } }),
    db.handler.findMany({ where: { operatorId: user.operatorId }, orderBy: { name: "asc" } }),
  ]);

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  const baseUrl = `${proto}://${host}`;

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
        availableHandlers={availableHandlers}
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

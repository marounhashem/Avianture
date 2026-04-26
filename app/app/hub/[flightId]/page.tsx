import { notFound } from "next/navigation";
import { requireHandler } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ServiceChecklist } from "@/components/handler-hub/service-checklist";
import { FlightThread } from "@/components/flights/flight-thread";

export default async function HubFlightPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  const user = await requireHandler();
  const req = await db.handlerRequest.findFirst({
    where: { flightId, handlerId: user.handlerId, inviteAcceptedAt: { not: null } },
    include: { flight: true, services: { orderBy: { type: "asc" } } },
  });
  if (!req) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10 space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight font-mono">
            {req.flight.tailNumber}
          </h1>
          <span className="font-mono text-sm text-amber-400">{req.airport}</span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {req.flight.originIcao} → {req.flight.destIcao} · ETD{" "}
          {new Date(req.flight.etdUtc).toUTCString()}
        </p>
      </header>
      <ServiceChecklist flightId={req.flight.id} services={req.services} />
      <FlightThread flightId={req.flight.id} currentUserId={user.id} />
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

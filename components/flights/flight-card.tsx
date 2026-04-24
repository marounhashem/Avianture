import Link from "next/link";
import { StatusChip } from "@/components/shared/status-chip";
import type { Flight, HandlerRequest, ServiceRequest } from "@prisma/client";

type FlightWithStats = Flight & {
  handlerRequests: (HandlerRequest & { services: ServiceRequest[] })[];
  _count: { crewAssignments: number };
};

export function FlightCard({ flight }: { flight: FlightWithStats }) {
  const services = flight.handlerRequests.flatMap((h) => h.services);
  const done = services.filter((s) => s.status === "COMPLETED").length;
  return (
    <Link href={`/app/flights/${flight.id}`} className="block rounded-lg border border-navy-700 bg-navy-900 p-4 hover:border-amber-500/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-amber-400">{flight.tailNumber}</span>
          <span className="font-mono text-sm">{flight.originIcao} → {flight.destIcao}</span>
        </div>
        <span className="text-xs text-slate-400">{new Date(flight.etdUtc).toUTCString().slice(5, 22)} UTC</span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
        <span>{flight.aircraftType}</span>
        <span>·</span>
        <span>PAX {flight.pax}</span>
        <span>·</span>
        <span>{flight._count.crewAssignments} crew</span>
        {services.length > 0 && (
          <>
            <span>·</span>
            <span>{done}/{services.length} services done</span>
          </>
        )}
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { Flight, CrewAssignment, CrewMember } from "@prisma/client";

type FlightWithCrew = Flight & {
  crewAssignments: (CrewAssignment & { crewMember: CrewMember })[];
};

export function CrewFlightCard({
  flight,
  myCrewMemberId,
}: {
  flight: FlightWithCrew;
  myCrewMemberId: string;
}) {
  const myAssignment = flight.crewAssignments.find((a) => a.crewMemberId === myCrewMemberId);
  // eslint-disable-next-line react-hooks/purity -- server-rendered per request; "now" snapshot is intentional
  const isPast = flight.etdUtc.getTime() < Date.now();
  return (
    <Link
      href={`/app/schedule/${flight.id}`}
      className="block rounded-lg border border-navy-700 bg-navy-900 p-4 hover:border-amber-500/40 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-amber-400">{flight.tailNumber}</span>
          <span className="font-mono text-sm">
            {flight.originIcao} → {flight.destIcao}
          </span>
          {myAssignment && (
            <span className="font-mono text-xs rounded bg-navy-800 px-2 py-0.5 text-slate-300">
              {myAssignment.crewMember.role}
            </span>
          )}
          {isPast && (
            <span className="text-xs rounded-full border border-slate-500/40 bg-slate-500/10 px-2 py-0.5 text-slate-400">
              Past
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {new Date(flight.etdUtc).toUTCString().slice(5, 22)} UTC
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
        <span>{flight.aircraftType}</span>
        <span>·</span>
        <span>PAX {flight.pax}</span>
        <span>·</span>
        <span className="font-mono text-[11px]">{flight.status}</span>
      </div>
    </Link>
  );
}

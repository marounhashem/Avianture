import type { Flight } from "@prisma/client";

export function FlightHeader({ flight }: { flight: Flight }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight font-mono">{flight.tailNumber}</h1>
          <span className="font-mono text-lg text-amber-400">
            {flight.originIcao} → {flight.destIcao}
          </span>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          {flight.aircraftType} · PAX {flight.pax} · ETD {new Date(flight.etdUtc).toUTCString()}
        </p>
        {flight.purpose && (
          <p className="text-xs text-slate-500 mt-1">Purpose: {flight.purpose}</p>
        )}
      </div>
    </header>
  );
}

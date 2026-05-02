/**
 * One-off utility: delete a flight by id.
 *
 * Usage (from project root, against the connected DB):
 *   npx tsx scripts/delete-flight.ts <flightId>
 *
 * Production (Railway-linked terminal):
 *   railway run npx tsx scripts/delete-flight.ts <flightId>
 *
 * Cascades automatically to:
 *   - CrewAssignment (onDelete: Cascade on flight relation)
 *   - HandlerRequest -> ServiceRequest -> ServiceStatusLog (cascade)
 *   - FlightMessage (onDelete: Cascade)
 *   - UserFlightView (onDelete: Cascade)
 *
 * The Handler and CrewMember rows themselves are NOT deleted — only the
 * per-flight assignments / requests are. Operator + Users untouched.
 */
import { PrismaClient } from "@prisma/client";

// Prefer DATABASE_PUBLIC_URL when present so this script works from a local
// machine via `railway run`. Inside Railway's container DATABASE_URL is fine
// (internal hostname), but locally that hostname won't resolve.
const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
const db = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const flightId = process.argv[2];
  if (!flightId) {
    console.error("Usage: tsx scripts/delete-flight.ts <flightId>");
    process.exit(1);
  }

  const flight = await db.flight.findUnique({
    where: { id: flightId },
    include: {
      _count: {
        select: {
          crewAssignments: true,
          handlerRequests: true,
          messages: true,
        },
      },
    },
  });

  if (!flight) {
    console.error(`Flight ${flightId} not found.`);
    process.exit(1);
  }

  console.log(
    `Deleting flight ${flight.tailNumber} (${flight.originIcao} -> ${flight.destIcao}, etd ${flight.etdUtc.toISOString()}):\n` +
      `  - ${flight._count.crewAssignments} crew assignment(s)\n` +
      `  - ${flight._count.handlerRequests} handler request(s)\n` +
      `  - ${flight._count.messages} message(s)`,
  );

  await db.flight.delete({ where: { id: flightId } });
  console.log(`Deleted ${flightId}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

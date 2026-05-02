/**
 * One-off utility: delete every flight for a single operator.
 *
 * Usage (Railway-linked terminal):
 *   railway run npx tsx scripts/delete-all-flights.ts <operatorName?>
 *
 * If <operatorName> is omitted, the script auto-resolves the only
 * operator in the database. If there's more than one, it refuses to
 * proceed without an explicit name (safety).
 *
 * Cascades via existing onDelete: Cascade relations:
 *   - CrewAssignment
 *   - HandlerRequest -> ServiceRequest -> ServiceStatusLog
 *   - FlightMessage
 *   - UserFlightView
 *
 * Operator, Users, CrewMember roster, Handler roster — all preserved.
 */
import { PrismaClient } from "@prisma/client";

// Prefer DATABASE_PUBLIC_URL when present so this script works from a local
// machine via `railway run`. Inside Railway's container DATABASE_URL is fine
// (internal `.railway.internal` hostname), but locally that hostname won't
// resolve — we have to use the TCP proxy URL Railway provides.
const url = process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;
const db = new PrismaClient({ datasources: { db: { url } } });

async function main() {
  const requestedName = process.argv[2];

  let operator;
  if (requestedName) {
    operator = await db.operator.findFirst({ where: { name: requestedName } });
    if (!operator) {
      console.error(`Operator "${requestedName}" not found.`);
      process.exit(1);
    }
  } else {
    const all = await db.operator.findMany();
    if (all.length === 0) {
      console.error("No operators in the database.");
      process.exit(1);
    }
    if (all.length > 1) {
      console.error(
        `Multiple operators present (${all.map((o) => `"${o.name}"`).join(", ")}). ` +
          `Pass the operator name as the first arg to disambiguate.`,
      );
      process.exit(1);
    }
    operator = all[0];
  }

  const flights = await db.flight.findMany({
    where: { operatorId: operator.id },
    select: {
      id: true,
      tailNumber: true,
      originIcao: true,
      destIcao: true,
      etdUtc: true,
    },
    orderBy: { etdUtc: "asc" },
  });

  if (flights.length === 0) {
    console.log(`Operator "${operator.name}" has no flights. Nothing to delete.`);
    return;
  }

  console.log(`About to delete ${flights.length} flight(s) for operator "${operator.name}":`);
  for (const f of flights) {
    console.log(
      `  - ${f.tailNumber} ${f.originIcao} -> ${f.destIcao} (etd ${f.etdUtc.toISOString()})`,
    );
  }

  const result = await db.flight.deleteMany({
    where: { operatorId: operator.id },
  });

  console.log(`\nDeleted ${result.count} flight(s).`);
  console.log(
    `Preserved: operator, users, crew roster, handler roster.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

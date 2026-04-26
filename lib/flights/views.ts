import { db } from "@/lib/db";

export function computeUnread(
  messages: { createdAt: Date }[],
  lastSeen: Date | undefined,
): number {
  if (!lastSeen) return messages.length;
  return messages.filter((m) => m.createdAt > lastSeen).length;
}

/**
 * Records that the given user has now seen the given flight. Idempotent — safe to
 * call on every server render of a flight detail page.
 */
export async function markFlightSeen(userId: string, flightId: string): Promise<void> {
  await db.userFlightView.upsert({
    where: { userId_flightId: { userId, flightId } },
    update: { lastSeenAt: new Date() },
    create: { userId, flightId, lastSeenAt: new Date() },
  });
}

/**
 * Builds a flight-id → lastSeenAt map for the given user across the given flights.
 * Returns an empty map when the user has never opened any of these flights.
 */
export async function lastSeenMap(
  userId: string,
  flightIds: string[],
): Promise<Map<string, Date>> {
  if (flightIds.length === 0) return new Map();
  const views = await db.userFlightView.findMany({
    where: { userId, flightId: { in: flightIds } },
    select: { flightId: true, lastSeenAt: true },
  });
  return new Map(views.map((v) => [v.flightId, v.lastSeenAt]));
}

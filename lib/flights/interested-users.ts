import { db } from "@/lib/db";
import type { User } from "@prisma/client";

/**
 * Returns every user who has a stake in a given flight:
 *   - operator users for the flight's operator
 *   - crew users assigned to the flight
 *   - handler users (with accepted invites) on the flight
 *
 * De-duplicated by user id.
 */
export async function getInterestedUsers(flightId: string): Promise<User[]> {
  const flight = await db.flight.findUnique({
    where: { id: flightId },
    include: {
      operator: { include: { users: true } },
      crewAssignments: {
        include: { crewMember: { include: { user: true } } },
      },
      handlerRequests: {
        where: { inviteAcceptedAt: { not: null } },
        include: { handler: { include: { users: true } } },
      },
    },
  });
  if (!flight) return [];

  const collected: User[] = [];
  collected.push(...flight.operator.users);
  for (const a of flight.crewAssignments) {
    if (a.crewMember.user) collected.push(a.crewMember.user);
  }
  for (const r of flight.handlerRequests) {
    collected.push(...r.handler.users);
  }

  const seen = new Set<string>();
  return collected.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

/**
 * Removes users who have viewed this flight within `withinMs` (default 5 min).
 * They're "actively looking" — no need to email them.
 */
export async function filterInactiveUsers(
  users: User[],
  flightId: string,
  withinMs: number = 5 * 60 * 1000,
): Promise<User[]> {
  if (users.length === 0) return [];
  const cutoff = new Date(Date.now() - withinMs);
  const activeViews = await db.userFlightView.findMany({
    where: {
      userId: { in: users.map((u) => u.id) },
      flightId,
      lastSeenAt: { gte: cutoff },
    },
    select: { userId: true },
  });
  const activeIds = new Set(activeViews.map((v) => v.userId));
  return users.filter((u) => !activeIds.has(u.id));
}

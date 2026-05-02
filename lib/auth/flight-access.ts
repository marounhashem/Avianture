import { db } from "@/lib/db";

type SessionUser = {
  id: string;
  role: "OPERATOR" | "CREW" | "HANDLER";
  operatorId?: string | null;
  handlerId?: string | null;
  crewMemberId?: string | null;
};

/**
 * True iff the user is authorized to read/write the given flight's thread.
 *
 * - OPERATOR: must own the flight (operatorId match)
 * - CREW: must be assigned to the flight
 * - HANDLER: must have an accepted handler request on the flight
 */
export async function canAccessFlight(
  user: SessionUser,
  flightId: string,
): Promise<boolean> {
  if (user.role === "OPERATOR" && user.operatorId) {
    const flight = await db.flight.findFirst({
      where: { id: flightId, operatorId: user.operatorId },
      select: { id: true },
    });
    return !!flight;
  }
  if (user.role === "CREW" && user.crewMemberId) {
    const a = await db.crewAssignment.findFirst({
      where: { flightId, crewMemberId: user.crewMemberId },
      select: { id: true },
    });
    return !!a;
  }
  if (user.role === "HANDLER" && user.handlerId) {
    const r = await db.handlerRequest.findFirst({
      where: { flightId, handlerId: user.handlerId, inviteAcceptedAt: { not: null } },
      select: { id: true },
    });
    return !!r;
  }
  return false;
}

/**
 * True iff the user can edit handler service requests (status + note) for
 * the given flight. Two paths:
 *
 * - OPERATOR who owns the flight (full power)
 * - CREW with role=PIC, assigned to this flight, AND has acknowledged the
 *   assignment. SIC and FA never qualify even if assigned.
 *
 * Used by the principal service-update action and to gate the edit UI on
 * the schedule page.
 */
export async function canEditServicesForFlight(
  user: SessionUser,
  flightId: string,
): Promise<boolean> {
  if (user.role === "OPERATOR" && user.operatorId) {
    const flight = await db.flight.findFirst({
      where: { id: flightId, operatorId: user.operatorId },
      select: { id: true },
    });
    return !!flight;
  }
  if (user.role === "CREW" && user.crewMemberId) {
    const a = await db.crewAssignment.findFirst({
      where: {
        flightId,
        crewMemberId: user.crewMemberId,
        acknowledgedAt: { not: null },
        crewMember: { role: "PIC" },
      },
      select: { id: true },
    });
    return !!a;
  }
  return false;
}

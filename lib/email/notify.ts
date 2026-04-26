import { db } from "@/lib/db";
import { APP_BASE_URL } from "./resend";
import {
  sendIssueNotification,
  sendMessageNotification,
  sendServiceStatusNotification,
} from "./send";
import {
  getInterestedUsers,
  filterInactiveUsers,
} from "@/lib/flights/interested-users";

const MESSAGE_PREVIEW_MAX = 240;

function flightUrlForRole(role: "OPERATOR" | "CREW" | "HANDLER", flightId: string): string {
  if (role === "OPERATOR") return `${APP_BASE_URL}/app/flights/${flightId}`;
  if (role === "CREW") return `${APP_BASE_URL}/app/schedule/${flightId}`;
  return `${APP_BASE_URL}/app/hub/${flightId}`;
}

/**
 * Notify the flight's operator users (only those not currently active on the flight)
 * that a crew member raised an issue.
 */
export async function notifyIssueRaised({
  flightId,
  raisedByUserId,
  issue,
}: {
  flightId: string;
  raisedByUserId: string;
  issue: string;
}): Promise<void> {
  const flight = await db.flight.findUnique({
    where: { id: flightId },
    select: {
      tailNumber: true,
      originIcao: true,
      destIcao: true,
      etdUtc: true,
      operatorId: true,
    },
  });
  if (!flight) return;

  const raisedBy = await db.user.findUnique({
    where: { id: raisedByUserId },
    select: { name: true, role: true, crewMember: { select: { role: true } } },
  });
  if (!raisedBy) return;

  // Operator users for the flight's operator
  const operators = await db.user.findMany({
    where: { operatorId: flight.operatorId, role: "OPERATOR" },
  });

  const recipients = await filterInactiveUsers(
    operators.filter((u) => u.id !== raisedByUserId),
    flightId,
  );

  await Promise.allSettled(
    recipients.map((u) =>
      sendIssueNotification(u.email, {
        raisedByName: raisedBy.name,
        raisedByRole: raisedBy.crewMember?.role ?? raisedBy.role,
        issue,
        flight,
        flightUrl: flightUrlForRole("OPERATOR", flightId),
      }).then((r) => {
        if (!r.ok) console.error(`[notify:issue] ${u.email}: ${r.error}`);
      }),
    ),
  );
}

/**
 * Notify all interested parties on a flight (except the author and currently-active users)
 * that a new thread message arrived.
 */
export async function notifyNewMessage({
  flightId,
  authorId,
  body,
}: {
  flightId: string;
  authorId: string;
  body: string;
}): Promise<void> {
  const flight = await db.flight.findUnique({
    where: { id: flightId },
    select: {
      tailNumber: true,
      originIcao: true,
      destIcao: true,
      etdUtc: true,
    },
  });
  if (!flight) return;

  const author = await db.user.findUnique({
    where: { id: authorId },
    select: { name: true, role: true },
  });
  if (!author) return;

  const all = await getInterestedUsers(flightId);
  const others = all.filter((u) => u.id !== authorId);
  const recipients = await filterInactiveUsers(others, flightId);

  const preview =
    body.length > MESSAGE_PREVIEW_MAX
      ? body.slice(0, MESSAGE_PREVIEW_MAX) + "…"
      : body;

  await Promise.allSettled(
    recipients.map((u) =>
      sendMessageNotification(u.email, {
        authorName: author.name,
        authorRole: author.role,
        body: preview,
        flight,
        flightUrl: flightUrlForRole(u.role, flightId),
      }).then((r) => {
        if (!r.ok) console.error(`[notify:message] ${u.email}: ${r.error}`);
      }),
    ),
  );
}

/**
 * Notify operator users (only those not currently active) that a handler
 * updated a ServiceRequest's status.
 */
export async function notifyServiceStatusChanged({
  serviceRequestId,
  oldStatus,
  newStatus,
  changedByUserId,
}: {
  serviceRequestId: string;
  oldStatus: string;
  newStatus: string;
  changedByUserId: string;
}): Promise<void> {
  const sr = await db.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: {
      handlerRequest: {
        include: {
          handler: true,
          flight: true,
        },
      },
    },
  });
  if (!sr) return;

  const flight = sr.handlerRequest.flight;
  const operators = await db.user.findMany({
    where: { operatorId: flight.operatorId, role: "OPERATOR" },
  });

  const recipients = await filterInactiveUsers(
    operators.filter((u) => u.id !== changedByUserId),
    flight.id,
  );

  await Promise.allSettled(
    recipients.map((u) =>
      sendServiceStatusNotification(u.email, {
        handlerName: sr.handlerRequest.handler.name,
        airport: sr.handlerRequest.airport,
        serviceType: sr.type,
        oldStatus,
        newStatus,
        note: sr.note,
        flight: {
          tailNumber: flight.tailNumber,
          originIcao: flight.originIcao,
          destIcao: flight.destIcao,
          etdUtc: flight.etdUtc,
        },
        flightUrl: flightUrlForRole("OPERATOR", flight.id),
      }).then((r) => {
        if (!r.ok)
          console.error(`[notify:service] ${u.email}: ${r.error}`);
      }),
    ),
  );
}

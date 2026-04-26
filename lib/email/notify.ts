import { db } from "@/lib/db";
import { APP_BASE_URL } from "./resend";
import {
  sendIssueNotification,
  sendMessageNotification,
  sendServiceStatusNotification,
  sendIssueResolvedNotification,
  sendMentionNotification,
} from "./send";
import { extractMentionedUsers } from "@/lib/messages/mentions";
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

  const inactive = await filterInactiveUsers(
    operators.filter((u) => u.id !== raisedByUserId),
    flightId,
  );
  const recipients = inactive.filter((u) => u.notifyOnIssueRaised);

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

  // Mentions: parse against the candidate pool (interested users on this flight).
  const mentioned = extractMentionedUsers(body, others).filter(
    (u) => u.notifyOnMention,
  );
  const mentionedIds = new Set(mentioned.map((u) => u.id));

  // Regular notifications: anyone else who's interested + inactive + opted-in.
  const inactive = await filterInactiveUsers(others, flightId);
  const regularRecipients = inactive
    .filter((u) => u.notifyOnNewMessage)
    .filter((u) => !mentionedIds.has(u.id)); // mentioned users get the mention email instead

  const preview =
    body.length > MESSAGE_PREVIEW_MAX
      ? body.slice(0, MESSAGE_PREVIEW_MAX) + "…"
      : body;

  // Mention emails — bypass active-filter and notifyOnNewMessage; use notifyOnMention only.
  await Promise.allSettled(
    mentioned.map((u) =>
      sendMentionNotification(u.email, {
        authorName: author.name,
        authorRole: author.role,
        body: preview,
        flight,
        flightUrl: flightUrlForRole(u.role, flightId),
      }).then((r) => {
        if (!r.ok) console.error(`[notify:mention] ${u.email}: ${r.error}`);
      }),
    ),
  );

  // Regular new-message emails for everyone else.
  await Promise.allSettled(
    regularRecipients.map((u) =>
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

  const inactive = await filterInactiveUsers(
    operators.filter((u) => u.id !== changedByUserId),
    flight.id,
  );
  const recipients = inactive.filter((u) => u.notifyOnServiceStatus);

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

/**
 * Notify the crew member (the user behind the CrewMember) that their issue
 * was resolved. Skipped if the crew member has no linked user account or is
 * actively viewing the flight.
 */
export async function notifyIssueResolved({
  crewAssignmentId,
  resolvedByUserId,
}: {
  crewAssignmentId: string;
  resolvedByUserId: string;
}): Promise<void> {
  const a = await db.crewAssignment.findUnique({
    where: { id: crewAssignmentId },
    include: {
      flight: true,
      crewMember: { include: { user: true } },
    },
  });
  if (!a) return;
  if (!a.issue) return; // nothing to notify about
  const crewUser = a.crewMember.user;
  if (!crewUser) return; // crew has no login account

  const resolver = await db.user.findUnique({
    where: { id: resolvedByUserId },
    select: { name: true },
  });
  if (!resolver) return;

  const filtered = await filterInactiveUsers([crewUser], a.flightId);
  if (filtered.length === 0) return;
  if (!crewUser.notifyOnIssueResolved) return;

  const send = await sendIssueResolvedNotification(crewUser.email, {
    resolvedByName: resolver.name,
    resolution: a.issueResolution,
    originalIssue: a.issue,
    flight: {
      tailNumber: a.flight.tailNumber,
      originIcao: a.flight.originIcao,
      destIcao: a.flight.destIcao,
      etdUtc: a.flight.etdUtc,
    },
    flightUrl: flightUrlForRole("CREW", a.flightId),
  });
  if (!send.ok) {
    console.error(`[notify:issue-resolved] ${crewUser.email}: ${send.error}`);
  }
}

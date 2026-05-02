"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invites/tokens";
import {
  DEFAULT_SERVICE_TYPES,
  type ServiceType,
} from "@/lib/flights/services";
import { sendHandlerInvite } from "@/lib/email/send";
import { APP_BASE_URL } from "@/lib/email/resend";
import {
  notifyIssueResolved,
  notifyServiceStatusChanged,
} from "@/lib/email/notify";

/**
 * Append a system message to the flight thread for audit purposes.
 * System messages render differently from chat (greyed/italic) and can't be
 * edited or deleted. Authored by the user who triggered the action.
 */
async function postSystemMessage(opts: {
  flightId: string;
  authorId: string;
  body: string;
}): Promise<void> {
  await db.flightMessage.create({
    data: {
      flightId: opts.flightId,
      authorId: opts.authorId,
      body: opts.body,
      isSystem: true,
    },
  });
}

/**
 * Reads which DEFAULT_SERVICE_TYPES are checked in the invite form, and the
 * optional note for each. Form fields:
 *   service-include-FUEL=on    (checkbox; absent when unchecked)
 *   service-note-FUEL=...      (text input, optional)
 *
 * Returns one create record per service type. Unchecked services are still
 * created so the operator can flip them back to PENDING later — they just
 * start in NOT_REQUIRED so the handler doesn't see them as actionable.
 */
function buildServiceCreates(
  formData: FormData,
): { type: ServiceType; status: "PENDING" | "NOT_REQUIRED"; note: string | null }[] {
  return DEFAULT_SERVICE_TYPES.map((t) => {
    const included = formData.get(`service-include-${t}`) !== null;
    const noteRaw = String(formData.get(`service-note-${t}`) ?? "").trim();
    return {
      type: t,
      status: included ? "PENDING" : "NOT_REQUIRED",
      note: noteRaw || null,
    } as const;
  });
}

const appointCrewSchema = z.object({
  flightId: z.string(),
  crewMemberId: z.string(),
});

export async function appointCrewAction(formData: FormData) {
  const user = await requireOperator();
  const { flightId, crewMemberId } = appointCrewSchema.parse(Object.fromEntries(formData));
  const flight = await db.flight.findFirst({ where: { id: flightId, operatorId: user.operatorId } });
  if (!flight) return { error: "Flight not found" };
  const crew = await db.crewMember.findFirst({ where: { id: crewMemberId, operatorId: user.operatorId } });
  if (!crew) return { error: "Crew member not found" };
  await db.crewAssignment.upsert({
    where: { flightId_crewMemberId: { flightId, crewMemberId } },
    update: {},
    create: { flightId, crewMemberId },
  });
  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

export async function unappointCrewAction(formData: FormData) {
  const user = await requireOperator();
  const flightId = String(formData.get("flightId"));
  const crewMemberId = String(formData.get("crewMemberId"));
  const flight = await db.flight.findFirst({ where: { id: flightId, operatorId: user.operatorId } });
  if (!flight) return { error: "Flight not found" };
  await db.crewAssignment.deleteMany({ where: { flightId, crewMemberId } });
  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

const inviteSchema = z.object({
  flightId: z.string(),
  handlerId: z.string(),
  airport: z.string(),
});

export async function inviteHandlerAction(formData: FormData) {
  const user = await requireOperator();
  const { flightId, handlerId, airport } = inviteSchema.parse(Object.fromEntries(formData));
  const flight = await db.flight.findFirst({
    where: { id: flightId, operatorId: user.operatorId },
    include: { operator: true },
  });
  if (!flight) return { error: "Flight not found" };
  const handler = await db.handler.findFirst({
    where: { id: handlerId, operatorId: user.operatorId },
  });
  if (!handler) return { error: "Handler not found" };

  const serviceCreates = buildServiceCreates(formData);

  const inviteToken = generateInviteToken();
  const handlerRequest = await db.handlerRequest.create({
    data: {
      flightId,
      handlerId,
      airport,
      inviteToken,
      inviteExpiresAt: inviteExpiryDate(),
      services: {
        create: serviceCreates.map((s) => ({
          type: s.type,
          status: s.status,
          note: s.note,
        })),
      },
    },
    include: { services: true },
  });

  // System message in the flight thread — audit log of who invited whom.
  await postSystemMessage({
    flightId,
    authorId: user.id,
    body: `${user.name ?? "Operator"} invited ${handler.name} as a handler for ${airport}.`,
  });

  // Best-effort email — never fail the action if Resend is unavailable.
  // Only mention the services that the handler is actually expected to act on.
  if (handler.email) {
    const inviteUrl = `${APP_BASE_URL}/invite/${inviteToken}`;
    const requestedServices = handlerRequest.services
      .filter((s) => s.status !== "NOT_REQUIRED")
      .map((s) => s.type);
    const send = await sendHandlerInvite(handler.email, {
      handlerName: handler.name,
      operatorName: flight.operator.name,
      flight: {
        tailNumber: flight.tailNumber,
        originIcao: flight.originIcao,
        destIcao: flight.destIcao,
        etdUtc: flight.etdUtc,
        aircraftType: flight.aircraftType,
        pax: flight.pax,
      },
      airport,
      services: requestedServices,
      inviteUrl,
    });
    if (!send.ok) {
      console.error(
        `[invite] Failed to send invite email to ${handler.email}: ${send.error}`,
      );
    }
  }

  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

// E.164-style international phone — same shape as the standalone Handlers form.
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const phoneSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v) return null;
    const stripped = v.replace(/[\s\-()]/g, "");
    return stripped === "" ? null : stripped;
  })
  .refine((v) => v === null || PHONE_REGEX.test(v), {
    message: "Phone must be international format, e.g. +97155000000.",
  });

const createAndInviteSchema = z.object({
  flightId: z.string(),
  airport: z.string().min(2).max(10),
  name: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: phoneSchema,
});

/**
 * One-click "create handler + invite for this flight" used from the inline
 * form in <HandlerSection /> when the operator picks "+ New handler" on the
 * dropdown. The new handler's `airports[]` is pre-populated with the airport
 * we're inviting them for, so subsequent invites filter cleanly.
 */
export async function createAndInviteHandlerAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = createAndInviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid input" };
  }
  const { flightId, airport, name, email, phone } = parsed.data;

  const flight = await db.flight.findFirst({
    where: { id: flightId, operatorId: user.operatorId },
    include: { operator: true },
  });
  if (!flight) return { error: "Flight not found" };

  // 1) Create the handler with the airport pre-populated
  const handler = await db.handler.create({
    data: {
      operatorId: user.operatorId,
      name,
      email: email || null,
      phone,
      airports: [airport.toUpperCase()],
    },
  });

  // 2) Create the HandlerRequest + service requests, honoring the operator's
  // pre-invite checkboxes/notes (services unchecked become NOT_REQUIRED).
  const serviceCreates = buildServiceCreates(formData);
  const inviteToken = generateInviteToken();
  const handlerRequest = await db.handlerRequest.create({
    data: {
      flightId,
      handlerId: handler.id,
      airport,
      inviteToken,
      inviteExpiresAt: inviteExpiryDate(),
      services: {
        create: serviceCreates.map((s) => ({
          type: s.type,
          status: s.status,
          note: s.note,
        })),
      },
    },
    include: { services: true },
  });

  // System message — audit log of who invited whom.
  await postSystemMessage({
    flightId,
    authorId: user.id,
    body: `${user.name ?? "Operator"} added and invited ${handler.name} as a handler for ${airport}.`,
  });

  // 3) Best-effort email — only list services the handler should act on.
  if (handler.email) {
    const inviteUrl = `${APP_BASE_URL}/invite/${inviteToken}`;
    const requestedServices = handlerRequest.services
      .filter((s) => s.status !== "NOT_REQUIRED")
      .map((s) => s.type);
    const send = await sendHandlerInvite(handler.email, {
      handlerName: handler.name,
      operatorName: flight.operator.name,
      flight: {
        tailNumber: flight.tailNumber,
        originIcao: flight.originIcao,
        destIcao: flight.destIcao,
        etdUtc: flight.etdUtc,
        aircraftType: flight.aircraftType,
        pax: flight.pax,
      },
      airport,
      services: requestedServices,
      inviteUrl,
    });
    if (!send.ok) {
      console.error(
        `[invite:create] Failed to send invite email to ${handler.email}: ${send.error}`,
      );
    }
  }

  revalidatePath(`/app/flights/${flightId}`);
  // Drop the ?newHandler query param so the inline form collapses
  redirect(`/app/flights/${flightId}`);
}

const resolveIssueSchema = z.object({
  flightId: z.string(),
  crewMemberId: z.string(),
  resolution: z.string().max(500).optional().or(z.literal("")),
});

export async function resolveIssueAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = resolveIssueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, crewMemberId, resolution } = parsed.data;

  // Multi-tenant: ensure flight belongs to this operator
  const flight = await db.flight.findFirst({
    where: { id: flightId, operatorId: user.operatorId },
    select: { id: true },
  });
  if (!flight) return { error: "Flight not found" };

  const assignment = await db.crewAssignment.findUnique({
    where: { flightId_crewMemberId: { flightId, crewMemberId } },
  });
  if (!assignment) return { error: "Assignment not found" };
  if (!assignment.issue) return { error: "No issue to resolve" };

  const updated = await db.crewAssignment.update({
    where: { id: assignment.id },
    data: {
      issueResolvedAt: new Date(),
      issueResolvedById: user.id,
      issueResolution: resolution?.trim() || null,
    },
  });

  revalidatePath(`/app/flights/${flightId}`);
  revalidatePath(`/app/schedule/${flightId}`);

  // Best-effort: notify the crew member who raised the issue.
  try {
    await notifyIssueResolved({
      crewAssignmentId: updated.id,
      resolvedByUserId: user.id,
    });
  } catch (e) {
    console.error("[notify:issue-resolved] orchestrator failed:", e);
  }

  return { error: null };
}

const handlerRequestActionSchema = z.object({
  flightId: z.string(),
  handlerRequestId: z.string(),
});

export async function resendHandlerInviteAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = handlerRequestActionSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, handlerRequestId } = parsed.data;

  // Multi-tenant: ensure flight belongs to this operator
  const request = await db.handlerRequest.findFirst({
    where: {
      id: handlerRequestId,
      flightId,
      flight: { operatorId: user.operatorId },
    },
    include: {
      handler: true,
      flight: { include: { operator: true } },
      services: true,
    },
  });
  if (!request) return { error: "Invite not found" };
  if (request.inviteAcceptedAt) return { error: "Invite already accepted" };
  if (request.inviteExpiresAt < new Date())
    return { error: "Invite has expired" };
  if (!request.handler.email) return { error: "Handler has no email on file" };

  const inviteUrl = `${APP_BASE_URL}/invite/${request.inviteToken}`;
  const send = await sendHandlerInvite(request.handler.email, {
    handlerName: request.handler.name,
    operatorName: request.flight.operator.name,
    flight: {
      tailNumber: request.flight.tailNumber,
      originIcao: request.flight.originIcao,
      destIcao: request.flight.destIcao,
      etdUtc: request.flight.etdUtc,
      aircraftType: request.flight.aircraftType,
      pax: request.flight.pax,
    },
    airport: request.airport,
    services: request.services.map((s) => s.type),
    inviteUrl,
  });
  if (!send.ok) {
    console.error(
      `[invite:resend] Failed to email ${request.handler.email}: ${send.error}`,
    );
    return { error: "Couldn't send email — check Resend logs" };
  }

  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

/**
 * Operator-side "edit any service status" action. Unlike the handler path
 * (which is forward-only via ALLOWED_TRANSITIONS), the operator gets free
 * any-to-any transitions — they can flip a COMPLETED back to PENDING if a
 * handler over-claimed, or mark a service NOT_REQUIRED at any time.
 *
 * The change is logged to ServiceStatusLog with the operator's user id and
 * the note text at the moment of the change. Operators are then notified
 * (the existing notify path will email any other operators not viewing).
 */
const operatorUpdateSchema = z.object({
  flightId: z.string(),
  serviceRequestId: z.string(),
  toStatus: z.enum([
    "PENDING",
    "ACKNOWLEDGED",
    "IN_PROGRESS",
    "COMPLETED",
    "NOT_REQUIRED",
  ]),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function operatorUpdateServiceStatusAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = operatorUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, serviceRequestId, toStatus, note } = parsed.data;

  // Multi-tenant: confirm flight + service belong to this operator
  const service = await db.serviceRequest.findFirst({
    where: {
      id: serviceRequestId,
      handlerRequest: {
        flightId,
        flight: { operatorId: user.operatorId },
      },
    },
    include: { handlerRequest: true },
  });
  if (!service) return { error: "Service not found" };

  const oldStatus = service.status;
  const newNote = note?.trim() || null;

  await db.$transaction([
    db.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: toStatus, note: newNote },
    }),
    db.serviceStatusLog.create({
      data: {
        serviceRequestId,
        fromStatus: oldStatus,
        toStatus,
        changedByUserId: user.id,
        note: newNote,
      },
    }),
  ]);

  revalidatePath(`/app/flights/${flightId}`);
  revalidatePath(`/app/hub/${flightId}`);
  revalidatePath(`/app/schedule/${flightId}`);

  // Best-effort: notify other operators who aren't actively viewing.
  try {
    await notifyServiceStatusChanged({
      serviceRequestId,
      oldStatus,
      newStatus: toStatus,
      changedByUserId: user.id,
    });
  } catch (e) {
    console.error("[notify:service:operator] orchestrator failed:", e);
  }

  return { error: null };
}

export async function cancelHandlerInviteAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = handlerRequestActionSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, handlerRequestId } = parsed.data;

  const request = await db.handlerRequest.findFirst({
    where: {
      id: handlerRequestId,
      flightId,
      flight: { operatorId: user.operatorId },
    },
  });
  if (!request) return { error: "Invite not found" };
  if (request.inviteAcceptedAt)
    return { error: "Cannot cancel an accepted invite" };

  await db.handlerRequest.delete({ where: { id: request.id } });

  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

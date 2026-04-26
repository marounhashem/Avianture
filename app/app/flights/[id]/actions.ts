"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { generateInviteToken, inviteExpiryDate } from "@/lib/invites/tokens";
import { DEFAULT_SERVICE_TYPES } from "@/lib/flights/services";
import { sendHandlerInvite } from "@/lib/email/send";
import { APP_BASE_URL } from "@/lib/email/resend";

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

  const inviteToken = generateInviteToken();
  const handlerRequest = await db.handlerRequest.create({
    data: {
      flightId,
      handlerId,
      airport,
      inviteToken,
      inviteExpiresAt: inviteExpiryDate(),
      services: {
        create: DEFAULT_SERVICE_TYPES.map((t) => ({ type: t })),
      },
    },
    include: { services: true },
  });

  // Best-effort email — never fail the action if Resend is unavailable.
  if (handler.email) {
    const inviteUrl = `${APP_BASE_URL}/invite/${inviteToken}`;
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
      services: handlerRequest.services.map((s) => s.type),
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

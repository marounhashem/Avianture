"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHandler } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { canTransition, type ServiceStatus } from "@/lib/flights/services";
import { notifyServiceStatusChanged } from "@/lib/email/notify";

const schema = z.object({
  serviceRequestId: z.string(),
  flightId: z.string(),
  toStatus: z.enum(["PENDING", "ACKNOWLEDGED", "IN_PROGRESS", "COMPLETED"]),
  note: z.string().max(500).optional().or(z.literal("")),
});

export async function updateServiceStatusAction(formData: FormData) {
  const user = await requireHandler();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { serviceRequestId, flightId, toStatus, note } = parsed.data;

  const service = await db.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: { handlerRequest: true },
  });
  if (!service) return { error: "Service not found" };
  if (service.handlerRequest.handlerId !== user.handlerId) return { error: "Forbidden" };
  // Handlers cannot move out of NOT_REQUIRED — only operators can change those.
  // canTransition() already returns an empty list from NOT_REQUIRED, so this
  // is technically redundant, but the explicit message helps debugging.
  if (service.status === "NOT_REQUIRED") {
    return { error: "This service is marked Not required by the operator." };
  }
  if (!canTransition(service.status as ServiceStatus, toStatus as ServiceStatus)) {
    return { error: "Invalid transition" };
  }

  const oldStatus = service.status;
  const newNote = note?.trim() || service.note;

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
  revalidatePath(`/app/hub/${flightId}`);
  revalidatePath(`/app/flights/${flightId}`);
  revalidatePath(`/app/schedule/${flightId}`);

  // Best-effort: notify operators who aren't actively viewing.
  try {
    await notifyServiceStatusChanged({
      serviceRequestId,
      oldStatus,
      newStatus: toStatus,
      changedByUserId: user.id,
    });
  } catch (e) {
    console.error("[notify:service] orchestrator failed:", e);
  }

  return { error: null };
}

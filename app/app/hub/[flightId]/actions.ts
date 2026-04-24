"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHandler } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { canTransition, type ServiceStatus } from "@/lib/flights/services";

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
  if (!canTransition(service.status as ServiceStatus, toStatus as ServiceStatus)) return { error: "Invalid transition" };

  await db.$transaction([
    db.serviceRequest.update({
      where: { id: serviceRequestId },
      data: { status: toStatus, note: note || service.note },
    }),
    db.serviceStatusLog.create({
      data: {
        serviceRequestId,
        fromStatus: service.status,
        toStatus,
        changedByUserId: user.id,
      },
    }),
  ]);
  revalidatePath(`/app/hub/${flightId}`);
  return { error: null };
}

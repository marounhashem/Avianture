"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { canAccessFlight } from "@/lib/auth/flight-access";
import { db } from "@/lib/db";
import { notifyNewMessage } from "@/lib/email/notify";

const schema = z.object({
  flightId: z.string(),
  body: z.string().min(1).max(2000),
});

export async function postMessageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, body } = parsed.data;

  const ok = await canAccessFlight(
    {
      id: user.id,
      role: user.role,
      operatorId: user.operatorId,
      handlerId: user.handlerId,
      crewMemberId: user.crewMemberId,
    },
    flightId,
  );
  if (!ok) return { error: "Forbidden" };

  const trimmed = body.trim();
  await db.flightMessage.create({
    data: { flightId, authorId: user.id, body: trimmed },
  });

  revalidatePath(`/app/flights/${flightId}`);
  revalidatePath(`/app/schedule/${flightId}`);
  revalidatePath(`/app/hub/${flightId}`);

  // Best-effort: notify other interested parties who aren't actively viewing.
  try {
    await notifyNewMessage({
      flightId,
      authorId: user.id,
      body: trimmed,
    });
  } catch (e) {
    console.error("[notify:message] orchestrator failed:", e);
  }

  return { error: null };
}

const editSchema = z.object({
  messageId: z.string(),
  body: z.string().min(1).max(2000),
});

export async function editMessageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  const parsed = editSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { messageId, body } = parsed.data;

  const msg = await db.flightMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, flightId: true, deletedAt: true },
  });
  if (!msg) return { error: "Message not found" };
  if (msg.authorId !== user.id) return { error: "Forbidden" };
  if (msg.deletedAt) return { error: "Cannot edit a deleted message" };

  await db.flightMessage.update({
    where: { id: messageId },
    data: { body: body.trim(), editedAt: new Date() },
  });

  revalidatePath(`/app/flights/${msg.flightId}`);
  revalidatePath(`/app/schedule/${msg.flightId}`);
  revalidatePath(`/app/hub/${msg.flightId}`);
  return { error: null };
}

export async function deleteMessageAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  const messageId = String(formData.get("messageId") ?? "");
  if (!messageId) return { error: "Invalid input" };

  const msg = await db.flightMessage.findUnique({
    where: { id: messageId },
    select: { authorId: true, flightId: true, deletedAt: true },
  });
  if (!msg) return { error: "Message not found" };
  if (msg.authorId !== user.id) return { error: "Forbidden" };
  if (msg.deletedAt) return { error: null }; // already deleted, idempotent

  await db.flightMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/app/flights/${msg.flightId}`);
  revalidatePath(`/app/schedule/${msg.flightId}`);
  revalidatePath(`/app/hub/${msg.flightId}`);
  return { error: null };
}

"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { canAccessFlight } from "@/lib/auth/flight-access";
import { db } from "@/lib/db";

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

  await db.flightMessage.create({
    data: { flightId, authorId: user.id, body: body.trim() },
  });

  revalidatePath(`/app/flights/${flightId}`);
  revalidatePath(`/app/schedule/${flightId}`);
  revalidatePath(`/app/hub/${flightId}`);
  return { error: null };
}

"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const schema = z.object({
  tailNumber: z.string().min(2).max(10),
  aircraftType: z.string().min(2).max(50),
  originIcao: z.string().length(4).toUpperCase(),
  destIcao: z.string().length(4).toUpperCase(),
  etdUtc: z.string().min(1),
  etaUtc: z.string().min(1),
  pax: z.coerce.number().int().min(0).max(500),
  purpose: z.string().max(200).optional().or(z.literal("")),
});

export async function createFlightAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const d = parsed.data;
  const flight = await db.flight.create({
    data: {
      operatorId: user.operatorId,
      tailNumber: d.tailNumber.toUpperCase(),
      aircraftType: d.aircraftType,
      originIcao: d.originIcao,
      destIcao: d.destIcao,
      etdUtc: new Date(d.etdUtc),
      etaUtc: new Date(d.etaUtc),
      pax: d.pax,
      purpose: d.purpose || null,
    },
  });
  revalidatePath("/app/flights");
  redirect(`/app/flights/${flight.id}`);
}

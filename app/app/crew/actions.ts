"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(80),
  role: z.enum(["PIC", "FO", "CABIN"]),
});

export async function createCrewAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  await db.crewMember.create({
    data: { operatorId: user.operatorId, name: parsed.data.name, role: parsed.data.role },
  });
  revalidatePath("/app/crew");
  return { error: null };
}

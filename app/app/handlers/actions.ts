"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
});

export async function createHandlerAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  await db.handler.create({
    data: {
      operatorId: user.operatorId,
      name: parsed.data.name,
      company: parsed.data.company || null,
      email: parsed.data.email || null,
    },
  });
  revalidatePath("/app/handlers");
  return { error: null };
}

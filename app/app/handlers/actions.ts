"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperator } from "@/lib/auth/session";
import { db } from "@/lib/db";

/**
 * Parse a free-text "airports" input into a clean ICAO list.
 * Accepts comma-, space-, or newline-separated values. Each token is
 * uppercased and kept only if it's exactly 4 alphanumeric characters.
 * De-duped, order preserved.
 */
function parseAirports(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const tokens = raw.split(/[\s,;]+/).map((t) => t.trim().toUpperCase());
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (!/^[A-Z0-9]{4}$/.test(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  airports: z.string().max(300).optional().or(z.literal("")),
});

export async function createHandlerAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const d = parsed.data;
  await db.handler.create({
    data: {
      operatorId: user.operatorId,
      name: d.name,
      company: d.company || null,
      email: d.email || null,
      city: d.city || null,
      country: d.country || null,
      airports: parseAirports(d.airports),
    },
  });
  revalidatePath("/app/handlers");
  return { error: null };
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  company: z.string().max(80).optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  airports: z.string().max(300).optional().or(z.literal("")),
});

export async function updateHandlerAction(formData: FormData) {
  const user = await requireOperator();
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect("/app/handlers?error=invalid-input");
  }
  const d = parsed.data;

  // Multi-tenant: confirm this handler belongs to this operator
  const existing = await db.handler.findFirst({
    where: { id: d.id, operatorId: user.operatorId },
    select: { id: true },
  });
  if (!existing) {
    redirect("/app/handlers?error=not-found");
  }

  await db.handler.update({
    where: { id: d.id },
    data: {
      name: d.name,
      company: d.company || null,
      email: d.email || null,
      city: d.city || null,
      country: d.country || null,
      airports: parseAirports(d.airports),
    },
  });

  revalidatePath("/app/handlers");
  redirect("/app/handlers");
}

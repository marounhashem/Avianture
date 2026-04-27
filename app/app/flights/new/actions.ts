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

/**
 * Parse a `<input type="datetime-local">` value as UTC, NOT as the server's
 * local time. The browser produces "YYYY-MM-DDTHH:mm" without a zone — JS's
 * `new Date(...)` would default to local. Force UTC explicitly.
 */
function parseAsUtc(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  const ts = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    Number(s ?? 0),
  );
  const date = new Date(ts);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type CreateFlightState = { error: string | null };

export const createFlightInitialState: CreateFlightState = { error: null };

export async function createFlightAction(
  _prevState: CreateFlightState,
  formData: FormData,
): Promise<CreateFlightState> {
  const user = await requireOperator();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }
  const d = parsed.data;

  const etd = parseAsUtc(d.etdUtc);
  const eta = parseAsUtc(d.etaUtc);
  if (!etd || !eta) {
    return { error: "Invalid ETD/ETA format." };
  }
  if (eta.getTime() <= etd.getTime()) {
    return { error: "ETA must be after ETD (UTC)." };
  }

  const flight = await db.flight.create({
    data: {
      operatorId: user.operatorId,
      tailNumber: d.tailNumber.toUpperCase(),
      aircraftType: d.aircraftType,
      originIcao: d.originIcao,
      destIcao: d.destIcao,
      etdUtc: etd,
      etaUtc: eta,
      pax: d.pax,
      purpose: d.purpose || null,
    },
  });
  revalidatePath("/app/flights");
  redirect(`/app/flights/${flight.id}`);
}

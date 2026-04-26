"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

const FIELDS = [
  "notifyOnIssueRaised",
  "notifyOnNewMessage",
  "notifyOnServiceStatus",
  "notifyOnIssueResolved",
  "notifyOnMention",
] as const;

type Field = (typeof FIELDS)[number];

const schema = z.object({
  field: z.enum(FIELDS),
  enabled: z.enum(["true", "false"]),
});

export async function updateNotificationPrefAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { field, enabled } = parsed.data;

  const value = enabled === "true";

  // Build a typed partial update. Switch instead of dynamic key to keep TS strict.
  let data: Partial<Record<Field, boolean>>;
  switch (field) {
    case "notifyOnIssueRaised":
      data = { notifyOnIssueRaised: value };
      break;
    case "notifyOnNewMessage":
      data = { notifyOnNewMessage: value };
      break;
    case "notifyOnServiceStatus":
      data = { notifyOnServiceStatus: value };
      break;
    case "notifyOnIssueResolved":
      data = { notifyOnIssueResolved: value };
      break;
    case "notifyOnMention":
      data = { notifyOnMention: value };
      break;
  }

  await db.user.update({ where: { id: userId }, data });
  revalidatePath("/app/account");
  return { error: null };
}

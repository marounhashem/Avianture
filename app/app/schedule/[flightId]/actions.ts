"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireCrew } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { notifyIssueRaised } from "@/lib/email/notify";

const ackSchema = z.object({ flightId: z.string() });

export async function acknowledgeAssignmentAction(formData: FormData) {
  const user = await requireCrew();
  const { flightId } = ackSchema.parse(Object.fromEntries(formData));
  await db.crewAssignment.updateMany({
    where: { flightId, crewMemberId: user.crewMemberId },
    data: { acknowledgedAt: new Date() },
  });
  revalidatePath(`/app/schedule/${flightId}`);
  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

const issueSchema = z.object({
  flightId: z.string(),
  issue: z.string().min(1).max(500),
});

export async function flagIssueAction(formData: FormData) {
  const user = await requireCrew();
  const parsed = issueSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { flightId, issue } = parsed.data;
  await db.crewAssignment.updateMany({
    where: { flightId, crewMemberId: user.crewMemberId },
    data: {
      issue: issue.trim(),
      issueUpdatedAt: new Date(),
      // Re-flagging an already-resolved issue clears the resolution (it's open again).
      issueResolvedAt: null,
      issueResolvedById: null,
      issueResolution: null,
    },
  });
  revalidatePath(`/app/schedule/${flightId}`);
  revalidatePath(`/app/flights/${flightId}`);

  // Best-effort: notify operators who aren't actively viewing.
  try {
    await notifyIssueRaised({
      flightId,
      raisedByUserId: user.id,
      issue: issue.trim(),
    });
  } catch (e) {
    console.error("[notify:issue] orchestrator failed:", e);
  }

  return { error: null };
}

export async function clearIssueAction(formData: FormData) {
  const user = await requireCrew();
  const flightId = String(formData.get("flightId"));
  await db.crewAssignment.updateMany({
    where: { flightId, crewMemberId: user.crewMemberId },
    data: {
      issue: null,
      issueUpdatedAt: new Date(),
      issueResolvedAt: null,
      issueResolvedById: null,
      issueResolution: null,
    },
  });
  revalidatePath(`/app/schedule/${flightId}`);
  revalidatePath(`/app/flights/${flightId}`);
  return { error: null };
}

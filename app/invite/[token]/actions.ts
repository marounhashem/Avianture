"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signIn } from "@/lib/auth/config";
import { isExpired } from "@/lib/invites/tokens";

const schema = z.object({
  token: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function acceptInviteAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid input" };
  const { token, name, email, password } = parsed.data;

  const req = await db.handlerRequest.findUnique({
    where: { inviteToken: token },
    include: { handler: true },
  });
  if (!req) return { error: "Invite not found" };
  if (isExpired(req.inviteExpiresAt)) return { error: "Invite expired" };

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!existing) {
    await db.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash: await hashPassword(password),
        role: "HANDLER",
        handlerId: req.handlerId,
      },
    });
  } else {
    if (existing.role !== "HANDLER") return { error: "Email already used by non-handler account" };
    if (existing.handlerId !== req.handlerId) {
      return { error: "This email is already linked to another handler. Contact support." };
    }
  }

  await db.handlerRequest.update({
    where: { id: req.id },
    data: { inviteAcceptedAt: new Date() },
  });

  try {
    await signIn("credentials", { email: email.toLowerCase(), password, redirectTo: "/app/hub" });
  } catch (e: any) {
    if (e?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    return { error: "Could not sign in. Try logging in manually." };
  }
  redirect("/app/hub");
}

import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendMagicLink } from "@/lib/email/send";
import { APP_BASE_URL } from "@/lib/email/resend";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function generateAndSendMagicLink(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.toLowerCase().trim();

  // Don't reveal whether the user exists. Always create a token, but only send if they do.
  const user = await db.user.findUnique({ where: { email: normalized } });
  if (!user) {
    return { ok: true }; // silent success — no enumeration
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.magicLinkToken.create({
    data: { email: normalized, token, expiresAt },
  });

  const magicUrl = `${APP_BASE_URL}/auth/magic?token=${encodeURIComponent(
    token,
  )}&email=${encodeURIComponent(normalized)}`;

  const send = await sendMagicLink(normalized, magicUrl);
  if (!send.ok) {
    return { ok: false, error: send.error };
  }
  return { ok: true };
}

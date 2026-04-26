import { Resend } from "resend";

let _client: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // configured-not-required: send wrappers handle null
  if (!_client) _client = new Resend(key);
  return _client;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
export const APP_BASE_URL =
  process.env.APP_BASE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Lower-level wrapper. Send wrappers in lib/email/send.ts compose this
 * with rendered react-email components.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<SendResult> {
  const client = getResend();
  if (!client) {
    return { ok: false, error: "RESEND_API_KEY not configured" };
  }
  try {
    const { error } = await client.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      react: opts.react,
    });
    if (error) {
      return { ok: false, error: error.message ?? "Resend rejected the send" };
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unknown send error",
    };
  }
}

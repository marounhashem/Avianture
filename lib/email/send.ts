import { sendEmail, type SendResult } from "./resend";
import {
  HandlerInviteEmail,
  type HandlerInviteEmailProps,
} from "@/emails/handler-invite";
import { MagicLinkEmail } from "@/emails/magic-link";

export async function sendHandlerInvite(
  to: string,
  props: HandlerInviteEmailProps,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: `New flight request — ${props.flight.tailNumber} from ${props.operatorName}`,
    react: HandlerInviteEmail(props),
  });
}

export async function sendMagicLink(
  to: string,
  magicUrl: string,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: "Your Avianture sign-in link",
    react: MagicLinkEmail({ magicUrl }),
  });
}

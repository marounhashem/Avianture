import { sendEmail, type SendResult } from "./resend";
import {
  HandlerInviteEmail,
  type HandlerInviteEmailProps,
} from "@/emails/handler-invite";
import { MagicLinkEmail } from "@/emails/magic-link";
import {
  IssueRaisedEmail,
  type IssueRaisedEmailProps,
} from "@/emails/issue-raised";
import {
  NewMessageEmail,
  type NewMessageEmailProps,
} from "@/emails/new-message";
import {
  ServiceStatusEmail,
  type ServiceStatusEmailProps,
} from "@/emails/service-status";
import {
  IssueResolvedEmail,
  type IssueResolvedEmailProps,
} from "@/emails/issue-resolved";

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

export async function sendIssueNotification(
  to: string,
  props: IssueRaisedEmailProps,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: `Crew issue on flight ${props.flight.tailNumber}`,
    react: IssueRaisedEmail(props),
  });
}

export async function sendMessageNotification(
  to: string,
  props: NewMessageEmailProps,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: `New message on flight ${props.flight.tailNumber}`,
    react: NewMessageEmail(props),
  });
}

export async function sendServiceStatusNotification(
  to: string,
  props: ServiceStatusEmailProps,
): Promise<SendResult> {
  const pretty = props.newStatus
    .toLowerCase()
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return sendEmail({
    to,
    subject: `Service update: ${props.serviceType} ${pretty} — ${props.flight.tailNumber}`,
    react: ServiceStatusEmail(props),
  });
}

export async function sendIssueResolvedNotification(
  to: string,
  props: IssueResolvedEmailProps,
): Promise<SendResult> {
  return sendEmail({
    to,
    subject: `Your issue on flight ${props.flight.tailNumber} was resolved`,
    react: IssueResolvedEmail(props),
  });
}

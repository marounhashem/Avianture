/**
 * Render the React-Email templates to PNG via Playwright.
 * Cleaner than real-inbox screenshots for a deck.
 *
 * Usage: npx tsx scripts/render-emails.ts
 */
import { render } from "@react-email/render";
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

import { HandlerInviteEmail } from "../emails/handler-invite";
import { MagicLinkEmail } from "../emails/magic-link";
import { IssueRaisedEmail } from "../emails/issue-raised";
import { NewMessageEmail } from "../emails/new-message";
import { ServiceStatusEmail } from "../emails/service-status";
import { IssueResolvedEmail } from "../emails/issue-resolved";
import { MessageMentionEmail } from "../emails/message-mention";

const OUT = path.resolve(
  "C:/Users/marou/My Second Brain/03 Projects/Avianture/04 Business/Deck Assets",
);

const FLIGHT = {
  tailNumber: "A6-AVC",
  originIcao: "OMDB",
  destIcao: "EGLL",
  etdUtc: new Date("2026-04-26T08:21:46Z"),
  aircraftType: "Dassault Falcon 8X",
  pax: 6,
};

async function renderToPng(html: string, fileName: string, width = 700) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width, height: 100 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  // Re-set the viewport to fit the rendered content height
  const bodyHeight = await page.evaluate(() => {
    return Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    );
  });
  await page.setViewportSize({ width, height: bodyHeight });
  const out = path.join(OUT, fileName);
  await page.screenshot({ path: out, fullPage: true, type: "png" });
  console.log(`  ✓ ${fileName}`);
  await browser.close();
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  console.log(`Rendering emails to ${OUT}\n`);

  // 1. Handler invite
  const inviteHtml = await render(
    HandlerInviteEmail({
      handlerName: "Andreas Pavlou",
      operatorName: "Maroun Private Aviation",
      flight: FLIGHT,
      airport: "OMDB",
      services: ["FUEL", "GPU", "CATERING", "TRANSPORT", "PARKING", "CUSTOMS"],
      inviteUrl: "https://avianture-production.up.railway.app/invite/example-token",
    }),
  );
  await renderToPng(inviteHtml, "email-01-handler-invite.png");

  // 2. Magic link
  const magicHtml = await render(
    MagicLinkEmail({
      magicUrl:
        "https://avianture-production.up.railway.app/auth/magic?token=...&email=...",
    }),
  );
  await renderToPng(magicHtml, "email-02-magic-link.png");

  // 3. Issue raised
  const issueHtml = await render(
    IssueRaisedEmail({
      raisedByName: "John Smith",
      raisedByRole: "PIC",
      issue:
        "Out of base since Monday — would prefer not to operate this leg if there's a swap option.",
      flight: FLIGHT,
      flightUrl: "https://avianture-production.up.railway.app/app/flights/...",
    }),
  );
  await renderToPng(issueHtml, "email-03-issue-raised.png");

  // 4. New message
  const messageHtml = await render(
    NewMessageEmail({
      authorName: "John Smith",
      authorRole: "CREW",
      body: "ETA OMDB ~30 min. Confirming PAX manifest unchanged.",
      flight: FLIGHT,
      flightUrl: "https://avianture-production.up.railway.app/app/flights/...",
    }),
  );
  await renderToPng(messageHtml, "email-04-new-message.png");

  // 5. Service status
  const serviceHtml = await render(
    ServiceStatusEmail({
      handlerName: "LCLK FBO Larnaca",
      airport: "OMDB",
      serviceType: "FUEL",
      oldStatus: "IN_PROGRESS",
      newStatus: "COMPLETED",
      note: "Refueled 12,500L JET-A1",
      flight: FLIGHT,
      flightUrl: "https://avianture-production.up.railway.app/app/flights/...",
    }),
  );
  await renderToPng(serviceHtml, "email-05-service-status.png");

  // 6. Issue resolved
  const resolvedHtml = await render(
    IssueResolvedEmail({
      resolvedByName: "Maroun Hashem",
      resolution:
        "Found another pilot — Sarah Khan will operate the leg. Stand down, enjoy the day off.",
      originalIssue:
        "Out of base since Monday — would prefer not to operate this leg if there's a swap option.",
      flight: FLIGHT,
      flightUrl: "https://avianture-production.up.railway.app/app/schedule/...",
    }),
  );
  await renderToPng(resolvedHtml, "email-06-issue-resolved.png");

  // 7. @mention
  const mentionHtml = await render(
    MessageMentionEmail({
      authorName: "Maroun Hashem",
      authorRole: "OPERATOR",
      body: "@john thanks for flagging — checking swap options now. Handler in LCLK already on top of fuel.",
      flight: FLIGHT,
      flightUrl: "https://avianture-production.up.railway.app/app/flights/...",
    }),
  );
  await renderToPng(mentionHtml, "email-07-mention.png");

  console.log(`\n✅ Rendered 7 email templates.`);
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});

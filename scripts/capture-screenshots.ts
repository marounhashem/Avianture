/**
 * Capture screenshots from the live Avianture app for the investor + sales decks.
 *
 * Two phases:
 *   1. Seed live demo data (issue raised + 3 thread messages with a @mention)
 *   2. Capture all screens with direct-URL navigation (no click-flake)
 *
 * Usage:  npx tsx scripts/capture-screenshots.ts
 */
import { chromium, type Page, type BrowserContext, type Browser } from "playwright";
import * as path from "path";
import * as fs from "fs";

const BASE = "https://avianture-production.up.railway.app";
const OUT = path.resolve(
  "C:/Users/marou/My Second Brain/03 Projects/Avianture/04 Business/Deck Assets",
);
const VIEWPORT = { width: 1920, height: 1080 } as const;

const A = {
  operator: { email: "marounhashem@gmail.com", password: "Avianture2026!" },
  pilot: { email: "pilot@avianture.demo", password: "Avianture2026!" },
  handlerLclk: { email: "handler.lclk@avianture.demo", password: "Avianture2026!" },
};

async function ensureOutDir() {
  fs.mkdirSync(OUT, { recursive: true });
}

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 30_000,
    }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle");
}

async function newCtx(browser: Browser): Promise<BrowserContext> {
  const ctx = await browser.newContext({ viewport: VIEWPORT });
  // The flight-detail / hub-detail / schedule-detail pages use an inline
  // setTimeout(..., 5000) that calls `location.reload()` for live polling.
  // During seeding + capture this is hostile — it can fire mid-form-submit
  // and clear the page. Override `location.reload` to a no-op everywhere.
  await ctx.addInitScript(() => {
    try {
      Object.defineProperty(window.location, "reload", {
        value: () => {},
        writable: true,
        configurable: true,
      });
    } catch {
      /* ignore */
    }
  });
  return ctx;
}

async function getFirstFlightId(page: Page): Promise<string> {
  await page.goto(`${BASE}/app/flights`);
  await page.waitForLoadState("networkidle");
  // Match a flight detail link: /app/flights/<id> where id != "new"
  const href = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/flights/"]'),
    );
    for (const a of links) {
      const rest = a.getAttribute("href")!.replace("/app/flights/", "");
      if (rest && rest !== "new" && !rest.includes("/")) return a.getAttribute("href");
    }
    return null;
  });
  if (!href) throw new Error("Could not find a flight detail link in /app/flights");
  return href.replace("/app/flights/", "");
}

async function getCrewFirstFlightId(page: Page): Promise<string> {
  await page.goto(`${BASE}/app/schedule`);
  await page.waitForLoadState("networkidle");
  const href = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/schedule/"]'),
    );
    for (const a of links) {
      const rest = a.getAttribute("href")!.replace("/app/schedule/", "");
      if (rest && !rest.includes("/")) return a.getAttribute("href");
    }
    return null;
  });
  if (!href) throw new Error("Could not find a crew flight detail link");
  return href.replace("/app/schedule/", "");
}

async function getHandlerFirstFlightId(page: Page): Promise<string> {
  await page.goto(`${BASE}/app/hub`);
  await page.waitForLoadState("networkidle");
  const href = await page.evaluate(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/hub/"]'),
    );
    for (const a of links) {
      const rest = a.getAttribute("href")!.replace("/app/hub/", "");
      if (rest && !rest.includes("/")) return a.getAttribute("href");
    }
    return null;
  });
  if (!href) throw new Error("Could not find a handler flight detail link");
  return href.replace("/app/hub/", "");
}

async function shoot(page: Page, name: string, full = false) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: full });
  console.log(`  ✓ ${name}.png${full ? " (full)" : ""}`);
}

async function seedDemoData(browser: Browser) {
  console.log("\n[Seed] Populating live demo data...");

  // 1) As crew, find Flight C-equivalent (any active flight) and flag an issue.
  const crewCtx = await newCtx(browser);
  const crewPage = await crewCtx.newPage();
  await login(crewPage, A.pilot.email, A.pilot.password);

  await crewPage.goto(`${BASE}/app/schedule`);
  await crewPage.waitForLoadState("networkidle");
  const crewFlightHref = await crewPage.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/schedule/"]'),
    );
    for (const c of cards) {
      const text = c.textContent ?? "";
      if (text.includes("ACTIVE") && !text.includes("Past")) {
        return c.getAttribute("href");
      }
    }
    return cards[0]?.getAttribute("href") ?? null;
  });
  if (!crewFlightHref) throw new Error("No crew flight available to seed");
  const crewFlightUrl = `${BASE}${crewFlightHref}`;

  // STEP 1: Acknowledge
  await crewPage.goto(crewFlightUrl);
  await crewPage.waitForLoadState("networkidle");
  const ackBtn = crewPage.getByRole("button", { name: /^Acknowledge$/ });
  if (await ackBtn.count()) {
    await ackBtn.first().click();
    await crewPage.waitForLoadState("networkidle");
    console.log("  ✓ crew acknowledged");
  } else {
    console.log("  · (already acknowledged)");
  }

  // STEP 2: Flag issue (full reload first to guarantee fresh DOM)
  await crewPage.goto(crewFlightUrl);
  await crewPage.waitForLoadState("networkidle");
  const issueTextarea = crewPage.locator('textarea[name="issue"]');
  if (await issueTextarea.count()) {
    await issueTextarea.fill(
      "Out of base since Monday — would prefer not to operate this leg if there's a swap option.",
    );
    await crewPage.getByRole("button", { name: /^Flag issue$/ }).click();
    await crewPage.waitForLoadState("networkidle");
    // Verify the issue actually persisted by checking the page after a fresh reload
    await crewPage.goto(crewFlightUrl);
    await crewPage.waitForLoadState("networkidle");
    const stillHasTextarea = await crewPage
      .locator('textarea[name="issue"]')
      .count();
    if (stillHasTextarea === 0) {
      console.log("  ✓ crew flagged issue (verified)");
    } else {
      console.log("  ✗ crew issue did NOT persist — debug needed");
    }
  } else {
    console.log("  · (issue already set)");
  }

  // STEP 3: Post a thread message (full reload first)
  await crewPage.goto(crewFlightUrl);
  await crewPage.waitForLoadState("networkidle");
  const crewBody = crewPage.locator('textarea[name="body"]').first();
  if (await crewBody.count()) {
    await crewBody.fill("ETA OMDB ~30 min. Confirming PAX manifest unchanged.");
    await crewPage.getByRole("button", { name: /^Send$/ }).click();
    await crewPage.waitForLoadState("networkidle");
    console.log("  ✓ crew posted message");
  }

  await crewCtx.close();

  // 2) As operator, post a thread message with a @mention
  const opCtx = await newCtx(browser);
  const opPage = await opCtx.newPage();
  await login(opPage, A.operator.email, A.operator.password);

  const opFlightId = await getFirstFlightId(opPage);
  await opPage.goto(`${BASE}/app/flights/${opFlightId}`);
  await opPage.waitForLoadState("networkidle");

  const opBody = opPage.locator('textarea[name="body"]').first();
  if (await opBody.count()) {
    await opBody.fill(
      "Crew acknowledged. @john thanks for flagging — checking swap options now. Handler in LCLK already on top of fuel.",
    );
    await opPage.getByRole("button", { name: /^Send$/ }).click();
    await opPage.waitForLoadState("networkidle");
    console.log("  ✓ operator posted message with @mention");
  }

  await opCtx.close();

  // 3) As handler, mark a service from PENDING → ACKNOWLEDGED to add freshness
  const hCtx = await newCtx(browser);
  const hPage = await hCtx.newPage();
  await login(hPage, A.handlerLclk.email, A.handlerLclk.password);

  await hPage.goto(`${BASE}/app/hub`);
  await hPage.waitForLoadState("networkidle");
  const hFlightHref = await hPage.evaluate(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="/app/hub/"]'),
    );
    return cards[0]?.getAttribute("href") ?? null;
  });
  if (hFlightHref) {
    await hPage.goto(`${BASE}${hFlightHref}`);
    await hPage.waitForLoadState("networkidle");
    // Try to advance one PENDING service
    const ackBtn = hPage.getByRole("button", { name: /^Mark acknowledged$/ }).first();
    if (await ackBtn.count()) {
      await ackBtn.click();
      await hPage.waitForLoadState("networkidle");
      console.log("  ✓ handler advanced a service");
    }
  }
  await hCtx.close();
}

async function captureAll(browser: Browser) {
  console.log("\n[Capture]");

  // === Operator
  const opCtx = await newCtx(browser);
  const opPage = await opCtx.newPage();
  await login(opPage, A.operator.email, A.operator.password);

  const opFlightId = await getFirstFlightId(opPage);

  // 01 Dashboard
  await opPage.goto(`${BASE}/app`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "01-operator-dashboard");

  // 02 Flight list
  await opPage.goto(`${BASE}/app/flights`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "02-operator-flight-list");

  // 02b Filtered list
  await opPage.goto(`${BASE}/app/flights?status=active&filter=issues`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "02b-operator-flight-list-filtered");

  // 03 Flight detail (DIRECT URL — no click)
  await opPage.goto(`${BASE}/app/flights/${opFlightId}`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "03-operator-flight-detail", true);

  // 04 Account / prefs
  await opPage.goto(`${BASE}/app/account`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "04-operator-account-prefs", true);

  // 05 Crew roster
  await opPage.goto(`${BASE}/app/crew`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "05-operator-crew-roster");

  // 06 Handler roster
  await opPage.goto(`${BASE}/app/handlers`);
  await opPage.waitForLoadState("networkidle");
  await shoot(opPage, "06-operator-handler-roster");

  await opCtx.close();

  // === Crew
  const crewCtx = await newCtx(browser);
  const crewPage = await crewCtx.newPage();
  await login(crewPage, A.pilot.email, A.pilot.password);

  // 07 Schedule list
  await crewPage.goto(`${BASE}/app/schedule`);
  await crewPage.waitForLoadState("networkidle");
  await shoot(crewPage, "07-crew-schedule");

  // 08 Crew flight detail
  const crewFlightId = await getCrewFirstFlightId(crewPage);
  await crewPage.goto(`${BASE}/app/schedule/${crewFlightId}`);
  await crewPage.waitForLoadState("networkidle");
  await shoot(crewPage, "08-crew-flight-detail", true);

  await crewCtx.close();

  // === Handler
  const hCtx = await newCtx(browser);
  const hPage = await hCtx.newPage();
  await login(hPage, A.handlerLclk.email, A.handlerLclk.password);

  // 09 Hub list
  await hPage.goto(`${BASE}/app/hub`);
  await hPage.waitForLoadState("networkidle");
  await shoot(hPage, "09-handler-hub-list");

  // 10 Handler flight detail
  const handlerFlightId = await getHandlerFirstFlightId(hPage);
  await hPage.goto(`${BASE}/app/hub/${handlerFlightId}`);
  await hPage.waitForLoadState("networkidle");
  await shoot(hPage, "10-handler-flight-detail", true);

  await hCtx.close();

  // === Login pages
  const anonCtx = await newCtx(browser);
  const anonPage = await anonCtx.newPage();
  await anonPage.goto(`${BASE}/login`);
  await anonPage.waitForLoadState("networkidle");
  await shoot(anonPage, "11-login-password");
  await anonPage.goto(`${BASE}/login?mode=magic`);
  await anonPage.waitForLoadState("networkidle");
  await shoot(anonPage, "12-login-magic");
  await anonCtx.close();
}

async function main() {
  await ensureOutDir();
  console.log(`Output: ${OUT}`);
  const browser = await chromium.launch({ headless: true });
  try {
    await seedDemoData(browser);
    await captureAll(browser);
    console.log(`\n✅ Done.`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("FAIL:", err);
  process.exit(1);
});

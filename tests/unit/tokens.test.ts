import { describe, it, expect } from "vitest";
import { generateInviteToken, inviteExpiryDate, isExpired } from "@/lib/invites/tokens";

describe("invite tokens", () => {
  it("generates a URL-safe token of sufficient length", () => {
    const t = generateInviteToken();
    expect(t.length).toBeGreaterThanOrEqual(32);
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(generateInviteToken()).not.toBe(t);
  });

  it("returns a date 14 days in the future by default", () => {
    const now = new Date("2026-04-24T00:00:00Z");
    const exp = inviteExpiryDate(now);
    const diff = exp.getTime() - now.getTime();
    expect(diff).toBe(14 * 24 * 60 * 60 * 1000);
  });

  it("flags expired dates correctly", () => {
    const past = new Date(Date.now() - 1000);
    const future = new Date(Date.now() + 1000);
    expect(isExpired(past)).toBe(true);
    expect(isExpired(future)).toBe(false);
  });
});

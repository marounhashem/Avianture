import { describe, it, expect } from "vitest";
import { computeUnread } from "@/lib/flights/views";

describe("computeUnread", () => {
  const m = (iso: string) => ({ createdAt: new Date(iso) });

  it("returns total when no lastSeen", () => {
    expect(computeUnread([m("2026-01-01"), m("2026-01-02")], undefined)).toBe(2);
  });

  it("counts only messages strictly after lastSeen", () => {
    const lastSeen = new Date("2026-01-02T00:00:00Z");
    const messages = [
      m("2026-01-01T00:00:00Z"),
      m("2026-01-02T00:00:00Z"), // exactly equal — excluded
      m("2026-01-03T00:00:00Z"),
      m("2026-01-04T00:00:00Z"),
    ];
    expect(computeUnread(messages, lastSeen)).toBe(2);
  });

  it("returns 0 when lastSeen is after all messages", () => {
    expect(
      computeUnread([m("2026-01-01"), m("2026-01-02")], new Date("2026-12-31")),
    ).toBe(0);
  });

  it("returns 0 for empty messages list", () => {
    expect(computeUnread([], new Date())).toBe(0);
  });
});

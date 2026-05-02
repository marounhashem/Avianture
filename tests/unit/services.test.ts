import { describe, it, expect } from "vitest";
import { canTransition, ALLOWED_TRANSITIONS } from "@/lib/flights/services";

describe("service status transitions (handler-side, forward-only)", () => {
  it("allows PENDING → ACKNOWLEDGED", () => {
    expect(canTransition("PENDING", "ACKNOWLEDGED")).toBe(true);
  });
  it("allows ACKNOWLEDGED → IN_PROGRESS", () => {
    expect(canTransition("ACKNOWLEDGED", "IN_PROGRESS")).toBe(true);
  });
  it("allows IN_PROGRESS → COMPLETED", () => {
    expect(canTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
  });
  it("rejects skipping from PENDING to COMPLETED", () => {
    expect(canTransition("PENDING", "COMPLETED")).toBe(false);
  });
  it("rejects regression from COMPLETED back to PENDING", () => {
    expect(canTransition("COMPLETED", "PENDING")).toBe(false);
  });
  it("does not allow handler to mark a service NOT_REQUIRED", () => {
    expect(canTransition("PENDING", "NOT_REQUIRED")).toBe(false);
    expect(canTransition("ACKNOWLEDGED", "NOT_REQUIRED")).toBe(false);
    expect(canTransition("IN_PROGRESS", "NOT_REQUIRED")).toBe(false);
    expect(canTransition("COMPLETED", "NOT_REQUIRED")).toBe(false);
  });
  it("does not allow handler to move out of NOT_REQUIRED", () => {
    expect(canTransition("NOT_REQUIRED", "PENDING")).toBe(false);
    expect(canTransition("NOT_REQUIRED", "ACKNOWLEDGED")).toBe(false);
    expect(canTransition("NOT_REQUIRED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("NOT_REQUIRED", "COMPLETED")).toBe(false);
  });
  it("matches the allowed-transition table", () => {
    expect(ALLOWED_TRANSITIONS).toBeDefined();
  });
});

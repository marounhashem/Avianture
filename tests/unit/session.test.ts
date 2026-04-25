import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));

vi.mock("@/lib/auth/config", () => ({
  auth: vi.fn(),
}));

const { auth } = await import("@/lib/auth/config");
const { requireCrew } = await import("@/lib/auth/session");

describe("requireCrew", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the user when role is CREW and crewMemberId is set", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "u1", email: "p@x.com", name: "P", role: "CREW", crewMemberId: "cm1" },
    });
    const u = await requireCrew();
    expect(u.crewMemberId).toBe("cm1");
  });

  it("redirects to /login when role is not CREW", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "u1", email: "p@x.com", name: "P", role: "OPERATOR", operatorId: "op1" },
    });
    await expect(requireCrew()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to /login when crewMemberId is null", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: { id: "u1", email: "p@x.com", name: "P", role: "CREW", crewMemberId: null },
    });
    await expect(requireCrew()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to /login when no session", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await expect(requireCrew()).rejects.toThrow("REDIRECT:/login");
  });
});

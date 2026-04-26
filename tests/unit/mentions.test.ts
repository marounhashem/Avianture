import { describe, it, expect } from "vitest";
import { parseMentions, extractMentionedUsers, resolveMention } from "@/lib/messages/mentions";
import type { User } from "@prisma/client";

function user(overrides: Partial<User>): User {
  return {
    id: overrides.id ?? "u1",
    email: overrides.email ?? "u@x.com",
    passwordHash: "",
    name: overrides.name ?? "Anonymous",
    role: overrides.role ?? "OPERATOR",
    operatorId: null,
    handlerId: null,
    crewMemberId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    notifyOnIssueRaised: true,
    notifyOnNewMessage: true,
    notifyOnServiceStatus: true,
    notifyOnIssueResolved: true,
    notifyOnMention: true,
  } as User;
}

describe("resolveMention", () => {
  const john = user({ id: "j", email: "pilot@avianture.demo", name: "John Smith" });
  const dxb = user({ id: "d", email: "dxb@avianture.demo", name: "Ahmad Al Ali" });
  const lclk = user({ id: "l", email: "lclk@avianture.demo", name: "Andreas Pavlou" });
  const users = [john, dxb, lclk];

  it("matches exact email", () => {
    expect(resolveMention("pilot@avianture.demo", users)).toBe(john);
  });

  it("matches exact local-part", () => {
    expect(resolveMention("dxb", users)).toBe(dxb);
  });

  it("matches name key prefix", () => {
    // "johnsmith" prefix
    expect(resolveMention("john", users)).toBe(john);
    expect(resolveMention("johns", users)).toBe(john);
  });

  it("returns null for ambiguous match", () => {
    const a = user({ id: "a1", email: "alpha@x.com", name: "Alice" });
    const a2 = user({ id: "a2", email: "alpha2@x.com", name: "Alex" });
    // "al" is prefix of both names
    expect(resolveMention("al", [a, a2])).toBeNull();
  });

  it("returns null for unknown token", () => {
    expect(resolveMention("nobody", users)).toBeNull();
  });

  it("ignores too-short prefix tokens (<3 chars) unless exact", () => {
    expect(resolveMention("jo", users)).toBeNull();
    // exact local-part still works for short emails
    const x = user({ id: "x", email: "xy@x.com", name: "Ex Why" });
    expect(resolveMention("xy", [x])).toBe(x);
  });
});

describe("parseMentions / extractMentionedUsers", () => {
  const john = user({ id: "j", email: "pilot@avianture.demo", name: "John Smith" });
  const dxb = user({ id: "d", email: "dxb@avianture.demo", name: "Ahmad Al Ali" });
  const users = [john, dxb];

  it("returns single text segment when no mentions", () => {
    const out = parseMentions("hello world", users);
    expect(out).toEqual([{ type: "text", value: "hello world" }]);
  });

  it("parses a single mention surrounded by text", () => {
    const out = parseMentions("hey @john update?", users);
    expect(out.length).toBe(3);
    expect(out[0]).toEqual({ type: "text", value: "hey " });
    expect(out[1].type).toBe("mention");
    if (out[1].type === "mention") expect(out[1].user.id).toBe("j");
    expect(out[2]).toEqual({ type: "text", value: " update?" });
  });

  it("parses multiple distinct mentions", () => {
    const out = parseMentions("@john and @dxb please coordinate", users);
    const mentions = out.filter((s) => s.type === "mention");
    expect(mentions.length).toBe(2);
  });

  it("leaves @unknown as-is", () => {
    const out = parseMentions("@unknown is mysterious", users);
    expect(out).toEqual([{ type: "text", value: "@unknown is mysterious" }]);
  });

  it("extractMentionedUsers de-dupes", () => {
    const out = extractMentionedUsers("@john and @john again", users);
    expect(out.length).toBe(1);
    expect(out[0].id).toBe("j");
  });
});

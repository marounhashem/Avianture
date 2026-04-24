import { describe, it, expect } from "vitest";
import { operatorScope, handlerScope } from "@/lib/auth/guards";

describe("scope guards", () => {
  it("builds operator-scoped where clause", () => {
    expect(operatorScope("op_123")).toEqual({ operatorId: "op_123" });
  });
  it("builds handler-scoped where clause for HandlerRequest", () => {
    expect(handlerScope("h_123")).toEqual({ handlerId: "h_123" });
  });
});

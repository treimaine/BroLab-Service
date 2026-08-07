import { describe, expect, it } from "vitest";
import {
  resolveClerkUserRole,
  shouldStartCreatorLifecycle,
} from "../../../convex/platform/userRoles";

describe("resolveClerkUserRole", () => {
  it("reads an admin role from Clerk public metadata", () => {
    expect(
      resolveClerkUserRole({
        public_metadata: { role: "admin" },
        unsafe_metadata: {},
      })
    ).toBe("admin");
  });

  it("gives public metadata precedence over unsafe metadata", () => {
    expect(
      resolveClerkUserRole({
        public_metadata: { role: "admin" },
        unsafe_metadata: { role: "artist" },
      })
    ).toBe("admin");
  });

  it("reads creator roles from Clerk unsafe metadata", () => {
    expect(
      resolveClerkUserRole({
        public_metadata: {},
        unsafe_metadata: { role: "producer" },
      })
    ).toBe("producer");
  });

  it("rejects unknown or missing roles", () => {
    expect(
      resolveClerkUserRole({
        public_metadata: { role: "owner" },
        unsafe_metadata: {},
      })
    ).toBeNull();
    expect(resolveClerkUserRole({})).toBeNull();
  });
});

describe("shouldStartCreatorLifecycle", () => {
  it("excludes admin accounts from creator growth and email automation", () => {
    expect(shouldStartCreatorLifecycle("admin")).toBe(false);
  });

  it("includes creator roles and role-less new signups", () => {
    expect(shouldStartCreatorLifecycle("producer")).toBe(true);
    expect(shouldStartCreatorLifecycle("artist")).toBe(true);
    expect(shouldStartCreatorLifecycle(null)).toBe(true);
  });
});

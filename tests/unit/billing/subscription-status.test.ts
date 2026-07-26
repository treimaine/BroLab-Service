import { describe, expect, it } from "vitest";
import {
  mapClerkSubscriptionStatus,
  mapSubscriptionItemEventToStatus,
} from "../../../convex/platform/billing/status";

describe("Clerk subscription entitlement status", () => {
  it("keeps access active when renewal is canceled", () => {
    expect(mapClerkSubscriptionStatus("canceled")).toBe("active");
    expect(
      mapSubscriptionItemEventToStatus("subscriptionItem.canceled", "canceled")
    ).toBe("active");
  });

  it("removes access when the paid period actually ends", () => {
    expect(mapClerkSubscriptionStatus("ended")).toBe("canceled");
    expect(
      mapSubscriptionItemEventToStatus("subscriptionItem.ended", "ended")
    ).toBe("canceled");
  });

  it("keeps active and trialing plans entitled", () => {
    expect(mapClerkSubscriptionStatus("active")).toBe("active");
    expect(mapClerkSubscriptionStatus("trialing")).toBe("active");
  });

  it("does not grant access to incomplete or past-due subscriptions", () => {
    expect(mapClerkSubscriptionStatus("incomplete")).toBe("inactive");
    expect(
      mapSubscriptionItemEventToStatus(
        "subscriptionItem.pastDue",
        "past_due"
      )
    ).toBe("inactive");
  });
});

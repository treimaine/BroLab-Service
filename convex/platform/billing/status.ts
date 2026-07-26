export type SubscriptionStatus = "active" | "inactive" | "canceled";

/**
 * Clerk's `canceled` state means renewal is canceled while the current paid
 * period remains entitled. Access ends only when Clerk reports `ended` (or an
 * abandoned checkout).
 */
export function mapClerkSubscriptionStatus(
  status?: string
): SubscriptionStatus {
  switch ((status ?? "").toLowerCase()) {
    case "active":
    case "trialing":
    case "canceled":
    case "cancelled":
      return "active";
    case "ended":
    case "abandoned":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "pastdue":
    case "unpaid":
      return "inactive";
    default:
      return "inactive";
  }
}

export function mapSubscriptionItemEventToStatus(
  eventType: string,
  itemStatus?: string
): SubscriptionStatus {
  switch (eventType) {
    case "subscriptionItem.active":
    case "subscriptionItem.canceled":
      return "active";
    case "subscriptionItem.ended":
    case "subscriptionItem.abandoned":
      return "canceled";
    case "subscriptionItem.pastDue":
    case "subscriptionItem.incomplete":
      return "inactive";
    default:
      return mapClerkSubscriptionStatus(itemStatus);
  }
}

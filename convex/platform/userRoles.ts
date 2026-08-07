import { v } from "convex/values";

export const userRoleValidator = v.union(
  v.literal("producer"),
  v.literal("engineer"),
  v.literal("artist"),
  v.literal("admin")
);

export type UserRole = "producer" | "engineer" | "artist" | "admin";

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === "producer" ||
    value === "engineer" ||
    value === "artist" ||
    value === "admin"
  );
}

/** Admin accounts operate the platform; they are not acquisition prospects. */
export function shouldStartCreatorLifecycle(role: UserRole | null): boolean {
  return role !== "admin";
}

function metadataRole(value: unknown): UserRole | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const role = (value as Record<string, unknown>).role;
  return isUserRole(role) ? role : null;
}

/**
 * Resolve the role carried by a Clerk user webhook.
 *
 * Administrative access is managed in public metadata, while creator
 * onboarding stores its role in unsafe metadata. Public metadata takes
 * precedence so an admin can never be downgraded by stale onboarding metadata.
 */
export function resolveClerkUserRole(
  data: Record<string, unknown>
): UserRole | null {
  return (
    metadataRole(data.public_metadata) ??
    metadataRole(data.unsafe_metadata)
  );
}

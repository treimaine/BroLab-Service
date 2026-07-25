"use client";

import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";

export function PostHogIdentity() {
  const { isLoaded, isSignedIn, user } = useUser();
  const previousUserId = useRef<string | null>(null);
  const isConfigured = Boolean(
    (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
      process.env.NEXT_PUBLIC_POSTHOG_KEY) &&
      process.env.NEXT_PUBLIC_POSTHOG_HOST,
  );

  useEffect(() => {
    if (!isConfigured || !isLoaded) return;

    if (isSignedIn && user) {
      const role =
        typeof user.unsafeMetadata?.role === "string"
          ? user.unsafeMetadata.role
          : undefined;
      posthog.identify(user.id, {
        role,
        created_at: user.createdAt?.toISOString(),
      });
      previousUserId.current = user.id;
      return;
    }

    if (previousUserId.current) {
      posthog.reset();
      previousUserId.current = null;
    }
  }, [isConfigured, isLoaded, isSignedIn, user]);

  return null;
}

import "server-only";

import { PostHog } from "posthog-node";

let posthogInstance: PostHog | null | undefined;

function getProjectToken(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  );
}

export function isPostHogConfigured(): boolean {
  return Boolean(
    getProjectToken() && process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim(),
  );
}

export function getPostHogServer(): PostHog | null {
  if (posthogInstance !== undefined) return posthogInstance;

  const projectToken = getProjectToken();
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  if (!projectToken || !host) {
    posthogInstance = null;
    return posthogInstance;
  }

  posthogInstance = new PostHog(projectToken, {
    host,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogInstance;
}

export function getPostHogClient(): PostHog | null {
  return getPostHogServer();
}

export async function captureServerEvent(
  event: string,
  distinctId: string,
  properties: Record<string, unknown> = {},
): Promise<boolean> {
  const posthog = getPostHogServer();
  if (!posthog) return false;

  await posthog.captureImmediate({
    distinctId,
    event,
    properties: {
      ...properties,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      source: "server",
    },
  });
  return true;
}

export async function captureServerException(
  error: unknown,
  distinctId: string | undefined,
  properties: Record<string, unknown> = {},
): Promise<boolean> {
  const posthog = getPostHogServer();
  if (!posthog) return false;

  await posthog.captureExceptionImmediate(error, distinctId, {
    ...properties,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    source: "server",
  });
  return true;
}

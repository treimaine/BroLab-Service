import posthog from "posthog-js";

const projectToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ??
  process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (!projectToken) {
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN or NEXT_PUBLIC_POSTHOG_KEY is required by PostHog.",
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}

"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    posthog.captureException(error, {
      digest: error.digest,
      boundary: "global",
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
            BroLab
          </p>
          <h1 className="mt-3 text-3xl font-bold">Something stopped the session</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            The issue was recorded. Retry the last screen; your account data is unchanged.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-full bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

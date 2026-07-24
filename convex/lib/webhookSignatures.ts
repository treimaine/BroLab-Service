const WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

type SignatureVerificationResult =
  | { ok: true }
  | { ok: false; reason: string };

function hasFreshTimestamp(timestamp: number, nowMs: number): boolean {
  const nowSeconds = Math.floor(nowMs / 1000);
  return Math.abs(nowSeconds - timestamp) <= WEBHOOK_TOLERANCE_SECONDS;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64(value: ArrayBuffer): string {
  const bytes = new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function encodeHex(value: ArrayBuffer): string {
  return Array.from(new Uint8Array(value), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function signHmacSha256(
  key: Uint8Array,
  message: string
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(message)
  );
}

/** Verify a Clerk/Svix delivery without relying on Node-only package internals. */
export async function verifyClerkWebhookSignature(args: {
  payload: string;
  secret: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  nowMs?: number;
}): Promise<SignatureVerificationResult> {
  const timestamp = Number.parseInt(args.svixTimestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return { ok: false, reason: "Invalid svix-timestamp header" };
  }

  if (!hasFreshTimestamp(timestamp, args.nowMs ?? Date.now())) {
    return { ok: false, reason: "Webhook timestamp is outside the 5 minute tolerance" };
  }

  try {
    const encodedSecret = args.secret.startsWith("whsec_")
      ? args.secret.slice("whsec_".length)
      : args.secret;
    const signature = await signHmacSha256(
      decodeBase64(encodedSecret),
      `${args.svixId}.${timestamp}.${args.payload}`
    );
    const expected = encodeBase64(signature);
    const candidates = args.svixSignature
      .split(/\s+/)
      .map((entry) => entry.split(",", 2))
      .filter(([version, value]) => version === "v1" && Boolean(value))
      .map(([, value]) => value);

    if (candidates.some((candidate) => timingSafeEqual(candidate, expected))) {
      return { ok: true };
    }

    return { ok: false, reason: "No matching Clerk webhook signature" };
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : "Invalid Clerk signing secret",
    };
  }
}

/** Verify Stripe's `t=...,v1=...` signature using the raw request body. */
export async function verifyStripeWebhookSignature(args: {
  payload: string;
  secret: string;
  signatureHeader: string;
  nowMs?: number;
}): Promise<SignatureVerificationResult> {
  const fields = args.signatureHeader.split(",").map((field) => field.trim());
  const timestampValue = fields.find((field) => field.startsWith("t="))?.slice(2);
  const timestamp = timestampValue ? Number.parseInt(timestampValue, 10) : Number.NaN;

  if (!Number.isFinite(timestamp)) {
    return { ok: false, reason: "Invalid Stripe signature timestamp" };
  }

  if (!hasFreshTimestamp(timestamp, args.nowMs ?? Date.now())) {
    return { ok: false, reason: "Webhook timestamp is outside the 5 minute tolerance" };
  }

  const signature = await signHmacSha256(
    new TextEncoder().encode(args.secret),
    `${timestamp}.${args.payload}`
  );
  const expected = encodeHex(signature);
  const candidates = fields
    .filter((field) => field.startsWith("v1="))
    .map((field) => field.slice(3));

  if (candidates.some((candidate) => timingSafeEqual(candidate, expected))) {
    return { ok: true };
  }

  return { ok: false, reason: "No matching Stripe webhook signature" };
}

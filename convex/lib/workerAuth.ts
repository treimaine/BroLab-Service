/** Authenticate calls made by the external media/PDF worker. */
export function assertWorkerSecret(providedSecret: string): void {
  const expectedSecret = process.env.WORKER_SECRET;
  if (!expectedSecret) throw new Error("WORKER_SECRET is not configured");

  const maxLength = Math.max(expectedSecret.length, providedSecret.length);
  let mismatch = expectedSecret.length ^ providedSecret.length;
  for (let index = 0; index < maxLength; index += 1) {
    mismatch |= (expectedSecret.charCodeAt(index) || 0) ^ (providedSecret.charCodeAt(index) || 0);
  }

  if (mismatch !== 0) throw new Error("Unauthorized worker request");
}

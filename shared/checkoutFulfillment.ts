export interface CheckoutFulfillmentFields {
  workspaceId: string;
  itemType: "track" | "service";
  itemId: string;
  licenseTier: string;
  buyerClerkUserId: string;
  expectedAmountCents: number;
  currency: string;
  connectedAccountId: string;
}

function serializeFulfillment(fields: CheckoutFulfillmentFields): string {
  return JSON.stringify([
    fields.workspaceId,
    fields.itemType,
    fields.itemId,
    fields.licenseTier,
    fields.buyerClerkUserId,
    fields.expectedAmountCents,
    fields.currency.toLowerCase(),
    fields.connectedAccountId,
  ]);
}

function encodeHex(value: ArrayBuffer): string {
  return Array.from(new Uint8Array(value), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function signCheckoutFulfillment(
  secret: string,
  fields: CheckoutFulfillmentFields
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(serializeFulfillment(fields))
  );
  return encodeHex(signature);
}

export async function verifyCheckoutFulfillment(
  secret: string,
  fields: CheckoutFulfillmentFields,
  providedSignature: string
): Promise<boolean> {
  const expected = await signCheckoutFulfillment(secret, fields);
  if (expected.length !== providedSignature.length) return false;

  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |=
      expected.charCodeAt(index) ^ providedSignature.charCodeAt(index);
  }
  return difference === 0;
}

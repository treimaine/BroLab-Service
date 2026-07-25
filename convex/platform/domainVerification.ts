"use node";

import { resolve4, resolve6, resolveCname } from "node:dns/promises";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

const PLATFORM_HOSTNAME = "brolabentertainment.com";

interface DnsEvidence {
  cnameRecords: string[];
  addressRecords: string[];
  platformAddresses: string[];
}

function normalizeDnsName(value: string): string {
  return value.toLowerCase().replace(/\.$/, "");
}

async function resolveOrEmpty(
  resolver: (hostname: string) => Promise<string[]>,
  hostname: string,
): Promise<string[]> {
  try {
    return await resolver(hostname);
  } catch {
    return [];
  }
}

async function readDnsEvidence(hostname: string): Promise<DnsEvidence> {
  const [cnameRecords, ipv4, ipv6, platformIpv4, platformIpv6] = await Promise.all([
    resolveOrEmpty(resolveCname, hostname),
    resolveOrEmpty(resolve4, hostname),
    resolveOrEmpty(resolve6, hostname),
    resolveOrEmpty(resolve4, PLATFORM_HOSTNAME),
    resolveOrEmpty(resolve6, PLATFORM_HOSTNAME),
  ]);

  return {
    cnameRecords: cnameRecords.map(normalizeDnsName),
    addressRecords: [...ipv4, ...ipv6].map(normalizeDnsName),
    platformAddresses: [...platformIpv4, ...platformIpv6].map(normalizeDnsName),
  };
}

function verifyDnsEvidence(evidence: DnsEvidence): { verified: boolean; error?: string } {
  const hasExpectedCname = evidence.cnameRecords.some(
    (record) =>
      record === PLATFORM_HOSTNAME ||
      record === `www.${PLATFORM_HOSTNAME}` ||
      record.endsWith(".vercel-dns.com"),
  );
  const hasMatchingAddress = evidence.addressRecords.some((record) =>
    evidence.platformAddresses.includes(record),
  );

  if (hasExpectedCname || hasMatchingAddress) return { verified: true };
  if (evidence.cnameRecords.length > 0) {
    return {
      verified: false,
      error: `CNAME points to ${evidence.cnameRecords.join(", ")}, not ${PLATFORM_HOSTNAME}.`,
    };
  }
  if (evidence.addressRecords.length > 0) {
    return {
      verified: false,
      error: `DNS resolves, but not to ${PLATFORM_HOSTNAME}.`,
    };
  }
  return {
    verified: false,
    error: "No public CNAME, A, or AAAA record was found yet.",
  };
}

export const checkDomainVerification = action({
  args: {
    workspaceId: v.id("workspaces"),
    domainId: v.id("domains"),
  },
  returns: v.object({
    status: v.union(v.literal("verified"), v.literal("failed")),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const domain: { hostname: string } = await ctx.runQuery(
      internal.platform.domains.getDomainForVerification,
      args,
    );
    const result = verifyDnsEvidence(await readDnsEvidence(domain.hostname));
    const persisted: { status: "verified" | "failed" } = await ctx.runMutation(
      internal.platform.domains.recordDomainVerification,
      {
        ...args,
        verified: result.verified,
        error: result.error,
      },
    );
    return { status: persisted.status, error: result.error };
  },
});

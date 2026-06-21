import { createHash } from "node:crypto";

import { eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { apiResponseCache } from "@/lib/db/schema";

type CacheLookupInput = {
  provider: string;
  operation: string;
  model: string;
  requestPayload: unknown;
};

type CacheWriteInput = CacheLookupInput & {
  content: string;
};

function normalizeForCache(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeForCache);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeForCache(nestedValue)]),
    );
  }

  return value;
}

export function createApiCacheKey(input: CacheLookupInput) {
  const stablePayload = JSON.stringify({
    provider: input.provider,
    operation: input.operation,
    model: input.model,
    requestPayload: normalizeForCache(input.requestPayload),
  });

  return createHash("sha256").update(stablePayload).digest("hex");
}

export async function getCachedApiResponse(input: CacheLookupInput) {
  const cacheKey = createApiCacheKey(input);

  const [cached] = await db
    .select({
      responsePayload: apiResponseCache.responsePayload,
    })
    .from(apiResponseCache)
    .where(eq(apiResponseCache.cacheKey, cacheKey))
    .limit(1);

  if (!cached) return null;

  await db
    .update(apiResponseCache)
    .set({
      hitCount: sql`${apiResponseCache.hitCount} + 1`,
      lastAccessedAt: sql`now()`,
      updatedAt: sql`now()`,
    })
    .where(eq(apiResponseCache.cacheKey, cacheKey));

  return cached.responsePayload.content;
}

export async function setCachedApiResponse(input: CacheWriteInput) {
  const cacheKey = createApiCacheKey(input);

  await db
    .insert(apiResponseCache)
    .values({
      provider: input.provider,
      operation: input.operation,
      model: input.model,
      cacheKey,
      requestPayload: normalizeForCache(input.requestPayload),
      responsePayload: { content: input.content },
    })
    .onConflictDoUpdate({
      target: apiResponseCache.cacheKey,
      set: {
        responsePayload: { content: input.content },
        updatedAt: sql`now()`,
        lastAccessedAt: sql`now()`,
      },
    });
}

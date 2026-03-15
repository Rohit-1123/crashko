/**
 * Distributed-first rate limiter.
 * Uses Upstash Redis when configured, with in-memory fallback for local/dev.
 */

interface BucketEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, BucketEntry>();

async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const windowKey = `rl:${Math.floor(Date.now() / windowMs)}:${key}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", windowKey],
        ["PEXPIRE", windowKey, windowMs],
      ]),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const count = Number(data?.[0]?.result ?? data?.result?.[0]?.result ?? 0);
    if (!Number.isFinite(count) || count <= 0) return null;

    return count <= limit;
  } catch {
    return null;
  }
}

/**
 * Returns true if the request should be allowed, false if rate-limited.
 * @param key     Unique identifier (userId or IP)
 * @param limit   Max requests per window
 * @param windowMs Window size in milliseconds (default: 60s)
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): Promise<boolean> {
  const remote = await upstashRateLimit(key, limit, windowMs);
  if (remote !== null) return remote;

  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count++;
  return true;
}

import { SUBREDDIT } from "./config";

// Managed Reddit API (redditapis.com) — used because direct unauthenticated
// requests from Vercel's IP ranges get a 403 from Reddit's own edge network.
const MANAGED_API_URL = `https://api.redditapis.com/api/reddit/sub/${SUBREDDIT}/about`;
const FETCH_TIMEOUT_MS = 8000;

export interface SubscriberReading {
  subscribers: number;
  fetchedAt: string; // ISO timestamp of when this reading was obtained
  stale: boolean; // true if this is a cached fallback rather than a fresh fetch
}

// Process-local fallback cache.
// NOTE: this only survives within a single warm serverless instance —
// it resets on cold start. Once Supabase is wired in (Stage 3), we should
// read the last snapshot row as the durable fallback instead of relying
// on this alone. Keeping this as a fast first line of defense either way.
let lastKnownGood: SubscriberReading | null = null;

async function fetchWithTimeout(url: string, ms: number, headers: HeadersInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers,
      signal: controller.signal,
      next: { revalidate: 60 },
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSubscriberCount(): Promise<SubscriberReading> {
  try {
    const apiKey = process.env.REDDITAPIS_KEY;
    if (!apiKey) {
      throw new Error("REDDITAPIS_KEY environment variable is not set");
    }

    const res = await fetchWithTimeout(MANAGED_API_URL, FETCH_TIMEOUT_MS, {
      Authorization: `Bearer ${apiKey}`,
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new Error(
        `redditapis.com responded with status ${res.status} ${res.statusText}. Body: ${bodyText.slice(0, 300)}`
      );
    }

    const json = await res.json();
    // Handle either a flat shape ({ subscribers }) or Reddit's nested shape
    // ({ data: { subscribers } }) since the exact response wrapper wasn't confirmed.
    const subscribers = json?.subscribers ?? json?.data?.subscribers;

    if (typeof subscribers !== "number" || !Number.isFinite(subscribers)) {
      throw new Error(
        `Unexpected response shape from redditapis.com: ${JSON.stringify(json).slice(0, 300)}`
      );
    }

    const reading: SubscriberReading = {
      subscribers,
      fetchedAt: new Date().toISOString(),
      stale: false,
    };

    lastKnownGood = reading;
    return reading;
  } catch (err) {
    console.error("[reddit] fetch failed:", err instanceof Error ? err.message : err);

    if (lastKnownGood) {
      return { ...lastKnownGood, stale: true };
    }
    throw err;
  }
}

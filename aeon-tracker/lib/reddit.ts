import { SUBREDDIT } from "./config";

// Managed Reddit API (redditapis.com) — used because direct unauthenticated
// requests from Vercel's IP ranges get a 403 from Reddit's own edge network.
const MANAGED_API_URL = `https://api.redditapis.com/r/${SUBREDDIT}/about`;
const FETCH_TIMEOUT_MS = 8000;

export interface SubscriberReading {
  subscribers: number;
  fetchedAt: string;
  stale: boolean;
}

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

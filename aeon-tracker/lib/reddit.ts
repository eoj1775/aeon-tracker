import { SUBREDDIT } from "./config";

const REDDIT_ABOUT_URL = `https://www.reddit.com/r/${SUBREDDIT}/about.json`;
const USER_AGENT = "aeon-network-tracker/0.1 (independent subscriber tracker)";
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

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      // Reddit's about.json is effectively public/static on the timescale we care about;
      // let Next.js cache it for a short window server-side as an extra buffer.
      next: { revalidate: 60 },
    });
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches the current subscriber count for the configured subreddit.
 * Falls back to the last known good reading if the live fetch fails,
 * rather than throwing or showing fabricated data.
 */
export async function getSubscriberCount(): Promise<SubscriberReading> {
  try {
    const res = await fetchWithTimeout(REDDIT_ABOUT_URL, FETCH_TIMEOUT_MS);

    if (!res.ok) {
      throw new Error(`Reddit responded with status ${res.status}`);
    }

    const json = await res.json();
    const subscribers = json?.data?.subscribers;

    if (typeof subscribers !== "number" || !Number.isFinite(subscribers)) {
      throw new Error("Unexpected response shape from Reddit about.json");
    }

    const reading: SubscriberReading = {
      subscribers,
      fetchedAt: new Date().toISOString(),
      stale: false,
    };

    lastKnownGood = reading;
    return reading;
  } catch (err) {
    if (lastKnownGood) {
      return { ...lastKnownGood, stale: true };
    }
    // No fallback available at all (e.g. very first request on a cold instance
    // happens to fail) — surface the error so the API route can decide how to respond.
    throw err;
  }
}

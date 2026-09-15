import { getSupabaseServerClient } from "./supabase";

export interface PaceInfo {
  dailyRate: number; // subscribers gained per day, from a linear fit across the window
  windowDays: number; // how many days of actual history this is based on
  sampleCount: number; // how many snapshot points went into the fit
  projectedDate: string | null; // ISO date string, or null if it can't be projected
  insufficientData: boolean; // true if we don't have enough history yet to say anything meaningful
}

const MIN_WINDOW_DAYS = 0.75; // require at least ~18 hours of history before showing a rate
const MIN_SAMPLES = 3; // need at least 3 points for a fit to mean anything
const LOOKBACK_DAYS = 7;

interface Snapshot {
  recorded_at: string;
  subscribers: number;
}

/**
 * Ordinary least-squares slope of subscribers vs. time (in days).
 * Using every point in the window, not just the two endpoints, so a single
 * noisy reading (a brief API hiccup, a momentary spike) can't skew the whole estimate.
 */
function linearRegressionSlope(points: Snapshot[]): number {
  const t0 = new Date(points[0].recorded_at).getTime();
  const xs = points.map((p) => (new Date(p.recorded_at).getTime() - t0) / (24 * 60 * 60 * 1000));
  const ys = points.map((p) => p.subscribers);
  const n = points.length;

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0; // all points at the same timestamp — shouldn't happen, but guard anyway

  return (n * sumXY - sumX * sumY) / denominator;
}

export async function computePace(currentSubscribers: number, target: number): Promise<PaceInfo | null> {
  try {
    const supabase = getSupabaseServerClient();
    const lookbackCutoff = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Prefer the full set of snapshots within the last 7 days...
    let { data, error } = await supabase
      .from("subscriber_snapshots")
      .select("recorded_at, subscribers")
      .gte("recorded_at", lookbackCutoff)
      .order("recorded_at", { ascending: true });

    if (error) throw new Error(error.message);

    // ...but if we don't have 7 days of history yet, fall back to whatever
    // full history exists, and just report the shorter window honestly.
    if (!data || data.length === 0) {
      const fallback = await supabase
        .from("subscriber_snapshots")
        .select("recorded_at, subscribers")
        .order("recorded_at", { ascending: true });
      if (fallback.error) throw new Error(fallback.error.message);
      data = fallback.data;
    }

    if (!data || data.length === 0) return null; // no history at all yet

    const oldest = new Date(data[0].recorded_at).getTime();
    const now = Date.now();
    const windowDays = (now - oldest) / (24 * 60 * 60 * 1000);

    if (windowDays < MIN_WINDOW_DAYS || data.length < MIN_SAMPLES) {
      return {
        dailyRate: 0,
        windowDays,
        sampleCount: data.length,
        projectedDate: null,
        insufficientData: true,
      };
    }

    const dailyRate = linearRegressionSlope(data);

    // Project forward from the live current count (not the regression's own
    // estimate of "now"), so the projection stays consistent with the number
    // actually shown on the page — the regression only supplies the rate.
    let projectedDate: string | null = null;
    if (dailyRate > 0) {
      const remaining = target - currentSubscribers;
      const daysToTarget = remaining / dailyRate;
      projectedDate = new Date(now + daysToTarget * 24 * 60 * 60 * 1000).toISOString();
    }

    return { dailyRate, windowDays, sampleCount: data.length, projectedDate, insufficientData: false };
  } catch (err) {
    console.error("[pace] failed:", err instanceof Error ? err.message : err);
    return null; // pace is a nice-to-have — never break the main subscriber count over this
  }
}

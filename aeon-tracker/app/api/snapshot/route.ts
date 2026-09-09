import { NextResponse } from "next/server";
import { getSubscriberCount } from "@/lib/reddit";
import { getSupabaseServerClient } from "@/lib/supabase";

// Called by a Vercel Cron job once per hour. Reads the current subscriber
// count (reusing the same cached/fallback logic as the main API route —
// this does NOT make an extra external call if a fresh reading was already
// fetched recently) and writes a row to Supabase for historical tracking.
export async function GET() {
  try {
    const reading = await getSubscriberCount();

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("subscriber_snapshots").insert({
      subscribers: reading.subscribers,
    });

    if (error) {
      throw new Error(`Supabase insert failed: ${error.message}`);
    }

    return NextResponse.json({
      ok: true,
      subscribers: reading.subscribers,
      recordedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[snapshot] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Snapshot failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

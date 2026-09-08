import { NextResponse } from "next/server";

// This route is intended to be called by a Vercel Cron job once per hour.
// It will fetch the current subscriber count and write a row to Supabase's
// subscriber_snapshots table. Not yet wired up — that happens in Stage 3
// once the Supabase project exists.
export async function GET() {
  return NextResponse.json(
    { error: "Snapshot storage is not configured yet (Stage 3)." },
    { status: 501 }
  );
}
